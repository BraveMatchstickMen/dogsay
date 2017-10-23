'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Video = require('react-native-video').default
var ImagePicker = require('NativeModules').ImagePickerManager
var CountDown = require('react-native-sk-countdown').CountDownText
var Text = React.Text
var View = React.View
var Image = React.Image
var TouchableOpacity = React.TouchableOpacity
var AsyncStorage = React.AsyncStorage
var ProgressViewIOS = React.ProgressViewIOS
var AlertIOS = React.AlertIOS
var StyleSheet = React.StyleSheet
var Dimensions = React.Dimensions

var request = require('../common/request')
var config = require('../common/config')

var width = Dimensions.get('window').width
var height = Dimensions.get('window').height

var videoOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '录制 10 秒视频',
  chooseFromLibraryButtonTitle: '选择已有视频',
  videoQuality: 'medium',
  mediaType: 'video',
  durationLimit: 10,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

var Edit = React.createClass({
  getInitialState() {
    var user = this.props.user || {}

    return {
      user: user,
      previewVideo: null,

      // video upload
      video: null,
      videoUpLoaded: false,
      videoUploading: false,
      videoUploadedProgress: 0.01,

      // video loads
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,

      // count down
      counting: false,
      recording: false,

      // video player
      rate: 1,
      muted: true,
      resizeMode: 'contain',
      repeat: false,
    }
  },

  _onLoadStart() {
    console.log('load start')
  },

  _onLoad() {
    console.log('load')
  },

  _onProgress(data) {
    var duration = data.playableDuration
    var currentTime = data.currentTime
    var percent = Number((currentTime / duration).toFixed(2))

    this.setState({
      videoTotal: duration,
      currentTime: Number(data.currentTime.toFixed(2)),
      videoProgress: percent
    })
  },

  _onEnd() {
    if (this.state.recording) {
      this.setState({
        videoProgress: 1,
        recording: false
      })
    }
  },

  _onError(e) {
    this.setState({
      videoOk: false
    })
  },

  _rePlay() {
    this.refs.videoPlayer.seek(0)
  },

  _pause() {
    if (!this.state.paused) {
      this.setState({
        paused: true
      })
    }
  },

  _resume() {
    if (this.state.paused) {
      this.setState({
        paused: false
      })
    }
  },

  _record() {
    this.setState({
      videoProgress: 0,
      counting: false,
      recording: true
    })

    this.refs.videoPlayer.seek(0)
  },

  _counting() {
    if (!this.state.counting && !this.state.recording) {
      this.setState({
        counting: true
      })

      this.refs.videoPlayer.seek(this.state.videoTotal - 0.01)
    }
  },

  componentDidMount() {
    var that = this

    AsyncStorage.getItem('user')
      .then((data) => {
        var user

        // console.log(data)

        if (data) {
          user = JSON.parse(data)
        }

        if (user && user.accessToken) {
          that.setState({
            user: user
          })
        }
      })
  },

  _getQiniuToken() {
    var accessToken = this.state.user.accessToken
    var signatureURL = config.api.base + config.api.signature
    return request.post(signatureURL, {
        accessToken: accessToken,
        type: 'video',
        cloud: 'qiniu'
      })
      .catch((err) => {
        console.log(err)
      })
  },

  _upload(body) {
    var that = this
    var xhr = new XMLHttpRequest()
    var url = config.qiniu.upload

    // console.log(body)

    this.setState({
      videoUploadedProgress: 0,
      videoUploading: true,
      videoUploaded: false
    })

    xhr.open('POST', url)
    xhr.onload = () => {
      if (xhr.status !== 200) {
        AlertIOS.alert('请求失败')
        // console.log(xhr.responseText)

        return
      }

      if (!xhr.responseText) {
        AlertIOS.alert('请求失败')

        return
      }

      var response

      try {
        response = JSON.parse(xhr.response)
      }
      catch(e) {
        console.log(e)
        console.log('parse fails')
      }

      console.log('upload api: ' + response)

      if (response) {
        that.setState({
          video: response,
          videoUploading: false,
          videoUploaded: true
        })

        var videoURL = config.api.base + config.api.video
        var accessToken = this.state.user.accessToken

        request.post(videoURL, {
          accessToken: accessToken,
          video: response
        })
        .catch((err) => {
          console.log(err)
          AlertIOS.alert('视频同步出错，请重新上传！')
        })
        .then((data) => {
          if (!data || !data.success) {
            AlertIOS.alert('视频同步出错，请重新上传！')
          }
        })
      }
    }

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var percent = Number((event.loaded / event.total).toFixed(2))

          that.setState({
            videoUploadedProgress: percent
          })
        }
      }
    }
    xhr.send(body)
  },

  _pickVideo() {
    var that = this

    ImagePicker.showImagePicker(videoOptions, (res) => {
      if (res.didCancel) {
        return
      }

      var uri = res.uri
      console.log('uri:' + uri)

      that.setState({
        previewVideo: uri
      })

      that._getQiniuToken()
        .then((data) => {
          console.log('_getQiniuToken: ' + data)
          if (data && data.success) {

            var token = data.data.token
            var key = data.data.key
            var body = new FormData()

            body.append('token', token)
            body.append('key', key)
            body.append('file', {
              type: 'video/mp4',
              uri: uri,
              name: key
            })

            that._upload(body)
          }
        })
    })
  },

  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>{this.state.previewVideo ? '点击按钮配音' : '理解狗狗，从配音开始'}</Text>
          {
            this.state.previewVideo && this.state.videoUpLoaded 
            ? <Text style={styles.toolbarExtra} onPress={this._pickVideo}>更换视频</Text>
            : null
          }
        </View>

        <View style={styles.page}>
          {
            this.state.previewVideo
            ? <View style={styles.videoContainer}>
                <View style={styles.videoBox}>
                  <Video
                    ref='videoPlayer'
                    source={{uri: this.state.previewVideo}}
                    style={styles.video}
                    volume={5}
                    paused={this.state.paused}
                    rate={this.state.rate}
                    muted={this.state.muted}
                    resizeMode={this.state.resizeMode}
                    repeat={this.state.repeat}

                    onLoadStart={this._onLoadStart}
                    onLoad={this._onLoad}
                    onProgress={this._onProgress}
                    onEnd={this._onEnd}
                    onError={this._onError} />
                    {
                      !this.state.videoUpLoaded && this.state.videoUploading
                      ? <View style={styles.progressTipBox}>
                          <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress} />
                          <Text style={styles.progressTip}>正在生成静音视频，已完成{(this.state.videoUploadedProgress * 100).toFixed(2)}%
                          </Text>
                        </View> 
                        : null
                    }

                    {
                      this.state.recording
                      ? <View style={styles.progressTipBox}>
                        <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress} />
                        <Text style={styles.progressTip}>录制声音中{(this.state.videoProgress * 100).toFixed(2)}%
                        </Text>
                      </View>
                      : null
                    }
                </View>
              </View>
            : <TouchableOpacity style={styles.uploadContainer}
              onPress={this._pickVideo}>
              <View style={styles.uploadBox}>
                <Image source={require('../assets/images/record.png')} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>点我上传视频</Text>
                <Text style={styles.uploadDesc}>建议时长不超过 20 秒</Text>
              </View>
            </TouchableOpacity>
          }

          {
            this.state.videoUpLoaded
            ? <View style={styles.recordBox}>
                <View style={[styles.recordIconBox, this.state.recording && styles.recordOn]}>
                  {
                    this.state.counting && !this.state.recording
                    ? <CountDown
                        style={styles.countBtn}
                        countType='seconds' // 计时类型：seconds / date
                        auto={true} // 自动开始
                        afterEnd={this._record} // 结束回调
                        timeLeft={3} // 正向计时 时间起点为0秒
                        step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                        startText='准备录制' // 开始的文本
                        endText='Go' // 结束的文本
                        intervalText={(sec) => {
                          return sec === 0 ? 'Go' : sec
                        }} // 定时的文本回调
                      />
                      : <TouchableOpacity onPress={this._counting}>
                          <Icon name='ios-mic' style={styles.recordIcon} />
                        </TouchableOpacity>
                  }
                </View>
              </View> : null
          }
        </View>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c'
  },

  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  },

  toolbarExtra: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14
  },

  page: {
    flex: 1,
    alignItems: 'center'
  },

  uploadContainer: {
    marginTop: 90,
    width: width - 40,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#fff'
  },

  uploadTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#000'
  },

  uploadDesc: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12
  },

  uploadIcon: {
    width: 110,
    resizeMode: 'contain'
  },

  uploadBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  videoContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },

  videoBox: {
    width: width,
    height: height * 0.6
  },

  video: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#333'
  },

  progressTipBox: {
    width: width,
    height: 30,
    backgroundColor: 'rgba(244,244,244,0.65)'
  },

  progressTip: {
    color: '#333',
    width: width - 10,
    padding: 5
  },

  progressBar: {
    width: width
  },

  recordBox: {
    width: width,
    height: 60,
    alignItems: 'center'
  },

  recordIconBox: {
    width: 68,
    height: 68,
    marginTop: -30,
    borderRadius: 34,
    backgroundColor: '#ee735c',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  recordIcon: {
    fontSize: 58,
    backgroundColor: 'transparent',
    color: '#fff'
  },

  countBtn: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff'
  },

  recordOn: {
    backgroundColor: '#ccc'
  },

  previewBox: {
    width: 80,
    height: 30,
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  previewIcon: {
    marginRight: 5,
    fontSize: 20,
    color: '#ee735c',
    backgroundColor: 'transparent'
  },

  previewText: {
    fontSize: 20,
    color: '#ee735c',
    backgroundColor: 'transparent'
  },

  uploadAudioBox: {
    width: width,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  uploadAudioText: {
    width: width - 20,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 30,
    color: '#ee735c'
  },

  modalContainer: {
    width: width,
    height: height,
    paddingTop: 50,
    backgroundColor: '#fff'
  },

  closeIcon: {
    position: 'absolute',
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c'
  },

  loadingBox: {
    width: width,
    height: 50,
    marginTop: 10,
    padding: 15,
    alignItems: 'center'
  },

  loadingText: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#333'
  },

  fieldBox: {
    width: width - 40,
    height: 36,
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },

  inputField: {
    height: 36,
    textAlign: 'center',
    color: '#666',
    fontSize: 14
  },

  submitBox: {
    marginTop: 50,
    padding: 15
  },

  btn: {
    marginTop: 65,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c'
  }
});

module.exports = Edit;
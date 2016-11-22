'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Video = require('react-native-video').default
var config = require('../common/config')
var request = require('../common/request')

var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet
var Dimensions = React.Dimensions
var ActivityIndicatorIOS = React.ActivityIndicatorIOS
var TouchableOpacity = React.TouchableOpacity
var ScrollView = React.ScrollView
var Image = React.Image
var ListView = React.ListView

var width = Dimensions.get('window').width

var Detail = React.createClass({
  getInitialState() {
    var data = this.props.data
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      data: data,
      dataSource: ds.cloneWithRows([]),

      videoLoaded: false,
      paused: false,
      playing: false,
      videoOk: true,

      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,

      rate: 1,
      muted: true,

      resizeMode: 'contain',
      repeat: false,
    }
  },

  _pop() {
    this.props.navigator.pop()
  },

  _onLoadStart() {
    console.log('load start')
  },

  _onLoad() {
    console.log('load')
  },

  _onProgress(data) {
    if (!this.state.videoLoaded) {
      this.setState({
        videoLoaded: true
      })
    }

    var duration = data.playableDuration
    var currentTime = data.currentTime
    var percent = Number((currentTime / duration).toFixed(2))
    
    var newState = {
      videoTotal: duration,
      currentTime: Number(data.currentTime.toFixed(2)),
      videoProgress: percent
    }

    if (!this.state.videoLoaded) {
      newState.videoLoaded = true
    }

    if (!this.state.playing) {
      newState.playing = true
    }

    this.setState(newState)
  },

  _onEnd() {
    this.setState({
      videoProgress: 1,
      playing: false
    })
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

  componentDidMount() {
    this._fetchData()
  },

  _fetchData() {
    var that = this
    var url = config.api.base + config.api.comment

    request.get(url, {
      id: 124,
      accessToken: '123a'
    })
    .then(function(data) {
      if (data && data.success) {
        var comments = data.data

        if (comments && comments.length > 0) {
          that.setState({
            comments: comments,
            dataSource: that.state.dataSource.cloneWithRows(comments)
          })
        }
      }
    })
    .catch((error) => {
      console.log(error)
    })
  },

  _renderRow(row) {
    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri: row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    )
  },

  render: function() {
    var data = this.props.data

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop}>
            <Icon name='ios-arrow-back' style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOflines={1}>
            视频详情页</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri: data.video}}
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
            !this.state.videoOk && <Text style={styles.failText}>视频出错了！很抱歉</Text>
          }

          {
            !this.state.videoLoaded && <ActivityIndicatorIOS color='#ee735c' style={styles.loading} />
          }

          {
            this.state.videoLoaded && !this.state.playing
            ? <Icon
                onPress={this._rePlay}
                name='ios-play'
                size={48}
                style={styles.playIcon} />
            : null
          }

          {
            this.state.videoLoaded && this.state.playing
            ? <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
              {
                this.state.paused
                ? <Icon onPress={this._resume} size={48} name='ios-play' style={styles.resumeIcon} />
                : <Text></Text>
              }
            </TouchableOpacity>
            : null
          }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}></View>
          </View>
        </View>
        
        <ScrollView
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          style={styles.scrollView}>
          <View style={styles.infoBox}>
            <Image style={styles.avatar} source={{uri: data.author.avatar}} />
            <View style={styles.descBox}>
              <Text style={styles.nickname}>{data.author.nickname}</Text>
              <Text style={styles.title}>{data.title}</Text>
            </View>
          </View>

          <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false} 
        />
        </ScrollView>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },

  backBox: {
    position: 'absolute',
    left: 12,
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },

  headerTitle: {
    width: width - 120,
    textAlign: 'center'
  },

  backIcon: {
    color: '#999',
    fontSize: 20,
    marginRight: 5
  },

  backText: {
    color: '#999'
  },

  videoBox: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000',
  },

  video: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000',
  },

  failText: {
    position: 'absolute',
    left: 0,
    top: 90,
    width: width,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'transparent',
  },

  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  progressBox: {
    width: width,
    height: 2,
    backgroundColor: '#ccc'
  },

  progressBar: {
    width: 1,
    height: 2,
    backgroundColor: '#ff6600'
  },

  playIcon: {
    position: 'absolute',
    top: 90,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },

  pauseBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: 360
  },

  resumeIcon: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },

  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },

  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 30
  },

  descBox: {
    flex: 1
  },

  nickname: {
    fontSize: 18
  },

  title: {
    marginTop: 8,
    fontSize: 16,
    color: '#666'
  },

  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10
  },

  replyAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 20
  },

  replyNickname: {
    color: '#666'
  },

  replyContent: {
    marginTop: 4,
    color: '#666'
  },

  reply: {
    flex: 1
  }
});

module.exports = Detail;
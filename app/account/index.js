'use strict';

var React = require('react-native')
var sha1 = require('sha1')
var Icon = require('react-native-vector-icons/Ionicons')
var ImagePicker = require('NativeModules').ImagePickerManager
var Progress = require('react-native-progress')
var Button = require('react-native-button').default

var request = require('../common/request')
var config = require('../common/config')

var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet
var Dimensions = React.Dimensions
var AsyncStorage = React.AsyncStorage
var TouchableOpacity = React.TouchableOpacity
var Image = React.Image
var AlertIOS = React.AlertIOS
var Modal = React.Modal
var TextInput = React.TextInput

var width = Dimensions.get('window').width

var photoOptions = {
  title: '选择头像',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '选择相册',
  quality: 0.75,
  allowsEditing: true,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

var CLOUDINARY = {
  cloud_name: 'db2oxpw9c',  
  api_key: '329161736663398',  
  base: 'http://res.cloudinary.com/db2oxpw9c',
  image: 'https://api.cloudinary.com/v1_1/db2oxpw9c/image/upload',
  video: 'https://api.cloudinary.com/v1_1/db2oxpw9c/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/db2oxpw9c/raw/upload' 
}

function avatar(id, type) {
  if (id.indexOf('http') > -1) {
    return id
  }

  if (id.indexOf('data:image') > -1) {
    return id
  }

  return CLOUDINARY.base + '/' + type + '/upload/' + id
}

var Account = React.createClass({
  getInitialState() {
    var user = this.props.user || {}

    return {
      user: user,
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible: false
    }
  },

  _edit() {
    this.setState({
      modalVisible: true
    })
  },

  _closeModal() {
    this.setState({
      modalVisible: false
    })
  },

  componentDidMount() {
    var that = this

    AsyncStorage.getItem('user')
      .then((data) => {
        var user

        console.log(data)

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

  _pickPhoto() {
    var that = this

    ImagePicker.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        return
      }

      var avartarData = 'data:image/jpeg;base64,' + res.data
      // var user = that.state.user

      // user.avatar = avartarData

      // that.setState({
      //   user: user
      // })

      var timestamp = Date.now()
      var tags = 'app,avatar'
      var folder = 'avatar'
      var signatureURL = config.api.base + config.api.signature
      var accessToken = this.state.user.accessToken

      request.post(signatureURL, {
        accessToken: accessToken,
        timestamp: timestamp,
        folder: folder,
        tags: tags,
        type: 'avatar'
      })
      .catch((err) => {
        console.log(err)
      })
      .then((data) => {
        console.log(data)
        if (data && data.success) {

          var signature = data.data

          var body = new FormData()

          body.append('folder', folder)
          body.append('signature', signature)
          body.append('tags', tags)
          body.append('timestamp', timestamp)
          body.append('api_key', CLOUDINARY.api_key)
          body.append('resource_type', 'image')
          body.append('file', avartarData)

          that._upload(body)

        }
      })
    })
  },

  _upload(body) {
    var that = this
    var xhr = new XMLHttpRequest()
    var url = CLOUDINARY.image

    console.log(body)

    this.setState({
      avatarUploading: true,
      avatarProgress: 0
    })

    xhr.open('POST', url)
    xhr.onload = () => {
      if (xhr.status !== 200) {
        AlertIOS.alert('请求失败')
        console.log(xhr.responseText)

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

      if (response && response.public_id) {
        var user = this.state.user

        user.avatar = response.public_id

        that.setState({
          avatarUploading: false,
          avatarProgress: 0,
          user: user
        })

        that._asyncUser(true)
      }
    }

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var percent = Number((event.loaded / event.total).toFixed(2))

          that.setState({
            avatarProgress: percent
          })
        }
      }
    }

    xhr.send(body)
  },

  _asyncUser(isAvatar) {
    var that = this
    var user = this.state.user

    if (user && user.accessToken) {
      var url = config.api.base + config.api.update

      request.post(url, user)
        .then((data) => {
          if (data && data.success) {
            var user = data.data

            if (isAvatar) {
              AlertIOS.alert('头像更新成功')
            }

            that.setState({
              user: user
            }, function() {
              that._closeModal()
              AsyncStorage.setItem('user', JSON.stringify(user))
            })
          }
        })
    }
  },

  _changeUserState(key, value) {
    var user = this.state.user

    user[key] = value

    this.setState({
      user: user
    })
  },

  _submit() {
    this._asyncUser()
  },

  _logout() {
    this.props.logout()
  },

  render() {
    var user = this.state.user

    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>狗狗的账户</Text>
          <Text style={styles.toolbarExtra} onPress={this._edit}>编辑</Text>
        </View>

        {
          user.avatar
          ? <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
            <Image source={{uri: avatar(user.avatar, 'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                  ? <Progress.Circle 
                      showsText={true}
                      size={75}
                      color={'#ee735c'}
                      progress={this.state.avatarProgress} />
                  : <Image
                      source={{uri: avatar(user.avatar, 'image')}}
                      style={styles.avatar} />
                }
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          : <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加狗狗头像</Text>
            <View style={styles.avatarBox}>
              {
                this.state.avatarUploading
                ? <Progress.Circle 
                    showsText={true}
                    size={75}
                    color={'#ee735c'}
                    progress={this.state.avatarProgress} />
                :<Icon
                  name='ios-cloud-upload-outline'
                  style={styles.plusIcon} />
              }
            </View>
          </TouchableOpacity>
        }

        <Modal
          animated={true}
          visible={this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <Icon
              name='ios-close-outline'
              onPress={this._closeModal}
              style={styles.closeIcon} />

            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                placeholder={'输入你的昵称'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.nickname}
                onChangeText={(text) => {
                  this._changeUserState('nickname', text)
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>品种</Text>
              <TextInput
                placeholder={'狗狗的品种'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.breed}
                onChangeText={(text) => {
                  this._changeUserState('breed', text)
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
                placeholder={'狗狗的年龄'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.age}
                onChangeText={(text) => {
                  this._changeUserState('age', text)
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                onPress={() => {
                  this._changeUserState('gender', 'male')
                }}
                style={[
                  styles.gender,
                  user.gender === 'male' && styles.genderChecked
                ]}
                name='ios-paw'>男</Icon.Button>
                <Icon.Button
                onPress={() => {
                  this._changeUserState('gender', 'female')
                }}
                style={[
                  styles.gender,
                  user.gender === 'female' && styles.genderChecked
                ]}
                name='ios-paw-outline'>女</Icon.Button>
            </View>

            <Button
              style={styles.btn}
              onPress={this._submit}>保存资料</Button>

          </View>
        </Modal>

        <Button
          style={styles.btn}
          onPress={this._logout}>退出登录</Button>
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

  avatarContainer: {
    width: width,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666'
  },

  avatarTip: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 14
  },

  avatarBox: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatar: {
    marginBottom: 15,
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: width * 0.1
  },

  plusIcon: {
    padding: 20,
    paddingLeft: 25,
    paddingRight: 25,
    color: '#999',
    fontSize: 24,
    backgroundColor: '#fff',
    borderRadius: 8
  },

  modalContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff'
  },

  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#eee',
    borderBottomWidth: 1
  },

  label: {
    color: '#ccc',
    marginRight: 10
  },

  closeIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c'
  },

  gender:{
    backgroundColor: '#ccc'
  },

  genderChecked: {
    backgroundColor: '#ee735c'
  },

  inputField: {
    flex: 1,
    height: 50,
    color: '#666',
    fontSize: 14
  },

  btn: {
    marginTop: 25,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c'
  }
});

module.exports = Account;
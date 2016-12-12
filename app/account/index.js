'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')

var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet
var Dimensions = React.Dimensions
var width = Dimensions.get('window').width
var AsyncStorage = React.AsyncStorage
var TouchableOpacity = React.TouchableOpacity
var Image = React.Image

var Account = React.createClass({
  getInitialState() {
    var user = this.props.user || {}

    return {
      user: user
    }
  },

  componentDidMount() {
    var that = this

    AsyncStorage.getItem('user')
      .then((data) => {
        var user

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

  render() {
    var user = this.state.user

    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
        </View>

        {
          !user.avatar
          ? <TouchableOpacity style={styles.avatarContainer}>
            <Image source={{uri: user.avatar}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Image
                  source={{uri: user.avatar}}
                  style={styles.avatar} />
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          : <View style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加狗狗头像</Text>
            <TouchableOpacity style={styles.avatarBox}>
              <Icon
                name='ios-cloud-upload-outline'
                style={styles.plusIcon} />
            </TouchableOpacity>
          </View>
        }
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
  }
});

module.exports = Account;
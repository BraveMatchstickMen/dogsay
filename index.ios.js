'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')

var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Account = require('./app/account/index')
var Login = require('./app/account/login')

var AppRegistry = React.AppRegistry
var TabBarIOS = React.TabBarIOS
var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet
var Navigator = React.Navigator
var AsyncStorage = React.AsyncStorage

var dogsay = React.createClass({

  getInitialState: function() {
    return {
      user: null,
      logined: false,
      selectedTab: 'list',
    };
  },

  componentDidMount() {
    this._asyncAppStatus()
  },

  _asyncAppStatus() {
    var that = this
    AsyncStorage.getItem('user')
      .then((data) => {
        var user
        var newState = {}

        if (data) {
          user = JSON.parse(data)
        }

        if (user && user.accessToken) {
          newState.user = user
          newState.logined = true
        }
        else {
          newState.logined = false
        }

        that.setState(newState)
      })
  },

  _afterLogin(user) {
    var that = this

    user = JSON.stringify(user)

    AsyncStorage.setItem('user', user)
      .then(() => {
        that.setState({
          logined: true,
          user: user
        })
      })
  },

  render: function() {
    if (!this.state.logined) {
      return <Login afterLogin={this._afterLogin} />
    }

    return (
      <TabBarIOS tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>
          <Navigator
            initialRoute={{
              name: 'list',
              component: List
            }}
            configureScene={(route) => {
              return Navigator.SceneConfigs.FloatFromRight
            }}
            renderScene={(route, navigator) => {
              var Component = route.component

              return <Component {...route.params} navigator={navigator}
                />
            }} />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit',
            });
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          renderAsOriginal
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account',
            });
          }}>
          <Account />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  },

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('dogsay', () => dogsay);
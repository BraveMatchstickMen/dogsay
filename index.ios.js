'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')

var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Account = require('./app/account/index')

var Component = React.Component
var AppRegistry = React.AppRegistry
var TabBarIOS = React.TabBarIOS
var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet

var dogsay = React.createClass({

  getInitialState: function() {
    return {
      selectedTab: 'list',
    };
  },

  render: function() {
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
          <List />
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
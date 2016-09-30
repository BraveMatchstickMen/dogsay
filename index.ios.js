'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Component = React.Component
var AppRegistry = React.AppRegistry
var TabBarIOS = React.TabBarIOS
var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet

var List = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>List Page</Text>
      </View>
    )
  }
})

var Edit = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>Edit Page</Text>
      </View>
    )
  }
})

var Account = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>Account Page</Text>
      </View>
    )
  }
})

var dogsay = React.createClass({

  getInitialState: function() {
    return {
      selectedTab: 'blueTab',
    };
  },

  _renderContent: function(color: string, pageText: string, num?: number) {
    return (
      <View style={[styles.tabContent, {backgroundColor: color}]}>
        <Text style={styles.tabText}>{pageText}</Text>
        <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
      </View>
    );
  },

  render: function() {
    return (
      <TabBarIOS tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'blueTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'blueTab',
            });
          }}>
          <List />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          badge={5}
          selected={this.state.selectedTab === 'redTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'redTab',
            });
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          renderAsOriginal
          selected={this.state.selectedTab === 'greenTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'greenTab',
            });
          }}>
          <Account />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  },

});

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

AppRegistry.registerComponent('dogsay', () => dogsay);
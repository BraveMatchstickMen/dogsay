'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet

var Detail = React.createClass({
  _backToList() {
    this.props.navigator.pop()
  },

  render: function() {
    var row = this.props.row

    return (
      <View style={styles.container}>
        <Text onPress={this._backToList}>Detail Page{row._id}</Text>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = Detail;
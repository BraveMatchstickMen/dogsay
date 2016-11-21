'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Video = require('react-native-video').default

var Text = React.Text
var View = React.View
var StyleSheet = React.StyleSheet
var Dimensions = React.Dimensions
var ActivityIndicatorIOS = React.ActivityIndicatorIOS

var width = Dimensions.get('window').width

var Detail = React.createClass({
  getInitialState() {
    var data = this.props.data

    return {
      data: data,

      videoReady: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,

      rate: 1,
      muted: true,

      resizeMode: 'contain',
      repeat: false,
    }
  },

  _backToList() {
    this.props.navigator.pop()
  },

  _onLoadStart() {
    console.log('load start')
  },

  _onLoad() {
    console.log('load')
  },

  _onProgress(data) {
    if (!this.state.videoReady) {
      this.setState({
        videoReady: true
      })
    }

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
    this.setState({
      videoProgress: 1
    })
  },

  _onError(e) {
    console.log(e)
    console.log('error')
  },

  render: function() {
    var data = this.props.data

    return (
      <View style={styles.container}>
        <Text onPress={this._backToList}>Detail Page</Text>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri: data.video}}
            style={styles.video}
            volume={5}
            paused={false}
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
            !this.state.videoReady && <ActivityIndicatorIOS color='#ee735c' style={styles.loading} />
          }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}></View>
          </View>
        </View>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  videoBox: {
    width: width,
    height: 360,
    backgroundColor: '#000',
  },

  video: {
    width: width,
    height: 360,
    backgroundColor: '#000',
  },

  loading: {
    position: 'absolute',
    left: 0,
    top: 140,
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
  }
});

module.exports = Detail;
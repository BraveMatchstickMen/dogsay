'use strict';

var React = require('react-native')
var Mock = require('mockjs')

var Icon = require('react-native-vector-icons/Ionicons')
var Text = React.Text
var View = React.View
var ListView = React.ListView
var StyleSheet = React.StyleSheet
var Image = React.Image
var Dimensions = React.Dimensions
var TouchableHighlight = React.TouchableHighlight

var width = Dimensions.get('window').width

var List = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([
         {
        "_id":"330000197401023499","thumb":"http://dummyimage.com/1280x720/fb756d)","title":"测试内容9055","video":"https://developer.apple.com/videos/images/ogg_bumper_no_tv.ogv"
    }
    ,
    {
        "_id":"410000198502139006","thumb":"http://dummyimage.com/1280x720/613516)","title":"测试内容9055","video":"https://developer.apple.com/videos/images/ogg_bumper_no_tv.ogv"
    }
    ,
    {
        "_id":"33000019710925576X","thumb":"http://dummyimage.com/1280x720/6c59c7)","title":"测试内容9055","video":"https://developer.apple.com/videos/images/ogg_bumper_no_tv.ogv"
    }
    ,
    {
        "_id":"530000201304234055","thumb":"http://dummyimage.com/1280x720/409ff9)","title":"测试内容9055","video":"https://developer.apple.com/videos/images/ogg_bumper_no_tv.ogv"
    }
    ,
    {
        "_id":"610000197910215437","thumb":"http://dummyimage.com/1280x720/fb76a9)","title":"测试内容9055","video":"https://developer.apple.com/videos/images/ogg_bumper_no_tv.ogv"
    }
      ]),
    };
  },

  renderRow: function(row) {
    return (
      <TouchableHighlight>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image
            source={{uri: row.thumb}}
            style={styles.thumb}
          >
            <Icon
              name='ios-play'
              size={28}
              style={styles.play} />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name='ios-heart-outline'
                size={28}
                style={styles.up} />
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name='ios-chatboxes-outline'
                size={28}
                style={styles.commentIcon} />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  },

  componentDidMount: function() {
    this._fetchData()
  },

  _fetchData: function (){
    fetch('http://rap.taobao.org/mockjs/8260/api/creations?accessToken=act')
    .then((response) => response.json())
    .then((response) => {
      var data = Mock.mock(response);
      console.log(data);
    })
    .catch((error) => {
      console.warn(error);
    });
  },

  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false} 
        />
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  thumb: {
    width: width,
    height: width * 0.56,
    resizeMode: 'cover'
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },
  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66'
  },
  up: {
    fontSize: 22,
    color: '#333'
  },
  commentIcon: {
    fontSize: 22,
    color: '#333'
  }
});

module.exports = List;

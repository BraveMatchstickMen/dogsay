'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')

var request = require('../common/request')
var config = require('../common/config')
var Detail = require('./detail')

var Text = React.Text
var View = React.View
var ListView = React.ListView
var StyleSheet = React.StyleSheet
var Image = React.Image
var Dimensions = React.Dimensions
var TouchableHighlight = React.TouchableHighlight
var ActivityIndicatorIOS = React.ActivityIndicatorIOS
var RefreshControl = React.RefreshControl
var AlertIOS = React.AlertIOS

var width = Dimensions.get('window').width

var cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
}

var Item = React.createClass({
  getInitialState() {
    var row = this.props.row

    return {
      up: row.voted,
      row: row
    }
  },

  _up() {
    var that = this
    var up = !this.state.up
    var row = this.state.row
    var url = config.api.base + config.api.up

    var body = {
      id: row._id,
      up: up ? 'yes' : 'no',
      accessToken: 'abcee'
    }

    request.post(url, body)
      .then(function(data) {
        if (data && data.success) {
          that.setState({
            up: up
          })
        }
        else {
          AlertIOS.alert('点赞失败，稍后重试')
        }
      })
      .catch(function(err) {
        console.log(err)
      })
  },

  render() {
    var row = this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
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
                name={this.state.up ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                onPress={this._up}
                style={[styles.up, this.state.up ? null : styles.down]} />
              <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
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
  }
})

var List = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
      nextPage: 0,
      isRefreshing: false 
    };
  },

  _renderRow: function(row) {
    return <Item 
      key={row._id} 
      onSelect={() => this._loadPage(row)} 
      row={row} />
  },

  componentDidMount: function() {
    this._fetchData(1)
  },

  _fetchData: function (page){
    var that = this

    if (page !== 0) {
      this.setState({
        isLoadingTail: true
      })
    } else {
      this.setState({
        isRefreshing: true
      })
    }

    request.get(config.api.base + config.api.creations, {
      accessToken: 'abcdef',
      page: page
    })
    .then((data) => {
      if(data.success) {
        var items = cachedResults.items.slice()

        if (page !== 0) {
          items = items.concat(data.data)
          cachedResults.nextPage += 1
        } 
        else {
          items = data.data.concat(items)
        }
        cachedResults.items = items
        cachedResults.total = data.total

        setTimeout(function() {
          if (page !== 0) {
            that.setState({
              isLoadingTail: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            })
          } else {
            that.setState({
              isRefreshing: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }
        }, 20)
      }
    })
    .catch((error) => {
      if (page !== 0) {
        this.setState({
          isLoadingTail: false
        })
      } 
      else {
        this.setState({
          isRefreshing: false
        })
      } 
    });
  },

  _hasMore() {
    return cachedResults.items.length !== cachedResults.total
  },

  _fetchMoreData() {
    if (!this._hasMore() || this.state.isLoadingTail) {
      return
    }
    var page = cachedResults.nextPage
    this._fetchData(page)
  },

  _onRefresh() {
    if (!this._hasMore() || this.state.isRefreshing) {
      return
    }
    this._fetchData(0)
  },

  _renderFooter() {
    if (!this._hasMore() && cachedResults.total !== 0) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多了</Text>
        </View>
      )
    }
    if (!this.state.isLoadingTail) {
      return <View style={styles.loadingMore} />
    }

    return <ActivityIndicatorIOS style={styles.loadingMore} />
  },

  _loadPage(row) {
    this.props.navigator.push({
      name: 'detail',
      component: Detail,
      params: {
        row: row
      }
    })
  },

  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
          refreshControl={
            <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._onRefresh}
            titleColor='ff6600'
            title='拼命加载中'
            />
          }
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
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
  down: {
    fontSize: 22,
    color: '#333'
  },
  up: {
    fontSize: 22,
    color: '#ed7b66'
  },
  commentIcon: {
    fontSize: 22,
    color: '#333'
  },
  loadingMore: {
    marginVertical: 20
  },
  loadingText: {
    color: '#777',
    textAlign: 'center'
  }
});

module.exports = List;

'use strict';

var React = require('react-native')
var Icon = require('react-native-vector-icons/Ionicons')
var Button = require('react-native-button').default

var request = require('../common/request')
var config = require('../common/config')

var Text = React.Text
var View = React.View
var TextInput = React.TextInput
var AlertIOS = React.AlertIOS
var StyleSheet = React.StyleSheet

var Login = React.createClass({
  getInitialState() {
  	return {
  	  phoneNumber: '',
  	  verifycode: '',
      codeSent: false
  	}
  },

  _showVerifyCode() {
  	this.setState({
  		codeSent: true
  	})
  },

  _sendVerifyCode() {
  	var that = this
    var phoneNumber = this.state.phoneNumber
    
    if (!phoneNumber) {
    	return AlertIOS.alert('手机号不能为空！')
    }

    var body = {
    	phoneNumber: phoneNumber
    }

    var signupURL = config.api.base + config.api.signup

    request.post(signupURL, body)
      .then((data) => {
      	if (data && data.success) {
      		that._showVerifyCode()
      	}
      	else {
      		AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
      	}
      })
      .catch((err) => {
      	AlertIOS.alert('获取验证码失败，请检查网络是否良好')
      })
  },

  render: function() {
    return (
	  <View style={styles.container}>
	    <View style={styles.signupBox}>
	      <Text style={styles.title}>快速登录</Text>
	      <TextInput
	        placeholder='输入手机号'
	        autoCaptialize={'none'}
	        autoCorrect={false}
	        keyboradType={'number-pad'}
	        style={styles.inputField}
	        onChangeText={(text) => {
	        	this.setState({
	        		phoneNumber: text
	        	})
	        }}
	      />

	      {
	      	this.state.codeSent
	      	? <View style={styles.verifyCodeBox}>
	      	    <TextInput
	      	      placeholder='输入验证码'
	      	      autoCaptialize={'none'}
	      	      autoCorrect={false}
	      	      keyboradType={'number-pad'}
	      	      style={styles.inputField}
	      	      onChangeText={(text) => {
	      	      	this.setState({
	      	      		verifycode: text
	      	      	})
	      	      }}
	      	    />
	      	  </View>
	      	: null
	      }

	      {
	      	this.state.codeSent
	      	? <Button
	      	    style={styles.btn}
	      	    onPress={this._submit}>登录</Button>
	      	: <Button
	      	    style={styles.btn}
	      	    onPress={this._sendVerifyCode}>获取验证码</Button>
	      }
	    </View>
	  </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },

  signupBox: {
  	marginTop: 30
  },

  title: {
  	marginBottom: 20,
  	color: '#333',
  	fontSize: 20,
  	textAlign: 'center'
  },

  inputField: {
  	flex: 1,
  	height: 40,
  	padding: 5,
  	color: '#666',
  	backgroundColor: '#fff',
  	borderRadius: 4
  },

  btn: {
  	marginTop: 10,
  	padding: 10,
  	backgroundColor: 'transparent',
  	borderColor: '#ee735c',
  	borderWidth: 1,
  	borderRadius: 4,
  	color: '#ee735c'
  }
});

module.exports = Login;
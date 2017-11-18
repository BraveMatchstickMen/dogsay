'use strict'

module.exports = {
	header: {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	},
	backup: {
		avatar: ''
	},
	qiniu: {
		video: 'http://oy41w5cp2.bkt.clouddn.com/',
		thumb: 'http://oy41w5cp2.bkt.clouddn.com/',
		avatar: 'http://ojwibjnxi.bkt.clouddn.com/',
		upload: 'http://upload.qiniu.com'
	},
	cloudinary: {
	  cloud_name: 'db2oxpw9c',  
	  api_key: '329161736663398',  
	  base: 'http://res.cloudinary.com/db2oxpw9c',
	  image: 'https://api.cloudinary.com/v1_1/db2oxpw9c/image/upload',
	  video: 'https://api.cloudinary.com/v1_1/db2oxpw9c/video/upload',
	  audio: 'https://api.cloudinary.com/v1_1/db2oxpw9c/raw/upload' 
	},
	api: {
		// base: 'http://rap.taobao.org/mockjs/4230/',
		base: 'http://localhost:1234/',
		creations: 'api/creations',
		comment: 'api/comments',
		up: 'api/up',
		video: 'api/creations/video',
		audio: 'api/creations/audio',
		signup: 'api/u/signup',
		verify: 'api/u/verify',
		update: 'api/u/update',
		signature: 'api/signature'
	}
}
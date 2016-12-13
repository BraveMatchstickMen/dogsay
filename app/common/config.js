'use strict'

module.exports = {
	header: {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	},
	api: {
		base: 'http://rap.taobao.org/mockjs/4230/',
		creations: 'api/creations',
		comment: 'api/comments',
		up: 'api/up',
		signup: 'api/u/signup',
		verify: 'api/u/verify',
		update: 'api/u/update',
		signature: 'api/signature'
	}
}
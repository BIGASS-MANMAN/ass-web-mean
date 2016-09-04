/**
 * Created by kuvshinov on 16. 8. 4.
 */
var mongoose = require('mongoose');
var db = require('../model/db');
var ai = require('mongoose-auto-increment');

ai.initialize(db);

var BoardSchema = new mongoose.Schema({
    subject: String,
    date: String,
    content: String,
    submit_form: String,
    attachment: String
    // "regdate": {
    //     "type": Date,
    //     "default": Date.now
    // }
});

var UserSchema = new mongoose.Schema({
    id: String,
    pw: String,
    email: String,
    name: String,
    hakbun: String
});

BoardSchema.plugin(ai.plugin, {
    "model": 'Board',
    "field": "idx",
    "startAt": 1,
    "incrementBy": 1
});

// DB 스키마 컴파일링 시작.
var Board = mongoose.model('Board', BoardSchema);
var User = mongoose.model('User', UserSchema);
// DB 스키마 컴파일링 종료.

module.exports = Board;
module.exports = User;
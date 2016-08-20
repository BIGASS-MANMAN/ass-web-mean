/**
 * Created by kuvshinov on 16. 8. 4.
 */
var mongoose = require('mongoose');
var db = require('../model/db');
var ai = require('mongoose-auto-increment');

ai.initialize(db);

var BoardSchema = new mongoose.Schema({
    "id": String,
    "title": String,
    "unittest": String,
    "setupcode": String,
    "setupcodeFN": String,
    "function": String,
    "object": String,
    "helper": String,
    "input": String,
    "output": String,
    "test": Boolean,
    "group": String,
    "content": String,
    "passwd": String,
    "regdate": {
        "type": Date,
        "default": Date.now
    }
});

BoardSchema.plugin(ai.plugin, {
    "model": 'Board',
    "field": "idx",
    "startAt": 1,
    "incrementBy": 1
});

var Board = mongoose.model('Board', BoardSchema);

module.exports = Board;
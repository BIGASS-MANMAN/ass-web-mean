/**
 * Created by kuvshinov on 16. 8. 4.
 */
var mongoose = require('mongoose');
var uri = 'mongodb://localhost/board';
var options = {
    "server": {
        "poolSize": 100
    }
};
mongoose.Promise = global.Promise;
var db = mongoose.createConnection(uri, options);

db.on('error', function(err){
   if(err)
       console.log('디비 연결 에-러 ', err);
});

db.once('open', function callback(){
    console.info("[몽고디비 via 몽구스 모듈] 연결 성-공");
});

module.exports = db;
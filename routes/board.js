/**
 * Created by kuvshinov on 16. 8. 4.
 */
var express = require('express');
var router = express.Router();

var fs = require('fs');
var bodyparser = require('body-parser');
var multer = require('multer');
var upload = multer({
    dest: '../public/uploads/'
});

var db = require('../model/db');
require('../model/boardmodel');
var BoardModel = db.model('Board');

router.use(bodyparser.urlencoded({extended: false}));

router.get('/', function(req, res, next) {
    res.render('board', { title: '게시판' });
});

/* get write form */
router.get('/writesetup', function(req, res, next) {
    res.render('writesetup', {title: "셋업"});
});

/* submit write form */
router.post('/writesetup', function (req, res, next) {
    console.log(req.body);

    var filename = __dirname + "/../public/uploads/" + "reqbody.json";

    fs.writeFile(filename, JSON.stringify(req.body), 'utf8', function (e) {
        res.json({success: true});

        if(e)
            console.log(e);
        else
            console.log("/public/uploads/ 경로에 파일 쓰기 성공");
    });

    var title = req.body.title;
    var unittest = req.body.unittest;
    var classes = req.body.class;
    var setupcode = req.body.setupcode;

    var functions = req.body.functions;
    var objects = req.body.objects;
    var helpers = req.body.helpers;
    var inputs = req.body.inputs;
    var outputs = req.body.outputs;
    var tests = req.body.tests;
    var groups = req.body.groups;

    /* 잠깐만 디비에 저장안함.
    // DB 모델 생성 및 저장.
    var board = new BoardModel({
        "title": title,
        "content": content,
        "passwd": passwd,
        "id": 'sanghoon'
    });

    board.save(function (err, doc) {
        if(err)
            console.error('err', err);
        // res.json(doc);
        // res.redirect('/board/list');
    });
    */

    res.redirect('/board/writepost');
});

router.get('/writepost', function (req, res, next) {
    res.render();
});

router.get('/list', function (req, res, next) {
    res.redirect('/board/list/1');
})

router.get('/list/:page', function (req, res, next) {
    var page = req.params.page;

    page = parseInt(page, 10);

    BoardModel.count(function (err, cnt) {
        var size = 10;  // 한 페이지에 보여줄 개수
        var begin = (page - 1) * size; // 시작 글
        var totalPage = Math.ceil(cnt / size);  // 전체 페이지의 수 (75 / 10 = 7.5(X) -> 8(O))
        var pageSize = 10; // 페이지 링크의 개수

        // 1~10페이지는 1로, 11~20페이지는 11로 시작되어야하기 때문에 숫자 첫째자리의 수를 고정시키기 위한 계산법
        var startPage = Math.floor((page-1) / pageSize) * pageSize + 1;
        var endPage = startPage + (pageSize - 1);

        if(endPage > totalPage) {
            endPage = totalPage;
        }

        // 전체 글이 존재하는 개수
        var max = cnt - ((page-1) * size);
        BoardModel.find({}).sort("-idx").skip(begin).limit(size).exec(function (err, docs) {
            if (err) console.error('err', err);
            // console.log((docs));
            for(i in docs){
                if(docs[i].content.length>200){
                    docs[i].content = docs[i].content.substr(0,200)+"...";
                }
            }
            //res.json({"result" : docs});

            var datas = {
                "title" : "게시판 목록",
                "data" : docs,
                "page" : page,
                "pageSize" : pageSize,
                "startPage" : startPage,
                "endPage" : endPage,
                "totalPage" : totalPage,
                "max" : max
            };

            res.render('list', datas);
        });
    });
});

router.get('/read/:page/:idx', function (req, res, next) {
    var page = req.params.page;
    var idx = req.params.idx;

    BoardModel.update( {"idx" : idx}, function (err, doc) {
        if (err) console.error('err', err);

        BoardModel.findOne({"idx" : idx} , function (err, docs) {
            if (err) console.error('err', err);
            res.render('read', {"title" : "글 읽기", "data" : docs, "page" : page});
        });
    });
});

/*  파일 업로드 ( multer 모듈 )
router.post('/upload', upload.single('attachedFile'), function (req, res, next) {
    console.log(req.body);
    console.log(req.file);

    res.redirect('/board/list');
});
*/

// 글 300개 임의 작성
router.get('/write300', function (req, res, next) {
   for(var i = 1; i < 300; i++){
       var board = new BoardModel({
            "title": '제목' + i,
            "content": '내용' + i,
            "passwd": '1234',
            'id': 'tongue'
       });

       board.save(function (err, doc) {
           if(err)
               console.error('err', err);
       });
   }

   res.send('<script>alert("success"); location.href="/board/list/1"</script>');
});

module.exports = router;
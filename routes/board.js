/**
 * Created by kuvshinov on 16. 8. 4.
 */
var express = require('express');
var router = express.Router();
var session = require('express-session');

var fs = require('fs');
var path = require('path');
var bodyparser = require('body-parser');
var multer = require('multer');
var Sugar = require('sugar');

router.use(session({
    secret: 'bimil',
    resave: false,
    saveUninitialized: true
}));

var db = require('../model/db');
require('../model/boardmodel');
var BoardModel = db.model('Board');
var UserModel = db.model('User');

router.use(bodyparser.urlencoded({extended: false}));

router.get('/', function(req, res, next) {
    res.render('board', { title: '게시판' });
});

router.post('/upload', function (req, res, next) {
    console.log(req.file);
    console.log(req.session);

    var newDir = __dirname + '/../public/uploads/' + req.session.hakbun + "/";

    fs.mkdir(newDir, function(e) {
        if(e)
            console.error('err', e);
    });

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + '/../public/uploads/' + req.session.hakbun + "/");
        },
        filename: function (req, file, cb) {
            var date = Sugar.Date.format(new Date(),  "%Y-%m-%d,%H'%M'%S");
            cb(null, req.session.hakbun + req.session.name +'-' + date + ".png");
        }
    });
    var upload = multer({storage: storage}).single('attachment');

    upload(req, res, function (e) {
        if(e){
            console.error('err', e);
        }
    });

    res.redirect('/board/list');
});

router.post('/signup', function (req, res, next) {
    console.log(req.body);

    UserModel.findOne({ id: req.body.user_id }, function (e, user) {
        if (e) {
            console.error('err', e);
            return handleError(e);
        }

        if (user == null) {
            var newUser = new UserModel({
                id: req.body.user_id,
                pw: req.body.user_pw,
                email: req.body.user_email,
                name: req.body.user_name,
                hakbun: req.body.user_hakbun
            });
            newUser.save(function (e, data) {
                if (e)
                    console.error('err', e);
            });
            console.log('가입 성공');
        }
    });

    res.redirect('/board/list');
});

router.post('/login', function (req, res, next) {
    console.log(req.body);

    UserModel.findOne({ id: req.body.user_id, pw: req.body.user_pw }, function (e, user) {
        if (e) {
            console.error('err', e);
            return handleError(e);
        }

        if (user != null){
            req.session.username  = user.id;
            req.session.hakbun = user.hakbun;
            req.session.name = user.name;

            console.log("쎄션값 : " + req.session.id);
            console.log("쎄션아이디 : " + req.session.username);
            console.log("디비학번 : " + user.hakbun);
            console.log("쎄션학번 : " + req.session.hakbun);
            console.log("로그인 성공");

            res.redirect('/board/list');
        }
        else{
            console.log("로그인 실패");
            res.redirect('//google.com');
        }
    });
});

router.post('/check', function (req, res, next) {
    UserModel.find({ id: req.body.user_id }, function (e, user) {
        if (user.length == 0) {
            console.log("안 중복");
            res.send("true");
        }
        else {
            console.log("중복");
            res.send("false");
        }
    });
});

router.get('/logout', function (req, res, next) {
    console.log("접속중인 아이디 : " + req.session.username);
    if(req.session){
        req.session.destroy(function (e) {
            if(e)
                console.error('err', e);
        });
    }
    res.redirect('/board/list');
});

/* get write form */
router.get('/write', function(req, res, next) {
    res.render('write', {title: "셋업", sess: req.session});
});

/* submit write form */
router.post('/write', function (req, res, next) {
    console.log(req.body);

    var filename = __dirname + "/../public/uploads/" + "reqbody.json";

    fs.writeFile(filename, JSON.stringify(req.body), 'utf8', function (e) {
        // res.json({success: true});
        if(e)
            console.log(e);
        else
            console.log(filename + " 파일 쓰기 성공");
    });

    // Setup make file.
    var title = req.body.title;
    var unittest = req.body.unittest;

    // DB model create & save.
    var board = new BoardModel({
        subject: req.body.subject,
        date: req.body.date,
        content: req.body.content,
        submit_form: req.body.submit_form,
        attachment: req.body.attachment
    });

    board.save(function (err, doc) {
        if(err)
            console.error('err', err);
        // res.json(doc);
        // res.redirect('/board/list');
    });

    res.redirect('/board/list');
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
                "max" : max,
                "sess" : req.session
            };

            res.render('list', datas);
        });
    });
});

router.get('/read/:page/:idx', function (req, res, next) {
    if(!req.session.username)
        res.redirect('/board/list');
    else {
        var page = req.params.page;
        var idx = req.params.idx;

        BoardModel.update({"idx": idx}, function (err, doc) {
            if (err) console.error('err', err);

            BoardModel.findOne({"idx": idx}, function (err, docs) {
                if (err) console.error('err', err);
                res.render('read', {"title": "글 읽기", "data": docs, "page": page, "sess": req.session});
            });
        });
    }
});

// 글 300개 임의 작성
router.get('/write300', function (req, res, next) {
   for(var i = 1; i < 300; i++){
       var board = new BoardModel({
            "subject": i + '차 과제',
            "content": i,
            "submit_form": 'jpg',
            'date': '오늘',
            'attached': '첨부맨'
       });

       board.save(function (err, doc) {
           if(err)
               console.error('err', err);
       });
   }

   res.send('<script>alert("success"); location.href="/board/list/1"</script>');
});

module.exports = router;
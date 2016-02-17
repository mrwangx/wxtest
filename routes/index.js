var express = require('express');
var router = express.Router();

/* GET home page. */
/*router.get('/', function(req, res, next) {
  console.log(2);
  res.render('index', { title: 'Express' });
});*/
var wechat_cfg = require('../config/wechat.cfg');
//var http = require('http');
//var cache = require('memory-cache');
//var sha1 = require('sha1'); //签名算法
//var url = require('url');
var signature = require('./signature');
var url = require("url");

router.get('/',function(req,res){
  console.log('index');
  var url = req.protocol + '://' + req.host + req.path; //获取当前url
  signature.sign(url,function(signatureMap){
    signatureMap.appId = wechat_cfg.appid;
    res.render('index',signatureMap);
  });
});
module.exports = router;

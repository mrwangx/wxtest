/**
 * Created by Administrator on 2016/2/17.
 */
var express = require('express');
var router = express.Router();

var url=require('url');
var crypto=require('crypto');
var request=require('request');
var select = require('xpath.js')
    , dom = require('xmldom').DOMParser;
var utils=require('utils');
var needle=require('needle');



/* GET users listing. */
router.get('/', function(req, res, next) {

    var reqObj=url.parse(req.url,true);
    var params=reqObj['query'];
    var signature=params['signature'];
    var timestamp=params['timestamp'];
    var nonce=params['nonce'];
    var echostr=params['echostr'];
    var tmpArr=['mrwangx',timestamp,nonce];
    tmpArr.sort();
    var tmpStr=tmpArr.join('');
    var shasum=crypto.createHash('sha1');
    shasum.update(tmpStr);
    var shaResult=shasum.digest('hex');
    if(shaResult==signature)
    {
        res.send(echostr);
    }
    else
    {
        console.log('not weixin server!');
        res.send('not weixin server!');
    }
});
router.get('/cd',function(req,res){
    var AppId = 'wx3ddb43260f90fe2c';
    var AppSecret = 'dd56595abd62595463403edf549e4854';
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        +AppId+'&secret='+AppSecret;
    needle.get(url, function(err, resp) {
        if(err){
            console.log('access_token获取失败');
        }else{

            console.log(resp.body.access_token);

            var menu={
            "button": [
                {
                    "type": "click",
                    "name": "第一个",
                    "key": "one"
                },
                {
                    "type": "view",
                    "name": "简介",
                    "url": "http://www.cloudpeng.com/"
                },
                {
                    "name": "子菜单",
                    "sub_button": [
                        {
                            "type": "click",
                            "name": "hello word",
                            "key": "hw"
                        },
                        {
                            "type": "view",
                            "name": "看看",
                            "url": "http://k14502w284.imwork.net/"
                        }
                    ]
                }
            ]
        };
            var params = JSON.stringify(menu);
            var options = {};
            var ACCESS_TOKEN =resp.body.access_token;
            var url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token='+ACCESS_TOKEN;
            console.log(url);
            console.log(params);
            needle.post(url, params, options, function(err, resp) {
                if(err)
                {
                    console.log('设置自定义菜单失败');
                }
                else
                {
                    console.log("setmenu");
                    console.log(resp.body);
                    // you can pass params as a string or as an object.
                }

            });
        }
    });
})
router.post('/',function(req,res,next){
    var reqObj=url.parse(req.url,true);
    var params=reqObj['query'];
    var signature=params['signature'];
    var timestamp=params['timestamp'];
    var nonce=params['nonce'];
    var echostr=params['echostr'];
    var tmpArr=['mrwangx',timestamp,nonce];
    tmpArr.sort();
    var tmpStr=tmpArr.join('');
    var shasum=crypto.createHash('sha1');
    shasum.update(tmpStr);
    var shaResult=shasum.digest('hex');
    if(true || shaResult==signature)
    {
        //微信服务器消息�����
        msgAction(req,res,next);
    }
    else
    {
        console.log('not weixin server!');
        res.send('not weixin server!');
    }
});


    function msgAction(req,res,next){
        var post_data="";
        req.on('data',function(chunk){
            post_data+=chunk;
        });
        req.on('end',function(){
           console.log("data:"+post_data);

            var user_msg=acceptMsg(post_data);
            var msgType=user_msg['MsgType'];
            switch (msgType){
                case 'event':
                    wxEvent(user_msg,req,res,next);
                    break;
                case 'text':
                    wxText(user_msg,req,res,next);
                    break;
                case 'image':
                    wxImage(user_msg,req,res,next);
                    break;
                case 'video':
                    wxVideo(user_msg,req,res,next);
                    break;
                case 'location':
                    wxLocation(user_msg,req,res,next);
                    break;
                case 'link':
                    wxLink(user_msg,req,res,next);
                    break;
                case 'voice':
                    wxVoice(user_msg,req,res,next);
                    break;
            }
        });
    }



/**
 * �解析消息
 * */
function acceptMsg(post_data){
    var retMsg='';
    var doc=new dom().parseFromString(post_data);

    function getDomStr(key)
    {
        console.log(key);
        var node=select(doc, '//'+key);
console.log("node:"+node);
        if(node && node[0] && node[0].firstChild)
        {
            return node[0].firstChild.data;
        }
        else
        {
            return null;
        }
    }

    var toUserName=getDomStr('ToUserName');
    var fromUserName=getDomStr('FromUserName');
    var createTime=getDomStr('CreateTime');
    var msgType=getDomStr('MsgType');

    var msgId=getDomStr('MsgId');
    var content=getDomStr('Content');

    var event=getDomStr('Event');
    var eventKey=getDomStr('EventKey');
    var ticket=getDomStr('Ticket');
    var latitude=getDomStr('Latitude');
    var longitude=getDomStr('Longitude');
    var precision=getDomStr('Precision');

    var mediaId=getDomStr('MediaId');
    var format=getDomStr('Format');
    var recognition=getDomStr('Recognition');
    var picUrl=getDomStr('PicUrl');
    var description=getDomStr('Description');

    var location_x=getDomStr('Location_x');
    var location_y=getDomStr('Location_y');
    var scale=getDomStr('Scale');
    var label=getDomStr('Label');

    return {
        ToUserName:toUserName,
        FromUserName:fromUserName,
        CreateTime:createTime,
        MsgType:msgType,
        MsgId:msgId,
        Content:content,
        Event:event,
        EventKey:eventKey,
        Latitude:latitude,
        Longitude:longitude,
        Precision:precision,
        Ticket:ticket,
        MediaId:mediaId,
        Format:format,
        Recognition:recognition,
        Location_X:location_x,
        Location_Y:location_y,
        Scale:scale,
        Label:label,
        PicUrl:picUrl,
        Description:description,
        Url:url
    }
}

function wxEvent(user_msg,req,res,next)
{
    console.log(user_msg);
    if(user_msg['EventKey']=='one')
    {
        console.log('第一个');
    //  res.send('/index');
       // sendTextMsg(user_msg,res,'第一个');
        sendImageMsg(user_msg,res,'第一个1','第一个11','第一个2','第一个22');
    }
    else if(user_msg['EventKey']=='hw'){
        sendTextMsg(user_msg,res,'hello word');
    }
    //next();
}

function sendImageMsg(user_msg,res,title1,description1,title2,description2){
    var fromUserName=user_msg['ToUserName'];
    var toUserName=user_msg['FromUserName'];

    var createTime=new Date().getTime();
    /*var msgType='text';
    var msgId=user_msg['MsgId'];
    var obj={
        FromUserName:fromUserName,
        ToUserName:toUserName,
        CreateTime:createTime
    };*/

    var xml='<xml>' +
        '<ToUserName><![CDATA['+toUserName+']]></ToUserName>' +
        '<FromUserName><![CDATA['+fromUserName+']]></FromUserName>' +
        '<CreateTime>'+createTime+'</CreateTime>' +
        '<MsgType><![CDATA[news]]></MsgType>' +
        '<ArticleCount>2</ArticleCount>' +
        '<Articles>' +
        '<item>' +
        '<Title><![CDATA['+title1+']]></Title>' +
        '<Description><![CDATA['+description1+']]></Description>' +
        '<PicUrl><![CDATA[http://k14502w284.imwork.net/images/sz.jpg]]></PicUrl>' +
        '<Url><![CDATA[http://k14502w284.imwork.net/images/sz.jpg]]></Url>' +
        '</item>' +
        '<item>' +
        '<Title><![CDATA['+title2+']]></Title>' +
        '<Description><![CDATA['+description2+']]></Description>' +
        '<PicUrl><![CDATA[http://k14502w284.imwork.net/images/sz.jpg]]></PicUrl>' +
        '<Url><![CDATA[http://k14502w284.imwork.net/]]></Url>' +
        '</item>' +
        '</Articles>' +
        '</xml> ';
    res.send(xml);
}


function wxText(user_msg,req,res,next){
    console.log(user_msg['Content']);
    var text=user_msg['Content'];
    if(text=='任务')
    {
        text="请选择您要查询的任务\n 1:未接收的任务\n 2:未完成的任务\n请编辑：员工工号+数字\n如:员工工号101，查询1，编辑1011回复即可";
    }
    else if(text.charAt(text.length - 1)=='1')
    {
        text='暂未开放，未查询到有未接收的任务';
    }
    else if(text.charAt(text.length - 1)=='2')
    {
        text='暂未开放，未查询到未完成的任务';
    }
    else
    {
        res.redirect('/index');
        return;
    }
    sendTextMsg(user_msg,res,text);
}

function sendTextMsg(user_msg,res,content)
{
    var fromUserName=user_msg['ToUserName'];
    var toUserName=user_msg['FromUserName'];

    var createTime=new Date().getTime();
    var msgType='text';
    var msgId=user_msg['MsgId'];
    var obj={
        FromUserName:fromUserName,
        ToUserName:toUserName,
        CreateTime:createTime,
        MsgType:msgType,
        MsgId:msgId,
        Content:content
    };
    var retMsg=new Message(obj);
    retMsg.send(res);
}


/**
 * �发送消息
 * **/
var numberItems='CreateTime,ArticleCount,MsgId'.split(',');
var Message=function(msg){
    this.msg=msg;
};

Message.prototype.toXML=function(){
    var str='';
    for(var key in this.msg){
        var value=this.msg[key];
       // console.log("123:"+key+","+numberItems[0]);
       // console.log(numberItems.indexOf('CreateTime'));
        if(numberItems.indexOf(key)>=0)
        {
            str+='<'+key+'>'+value+'</'+key+'>';
        }
        else
        {
            str+='<'+key+'><![CDATA['+value+']]></'+key+'>';
        }
    }
    //console.log("str:"+str);
    return '<xml>'+str+'</xml>';
}

Message.prototype.send=function(res){
   // console.log(this.toXML());
   /* var xml='<xml><FromUserName><![CDATA[gh_25fbcd62e3e9]]></FromUserName>' +
        ' <ToUserName><![CDATA[o3r6XuMDPa2wT5wNeuqmmshUCvxc]]></ToUserName>' +
        '    <CreateTime>1455692829</CreateTime>' +
        '    <MsgType><![CDATA[text]]></MsgType>' +
        '    <Content><![CDATA[123]]></Content>' +
        ' <MsgId>6252153093981427593</MsgId>  </xml>';
    res.send(xml);
    var xml='<xml><FormUserName><![CDATA[gh_25fbcd62e3e9]]></FormUserName>' +
        '<ToUserName><![CDATA[o3r6XuMDPa2wT5wNeuqmmshUCvxc]]></ToUserName>' +
        '<CreateTime>1455693065598</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        '<MsgId>6252154571450177451</MsgId>' +
        '<Content><![CDATA[Hello]]></Content></xml>';*/
    res.send(this.toXML());
}

/**
 * �����
 * 服务和发送消息
/*
Message.prototype.sendAsyn=function(){
    var apiUrl='';
    request.post(apiUrl,{json:this.msg},function(err,resp,body){
        if(err)
        {
            console.log(err);
        }
        console.log('send Asyn Msg:'+JSON.stringify(body));
    })
}
*/

module.exports = router;

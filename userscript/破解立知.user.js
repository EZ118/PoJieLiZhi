// ==UserScript==
// @name         破解立知
// @namespace    https://ez118.github.io/
// @version      5.2
// @description  破解立知课堂工具（由两位来自上海市某中学的青年共同编制、调试和维护）
// @author       ZZY_WISU
// @match        https://*.imlizhi.com/slive/pc/*
// @match        https://easilive.seewo.com/*
// @license      GNU GPLv3
// @icon         https://edu.seewo.com/res/head/1/default.png
// @run-at document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.bootcss.com/pako/1.0.6/pako.min.js
// ==/UserScript==


/*   自定义部分   */

var verlist = [69, 50 ,40, 36, 29, 25, 19, 14, 11, 8, 4, 1];
//破解列表

var api = "https://s2.imlizhi.com/slive/pc/enow/thumbnail/api/v1/courseware";
//对接官方接口

var ReaderUrl = "https://easilive.seewo.com/ZZY_WISU/";
//课件浏览器的链接

var ScriptUrl = "https://greasyfork.org/scripts/441933-%E7%A0%B4%E8%A7%A3%E7%AB%8B%E7%9F%A5/code/%E7%A0%B4%E8%A7%A3%E7%AB%8B%E7%9F%A5.user.js";
//用于查检更新的链接

var MaxPageNum = 200;
//用于储存最大课件页面数量

var ShareReaderUrl = "https://ez118.github.io/static/PoJieLiZhi/";
//分享的课件的阅读器链接（默认为作者个人建立的阅读器，你也可以参照并下载//github.com/EZ118/EZ118.github.io/blob/master/static/PoJieLiZhi/index.html，以此建立自己的阅读器）

/*以上为自定义部分*/

/* 以下为菜单设定 */
function OpenExplorer() {
    let cid = document.getElementsByClassName("enow__stage-wrap")[0].id.replace("stage-", "");
    let title = document.getElementsByTagName("title")[0].innerText;
    window.open(ReaderUrl + "@" + cid + "@0@" + encodeURI(title) + "@0");
}

function UnlockLimit() {
    try{
        let parent=document.getElementById('enow__non-interacte-hover');
        parent.setAttribute("style", "display:none;");
    }catch(e){}
    try{
        let parent=document.getElementById('enow__non-interacte-hover');
        parent.setAttribute("onclick", "this.setAttribute('style', 'display:none;');");
    }catch(e){}
    try{
        let toolbx = document.getElementsByClassName("enow__teachingtool-hide")[0];
        toolbx.setAttribute("class", "enow__teachingtool");
    }catch(e){}
}

function RemoveCover() {
    try{
       var parent= document.getElementsByClassName('live-poster live-pc-poster')[0];
       parent.setAttribute("style", "visibility: hidden;");
    }catch(e){}
}

function RemoveHand(mode){
    if (typeof mode === 'undefined') {mode = "HideHand";}
    try{
        let parent = document.getElementsByClassName('live-raise-hand live-pc-raise-hand live-student-raise-hand')[0];
        if(mode == "HideHand"){parent.setAttribute("style", "visibility: hidden;");}
        else {
            parent.setAttribute("style", "width:25px; height:25px; overflow:hidden; border-radius:10px;");
            document.getElementsByClassName('live-raise-hand-item')[0].setAttribute("style", "width: 25px;height:25px;");
        }
    }catch(e){
        alert("未能在页面上找到举手按钮");
        return;
    }
}

function BadGuyMode(){
    var test_value = confirm("请选择，是否打开骇客模式？\n提示：骇客模式相较于坏小孩模式去除了自动移除举手按钮。\n打开后将会在进入教室后自动执行以下功能: \n解锁学生操作课件限制、解除讨论区字符限制、移除课前等待遮罩、缩小举手按钮。");

    if(test_value == true) { GM_setValue('BadGuyMode', {'state':'true'}); alert("已开启“骇客模式”！");}
    else { GM_setValue('BadGuyMode', {'state':'false'}); alert("已关闭“骇客模式”！");}
}

function CheckUpdate(){
    location.href = ScriptUrl;
}

function MsgWordNumBreak(){
    try{
       let iptbx = document.getElementsByClassName("live-chat-send-msg-txt")[0];
       iptbx.removeAttribute("maxlength");
    }catch(e){}
}

let menu1 = GM_registerMenuCommand('手动打开课件浏览器', function () { OpenExplorer(); }, 'O');
let menu2 = GM_registerMenuCommand('解锁学生操作课件限制', function () { UnlockLimit(); }, 'U');
let menu3 = GM_registerMenuCommand('解除讨论区字符限制', function () { MsgWordNumBreak(); }, 'M');
let menu4 = GM_registerMenuCommand('移除课前等待遮罩', function () { RemoveCover(); }, 'R');
let menu5 = GM_registerMenuCommand('移除举手按钮', function () { RemoveHand("HideHand"); }, 'H');
let menu6 = GM_registerMenuCommand('骇客模式', function () { BadGuyMode(); }, 'B');
let menu7 = GM_registerMenuCommand('查检更新', function () { CheckUpdate(); }, 'C');
/* 以上为菜单设定 */


function runAsync(url,send_type,data_ry) {
    var p = new Promise((resolve, reject)=> {
        GM_xmlhttpRequest({
            method: send_type,
            url: url,
            headers: {"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
            data:data_ry,
            onload: function(response){resolve(response.responseText);},
            onerror: function(response){reject("请求失败");}
        });
    })
    return p;
}

(function() {
    'use strict';

    if(window.location.href.split("@")[0] == ReaderUrl){
        var data = window.location.href.split("@")[1];//课程ID
        var ver = window.location.href.split("@")[2];//版本号在破解字典中的位置
        var title = window.location.href.split("@")[3];//教师标题
        var adds = window.location.href.split("@")[4];//版本微调
        if(adds == undefined) {adds = "0";}
        adds = new Number(adds);//课件版本微调
        var dochtml = "";//输出的html
        var obj = [];//课件列表
        var PageCnt = 0;//有效课件页面计数器
        var ShareData = "";//分享链接所包含的数据

        runAsync(api + "?coursewareId=" + data + "&version=" + (verlist[ver] + adds) + "&resolution=960_640","GET","content=erwer").then((result)=> {return result;}).then(function(result){
            var filelist = eval("("+result+")");
            if(filelist.message != "error"){
                /*将课件按照顺序给obj变量赋值*/
                for(var i = 0; i <= MaxPageNum; i ++){
                    try{
                        obj[filelist.data[i].pageIndex] = filelist.data[i].downloadUrl;
                    }catch{}
                }
                /*将obj中的课件按顺序以html的形式写入dochtml，以及生成分享链接*/
                for(i = 0; i <= MaxPageNum; i ++){
                    if(obj[i] != undefined) {
                        /*写入html*/
                        dochtml += "<img src='" + obj[i] + "' title='第" + (i + 1) + "页'><br>"; PageCnt += 1;
                        /*生成分享链接*/
                        ShareData += obj[i].replace("https://cstore-private-bs.seewo.com/easinote/encloud-", "").split("?")[0] + ",";
                    }
                }
                /*压缩字符串*/

                ShareData = window.btoa(pako.gzip(ShareData.replace("undefined", ""), {to: "string"}));
                /*script储存javascript脚本，header储存<head>标签中的html元素，shareExt储存分享功能的html*/
                var script = '<script>function printmode(){document.getElementsByClassName("msg")[0].remove();document.getElementsByClassName("share")[0].remove();document.getElementsByTagName("style")[0].innerText = "img{width:100%;margin-top:15px;}";}</script>';
                var header = "<title>课件浏览器 | " + decodeURI(title) +"</title><style>body{background-color: rgb(50, 54, 57); user-select: none;margin:0px;} .ctrl{font-size:14px; border-radius:15px; padding:5px; padding-left:13px; padding-right:13px; background-color: rgb(51, 51, 51); color:#FFF; border:1px solid #CCC;} .msg{position:fixed; top:15px; left:15px; z-index:5;} .share{position:fixed; top:15px; right:15px; z-index:5;} img{width:60%; min-width:450px; margin-top:5px; border-radius:4px;} .printBtn{margin:10px;} a{color:#FFF; text-decoration:none;}</style>";
                var shareExt = '<div class="ctrl share" title="右键此处，然后点击复制链接即可！"><a href="' + ShareReaderUrl + '#' + ShareData +'" target="_blank">分享</a></div>';
                document.write(header + script + '<body><div class="ctrl msg"><a href="' + ReaderUrl + '@' + data + '@' + ver + '@' + title + '@' + (adds - 1) + '">◀</a>&nbsp;共' + PageCnt + '页 (版本: ' + (verlist[ver] + adds) + ')&nbsp;<a href="' + ReaderUrl + '@' + data + '@' + ver + '@' + title + '@' + (adds + 1) + '">▶</a></div>' + shareExt + '<center>' + dochtml + '<button onclick="this.remove();printmode();" class="ctrl printBtn">打印&nbsp;&amp;&nbsp;PDF存储模式</button></center></body>');
            } else {
                ver = new Number(ver) + 1;
                if(verlist[ver] != undefined) location.href=ReaderUrl + "@" + data + "@" + ver + "@" + title + "@0";
                else document.write("<title>出现问题</title><h2>抱歉，无法为您获取课件</h2><hr><b>你可以尝试更新该脚本以取得最新的破解字典。</b>");
            }
        });
    } else if(window.location.href.split("/")[3] == "preview" || window.location.href.split("/")[3] == "course"){
        var div=document.createElement("a");
        div.innerText="右键空白处浏览课件";
        div.setAttribute("style", "z-index:9;position:absolute;right:60px;top:120px;");
        document.body.appendChild(div);
        document.body.insertBefore(div, document.body.firstElementChild);
    } else {
        if(GM_getValue('BadGuyMode').state == "true"){
            setTimeout(function() {
                UnlockLimit();
                RemoveCover();
                RemoveHand("MinimizeHand");
                MsgWordNumBreak();
            }, 6000);
        }
    }
})();
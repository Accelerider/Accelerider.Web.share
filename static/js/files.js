/*
-   Accelerider.Web.share
-   made   by zishuo & aq
-   date    12/26/2017
-   ver      1.0.1
*/
$('.main-content').data('shareid',getUrlParams('shareid'));
$('.main-content').data('passwd',decodeURIComponent(getUrlParams('pass')));
setCookie('Path', "", -1); 
var xPath = getCookie('Path');
setTimeout(function(){
	GetFiles((xPath!=undefined?xPath:'/'));
},800);

PathPlaceBtn((xPath!=undefined?xPath:'/'));
setCookie('uploadSize',1024 * 1024 * 1024);
if(getCookie('rank') == undefined || getCookie('rank') == null){
	setCookie('rank','a');
}
$("#set_icon").click(function(){
	setCookie('rank','b');
	$(this).addClass("active");
	$("#set_list").removeClass("active");
	GetFiles(getCookie('Path'));
});
$("#set_list").click(function(){
	setCookie('rank','a');
	$(this).addClass("active");
	$("#set_icon").removeClass("active");
	GetFiles(getCookie('Path'));
})
$(".refreshBtn").click(function(){
	GetFiles(getCookie('Path'));
})

//判断磁盘数量超出宽度
function IsDiskWidth(){
	var comlistWidth = $("#comlist").width();
	var bodyWidth = $(".file-box").width();
	if(comlistWidth + 530 > bodyWidth){
		$("#comlist").css({"width":bodyWidth-530+"px","height":"34px","overflow":"auto"});
	}
	else{
		$("#comlist").removeAttr("style");
	}
}

//去扩展名不处理
function getFileName(name){
	var text = name.split(".");
	var n = text.length-1;
	text = text[n];
	return text;
}
//判断图片文件
function ReisImage(fileName){
	var exts = ['jpg','jpeg','png','bmp','gif','tiff','ico'];
	for(var i=0; i<exts.length; i++){
		if(fileName == exts[i]) return true
	}
	return false;
}
function getUrlParams(name) {
    var params = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
        params[key] = value;
    });
    return params[name] || params;
}
function GetShareFiles(type){
	if (type == 1) {
		var shareid = $("#shareid").val() || $('.main-content').data('shareid');
		var passwd = $("#filespasswd").val() || $('.main-content').data('passwd');
		if(typeof(shareid) == "object"){
		    layer.msg('分享ID都不给叫我怎么办?')
		    return ;
		}
		if(shareid){
		    var data = 'shareid='+shareid+'&pass=' + encodeURIComponent(passwd);
		    console.log(data)
        	$.post('./api/index.php?'+data,function(d) {
        	    $('.main-content').data('shareid',shareid);
        	    $('.main-content').data('passwd',decodeURIComponent(passwd));
        	    if(d.errno == 1){
        	        GetShareFiles(0)
        	        layer.msg(d.message)
        	    }else if(d.errno == 2){
        	        Dopasswd(0)
        	        layer.msg(d.message)
        	    }else{
        	        $('.main-content').data('token',d.token);
        	        GetFiles((xPath!=undefined?xPath:'/'));
        	    }
        	});
        	layer.closeAll();
		}else{
		    layer.msg('你似乎没有填写内容哦！', {icon: 2,time: 2e3});
		}
		return;
	}
	layer.open({
		type: 1,
		shift: 5,
		closeBtn: 2,
		move:0,
		scrollbar:false,
		area: '400px', //宽高
		title: '分享文件提取',
		content: '<div class="bt-form pd20 pb70">\
					<div class="line">\
					<input type="text" class="bt-input-text" name="shareid" id="shareid" placeholder="请输入文件提取码" style="width:100%" value=""/>\
					</div>\
					<input type="text" class="bt-input-text" name="passwd" id="filespasswd" placeholder="若果有分享密码，请输入文件提取密码" style="width:100%" value=""/>\
					</div>\
					<div class="bt-form-submit-btn">\
					<button type="button" class="btn btn-danger btn-sm btn-title" onclick="layer.closeAll()">取消</button>\
					<button type="button" id="btn-share" class="btn btn-success btn-sm btn-title" onclick="GetShareFiles(1)">确定</button>\
					</div>\
				</div>'
	});
	$("#btn-share").focus().keyup(function(e){
		if(e.keyCode == 13) $("#btn-share").click();
	});
}
function Dopasswd(type){
	if (type == 1) {
		var passwd = $("#filepasswd").val() || $('.main-content').data('passwd'),
		    shareid = $('.main-content').data('shareid') || getUrlParams('shareid');
		if(passwd){
		    var data = 'shareid='+shareid+'&pass=' + encodeURIComponent(passwd);
        	$.post('./api/index.php?'+data,function(d) {
        	    $('.main-content').data('shareid',shareid);
        	    $('.main-content').data('passwd',decodeURIComponent(passwd));
        	    if(d.errno){
        	        Dopasswd(0)
        	        layer.msg(d.message)
        	    }else{
        	        $('.main-content').data('token',d.token);
        	        GetFiles((xPath!=undefined?xPath:'/'));
        	    }
        	});
        	layer.closeAll();
		}else{
		    layer.msg('你似乎没有填写内容哦！', {icon: 2,time: 2e3});
		}
		return;
	}
	layer.open({
		type: 1,
		shift: 5,
		closeBtn: 2,
		move:0,
		scrollbar:false,
		area: '400px', //宽高
		title: '请输入文件提取密码',
		content: '<div class="bt-form pd20 pb70">\
					<div class="line">\
					<input type="text" class="bt-input-text" name="passwd" id="filepasswd" placeholder="请输入文件提取密码" style="width:100%" value=""/>\
					</div>\
					<div class="bt-form-submit-btn">\
					<button type="button" class="btn btn-danger btn-sm btn-title" onclick="layer.closeAll()">取消</button>\
					<button type="button" id="btn-passwd" class="btn btn-success btn-sm btn-title" onclick="Dopasswd(1)">确定</button>\
					</div>\
				</div>'
	});
	$("#btn-passwd").focus().keyup(function(e){
		if(e.keyCode == 13) $("#btn-passwd").click();
	});
}
//取数据
function GetFiles(Path) {
	var Body = '';
	var loadT = layer.load();
	var totalSize = 0;
	var shareid = $('.main-content').data('shareid') || '',
	    passwd = $('.main-content').data('passwd') || '',
	    token = $('.main-content').data('token') || '';

	if(typeof(shareid) == "object"){
	    GetShareFiles(0);
	    return ;
	}
	$.post("./api/index.php",{shareid: shareid,token: token,path:encodeURIComponent(Path)}, function(rdata) {
		layer.close(loadT);
		if(rdata.errno){
		    if(passwd){
		        Dopasswd(1);
		    }else{
		       Dopasswd(0); 
		    }
		    return ;
		}else if(rdata.errno == 0 && rdata.token){
		    $('.main-content').data('token',rdata.token);
		    GetFiles(Path);
		    return ;
		}
		if(rdata.DIR == null) rdata.DIR = [];
		for (var i = 0; i < rdata.DIR.length; i++) {
			var fmp = rdata.DIR[i].split(";");
			var cnametext =fmp[0];// + fmp[4];
			if(cnametext.length>64){
				cnametext = cnametext.substring(0,64)+'...'
			}
			if(isChineseChar(cnametext)){
				if(cnametext.length>30){
					cnametext = cnametext.substring(0,30)+'...'
				}
			}
			var timetext ='--';
			if(getCookie("rank") == "a"){
					$("#set_list").addClass("active");
					$("#set_icon").removeClass("active");
					Body += "<tr class='folderBoxTr' data-path='" + rdata.PATH + "/" + fmp[0] + "' filetype='dir'>\
						<td><input type='checkbox' name='id' value='"+fmp[5]+"'></td>\
						<td class='column-name'><span class='cursor' onclick=\"GetFiles('" + rdata.PATH + "/" + fmp[0] + "')\"><span class='ico ico-folder'></span><a class='text' title='" + fmp[0] + fmp[5] + "'>" + cnametext + "</a></span></td>\
						<td>"+ToSize(fmp[1])+"</td>\
						<td>"+getLocalTime(fmp[2])+"</td>\
						<td>"+fmp[4]+"</td>\
						<td class='editmenu'><span>\
						<a class='btlink' href='javascript:;' onclick=\"GetFiles('" + rdata.PATH + "/" + fmp[0] + "')\">打开文件夹</a></span>\
					</td></tr>";
			}
			else{
				$("#set_icon").addClass("active");
				$("#set_list").removeClass("active");
				Body += "<div class='file folderBox menufolder' data-path='" + rdata.PATH + "/" + fmp[0] + "' filetype='dir' title='文件名：" + fmp[0]+"&#13;大小：" + ToSize(fmp[1])+"&#13;创建时间："+getLocalTime(fmp[2])+"&#13;修改时间："+getLocalTime(fmp[3])+"&#13;所有者："+fmp[4]+"'>\
						<input type='checkbox' name='id' value='"+fmp[0]+"'>\
						<div class='ico ico-folder' ondblclick=\"GetFiles('" + rdata.PATH + "/" + fmp[0] + "')\"></div>\
						<div class='titleBox' onclick=\"GetFiles('" + rdata.PATH + "/" + fmp[0] + "')\"><span class='tname'>" + fmp[0] + "</span></div>\
						</div>";
			}
		}
		for (var i = 0; i < rdata.FILES.length; i++) {
			if(rdata.FILES[i] == null) continue;
			var fmp = rdata.FILES[i].split(";");
			var displayZip = isZip(fmp[0]);
			var bodyZip = '';
			var download = '';
			var cnametext =fmp[0];// + fmp[4];
// 			if(cnametext.length>48){
// 				cnametext = cnametext.substring(0,48)+'...'
// 			}
// 			if(isChineseChar(cnametext)){
// 				if(cnametext.length>48){
// 					cnametext = cnametext.substring(0,48)+'...'
// 				}
// 			}
			if(isImage(fmp[0])){
				download = "<a class='btlink' href='javascript:;' onclick=\"GetImage('" + rdata.PATH +"/"+ fmp[0] + "')\">预览</a> | ";
				download += "<a class='btlink' href='javascript:;' onclick=\"GetFileBytes('" + rdata.PATH +"/"+ fmp[0] + "',"+fmp[1]+")\">下载</a> | ";
			}else{
				download = "<a class='btlink' href='javascript:;' onclick=\"GetFileBytes('" + rdata.PATH +"/"+ fmp[0] + "',"+fmp[1]+")\">下载</a> | ";
			}
			
			totalSize +=  parseInt(fmp[1]);
			if(getCookie("rank")=="a"){
				Body += "<tr class='folderBoxTr' data-path='" + rdata.PATH +"/"+ fmp[0] + "' filetype='" + fmp[0] + "'><td><input type='checkbox' name='id' value='"+fmp[5]+"'></td>\
						<td class='column-name'><span class='ico ico-"+(GetExtName(fmp[0]))+"'></span><a class='text' title='" + fmp[0] + fmp[5] + "'>" + cnametext + "</a></td>\
						<td>" + (ToSize(fmp[1])) + "</td>\
						<td>" + ((fmp[2].length > 11)?fmp[2]:getLocalTime(fmp[2])) + "</td>\
						<td>"+fmp[4]+"</td>\
						<td class='editmenu'>\
						<span>\
						<a class='btlink' href='javascript:;' onclick=\"GetFileBytes('" + rdata.PATH +"/" + fmp[0] + "')\">直链下载</a> | \
						<a class='btlink' href=\"javascript:AccFileBytes('" + rdata.PATH +"/" +fmp[0] + "');\">坐骑下载</a> | \
						<a class='btlink' href=\"javascript:AriaFileBytes('" + rdata.PATH +"/" +fmp[0] + "');\">Aria2下载</a> \
						</span></td></tr>";
			}
			else{
				Body += "<div class='file folderBox menufile' data-path='" + rdata.PATH +"/"+ fmp[0] + "' filetype='"+fmp[0]+"' title='文件名：" + fmp[0]+"&#13;大小：" + ToSize(fmp[1])+"&#13;修改时间："+getLocalTime(fmp[2])+"&#13;权限："+fmp[3]+"&#13;所有者："+fmp[4]+"'>\
						<input type='checkbox' name='id' value='"+fmp[0]+"'>\
						<div class='ico ico-"+(GetExtName(fmp[0]))+"'></div>\
						<div class='titleBox'><span class='tname'>" + fmp[0] + "</span></div>\
						</div>";
			}
		}
		var dirInfo = '(共'+rdata.DIR.length+'个目录与'+rdata.FILES.length+'个文件,大小:<font id="pathSize">'+(ToSize(totalSize))+'</font>)';
		$("#DirInfo").html(dirInfo);
		if(getCookie("rank")=="a"){
			var tablehtml = '<table width="100%" border="0" cellpadding="0" cellspacing="0" class="table table-hover">\
							<thead>\
								<tr>\
									<th width="3%"><input type="checkbox" id="setBox" placeholder=""></th>\
									<th>文件名</th>\
									<th width="9%">大小</th>\
									<th width="15%">创建时间</th>\
									<th width="19%">文件MD5</th>\
									<th style="text-align: right;" width="16%">操作</th>\
								</tr>\
							</thead>\
							<tbody id="filesBody" class="list-list">'+Body+'</tbody>\
						</table>';
			$("#fileCon").removeClass("fileList").html(tablehtml);
			$("#tipTools").width($("#fileCon").width());
		}
		else{
			$("#fileCon").addClass("fileList").html(Body);
			$("#tipTools").width($("#fileCon").width());
		}
		$("#DirPathPlace input").val(rdata.PATH);
		var BarTools = '';
		if (rdata.PATH != '/') {
			BarTools += ' <button onclick="javascript:BackDir();" class="btn btn-default btn-sm glyphicon glyphicon-arrow-left" title="返回上一级"></button>';
		}
		setCookie('Path',rdata.PATH);
		BarTools += ' <button onclick="javascript:GetFiles(\'' + rdata.PATH + '\');" class="btn btn-default btn-sm glyphicon glyphicon-refresh" title="刷新"></button> ';
		$("#Batch").html('');
		$("#setBox").prop("checked", false);
		
		$("#BarTools").html(BarTools);
		
		$("input[name=id]").click(function(){
			if($(this).prop("checked")) {
				$(this).prop("checked", true);
				$(this).parents("tr").addClass("ui-selected");
			}
			else{
				$(this).prop("checked", false);
				$(this).parents("tr").removeClass("ui-selected");
			}
		});

		$("#setBox").click(function() {
			if ($(this).prop("checked")) {
				$("input[name=id]").prop("checked", true);
				$("#filesBody > tr").addClass("ui-selected");
				
			} else {
				$("input[name=id]").prop("checked", false);
				$("#filesBody > tr").removeClass("ui-selected");
			}
		});
		//阻止冒泡
		$("#filesBody .btlink").click(function(e){
			e.stopPropagation();
		});
		$("input[name=id]").dblclick(function(e){
			e.stopPropagation();
		});
		//禁用右键
		$("#fileCon").bind("contextmenu",function(e){
			return false;
		});
		bindselect();
		//绑定右键
		$("#fileCon").mousedown(function(e){
			var count = totalFile();
			if(e.which == 3) {
				if(count>1){
					RClickAll(e);
				}
				else{
					return
				}
			}
		});
		$(".folderBox,.folderBoxTr").mousedown(function(e){
			var count = totalFile();
			if(e.which == 3) {
				if(count <= 1){
					var a = $(this);
					a.contextify(RClick(a.attr("filetype"),a.attr("data-path"),a.find("input").val()));
				}
				else{
					RClickAll(e);
				}
			}
		});
		PathPlaceBtn(rdata.PATH);
	});
  setTimeout(getCookie('path'),200);
}
//统计选择数量
function totalFile(){
	var el = $("input[name='id']");
	var len = el.length;
	var count = 0;
	for(var i=0;i<len;i++){
		if(el[i].checked == true){
			count++;
		}
	}
	return count;
}
//绑定操作
function bindselect(){
	$("#filesBody,#fileCon").selectable({
		autoRefresh: false,
		filter:"tr,.folderBox",
		cancel: "a,span,input,.ico-folder",
		selecting:function(e){
			$(".ui-selecting").find("input").prop("checked", true);
		},
		selected:function(e){
			$(".ui-selectee").find("input").prop("checked", false);
			$(".ui-selected", this).each(function() {
				$(this).find("input").prop("checked", true);
			});
		},
		unselecting:function(e){
			$(".ui-selectee").find("input").prop("checked", false);
			$(".ui-selecting").find("input").prop("checked", true);
			$("#rmenu").hide()
		}
	});
	$("#filesBody,#fileCon").selectable("refresh");
	//重绑图标点击事件
	$(".ico-folder").click(function(){
		$(this).parent().addClass("ui-selected").siblings().removeClass("ui-selected");
		$(".ui-selectee").find("input").prop("checked", false);
		$(this).prev("input").prop("checked", true);
	})
}

//滚动条事件
$(window).scroll(function () {
	if($(window).scrollTop() > 16){
		$("#tipTools").css({"position":"fixed","top":"50px","left":"195px","box-shadow":"0 1px 10px 3px #ccc"});
	}else{
		$("#tipTools").css({"position":"absolute","top":"0","left":"0","box-shadow":"none"});
	}
});
$("#tipTools").width($(".file-box").width());
$("#PathPlaceBtn").width($(".file-box").width()-460);
$("#DirPathPlace input").width($(".file-box").width()-460);
if($(window).width()<1160){
	$("#PathPlaceBtn").width(290);
}
window.onresize = function(){
	$("#tipTools").width($(".file-box").width()-30);
	$("#PathPlaceBtn").width($(".file-box").width()-460);
	$("#DirPathPlace input").width($(".file-box").width()-460);
	if($(window).width()<1160){
		$("#PathPlaceBtn,#DirPathPlace input").width(290);
	}
	PathLeft();
	IsDiskWidth()
}

//取扩展名
function GetExtName(fileName){
	var extArr = fileName.split(".");	
	var exts = ['folder','folder-unempty','sql','c','cpp','cs','flv','css','js','htm','html','java','log','mht','php','url','xml','ai','bmp','cdr','gif','ico','jpeg','jpg','JPG','png','psd','webp','ape','avi','flv','mkv','mov','mp3','mp4','mpeg','mpg','rm','rmvb','swf','wav','webm','wma','wmv','rtf','docx','fdf','potm','pptx','txt','xlsb','xlsx','7z','cab','iso','rar','zip','gz','bt','file','apk','bookfolder','folder','folder-empty','folder-unempty','fromchromefolder','documentfolder','fromphonefolder','mix','musicfolder','picturefolder','videofolder','sefolder','access','mdb','accdb','sql','c','cpp','cs','js','fla','flv','htm','html','java','log','mht','php','url','xml','ai','bmp','cdr','gif','ico','jpeg','jpg','JPG','png','psd','webp','ape','avi','flv','mkv','mov','mp3','mp4','mpeg','mpg','rm','rmvb','swf','wav','webm','wma','wmv','doc','docm','dotx','dotm','dot','rtf','docx','pdf','fdf','ppt','pptm','pot','potm','pptx','txt','xls','csv','xlsm','xlsb','xlsx','7z','gz','cab','iso','rar','zip','bt','file','apk','css'];
	var extLastName = extArr[extArr.length - 1];
	for(var i=0; i<exts.length; i++){
		if(exts[i]==extLastName){
			return exts[i];
		}
	}
	return 'file';
}
//操作显示
function ShowEditMenu(){
	$("#filesBody > tr").hover(function(){
		$(this).addClass("hover");
	},function(){
		$(this).removeClass("hover");
	}).click(function(){
		$(this).addClass("on").siblings().removeClass("on");
	})
}
//取文件名
function GetFileName(fileNameFull) {
	var pName = fileNameFull.split('/');
	return pName[pName.length - 1];
}
//返回上一级
function BackDir() {
	var str = $("#DirPathPlace input").val().replace('//','/');
	if(str.substr(str.length-1,1) == '/'){
		str = str.substr(0,str.length-1);
	}
	var Path = str.split("/");
	var back = '';
	if (Path.length > 2) {
		var count = Path.length - 1;
		for (var i = 0; i < count; i++) {
			back += Path[i] + '/';
		}
		if(back.substr(back.length-1,1) == '/'){
			back = back.substr(0,back.length-1);
		}
		console.log(back)
		GetFiles(back);
	} else {
		back += Path[0];
		console.log(back)
		GetFiles(back);
	}
  setTimeout('PathPlaceBtn(getCookie("Path"));',200);
}

//重载文件列表
function ReloadFiles(){
	setInterval(function(){
		var path = $("#DirPathPlace input").val();
		GetFiles(path);
	},3000);
}

//是否压缩文件
function isZip(fileName){
	var ext = fileName.split('.');
	var extName = ext[ext.length-1].toLowerCase();
	if( extName == 'zip') return 0;
	if( extName == 'gz' || extName == 'tgz') return 1;
	return -1;
}

//是否文本文件
function isText(fileName){
	var exts = ['rar','zip','tar.gz','gz','iso','xsl','doc','xdoc','jpeg','jpg','png','gif','bmp','tiff','exe','so','7z','bz'];
	return isExts(fileName,exts)?false:true;
}

//是否图片文件
function isImage(fileName){
	var exts = ['jpg','jpeg','png','bmp','gif','tiff','ico'];
	return isExts(fileName,exts);
}

//是否视频文件
function isVideo(fileName){
	var exts = ["webm","rm","rmvb","ts","mpeg","mov","mp4","m4a","3gp","3g2","mj2","mkv","flv","avi","asf","m3u8","m3u"];
	return isExts(fileName,exts);
}

//是否为指定扩展名
function isExts(fileName,exts){
	var ext = fileName.split('.');
	if(ext.length < 2) return false;
	var extName = ext[ext.length-1].toLowerCase();
	for(var i=0;i<exts.length;i++){
		if(extName == exts[i]) return true;
	}
	return false;
}

//aria2设置
function DoAria2(type){
    var rpc_server = localStorage.getItem("aria2_server") || '';
    var rpc_token = localStorage.getItem("aria2_token") || '';
	if (type == 1) {
		var rpc_server = $("#host").val();
		var rpc_token = $("#token").val();
		if(rpc_server){
        	layer.msg('正在保存...', {
        		icon: 16,
        		time: 1500
        	});
        	localStorage.setItem("aria2_server", rpc_server);
        	localStorage.setItem("aria2_token", rpc_token);
        // 	CheckAria2();
        	setTimeout("layer.closeAll()",3000);
		}else{
		    layer.msg('你似乎没有填写内容哦！', {
        		icon: 2,
        		time: 2e3
        	});
		}
		return;
	}
	layer.open({
		type: 1,
		shift: 5,
		closeBtn: 2,
		scrollbar:false,
		area: '400px', //宽高
		title: '设置Aria2服务器地址',
		content: '<div class="bt-form pd20 pb70">\
					<div class="line">\
					<input type="text" class="bt-input-text" name="host" id="host" placeholder="Aria2服务器,例如 http://host:port/jsonrpc" style="width:100%" value="'+rpc_server+'"/>\
					</div>\
					<div class="line">\
					<input type="text" class="bt-input-text" name="token" id="token" placeholder="认证Token,如果存在请输入,例如 token:123456" style="width:100%" value="'+rpc_token+'"/>\
					</div>\
					<div class="bt-form-submit-btn">\
					<button type="button" class="btn btn-danger btn-sm btn-title" onclick="layer.closeAll()">取消</button>\
					<button type="button" id="CreateAria2" class="btn btn-success btn-sm btn-title" onclick="DoAria2(1)">保存</button>\
					</div>\
				</div>'
	});
	$("#Aria2").focus().keyup(function(e){
		if(e.keyCode == 13) $("#CreateAria2").click();
	});
}
//js字符加密  
function EncodeFile(s){  
    var es = [],c='',ec='';  
    s = s.split('');
    for(var i=0,length=s.length;i<length;i++){  
        c = s[i];  
        ec = encodeURIComponent(c);  
        if(ec==c){  
            ec = c.charCodeAt().toString(16);  
            ec = ('00' + ec).slice(-2);  
        }  
        es.push(ec);  
    }  
    return es.join('').replace(/%/g,'').toUpperCase();  
}

//图片预览
function GetImage(fileName){
	token = $('.main-content').data('token');
    var loadT = layer.load();
    $.getJSON('./api/index.php',{token:token,filename:encodeURIComponent(fileName)},function(d){
        layer.close(loadT);
        if(d.errno){
            layer.msg('获取文件数据失败')
        }else{
            layer.open({
        		type:1,
        		closeBtn: 2,
        		title:false,
        		area: '500px',
        		shadeClose: true,
        		content: '<div class="showpicdiv"><img width="100%" src="'+d.links[0]+'"></div>'
        	});
        	$(".layui-layer").css("top", "30%");
        }
    });
}

//获取文件数据
function GetFileBytes(fileName){
    token = $('.main-content').data('token');
    var loadT = layer.load();
    $.getJSON('./api/index.php',{token:token,filename:encodeURIComponent(fileName)},function(d){
        layer.close(loadT);
        if(d.errno){
            layer.msg('获取文件数据失败')
        }else{
            EchoFlie(d.links)
        }
    });
}
//发送到坐骑下载{"filelist":[{"server_path":"/QQ8.9.3.21167VipCrack.exe"}]}
function AccFileBytes(fileName, fileSize){
    token = $('.main-content').data('token');
    var loadT = layer.load();
    $.getJSON('http://127.0.0.1:10000/guanjia?method=DownloadSelfOwnItems',{token:token,filename:encodeURIComponent(fileName)})
    .done(function(){layer.msg('这个还没做好，请继续等待...',{icon:5,time:3e3});layer.close(loadT);return ;layer.msg("文件已发送到坐骑");})
    .fail(function(){layer.msg('这个还没做好，请继续等待...',{icon:5,time:3e3});layer.close(loadT);return ;layer.msg("文件发送失败，您是否已经打开坐骑");});
}
//发送到Aria2下载
function AriaFileBytes(fileName, fileSize){
    layer.msg('这个还没做好，请继续等待...',{icon:5,time:3e3});
}
function EchoFlie(data){
    var url='',urls='';
    $.each(data,function(name,value) {
        if(!name){
            url = value;
        }
        urls += value+"\r\n\r\n";
    });
    loadT = layer.open({
        type: 1,
        id:'downloads',
        title:'文件直链地址提取成功',
        skin: 'layui-layer-rim downloads', //加上边框
        area: ['500px', '385px'], //宽高
        btn: ['下载文件'],
        btnAlign:'c',
        scrollbar: false,
        move:false,
        content: '<div class="urlbox"><textarea class="layui-textarea layui-hide urltextarea" name="content" lay-verify="content">'+urls+'</textarea></div>',
        yes: function(index, layero){
          var arg = '\u003cscript\u003elocation.replace("'+url+'")\u003c/script\u003e';
          window.open('javascript:window.name;', arg);
          layer.close(loadT);
        }
    });

}
//右键菜单
function RClick(type,path,name){
	var options = {}
	if(type != "dir"){
		options = {
		    items:[
        	  {text: '直连下载', 	onclick: function() {GetFileBytes(path)}},
        	  {text: '坐骑下载', 	onclick: function() {AccFileBytes(path)}},
        	  {text: 'Aria2下载', 	onclick: function() {AriaFileBytes(path)}}
    	]};
	}else{
		options = {
		    items:[
		        {text: '打开文件夹', onclick: function() {GetFiles(path)}}
		]};
	}
	return options;
}
//右键批量操作
function RClickAll(e){
	var menu = $("#rmenu");
	var windowWidth = $(window).width(),
		windowHeight = $(window).height(),
		menuWidth = menu.outerWidth(),
		menuHeight = menu.outerHeight(),
		x = (menuWidth + e.clientX < windowWidth) ? e.clientX : windowWidth - menuWidth,
		y = (menuHeight + e.clientY < windowHeight) ? e.clientY : windowHeight - menuHeight;

	menu.css('top', y)
		.css('left', x)
		.css('position', 'fixed')
		.css("z-index","1")
		.show();
}
$("body").not(".def-log").click(function(){
	$("#rmenu").hide()
});
//指定路径
$("#DirPathPlace input").keyup(function(e){
	if(e.keyCode == 13) {
		GetFiles($(this).val());
	}
});
function PathPlaceBtn(path){
	var html = '';
	var title = '';
	var	Dpath = path;
	if(path == '/'){
		html ='<li><a title="/">根目录</a></li>';
	}
	else{
		Dpath = path.split("/");
		for(var i = 0; i<Dpath.length; i++ ){
			title += Dpath[i]+'/';
			Dpath[0] = '根目录';
			html +='<li><a title="'+title+'">'+Dpath[i]+'</a></li>';
		}
	}
	html = '<div style="width:1200px;height:26px"><ul>'+html+'</ul></div>';
	$("#PathPlaceBtn").html(html);
	$("#PathPlaceBtn ul li a").click(function(e){
		var Gopath = $(this).attr("title");
		if(Gopath.length>1){
			if(Gopath.substr(Gopath.length-1,Gopath.length) =='/'){
				Gopath = Gopath.substr(0,Gopath.length-1);
			}
		}
		GetFiles(Gopath);
		e.stopPropagation();
	});
	PathLeft();
}
//计算当前目录偏移
function PathLeft(){
	var UlWidth = $("#PathPlaceBtn ul").width();
	var SpanPathWidth = $("#PathPlaceBtn").width() - 50;
	var Ml = UlWidth - SpanPathWidth;
	if(UlWidth > SpanPathWidth ){
		$("#PathPlaceBtn ul").css("left",-Ml)
	}
	else{
		$("#PathPlaceBtn ul").css("left",0)
	}
}
//路径快捷点击
$("#PathPlaceBtn").on("click", function(e){
	if($("#DirPathPlace").is(":hidden")){
		$("#DirPathPlace").css("display","inline");
		$("#DirPathPlace input").focus();
		$(this).hide();
	}else{
		$("#DirPathPlace").hide();
		$(this).css("display","inline");
	}
	$(document).one("click", function(){
		$("#DirPathPlace").hide();
		$("#PathPlaceBtn").css("display","inline");
	});
	e.stopPropagation(); 
}); 
$("#DirPathPlace").on("click", function(e){
	e.stopPropagation();
});
var tips = '';
$(".userinfo a").on("mouseenter", function () {
    var $this = $(this);
    tips = layer.tips($this.data('msg'),$this, {tips:[1,'#3B8CFF']});
}).on("mouseleave", function () {
    var $this = $(this);
    layer.close(tips);
});


//打赏
function DaShang(){
	var content='<div class="hide_box"></div>'+
                '<div class="shang_box">'+
                '	<a class="shang_close" href="javascript:void(0)" onclick="dashangToggle()" title="关闭"><img src="./static/img/shang/close.jpg" alt="取消" /></a>'+
                '	<div class="shang_tit">'+
                '		<p>感谢您的支持，我会继续努力的!</p>'+
                '	</div>'+
                '	<div class="shang_payimg">'+
                '		<img src="./static/img/shang/alipayimg.png" alt="扫码支持" title="扫一扫" />'+
                '	</div>'+
                '		<div class="pay_explain">打赏是为了让项目更好的发展下去</div>'+
                '	<div class="shang_payselect">'+
                '		<div class="pay_item checked" data-id="alipay">'+
                '			<span class="radiobox"></span>'+
                '			<span class="pay_logo"><img src="./static/img/shang/alipay.jpg" alt="支付宝" /></span>'+
                '		</div>'+
                '		<div class="pay_item" data-id="weipay">'+
                '			<span class="radiobox"></span>'+
                '			<span class="pay_logo"><img src="./static/img/shang/wechat.jpg" alt="微信" /></span>'+
                '		</div>'+
                '	</div>'+
                '	<div class="shang_info">'+
                '		<p>打开<span id="shang_pay_txt">支付宝</span>扫一扫，即可进行扫码打赏哦</p>'+
                '	</div>'+
                '</div>'+
                '<script>'+
                '    $(".pay_item").on("click",function(){'+
                '    	$(this).addClass(\'checked\').siblings(\'.pay_item\').removeClass(\'checked\');'+
                '    	var dataid=$(this).attr(\'data-id\');'+
                '    	$(".shang_payimg img").attr("src","./static/img/shang/"+dataid+"img.png");'+
                '    	$("#shang_pay_txt").text(dataid=="alipay"?"支付宝":"微信");'+
                '    });'+
                '</script>';
    $('body').append(content);
}
function dashangToggle(){
	$(".hide_box").fadeToggle();
	$(".shang_box").fadeToggle();
}
$("#dopay").on("click", function(e){
	DaShang();
	dashangToggle();
});
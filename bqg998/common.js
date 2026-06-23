function url_img(id){
	return '//www.'+location.host.match(/[\w\-]+\.\w+$/g)[0]+'/bookimg/'+Math.floor(id/1000)+'/'+id+'.jpg';
}
function booklist(){
	var listHtml = "";var cs = datalist.length;if(!onall){$(".book_more").hide();}
	for(i=0;i<datalist.length;i++){
		var ii = i+1; var name = datalist[i];
		if(on){ii=cs-i;name=datalist[cs-i-1];}
		listHtml += '<dd><a href="'+url_chapter(id,ii)+'">'+name+'</a></dd>';
		if(onall && i>10){onall=false;break;}
	}
	$("#list").html(listHtml);
	if(on){on=false;$(".onlist").html("↑正序");}else{on=true;$(".onlist").html("↓倒序");}
}
function get_booklist(id){
	$.getJSON(get_api('booklist',{id:id}),function(data){
		datalist = data.list;booklist();
	});
}
function book(id){
	datahtml = headhtml('')+'<div class="books"><div class="book_info"><div class="cover"><img src="'+url_img(id)+'" width="80" height="100"></div><div class="book_box"><dl><dt class="title">书名</dt><dd class="dd_box"><span style="width: 100%;" id="author">作者</span></dd><dd class="dd_box"><span id="sort">分类</span><span id="full">状态</span></dd><dd class="dd_box"><span style="width: 100%;" id="update">更新时间</span></dd></dl></div></div><div class="readlink"><a href="javascript:addBookCase(id)">加入书架</a><a class="rl" href="'+url_chapter(id,1)+'">开始阅读</a></div><div class="book_about"><dl><dt>内容简介</dt><dd id="intro"></dd></dl></div><div class="book_last"><dl><dt>目录<a class="onlist" href="javascript:booklist()">↓倒序</a></dt><span id="list"><div class="loadmore">加载中……</div></span></dl></div><div class="book_more"><a href="javascript:booklist()">查看更多章节</a></div></div><div class="search"></div>';
	$("#app").html(datahtml);on=true;onall=true;window.id=id;searchhtml();
	$.getJSON(get_api('book',{id:id}),function(data){
		$(".title").html(data.title);
		$("#author").html('作者：'+data.author);
		$("#sort").html('分类：'+data.sortname);
		$("#full").html('状态：'+data.full);
		$("#update").html('更新时间：'+data.lastupdate);
		var a="";var b="";
		if(data.intro.length>88){
			a = data.intro.slice(0,88);
			b = '<span class="noshow">'+data.intro.slice(88,data.intro.length)+'</span> <span class="allshow">展开全部&gt;&gt;</span>';
			data.intro = a+b;
		}
		$("#intro").html(data.intro);
		get_booklist(data.dirid);
		$(".noshow").hide();$(".allshow").click(function(){$(".noshow").show();$(".allshow").hide();});
	}).fail(function(){getreload()});
	getcase = localStorage.getItem(id);
	if(getcase){
		lastbook = getcase.split('#');
		$(".readlink .rl").attr('href', url_chapter(id,lastbook[3]));
		$(".readlink .rl").attr('title', '上次阅读到：' + lastbook[4]);
		$(".readlink .rl").text('继续阅读');
	}
}
function index(name){
	if(/xuanhuan|wuxia|dushi|lishi|wangyou|kehuan|mm|top|finish|search/i.test(name)){
		$("#app").html(headhtml('')+'<div class="wrap"><div class="hot"></div><div class="loadmore">加载中……</div></div>');
	}else{
		name = "index";
		$("#app").html('<div class="header"><span class="title">笔趣阁</span><a class="user" href="/#/bookcase"><svg class="lnr lnr-user"><use xlink:href="#lnr-user"></use></svg></a></div><div class="nav"><ul><li><a href="/#/">首页</a></li><li><a href="/#/xuanhuan">玄幻</a></li><li><a href="/#/wuxia">武侠</a></li><li><a href="/#/dushi">都市</a></li><li><a href="/#/lishi">历史</a></li><li><a href="/#/wangyou">网游</a></li><li><a href="/#/kehuan">科幻</a></li><li><a href="/#/mm">女生</a></li><li><a href="/#/top">排行榜</a></li><li><a href="/#/finish">全本</a></li></ul></div><div class="search"></div><div class="wrap"><div class="hot"></div><div class="loadmore">加载中……</div></div>');
		searchhtml();
	}
	start=true;datathis=[];get_index(name);
}
function get_index(name){
	if(name=="search"){
		geturl = gethost()+"/api/search?q="+encodeURIComponent(doParse("q"));
	}else{
		geturl = gethost()+"/api/sort?sort="+name;
	}
	$.getJSON(geturl,function(data){
		datathis = data['data'];$(".title").html(data.title);
		start=true;page=0;loadmore(page);
	}).fail(function(){getreload()})
}
function loadmore(page){
	start=false;var strHtml = "";sp=page*10;
	datathis.slice(sp,(sp+10)).forEach(function(val){
		strHtml += '<div class="item"><div class="image"><a href="'+url_book(val.id)+'"><img src="'+url_img(val.id)+'"></a></div><dl><dt><span>'+val.author+'</span><a href="'+url_book(val.id)+'">'+val.title+'</a></dt><dd>'+val.intro+'......</dd></dl></div>';
	});
	if(strHtml == ""){$(".loadmore").html('暂无');return false;}
	if(page==0){$(".hot").html(strHtml);}else{$(".hot").append(strHtml);}
	window.page++;start=true;
}
function bookcase(){
	datahtml='<div class="header"><a class="home" href="javascript:history.go(-1);"><svg class="lnr lnr-chevron-left-circle"><use xlink:href="#lnr-chevron-left-circle"></use></svg></a><span class="title"><span class="caset"><span class="casea" onclick="loadbooker();">最近阅读</span><span class="caseb" onclick="get_case();">我的书架</span></span></span><a class="user" href="/#/"><svg class="lnr lnr-home"><use xlink:href="#lnr-home"></use></svg></a></div><div class="userinfo"></div><div class="wrap"><div class="block bookcase"><div class="read_book"></div></div></div><div class="search"></div>';
	$("#app").html(datahtml);searchhtml();if(getCookie("username")){$(".userinfo").html('<div class="right">用户：'+getCookie("username")+'&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:logout()">退出登录</a></div>');get_case();}else{loadbooker();}
}

function login(){
	datahtml=headhtml('用户登陆')+'<div class="login"><p>手机号：</p><p><input class="text" id="username" name="username" type="text"  size="20" maxlength="30" value=""></p><p>密码：</p><p><input class="text" id="password" size="20" maxlength="30" type="password" name="password" value=""></p><p><font color=red><span id="tips"></span></font></p><p><input class="btn" type="submit" onclick="post_login(username.value,password.value);" value="确认登录" /><p><a class=\'btn\' href=\'/#/register\'>没有账号？点击注册</a></p></div>';
	$("#app").html(datahtml);
}
function register(){
	datahtml=headhtml('用户注册')+'<div class="login"><p>手机号：</p><p><input class="text" id="username" name="username" type="text"  size="20" maxlength="30"><p><p>密码：</p><p><input class="text" id="password" size="20" maxlength="30" type="password" name="password"><p><p>重复密码：</p><p> <input class="text" id="repassword" size="20" maxlength="30" type="password" name="repassword"><p><p><font color=red><span id="tips"></span></font></p><p><input type="submit" class="btn" onclick="post_register(username.value,password.value,repassword.value);" value="确认注册" /></p><p><a class=\'btn\' href=\'/#/login\'>已有账号，点击登录</a></p></div>';
	$("#app").html(datahtml);
}
function headhtml(name){
	return '<div class="header"><a class="home" href="javascript:history.go(-1);"><svg class="lnr lnr-chevron-left-circle"><use xlink:href="#lnr-chevron-left-circle"></use></svg></a><span class="title">'+name+'</span><a class="user" href="/#/"><svg class="lnr lnr-home"><use xlink:href="#lnr-home"></use></svg></a></div><div class="clear"></div>';
}
function searchhtml(){
	$(".search").html('<form onsubmit="if(q.value==\'\'){alert(\'提示：请输入小说名称或作者名字！\');}else{location.href=\'/#/search/?q=\'+q.value}return false;"><input type="search" class="text" name="q" placeholder="快速搜索、找书、找作者" value="" /><input type="submit" class="btn" value=""></form>');
}
function logout(){
	setCookie("userid",'',1);setCookie("username",'',1);location.reload();
}
function doParse(key) {
	const regex = new RegExp(`[?&]${key}=([^&]*)`);
	const results = regex.exec(window.location.href);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
function user_href(){
	if(getCookie('username')){
		var jumpurl = doParse("jumpurl");headhtml();
		if (!jumpurl) {location.href = "/#/bookcase";} else{location.href = decodeURIComponent(jumpurl);}
	}
}
function addBookCase(bookid){
	$.post("/api/action",{action:"addbook",bookid:bookid},function(data){
		if(data.code==0){
			location.href = "/#/login?jumpurl="+location.href;
		}else if(data.code==1){
			alert("加入书架成功！");
		}else if(data.code==2){
			alert("该书已在书架中！");
		}else if(data.code==3){
			alert("书架已满，加入书架出错！");
		}else{alert("加入书架出错！");}
	},"JSON")
}
function post_login(userName,passWord){
	if(!userName || !passWord){
		$("#tips").html("请输入手机号、密码！");
	}else{
		$.post("/api/action",{action:"login",username:userName,password:passWord},function(data){
			if(data.code==0){
				$("#tips").html("密码错误或手机号不存在，请重新登陆！");
			}else if(data.code==1){
				$("#tips").html("登陆成功，欢迎您："+userName);
				user_href();
			}else{
				$("#tips").html("系统维护中，请稍后重试！");
			}
		},"JSON")
	}
	setTimeout("$('#tips').html('')",3000);
}
function post_register(userName,passWord,repassWord){
	if(!/^[1][0-9]{10}$/.test(userName)) {
		$("#tips").html("手机号码不正确");
	}else if(!passWord || passWord != repassWord){
		$("#tips").html("两次密码输入不一致");
	}else{
		$.post("/api/action",{action:"register",username:userName,password:passWord},function(data){
			if(data.code==0){
				$("#tips").html("此手机号已存在，请重新注册！");
			}else if(data.code==1){
				$("#tips").html("注册成功，欢迎您："+userName);
				user_href();
			}else{
				$("#tips").html("注册失败，请稍后重试！");
			}
		},"JSON")
	}
	setTimeout("$('#tips').html('')",3000);
}
function removeCase(obj,delid) {
    if(confirm('真的要删除此书架条目吗？此操作不可恢复!')){
		$.post("/api/action",{action:"delbook",delid:delid},function(data){
            if (data.code==1) {
                $(obj).parent().parent().remove();
            }else {
                alert("删除失败");
            }
        },"JSON")
    }
}
function get_case(){
	$('.casea').css('background', '#ccc');$('.caseb').css('background', '#f77720');
	$.post("/api/action",{action: "bookcase"},function(data){
		if(data.code==0){location.href = "/#/login";return false;}
		if(!data.data){$(".read_book").html('<div class="loadmore">暂无</div>');return false;}
        var strHtml = "";
		$.each(data.data,function(i,val){
			strHtml += '<div class="bookbox"><div class="box"><span class="image"><a href="'+url_book(val.id)+'"><img src="'+url_img(val.id)+'"></a></span><div class="bookinfo"><h4 class="bookname"><a href="'+url_book(val.id)+'">'+val.title+'</a></h4><div class="author">作者：'+val.author+'</div><div class="update"><span>读至：</span><a href="'+url_chapter(val.id,val.readchapterid)+'">'+val.readchapter+'</a></div><div class="update"><span>最新：</span><a href="'+url_chapter(val.id,val.lastchapterid)+'">'+val.lastchapter+'</a></div></div><div class="delbutton"><a href="javascript:;" onclick="removeCase(this,\''+val.caseid+'\');">删除</a></div></div></div>';
		});
		$(".read_book").html(strHtml);
    },"JSON")
}
function get_html(){
	var hp = window.location.hash.split(/\/|\?|\.|_/g);start=false;
	if(hp[0] != '#'){location.href='//'+location.host+'/#'+location.pathname;return}
	switch (hp[1]){
		case "book":if(hp[3]){location.href=location.href.replace('/#/book/','/book/')}else{book(hp[2])};break;
		case "bookcase":bookcase();break;
		case "login":login();break;
		case "register":register();break;
		default:index(hp[1]);
	}
	scrollTo(0,0);
}
$(document).ready(function(){
	get_html();tj();
	window.addEventListener('hashchange', function(event) {
		get_html();
	});
	$(window).bind('scroll',function(){
		if(start==true && $(window).scrollTop()+$(window).height()+100>=$(document).height()){
			start=false;loadmore(page);
		}
	})
});
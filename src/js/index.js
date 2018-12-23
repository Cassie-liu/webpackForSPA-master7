// reference css
// require('bootstrapcss');

require("indexcss");

var pageDatas = {
	params: {}, // params
	defaultRoute: "organize" // default Route
};

function initMenu() {
	/// <summary>
	/// init menu
	/// </summary>

	var modName = window.location.href.split("#")[1];

	modName = modName || pageDatas.defaultRoute;

	$("ul li a").each(function (e) {
		if ("#" + modName === $(this).attr("href")) {
			$(this)
				.children(".nav")
				.addClass("active");

			$(this)
				.children(".nav")
				.children("div")
				.addClass("active");
		}
	});

	loadHtml(modName);
}

function bindMenu() {
	/// <summary>
	/// bind menu
	/// </summary>

	$(document).on("click", ".sidebar .nav-li", function (e) {
		e.stopPropagation();
	});

	// 
	//退出登录
	$(".b-img-wrap").on("click", function () {
		$.cookie('token', "",{ expires: -1, path: '/' });
		$.cookie('userType', "",{ expires: -1, path: '/' });
		window.location.href = 'login.html';
	});

	$("ul li a").on("click", function (e) {
		e.stopPropagation();

		if (
			$(this)
			.children(".nav")
			.hasClass("active")
		) {
			return false;
		}

		//删除active
		$("ul li a")
			.children(".nav")
			.removeClass("active");
		$("ul li a")
			.children(".nav")
			.children("div")
			.removeClass("active");

		//添加active
		$(this)
			.children(".nav")
			.addClass("active");
		$(this)
			.children(".nav")
			.children("div")
			.addClass("active");

		var modName = $(this).attr("href");
		modName = modName.split("#")[1];

		loadHtml(modName);
	});
}

function loadHtml(modName) {
	/// <summary>
	/// load html
	/// </summary>
	/// <param name="modName" type="type">modName</param>

	pageDatas.params = null;

	var htmlPath = "./html/" + modName + "/" + modName + ".html";
	var jsPath = "./" + modName + "/" + modName;

	$.get(htmlPath, [], function (html) {
		$("#container").html(html);
		loadJs(jsPath);
	});
}

function loadJs(jsPath) {
	/// <summary>
	/// load js mod
	/// </summary>
	/// <param name="jsPath" type="type">js path</param>

	var currentMod;
	if (jsPath === "./organize/organize") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./organize/organize");
				currentMod.init();
			},
			"organize"
		);
	} else if (jsPath === "./center/center") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./center/center");
				currentMod.init(pageDatas.params);
			},
			"center"
		);
	} else if (jsPath === "./heart/heart") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./heart/heart");
				currentMod.init(pageDatas.params);
			},
			"heart"
		);
	} else if (jsPath === "./stop/stop") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./stop/stop");
				currentMod.init(pageDatas.params);
			},
			"stop"
		);
	} else if (jsPath === "./notice/notice") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./notice/notice");
				currentMod.init(pageDatas.params);
			},
			"notice"
		);
	} else if (jsPath === "./specialActivity/specialActivity") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./specialActivity/specialActivity");
				currentMod.init(pageDatas.params);
			},
			"specialActivity"
		);
	} else if (jsPath === "./activity/activity") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./activity/activity");
				currentMod.init(pageDatas.params);
			},
			"activity"
		);
	} else if (jsPath === "./system/system") {
		require.ensure(
			[],
			function (require) {
				currentMod = require("./system/system");
				currentMod.init(pageDatas.params);
			},
			"system"
		);
	} else {
		if (__DEV__) {
			console.log("no request mod");
		}
	}
}

function initialize() {
	initMenu();

	bindMenu();
}

$(function () {
	initialize();
});
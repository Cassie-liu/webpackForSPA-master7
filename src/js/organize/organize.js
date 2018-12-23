function initialize(params) {
	if (__DEV__) {
		console.log(params);
	}

	var organize = {
		init: function () {
			//进入组织架构模块初始化数据
			$(".org-btn").removeClass("active");
			$(".org-leader").addClass("active");

			//默认第一个模块，在组织架构中就是领导
			this.loadHtml("organize_leader");
			this.bindMenu();
		},
		bindMenu: function () {
			var that = this;
			$(".org-btn").on("click", function (e) {
				e.stopPropagation();

				if ($(this).hasClass("active")) return;

				$(".sub-nav").html($(this).text());
				$(".org-btn").removeClass("active");
				$(this).addClass("active");

				var subName = $(this).attr("id");
				that.loadHtml(subName);
			});
		},
		loadHtml: function (name) {
			var that = this;
			var splitName = name.split("_");
			var mainName = splitName[0],
				subName = splitName[1];

			var htmlPath = "./html/" + mainName + "/" + subName + ".html";
			var jsPath = "./" + mainName + "/" + subName;

			$.get(htmlPath, [], function (html) {
				$(".main-bottom").html(html);
				that.loadJs(jsPath);
			});
		},
		loadJs: function (jsPath) {
			var currentMod;
			if (jsPath === "./organize/leader") {
				require.ensure(
					[],
					function (require) {
						currentMod = require("../organize/leader");
						currentMod.init();
					},
					"leader"
				);
			} else if (jsPath === "./organize/office") {
				require.ensure(
					[],
					function (require) {
						currentMod = require("../organize/office");
						currentMod.init();
					},
					"office"
				);
			}
		}
	};

	organize.init();
}

module.exports = {
	init: initialize
};
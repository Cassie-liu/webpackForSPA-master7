import {
	apiPost,
	validate,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"

function initialize(params) {

	if (__DEV__) {
		console.log(params);
	}

	let center = {
		init: function () {
			//加载中心组数据
			this.loadCenterZuData();
			this.centerAddBtn();
			hideAlert();
		},
		//加载分中心组的数据
		loadCenterZuData: function () {
			let that = this;
			apiPost("queryCenter", "", function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试")
					$(".c-group").html();
					return;
				}
				let centerGroupArr = data.contents;
				if (centerGroupArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}
				let cgHtml = "";
				for (let i = 0; i < centerGroupArr.length; i++) {
					let item = centerGroupArr[i];
					cgHtml += `<div class="c-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".c-group").html(cgHtml);

				$(".c-group .item").on("click", function (e) {
					let centerId = e.currentTarget.dataset.id;

					addNoneFn(".org-menu, .org-group-menu");
					delNoneFn(".org-group-menu");

					that.loadCenterGroupDetail(centerId);
				})

				that.deleteOfficeGroup();
				that.editOfficeGroup();
			})
		},
		//删除分中心
		deleteOfficeGroup: function () {
			let that = this;
			$(".c-group-item .item-dele").off().on("click", function (e) {
				let centerId = e.currentTarget.dataset.id;
				apiPost("delCenter?centerId=" + centerId, "", function (data) {
					// alert("删除分中心成功");
					that.loadCenterZuData();
				})
			})
		},
		//编辑分中心
		editOfficeGroup: function () {
			let that = this;
			$(".c-group-item .item-edit").off().on("click", function (e) {
				delNoneFn('.center-edit-popup');

				//选择编辑的分中心的名字
				let editCenterName = $(this).parent().siblings().find('span').text()
				$('#cGroupEdit').val(editCenterName)

				let officeId = e.currentTarget.dataset.id;

				$('.pop-edit .notice_cancel').on('click', function () {
					addNoneFn('.center-edit-popup');
				});

				$('.pop-edit .yes').off().on('click', function () {
					let name = $('#cGroupEdit').val();
					if (!name) {
						showAlert("内容不能为空");
						return;
					}
					addNoneFn('.center-edit-popup');
					apiPost("updateCenterName?id=" + officeId + '&name=' + name, "", function (data) {
						if (data.success) {
							//编辑成功
							// alert('编辑成功')
						} else {
							showAlert("编辑失败，请重试");
						}
						that.loadCenterZuData();
					})
				})
			})
		},
		//分中心组新增
		centerAddBtn: function () {
			let that = this;
			$(".c-add").off().on("click", function () {
				delNoneFn(".center-add-popup");
				that.sureAddCenterGroup();
				that.cancelAddCenterGroup();
			})
		},
		//确定添加分中心事件
		sureAddCenterGroup: function () {
			let that = this;
			$(".cap-sure-add").off().on("click", function (event) {
				event.stopPropagation();

				let name = $("#ceName").val(),
					lon = $("#ceLon").val(),
					lat = $("#ceLat").val();

				let param = {
					"name": name,
					"lon": lon,
					"lat": lat
				}
				if (!validate(param, false)) {
					return;
				}
				addNoneFn(".center-add-popup");
				apiPost("addCenter", param, function (data) {
					if (data.success) {
						// alert("添加事件成功");
					} else {
						showAlert("添加失败，请重试");
					}

					that.loadCenterZuData();
				})
			})
		},
		//取消添加分中心事件
		cancelAddCenterGroup: function () {
			$(".cap-cancel-add").off().on("click", function () {
				addNoneFn(".center-add-popup");
			})
		},
		//加载分中心组详细数据
		loadCenterGroupDetail: function (centerId) {
			let htmlPath = "./html/center/cgroup.html";
			let jsPath = "./center/cgroup";

			$.get(htmlPath, [], function (html) {
				let currentMod;
				$(".main-bottom").html(html);
				if (jsPath === "./center/cgroup") {
					require.ensure(
						[],
						function (require) {
							currentMod = require("../center/cgroup");
							currentMod.init({
								"id": centerId
							});
						},
						"cgroup"
					);
				}
			});
		}
	};
	center.init();
}


module.exports = {

	init: initialize
}
import {
	apiPost,
	delNoneFn,
	addNoneFn,
	validate,
	showAlert,
	hideAlert
} from "../../util/util.js"

function initialize(params,outerParam) {

	if (__DEV__) {
		console.log(params);
	}

	let stop = {
		init: function () {
			// if(outerParam && outerParam.indexOf("isDirectShowPlan")>-1) {
			// 	this.scanGroup(1,outerParam);
			// } else {
			// 	this.loadStopGroupData();
			// 	this.addTown();
			// 	this.clickEvents();
			// 	hideAlert();
			// }


			this.loadStopGroupData();
			this.addTown();
			this.clickEvents();
			hideAlert();
		},
		//加载所站组的数据
		loadStopGroupData: function () {
			let that = this;
			apiPost("queryTown", "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂无数据，可以去新增~")
					return;
				}

				let sGroupArr = data.contents;
				let sgHtml = "";
				for (let i = 0; i < sGroupArr.length; i++) {
					let item = sGroupArr[i];
					sgHtml += `<div class="stop-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".stop-group").html(sgHtml);

				that.scanGroupData();
				that.deleteTown();
				that.editTown();
			})
		},
		//删除镇
		deleteTown: function () {
			let that = this;
			$(".stop-group-item .item-dele").off().on("click", function (e) {
				let townId = e.currentTarget.dataset.id;
				apiPost("delTown?townId=" + townId, "", function (data) {
					// alert("删除镇成功");
					that.loadStopGroupData();
				})
			})
		},
		//编辑镇
		editTown: function () {
			$(".stop-group-item .item-edit").off().on("click", function (e) {
				showAlert("暂无接口")
				//updateTownRoomName
				let centerId = e.currentTarget.dataset.id;
				// $('.pop').removeClass('none');
				// $('.pop-edit').removeClass('none');

			})
		},

		//编辑接口
		editTowngroup: function (officeId) {
			var that = this;
			var name = $('.pop-edit .pop_title input').val();
			apiPost("updateOfficeName?id=" + officeId + '&name=' + name, "", function (data) {
				if (data.success) {
					//编辑成功
					$('.pop').addClass('none');
					$('.pop-edit').addClass('none');
					that.loadOfficeZuData();

				} else {
					//
					showAlert('编辑失败')
					$('.pop').addClass('none');
					$('.pop-edit').addClass('none');
				}

			})
		},
		//新增镇
		addTown: function () {
			let that = this;
			$(".sgdb-add").off().on("click", function () {
				delNoneFn(".stop-add-popup");

				that.sureAddStopGroup();
				that.cancelAddStopGroup();
			})
		},
		//确定添加分中心事件
		sureAddStopGroup: function () {
			let that = this;
			$(".sap-sure-add").off().on("click", function (event) {
				event.stopPropagation();

				let name = $("#cName").val(),
					lon = $("#cLon").val(),
					lat = $("#cLat").val();

				let param = {
					"name": name,
					"lon": lon,
					"lat": lat
				}
				if (!validate(param, false)) return;
				addNoneFn(".stop-add-popup");
				apiPost("addTown", param, function (data) {
					if (data.success) {
						// alert("添加镇成功");
					} else {
						showAlert("添加镇失败");
					}

					that.loadStopGroupData();
				})
			})
		},
		//取消添加分中心事件
		cancelAddStopGroup: function () {
			let that = this;
			$(".sap-cancel-add").off().on("click", function () {
				addNoneFn(".stop-add-popup");
			})
		},
		//查看镇详细数据
		scanGroupData: function () {
			let that = this;
			$(".stop-group-item .item").on("click", function (e) {
				let townId = e.currentTarget.dataset.id;

				let htmlPath = "./html/stop/group.html";
				let jsPath = "./stop/group";

				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/group") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/group");
								currentMod.init({
									"id": townId,
									"outerParam": outerParam
								});
							},
							"group"
						);
					}
				});
			})
		},
		scanGroup: function (townId, outerParam) {
			let that = this;
			// $(".stop-group-item .item").on("click", function (e) {
				// let townId = e.currentTarget.dataset.id;

				let htmlPath = "./html/stop/group.html";
				let jsPath = "./stop/group";

				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/group") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/group");
								currentMod.init({
									"id": townId,
									"outerParam": outerParam
								});
							},
							"group"
						);
					}
				});
			// })
		},
		clickEvents: function () {
			var that = this;
			$('.add').on('click', function () {
				$('.pop').removeClass('none');
				$('.pop-content').removeClass('none');
			});
			$('.pop-content .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
			});
			// $('.pop-edit .notice_cancel').on('click',function(){
			// 	$('.pop').addClass('none');
			// 	$('.pop-edit').addClass('none');
			// });

		},

	};
	stop.init();
}


module.exports = {

	init: initialize
}
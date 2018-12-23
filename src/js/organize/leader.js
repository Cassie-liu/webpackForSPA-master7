import {
	apiPost,
	peopleValidate,
	addNoneFn,
	delNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js";

function initialize(params) {
	if (__DEV__) {
		console.log(params);
	}

	var leader = {
		model: {
			totalpage: 1,

		},
		popContentActionFrom: "add", //打开内容弹窗的操作来源
		editId: "", //选择编辑的人员id
		init: function () {
			addNoneFn(".l-organize, .l-data");
			delNoneFn(".l-organize");
			delNoneFn(".l-switch");

			this.loadLeaderOrgData();
			this.switchLeaderData();
			this.exportLeaderData();
			this.pageFunc();
			this.clickEvents();
			hideAlert();
		},
		//切换数据
		switchLeaderData: function () {
			let that = this;
			$(".l-switch").off().on("click", function () {
				if ($(".l-organize").hasClass("none")) {
					addNoneFn(".l-organize, .l-data");
					addNoneFn(".l-export");
					delNoneFn(".l-organize");

					that.loadLeaderOrgData();
				} else {
					addNoneFn(".l-organize, .l-data");
					delNoneFn(".l-data, .l-export");

					that.loadLeaderTabData();
				}
			});
		},
		//导出领导数据
		exportLeaderData: function () {
			$(".l-export").off().on("click", function () {
				showAlert("敬请期待")
			});
		},
		//加载领导组织数据
		loadLeaderOrgData: function () {
			let that = this;
			let param = {
				"jrId": "999"
			};
			//请求组织数据
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试");
					return;
				};
				if (data.contents.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}

				let orgArr = data.contents;
				let orgHtml = "";
				for (let i = 0; i < orgArr.length; i++) {
					let item = orgArr[i];
					orgHtml += `<div class="l-org-detail">
									<div>${item.positionName}</div>
									<div>${item.userName}</div>
								</div>`;
				}
				$(".l-o-cnt").html(orgHtml);
			})
		},
		//加载领导表格数据
		loadLeaderTabData: function () {
			let that = this;
			let param = {
				"jrId": 999,
				"pageSize": 10,
				"pageNum": 1
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content || !data.content.jrUserList) {
					showAlert("请求数据失败，请稍后重试")
					return;
				};
				let tableArr = data.content.jrUserList.content || [];
				if (tableArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}
				let tableHtml = "";
				for (let i = 0; i < tableArr.length; i++) {
					let item = tableArr[i];

					let gender = '';
					let position = '';
					if (item.gender == 1) {
						gender = '男';
					} else {
						gender = '女';
					}

					if (item.position == 1) {
						position = '主任';
					} else if (item.position == 2) {
						position = '副主任';
					}

					tableHtml += `<tr>
						<th class="ld-select" data-id="${item.id}"><p></p></th>
						<td class="ld-no">${i}</td>
						<td class="ld-name">${item.userName}</td>
						<td class="ld-sex">${gender}</td>
						<td class="ld-section">${position}</td>
						<td class="ld-range">${item.notice}</td>
					</tr>`;
				}
				$(".l-data tbody").html(tableHtml);

				that.forLeaderAddSelect();
			})
		},
		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".l-data table").off().on("click", ".ld-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		//分页函数
		pageFunc: function () {
			var _this = this;
			setTimeout(function () {
				if (!_this.model.totalpage) {
					$("#page").hide();
					return;
				}
				$("#page").show();
				$("#page").createPage({
					pageCount: _this.model.totalpage, // 总页数
					firstpageBtn: 'true', // 是否显示页首页按钮
					current: 1, // 当前页
					lastpageBtn: 'true', // 是否显示尾页按钮
					pageCountBtn: 'true', // 是否显示总页数
					turndown: 'true', // 是否显示跳转框，显示为true，不现实为false,一定记得加上引号...
					totalBtn: 'false', // 是否显示总条数
					backFn: function (p) {
						$('body,html').animate({
							scrollTop: 0
						}, 200);
					}
				});
			}, 2000);

		},

		clickEvents: function () {
			var that = this;
			//添加表格数据
			$('.l-do-wrap .add').off().on('click', function () {
				that.popContentActionFrom = "add";
				$('#orgName').val("");
				delNoneFn(".pop");
			});
			//取消添加
			$('.pop-content .notice_cancel').off().on('click', function () {
				addNoneFn(".pop");
			});
			//确认添加
			$('.pop-content .yes').off().on('click', function () {
				addNoneFn(".pop");
				if (that.popContentActionFrom == "add") {
					that.addPeople();
				} else if (that.popContentActionFrom == "edit") {
					that.editPeople();
				}
			})
			that.deleteTableData();
			that.updateTableData();
		},

		//添加人
		addPeople: function () {
			var that = this;
			var name = $('#orgName').val();
			var gender = $('#orgGender option:selected').val();
			var position = $('#orgPosition option:selected').val();
			var param = {
				userName: name,
				gender: parseInt(gender),
				position: parseInt(position),
				jrId: 999
			};
			if (!peopleValidate(param)) return;
			apiPost("addUser", param, function (data) {
				if (data.success) {
					that.loadLeaderTabData();
				} else {
					showAlert("添加失败，请重试");
				}
			})
		},
		//编辑人
		editPeople: function () {
			let that = this;
			let userName = $('#orgName').val();
			let gender = $('#orgGender option:selected').val();
			let position = $('#orgPosition option:selected').val();
			let param = {
				id: this.editId,
				userName: userName,
				gender: gender,
				position: position
			}
			apiPost("editorUser", param, function (data) {
				if (data.success) {
					that.loadLeaderTabData();
				} else {
					showAlert("编辑失败，请重试")
				}
			})
		},
		//删除表格的数据
		deleteTableData: function () {
			$(".l-data .delete").off().on("click", function () {
				let leaderTableData = $(".l-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasSelectData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".ld-select p").hasClass("checked")) {
						ishasSelectData = true;
						selectedData = item;
					};
				}
				if (!ishasSelectData) {
					showAlert("请选择要操作的数据");
					return;
				}

				let deleId = $(selectedData).find(".ld-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						$(selectedData).remove();
					} else {
						showAlert("删除失败，请重试")
					}
				})
			})
		},
		//修改表格数据
		updateTableData: function () {
			let that = this;
			$(".l-data .edit").off().on("click", function () {
				that.popContentActionFrom = "edit";
				let leaderTableData = $(".l-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasSelectData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".ld-select p").hasClass("checked")) {
						ishasSelectData = true;
						selectedData = item;
					};
				}
				if (!ishasSelectData) {
					showAlert("请选择要操作的数据");
					return;
				}
				//将选择修改的名字带入编辑弹窗中
				let selectName = $(selectedData).find(".ld-name").text();
				$('#orgName').val(selectName);
				//打开编辑弹窗
				delNoneFn(".pop");
				//保存编辑人的id
				that.editId = $(selectedData).find(".ld-select").attr("data-id");
			})
		}
	};
	leader.init();
}

module.exports = {
	init: initialize
};
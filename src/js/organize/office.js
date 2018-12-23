import {
	apiPost,
	peopleValidate,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"

function initialize(params) {
	if (__DEV__) {
		console.log(params);
	}

	let office = {
		model: {
			totalpage: 1,
			officeId: '',
			popContentActionFrom: "add", //打开内容弹窗的操作来源
			editId: "", //选择编辑的人员id
		},
		init: function () {

			this.officeNewAdd();
			this.officePersonOrg();
			this.officeBackBtn();
			this.officeSwitchBtn();
			this.exportOfficeData();

			this.loadOfficeZuData();
			this.pageFunc();
			this.clickEvents();
			hideAlert();
		},
		//办公室新增，出现新增弹窗
		officeNewAdd: function () {
			let that = this;
			$(".o-add").off().on("click", function (event) {
				event.stopPropagation();

				delNoneFn(".office-add-popup");
				$('#officegroup').val("");

				that.sureAddOfficeGroup();
				that.cancelAddOfficeGroup();
			});
		},
		//确定添加办公室组事件
		sureAddOfficeGroup: function () {
			let that = this;
			$(".oap-sure-add").off().on("click", function (event) {
				event.stopPropagation();
				let name = $('#officegroup').val();
				let param = {
					"name": name
				}
				apiPost("addOffice", param, function (data) {
					// showAlert("添加事件成功");
					addNoneFn(".office-add-popup");
					that.loadOfficeZuData();
				})
			})
		},
		//取消添加办公室组事件
		cancelAddOfficeGroup: function () {
			let that = this;
			$(".oap-cancel-add").off().on("click", function () {
				addNoneFn(".office-add-popup");
			})
		},
		//删除办公室组
		deleteOfficeGroup: function () {
			let that = this;
			$(".item-dele").off().on("click", function (e) {
				let officeId = e.currentTarget.dataset.id;
				apiPost("delOffice?officeId=" + officeId, "", function (data) {
					// showAlert("删除办公室组成功");
					//删除办公室组数据之后重新请求办公室组数据
					that.loadOfficeZuData();
				})
			})
		},
		//编辑办公室组
		editOfficeGroup: function () {
			var that = this;
			$(".item-edit").off().on("click", function (e) {
				delNoneFn('.edit-pop');
				that.model.officeId = e.currentTarget.dataset.id;
				//选择编辑的办公室的名字
				let editOfficeName = $(this).parent().siblings().find('span').text()
				$('.edit-pop input').val(editOfficeName)
				//取消编辑
				$('.edit-pop .notice_cancel').off().on('click', function () {
					addNoneFn('.edit-pop');
				});
				//确认编辑
				$('.edit-pop .yes').off().on('click', function () {
					addNoneFn('.edit-pop');
					that.editOffice();
				});
			})
		},
		//编辑办公室接口
		editOffice: function () {
			var that = this;
			var name = $('.edit-pop input').val();
			apiPost("updateOfficeName?id=" + that.model.officeId + '&name=' + name, "", function (data) {
				if (data.success) {
					//编辑成功
					that.loadOfficeZuData();
				} else {
					//编辑失败
					showAlert('编辑失败')
				}
			})
		},
		//加载办公室组的数据
		loadOfficeZuData: function () {
			let that = this;
			apiPost("queryOffice", "", function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试");
					return;
				}

				if (data.contents.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}

				let officeGroupArr = data.contents;
				let ogHtml = "";
				for (let i = 0; i < officeGroupArr.length; i++) {
					let item = officeGroupArr[i];
					ogHtml += `<div class="o-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".o-group").html(ogHtml);

				$(".o-group .item").off().on("click", function (e) {
					let officeId = e.currentTarget.dataset.id;

					addNoneFn(".org-menu, .org-group-menu");
					delNoneFn(".org-group-menu");

					that.loadOfficeGroupDetail(officeId);
				})

				that.deleteOfficeGroup();
				that.editOfficeGroup();
			})
		},
		//加载办公室组的详细数据
		loadOfficeGroupDetail: function (officeId) {
			let htmlPath = "./html/organize/group.html";
			let jsPath = "./organize/group";

			$.get(htmlPath, [], function (html) {
				let currentMod;
				$(".main-bottom").html(html);
				if (jsPath === "./organize/group") {
					require.ensure(
						[],
						function (require) {
							currentMod = require("../organize/group");
							currentMod.init({
								"id": officeId
							});
						},
						"group"
					);
				}
			});
		},
		/**********************************办公室人员操作start**************************************/
		//办公室人员架构
		officePersonOrg: function () {
			let that = this;
			$(".o-person").off().on("click", function () {
				//切换到办公室人员组织
				addNoneFn(".office-menu");
				addNoneFn(".o-group, .o-organize, .o-data");
				delNoneFn(".o-back, .o-switch");
				delNoneFn(".o-organize");

				that.loadOfficeOrgData();
			});
		},
		//办公室返回
		officeBackBtn: function () {
			let that = this;
			$(".o-back").off().on("click", function () {
				addNoneFn(".office-menu");
				addNoneFn(".o-group, .o-organize, .o-data");
				delNoneFn(".o-add, .o-person");
				delNoneFn(".o-group");

				that.loadOfficeZuData();
			});
		},
		//办公室切换
		officeSwitchBtn: function () {
			let that = this;
			$(".o-switch").off().on("click", function () {
				if ($(".o-organize").hasClass("none")) {
					addNoneFn(".office-menu");
					addNoneFn(".o-group, .o-organize, .o-data");
					delNoneFn(".o-switch, .o-back");
					delNoneFn(".o-organize");

					that.loadOfficeOrgData();
				} else {
					addNoneFn(".office-menu");
					addNoneFn(".o-group, .o-organize, .o-data");
					delNoneFn(".o-switch, .o-export");
					delNoneFn(".o-data");

					that.loadOfficeTableData();
				}
			});
		},
		//导出办公室数据
		exportOfficeData: function () {
			$(".o-export").off().on("click", function () {
				showAlert("敬请期待");
			});
		},
		//加载办公室组织架构的数据
		loadOfficeOrgData: function () {
			//获取人员组织架构数据
			let param = {
				jrId: 888
			};
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试");
					return;
				}

				if (data.contents.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}

				let officeOrgArr = data.contents;
				let officeOrgHtml = "";
				for (let i = 0; i < officeOrgArr.length; i++) {
					let item = officeOrgArr[i];
					officeOrgHtml += `<div class="o-org-detail">
										<div>${item.positionName}</div>
										<div>${item.userName}</div>
									</div>`;
				}
				$(".o-o-cnt").html(officeOrgHtml);

			})
		},
		//加载办公室表格的数据
		loadOfficeTableData: function () {
			let that = this;
			let param = {
				"jrId": 888,
				"pageSize": 10,
				"pageNum": 1
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content || !data.content.jrUserList) {
					showAlert("请求数据失败，请稍后重试");
					return;
				};

				let otableArr = data.content.jrUserList.content;
				if (!otableArr || otableArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}
				let otableHtml = "";
				for (let i = 0; i < otableArr.length; i++) {
					let item = otableArr[i];
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
					otableHtml += `<tr>
						<th class="od-select" data-id="${item.id}"><p></p></th>
						<td class="od-no">${i}</td>
						<td class="od-name">${item.userName}</td>
						<td class="od-sex">${gender}</td>
						<td class="od-section">${position}</td>
						<td class="od-range">${item.notice}</td>
					</tr>`;
				}
				$(".o-data tbody").html(otableHtml);
				that.forLeaderAddSelect();
			})
		},
		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".o-data table").off().on("click", ".od-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		clickEvents: function () {
			var that = this;
			//添加办公室人员表格数据
			$('.o-do-wrap .add').off().on('click', function () {
				that.model.popContentActionFrom = "add";
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
				if (that.model.popContentActionFrom == "add") {
					that.addPeople();
				} else if (that.model.popContentActionFrom == "edit") {
					that.editPeople();
				}
			});
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
				jrId: 888
			};
			if (!peopleValidate(param)) return;
			apiPost("addUser", param, function (data) {
				if (data.success) {
					that.loadOfficeTableData();
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
				id: this.model.editId,
				userName: userName,
				gender: gender,
				position: position
			}
			apiPost("editorUser", param, function (data) {
				if (data.success) {
					that.loadOfficeTableData();
				} else {
					showAlert("编辑失败，请重试")
				}
			})
		},
		//删除表格的数据
		deleteTableData: function (tableArr) {
			$(".o-do-wrap .delete").off().on("click", function () {
				let officeTabData = $(".o-data tbody").children(); //领导的表格数据
				let len = officeTabData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = officeTabData[i];
					if ($(item).find(".od-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".od-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						// showAlert("删除成功")
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
			$(".o-do-wrap .edit").off().on("click", function () {
				that.model.popContentActionFrom = "edit";
				let officeTabData = $(".o-data tbody").children(); //领导的表格数据
				let len = officeTabData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasSelectData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = officeTabData[i];
					if ($(item).find(".od-select p").hasClass("checked")) {
						ishasSelectData = true;
						selectedData = item;
					};
				}
				if (!ishasSelectData) {
					showAlert("请选择要操作的数据");
					return;
				}
				//将选择修改的名字带入编辑弹窗中
				let selectName = $(selectedData).find(".od-name").text();
				$('#orgName').val(selectName);
				//打开编辑弹窗
				delNoneFn(".pop");
				//保存编辑人的id
				that.model.editId = $(selectedData).find(".od-select").attr("data-id");
			})
		},
		/**
		 * 分页(许卉新增)
		 */
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
						// _this.getTripList(p, _this.model.type, "");//获取行程列表信息
						$('body,html').animate({
							scrollTop: 0
						}, 200);
					}
				});
			}, 2000);

		}
	};

	office.init();
}

module.exports = {
	init: initialize
};
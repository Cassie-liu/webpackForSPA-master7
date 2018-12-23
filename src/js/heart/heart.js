import {
	apiPost,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"

function initialize(params) {

	if (__DEV__) {
		console.log(params);
	}

	let heart = {
		model: {
			officeid: '',
		},
		init: function () {
			//初始化页面
			this.initPage();

			this.switchOrgToData();

			this.switchMenu();

			this.notOpenInstruction();
			this.clickEvents();
			hideAlert();
		},
		//初始化页面
		initPage: function () {
			$(".h-menu").removeClass("active");
			$(".h-submenu").removeClass("active");

			$(".hm-total").addClass("active");
			$(".hsm-org").addClass("active");

			addNoneFn(".h-btn");
			delNoneFn(".hb-switch");

			addNoneFn(".h-module");
			delNoneFn(".h-org");

			//加载总队的组织机构
			this.loadTotalOrgData();
		},
		//切换顶部子菜单
		switchMenu: function () {
			let that = this;
			$(".h-submenu").on("click", function () {
				$(".h-submenu").removeClass("active");
				$(this).addClass("active");

				let cId = $(this).attr("id");
				switch (cId) {
					case "horg":
						addNoneFn(".h-module");
						delNoneFn(".h-org");

						addNoneFn(".h-btn");
						delNoneFn(".hb-switch");

						that.loadTotalOrgData();
						break;
					case "hser":
						addNoneFn(".h-module");
						delNoneFn(".h-ser");

						addNoneFn(".h-btn");
						delNoneFn(".hb-add");

						that.loadTotalGroupData();
						that.serverGroupNewAdd();
						break;
				}
			})
		},
		//切换组织架构到数据
		switchOrgToData: function () {
			let that = this;
			$(".hb-switch").on("click", function () {
				if ($(".h-org").hasClass("none")) {
					addNoneFn(".h-module");
					delNoneFn(".h-org");

					//加载组织的数据
					that.loadTotalOrgData();
				} else {
					addNoneFn(".h-module");
					delNoneFn(".h-data");

					//加载组织表格的数据
					that.loadTotalTableData();
				}
			})
		},
		//加载组织的数据
		loadTotalOrgData: function () {
			let that = this;
			let param = {
				"jrId": 777
			};
			//请求组织数据
			apiPost("queryUserOrganization", param, function (data) {

				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂无数据，可以去新增~");
					$(".h-o-cnt").html();
					return;
				};

				let horgArr = data.contents;
				let horgHtml = "";
				for (let i = 0; i < horgArr.length; i++) {
					let item = horgArr[i];
					horgHtml += `<div class="h-org-detail">
									<div>${item.positionName}</div>
									<div>${item.userName}</div>
								</div>`;
				}
				$(".h-o-cnt").html(horgHtml);
			})
		},
		//加载组织表格的数据
		loadTotalTableData: function () {
			let that = this;
			let param = {
				"jrId": 777,
				"pageSize": 10,
				"pageNum": 1
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content) {
					showAlert("暂无数据，可以去新增~");
					return;
				};
				if (!data.content.jrUserList) {
					showAlert("暂无数据，可以去新增~");
					return;
				}

				let htableArr = data.content.jrUserList.content;

				if (htableArr.length == 0) {
					showAlert("暂无数据，可以去新增~");
					return;
				}
				let htableHtml = "";
				for (let i = 0; i < htableArr.length; i++) {
					let item = htableArr[i];

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

					htableHtml += `<tr>
						<th class="hd-select" data-id="${item.id}"><p></p></th>
						<td class="hd-no">${i}</td>
						<td class="hd-name">${item.userName}</td>
						<td class="hd-sex">${gender}</td>
						<td class="hd-section">${position}</td>
						<td class="hd-range">${item.notice}</td>
					</tr>`;
				}
				$(".h-data tbody").html(htableHtml);
				that.forLeaderAddSelect();
			})
		},

		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".h-data table").off().on("click", ".hd-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},

		//给表格数据添加选择方法
		forLeadersAddSelect: function () {
			$(".hs-data table").off().on("click", ".hd-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		//删除表格的数据
		deleteTableData: function (tableArr) {
			$(".h-data .delete").off().on("click", function () {
				let leaderTableData = $(".h-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".hd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".hd-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						// alert("删除成功")
						$(selectedData).remove();
					} else {
						showAlert("删除失败")
					}
				})
			})
		},
		//删除表格的数据
		deletesTableData: function (tableArr) {
			$(".hs-data .delete").off().on("click", function () {
				// debugger
				let leaderTableData = $(".hs-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("暂无数据");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".hd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".hd-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						// alert("删除成功")
						$(selectedData).remove();
					} else {
						showAlert("删除失败")
					}
				})
			})
		},
		//加载组织服务队伍的数据
		loadTotalGroupData: function () {
			let that = this;
			apiPost("queryVolunteer", "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂无数据，可以去新增~")
					return;
				}
				let hGroupArr = data.contents;
				let hgHtml = "";
				for (let i = 0; i < hGroupArr.length; i++) {
					let item = hGroupArr[i];
					hgHtml += `<div class="h-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".h-group").html(hgHtml);

				that.scanGroupData();
				that.deleteArmyGroup();
				that.editArmyGroup();
			})
		},
		//删除服务队伍
		deleteArmyGroup: function () {
			let that = this;

			$(".item-dele").off().on("click", function (e) {
				showAlert("暂无接口")
				let officeId = e.currentTarget.dataset.id;
				// apiPost("delOffice?officeId=" + officeId, "", function (data) {
				// 	alert("删除办公室组成功");

				// 	//删除办公室组数据之后重新请求办公室组数据
				// 	that.loadOfficeZuData();
				// })
			})
		},
		//编辑服务队伍
		editArmyGroup: function () {
			let that = this;
			$(".h-group-item .item-edit").off().on("click", function (e) {
				showAlert('暂无接口')
				// $('.pop').removeClass('none');
				// $('.pop-edit').removeClass('none');
				that.model.officeid = e.currentTarget.dataset.id;
			})
		},
		//编辑服务队伍
		editOffice: function (officeId) {

			var that = this;
			var name = $('.pop-edit .pop_title input').val();
			// apiPost("updateOfficeName?id=" + officeId + '&name=' + name, "", function (data) {
			// 	if (data.success) {
			// 		//编辑成功
			// 		$('.pop').addClass('none');
			// 		$('.pop-edit').addClass('none');
			// 		that.loadOfficeZuData();

			// 	} else {
			// 		//
			// 		alert('编辑失败')
			// 		$('.pop').addClass('none');
			// 		$('.pop-edit').addClass('none');
			// 	}

			// })
		},


		//查看组的数据
		scanGroupData: function () {
			let that = this;
			$(".h-group .item").on("click", function (e) {
				let id = e.currentTarget.dataset.id;
				addNoneFn(".h-module");
				delNoneFn(".h-ser-data");

				addNoneFn(".h-btn");
				delNoneFn(".hb-back");

				that.loadHeartGroupDetail(id);
				that.backToGroup();
			})
		},
		loadHeartGroupDetail: function (id) {
			let that = this;
			let param = {
				"jrId": 777,
				"pageSize": 10,
				"pageNum": 1
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content) {
					showAlert("暂无数据，请稍后重试~")
					return;
				};
				if (!data.content.jrUserList) {
					showAlert("暂无数据，请稍后重试~")
					return;
				}

				let htableArr = data.content.jrUserList.content;

				if (htableArr.length == 0) {
					showAlert("暂无数据，请稍后重试~")
					return;
				}

				let htableHtml = "";
				for (let i = 0; i < htableArr.length; i++) {
					let item = htableArr[i];
					htableHtml += `<tr>
						<th class="hd-select" data-id="${item.id}"><p></p></th>
						<td class="hd-no">${i}</td>
						<td class="hd-name">${item.userName}</td>
						<td class="hd-sex">${item.gender}</td>
						<td class="hd-section">${item.position}</td>
						<td class="hd-range">${item.notice}</td>
					</tr>`;
				}
				$(".hs-data tbody").html(htableHtml);
				that.forLeadersAddSelect();
			})
		},
		//点击返回
		backToGroup: function () {
			let that = this;
			$(".hb-back").on("click", function () {
				addNoneFn(".h-module");
				delNoneFn(".h-ser");

				addNoneFn(".h-btn");
				delNoneFn(".hb-add");

				that.loadTotalGroupData();
			})
		},
		//新增，出现新增弹窗
		serverGroupNewAdd: function () {
			let that = this;
			$(".hb-add").off().on("click", function (event) {
				event.stopPropagation();

				delNoneFn(".h-add-popup");
				that.sureAddHeartGroup();
				that.cancelAddHeartGroup();
			});
		},
		//确定添组事件
		sureAddHeartGroup: function () {
			let that = this;
			$(".hap-sure-add").off().on("click", function (event) {
				event.stopPropagation();
				let name = $("#name").val();
				let content = $("content").val();
				let param = {
					"name": name,
					"content": content
				}
				if (!name) {
					showAlert("请填写名称")
					return;
				}
				addNoneFn(".h-add-popup");
				apiPost("addVolunteer", param, function (data) {
					if (data.success) {
						// alert("添加事件成功");
					} else {
						showAlert("添加失败");
					}

					that.loadTotalGroupData();
				})
			})
		},
		//取消添加组事件
		cancelAddHeartGroup: function () {
			let that = this;
			$(".hap-cancel-add").off().on("click", function () {
				addNoneFn(".h-add-popup");
			})
		},
		//未开放的建设
		notOpenInstruction: function () {
			$(".hm-branch, .hm-big").on("click", function () {
				showAlert("暂未开放")
			})
		},
		clickEvents: function () {
			let that = this;
			$('.add').on('click', function () {
				$('.pop').removeClass('none');
				$('.pop-content').removeClass('none');
			});
			$('.pop-content .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
			});
			$('.pop-edit .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-edit').addClass('none');
			});
			$('.pop-content .yes').on('click', function () {
				that.addpeople();
			});

			$('.pop-edit .yes').on('click', function () {
				that.editOffice(that.model.officeid);
			});
			that.deleteTableData();
			that.deletesTableData();
		},
		//添加人
		addpeople: function () {
			var that = this;
			var position = $('#orgrazation option:selected').val();
			var gender = $('#gender option:selected').val();
			var param = {
				userName: $('.pop_title input').val(),
				gender: parseInt(gender),
				position: parseInt(position),
				jrId: 777
			};
			// if (!peopleValidate(param)) return;
			apiPost("addUser", param, function (data) {
				if (data.success) {
					// alert('新增成功')
				} else {
					showAlert('新增失败')
				}
				$('.pop').addClass('none');
				that.loadHeartGroupDetail();
			})
		},
	}
	heart.init();
}


module.exports = {

	init: initialize
}
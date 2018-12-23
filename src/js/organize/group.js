import {
	apiPost,
	showAlert,
	hideAlert,
	addNoneFn,
	delNoneFn,
	peopleValidate
} from "../../util/util.js"

function initialize(params) {
	if (__DEV__) {
		console.log(params);
	}

	let group = {
		model: {
			totalpage: 1,
			content: '',
			popContentActionFrom: "add", //打开内容弹窗的操作来源
			editId: "", //选择编辑的人员id
		},
		init: function () {
			//初始化组菜单的样式
			$(".office-group-btn").removeClass("active");
			$(".group-general").addClass("active");

			addNoneFn(".group-menu");
			delNoneFn(".g-back");

			addNoneFn(".group-subpage");
			delNoneFn(".general-cnt");

			this.judgeOfficeHaveContent();

			this.groupSwitchGroup();
			this.groupBackBtn();
			this.pageFunc();
			this.clickEvent();
			hideAlert();

			this.addGeneral();
			this.generalPopConfirm();
			this.generalPopCancel();
		},
		//判断办公室概况是否已添加
		judgeOfficeHaveContent: function () {
			let that = this;
			apiPost("officeContentHave?id=" + params.id, "", function (data) {
				if (!data.success || !data.content) {
					return;
				}
				if (data.success) {
					//查询办公室的概况
					addNoneFn(".general-wrap .no-cnt, .general-wrap .cnt");
					delNoneFn(".general-wrap .cnt");

					that.queryOfficeContent();
				} else {
					//显示兜底图
					addNoneFn(".general-wrap .no-cnt, .general-wrap .cnt");
					delNoneFn(".general-wrap .no-cnt");
				}
			})
		},
		//查询办公室的概况
		queryOfficeContent: function () {
			apiPost("queryOfficeById?id=" + params.id, "", function (data) {
				if (!data.success || !data.content) {
					return;
				}

				let officeGroupCnt = data.content;
				let officeGroupContentHtml = `<div class="general-slide">
												<ul>
													<li>
														<img src="${officeGroupCnt.officePic}" alt="">
													</li>
												</ul>
											</div>
											<div class="general-right">
												<div class="g-tit">${officeGroupCnt.name}</div>
												<p>${officeGroupCnt.content}</p>
											</div>`;
				$(".general-wrap .cnt").html(officeGroupContentHtml);
			})
		},

		//上传文件
		uploadFiles: function (files) {
			var _this = this;
			var formData = new FormData();

			formData.append('file', files[0]);

			$.ajax({
				type: "Post",
				url: "http://47.254.44.188:8088/upload",
				contentType: false,
				processData: false,
				data: formData,
				dataType: "json",
				success: function (response) {
					if (response.success) {
						_this.model.content = response.content;
						// showAlert('上传成功')
					} else {
						showAlert('接口返回数据失败')
					}
				}
			})
		},
		//添加办公室概况
		addOfficeContent: function () {
			var _this = this;
			var pic = 'http://47.254.44.188:8088/files/' + _this.model.content;
			var content = $('.general-pop .pop_content input').val();
			if (!content) {
				showAlert("内容不能为空");
				return;
			}
			addNoneFn(".general-pop");
			let that = this;
			let param = {
				"id": params.id,
				"officePic": pic,
				"content": content
			};
			apiPost("addOfficeContent", param, function (data) {
				if (data.success) {
					// showAlert("新建概况成功")
					_this.queryOfficeContent();
				} else {
					showAlert('新建失败，请重试')
				}
			})
		},
		//切换概况和人员
		groupSwitchGroup: function () {
			let that = this;
			$(".office-group-btn").off().on("click", function () {
				if ($(this).hasClass("active")) return;

				//btn操作
				$(".office-group-btn").removeClass("active");
				$(this).addClass("active");

				//页面操作
				let seleId = $(this).attr("id");
				addNoneFn(".group-subpage");
				addNoneFn(".group-menu");
				if (seleId == "general") {
					//显示概况页面
					delNoneFn(".general-cnt");
					delNoneFn(".g-back");
					$(".g-back").css("right", "0px");
				} else {
					//显示人员页面
					delNoneFn(".staff-org");
					delNoneFn(".g-back, .g-switch");
					$(".g-back").css("right", "135px");

					//加载办公室组人员组织架构数据
					that.loadOfficeGroupOrgData();

					that.groupSwitchBtn();
				}
			})
		},
		//点击新建概况按钮
		addGeneral: function () {
			$(".add-og-cnt").off().on("click", function () {
				//弹出新增概况的弹框
				delNoneFn(".general-pop");
			});
		},
		//概况弹窗确认按钮
		generalPopConfirm: function () {
			let that = this;
			$('.general-pop .yes').off().on('click', function () {
				that.addOfficeContent();
			});
		},
		//概况弹窗取消按钮
		generalPopCancel: function () {
			$('.general-pop .notice_cancel').off().on('click', function () {
				addNoneFn(".general-pop");
			});
		},
		/*******************************************概况end***********************************************/
		//加载办公室组人员组织架构数据
		loadOfficeGroupOrgData: function () {
			let param = {
				jrId: 888,
				officeId: params.id
			};
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试");
					return;
				};

				let officeGroupOrgArr = data.contents;

				if (officeGroupOrgArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}
				let officeGroupOrgHtml = "";
				for (let i = 0; i < officeGroupOrgArr.length; i++) {
					let item = officeGroupOrgArr[i];
					officeGroupOrgHtml += `<div class="o-gorg-detail">
										<div>${item.positionName}</div>
										<div>${item.userName}</div>
									</div>`;
				}
				$(".o-go-cnt").html(officeGroupOrgHtml);

			})
		},
		//加载办公室组人员表格数据
		loadOfficeGroupTable: function () {
			let that = this;
			let param = {
				"jrId": 888,
				"officeId": params.id,
				"pageSize": 10,
				"pageNum": 1
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content || !data.content.jrUserList) {
					showAlert("请求数据失败，请稍后重试");
					return;
				};

				let ogtableArr = data.content.jrUserList.content;

				if (!ogtableArr || ogtableArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}
				let ogtableHtml = "";
				for (let i = 0; i < ogtableArr.length; i++) {
					let item = ogtableArr[i];

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

					ogtableHtml += `<tr>
						<th class="gd-select" data-id="${item.id}"><p></p></th>
						<td class="gd-no">${i}</td>
						<td class="gd-name">${item.userName}</td>
						<td class="gd-sex">${gender}</td>
						<td class="gd-section">${position}</td>
						<td class="gd-range">${item.notice}</td>
					</tr>`;
				}
				$(".staff-data tbody").html(ogtableHtml);
				that.forLeaderAddSelect();
			})
		},
		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".staff-data table").off().on("click", ".gd-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		//办公室组的人员切换
		groupSwitchBtn: function () {
			let that = this;
			$(".g-switch").off().on("click", function () {
				if ($(".staff-org").hasClass("none")) {
					//menu显隐
					addNoneFn(".group-menu");
					delNoneFn(".g-back, .g-switch");
					$(".g-back").css("right", "135px");

					//页面显隐
					addNoneFn(".group-subpage");
					delNoneFn(".staff-org");

					that.loadOfficeGroupOrgData();
				} else {
					//menu显隐
					delNoneFn(".group-menu");
					$(".g-back").css("right", "270px");

					//页面显隐
					addNoneFn(".group-subpage");
					delNoneFn(".staff-data");

					that.loadOfficeGroupTable();
					that.groupStaffExport();
				}
			})
		},
		//办公室组返回
		groupBackBtn: function () {
			let that = this;
			$(".g-back").off().on("click", function () {
				//导航菜单的更新
				addNoneFn(".org-menu, .org-group-menu");
				delNoneFn(".org-menu");

				let htmlPath = "./html/organize/office.html";
				let jsPath = "./organize/office";
				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./organize/office") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../organize/office");
								currentMod.init();
							},
							"office"
						);
					}
				});
			})
		},
		//办公室组人员导出
		groupStaffExport: function () {
			$(".g-export").off().on("click", function () {
				showAlert("敬请期待")
			});
		},
		clickEvent: function () {
			let that = this;
			//添加办公室组人员表格数据
			$('.g-do-wrap .add').off().on('click', function () {
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
			that.deleteOGTableData(); //OG: officegroup
			that.updateOGTableData();

			$('#addPhotoBtn').change(function (e) {
				var files = e.target.files || e.dataTransfer.files;
				//上传文件
				that.uploadFiles(files);
			});
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
					that.loadOfficeGroupTable();
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
					that.loadOfficeGroupTable();
				} else {
					showAlert("编辑失败，请重试")
				}
			})
		},
		//删除表格的数据
		deleteOGTableData: function (tableArr) {
			$(".g-do-wrap .delete").off().on("click", function () {
				let officeTabData = $(".staff-data tbody").children(); //领导的表格数据
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
					if ($(item).find(".gd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".gd-select").attr("data-id");

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
		updateOGTableData: function () {
			let that = this;
			$(".g-do-wrap .edit").off().on("click", function () {
				that.model.popContentActionFrom = "edit";
				let officeTabData = $(".staff-data tbody").children(); //领导的表格数据
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
					if ($(item).find(".gd-select p").hasClass("checked")) {
						ishasSelectData = true;
						selectedData = item;
					};
				}
				if (!ishasSelectData) {
					showAlert("请选择要操作的数据");
					return;
				}
				//将选择修改的名字带入编辑弹窗中
				let selectName = $(selectedData).find(".gd-name").text();
				$('#orgName').val(selectName);
				//打开编辑弹窗
				delNoneFn(".pop");
				//保存编辑人的id
				that.model.editId = $(selectedData).find(".gd-select").attr("data-id");
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
	}

	group.init();
}

module.exports = {
	init: initialize
};
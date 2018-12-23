import {
	apiPost,
	validate,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"

function initialize(params) {

	// if (__DEV__) {
	// 	console.log(params);
	// }

	let centerId = params.id;
	let cgroup = {
		model: {
			totalpage: 1,
			popContentActionFrom: "add", //打开内容弹窗的操作来源
			editId: "", //选择编辑的人员id
		},
		init: function () {
			//初始化页面
			this.initPageCenter();
			//切换顶部菜单
			this.switchMenu();
			//切换中心组织到表格数据
			this.switchCenterOrgToData();
			this.pageFunc();
			this.clickEvents();
			hideAlert();
		},
		//初始化页面
		initPageCenter: function () {
			if (params.from == "cgroupdetail") {
				$(".c-menu").removeClass("active");
				$(".cm-civi").addClass("active");

				addNoneFn(".c-module");
				delNoneFn(".c-practice-data");

				addNoneFn(".c-btn");
				delNoneFn(".cb-back, .cb-add");

				//加载文明实践点
				this.loadCiviPracData();
			} else {
				$(".c-menu").removeClass("active");
				$(".cm-org").addClass("active");

				addNoneFn(".c-module");
				delNoneFn(".c-org");

				addNoneFn(".c-btn");
				delNoneFn(".cb-switch, .cb-back");

				//加载分中心的组织架构
				this.loadCenterOrg();
			}
			//返回
			this.backToCenter();
		},
		//切换顶部菜单
		switchMenu: function () {
			let that = this;
			$(".c-menu").on("click", function () {
				$(".c-menu").removeClass("active");
				$(this).addClass("active");

				let cId = $(this).attr("id");
				switch (cId) {
					case "corg":
						addNoneFn(".c-module");
						delNoneFn(".c-org");

						addNoneFn(".c-btn");
						delNoneFn(".cb-switch, .cb-back");

						that.loadCenterOrg();
						break;
					case "ccivi":
						addNoneFn(".c-module");
						delNoneFn(".c-practice-data");

						addNoneFn(".c-btn");
						delNoneFn(".cb-back, .cb-add");

						that.addCiviPracticeData();
						that.loadCiviPracData();
						break;

					case "cplan":
						addNoneFn(".c-module");
						delNoneFn(".c-plan-data");

						addNoneFn(".c-btn");
						delNoneFn(".cb-back, .cb-export, .cb-count");

						that.queryPlan();
						break;
					case "cact":
						alert("敬请期待");
						addNoneFn(".c-module");
						// delNoneFn(".c-act-data");

						addNoneFn(".c-btn");
						// delNoneFn(".cb-back, .cb-export");
						break;
					default:
						alert("敬请期待");
						addNoneFn(".c-module");
						addNoneFn(".c-btn");
				}
			})
		},
		//返回到分中心主页
		backToCenter: function () {
			$(".cb-back").off().on("click", function (e) {
				e.stopPropagation();

				let htmlPath = "./html/center/center.html";
				let jsPath = "./center/center";
				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".center-box").html(html);
					if (jsPath === "./center/center") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../center/center");
								currentMod.init();
							},
							"center"
						);
					}
				});
			})
		},
		//组织架构导出功能
		exportOrgData: function () {
			$(".cb-export").off().on('click', function () {
				showAlert("敬请期待")
			})
		},
		//切换中心组织架构到数据
		switchCenterOrgToData: function () {
			let that = this;
			$(".cb-switch").off().on("click", function () {
				addNoneFn(".c-btn");
				if ($(".c-org").hasClass("none")) {
					delNoneFn(".cb-switch, .cb-back");
					addNoneFn(".c-module");
					delNoneFn(".c-org");
					//加载组织架构数据
					that.loadCenterOrg();
				} else {
					delNoneFn(".cb-switch, .cb-export");
					addNoneFn(".c-module");
					delNoneFn(".c-data");
					//加载组织表格数据
					that.loadCenterTable();

					//表格数据操作
					that.exportOrgData();
					that.deleteTableData();
					that.updateTableData();
				}
			})
		},
		//加载分中心的组织架构
		loadCenterOrg: function () {
			let that = this;
			let param = {
				"jrId": '',
				"centerId": centerId
			};
			//请求组织数据
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success || !data.contents) {
					showAlert("请求数据失败，请稍后重试")
					return;
				};

				let orgArr = data.contents;

				if (orgArr.length == 0) {
					showAlert("暂无数据，可以去新增");
					return;
				}

				let orgHtml = "";
				for (let i = 0; i < orgArr.length; i++) {
					let item = orgArr[i];
					orgHtml += `<div class="c-org-detail">
									<div>${item.positionName}</div>
									<div>${item.userName}</div>
								</div>`;
				}
				$(".c-o-cnt").html(orgHtml);
			})
		},
		//加载分中心表格数据
		loadCenterTable: function () {
			let that = this;
			let param = {
				"jrId": '',
				"pageSize": 10,
				"pageNum": 1,
				"centerId": centerId
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content || !data.content.jrUserList) {
					showAlert("请求数据失败，请稍后重试")
					return;
				};

				let tableArr = data.content.jrUserList.content;
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
					} else {
						position = '工作人员';
					}

					tableHtml += `<tr>
						<th class="cd-select" data-id="${item.id}"><p></p></th>
						<td class="cd-no">${i}</td>
						<td class="cd-name">${item.userName}</td>
						<td class="cd-sex">${gender}</td>
						<td class="cd-section">${position}</td>
						<td class="cd-range">${item.notice}</td>
					</tr>`;
				}
				$(".c-data tbody").html(tableHtml);
				that.forLeaderAddSelect();
			});
		},
		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".c-data table").off().on("click", ".cd-select", function () {
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		//修改表格数据
		updateTableData: function () {
			let that = this;
			$(".c-do-wrap .edit").off().on("click", function () {
				that.model.popContentActionFrom = "edit";
				let leaderTableData = $(".c-data tbody").children(); //领导的表格数据
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
					if ($(item).find(".cd-select p").hasClass("checked")) {
						ishasSelectData = true;
						selectedData = item;
					};
				}
				if (!ishasSelectData) {
					showAlert("请选择要操作的数据");
					return;
				}
				//将选择修改的名字带入编辑弹窗中
				let selectName = $(selectedData).find(".cd-name").text();
				$('#cName').val(selectName);
				//打开编辑弹窗
				delNoneFn(".people-add-popup");
				//保存编辑人的id
				that.model.editId = $(selectedData).find(".cd-select").attr("data-id");
			})
		},
		//删除表格的数据
		deleteTableData: function () {
			$(".c-do-wrap .delete").off().on("click", function () {
				let leaderTableData = $(".c-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("暂无数据~");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".cd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要操作的数据");
					return;
				}

				let deleId = $(selectedData).find(".cd-select").attr("data-id");

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
		//确认添加人
		sureAddpeople: function () {
			var that = this;
			var position = $('#cPosition option:selected').val();
			var gender = $('#cGender option:selected').val();
			var name = $('#cName').val();
			var param = {
				userName: name,
				gender: parseInt(gender),
				position: parseInt(position),
				centerId: params.id
			};
			if (!name) {
				showAlert("请填写内容");
				return;
			}
			apiPost("addUser", param, function (data) {
				addNoneFn(".people-add-popup");
				that.loadCenterTable();
			})
		},
		//编辑人
		sureEditPeople: function () {
			let that = this;
			let userName = $('#cName').val();
			let gender = $('#cGender option:selected').val();
			let position = $('#cPosition option:selected').val();
			let param = {
				id: this.model.editId,
				userName: userName,
				gender: gender,
				position: position
			}
			apiPost("editorUser", param, function (data) {
				if (data.success) {
					that.loadCenterTable();
				} else {
					showAlert("编辑失败，请重试")
				}
			})
		},
		//事件点击器
		clickEvents: function () {
			var that = this;
			$('.c-do-wrap .add').off().on('click', function () {
				delNoneFn(".people-add-popup");
				that.model.popContentActionFrom = "add";
				$('#cName').val("");
			});
			$('.people-add-popup .notice_cancel').on('click', function () {
				addNoneFn(".people-add-popup");
			});
			//确认添加
			$('.people-add-popup .yes').off().on('click', function () {
				addNoneFn(".people-add-popup");
				if (that.model.popContentActionFrom == "add") {
					that.sureAddpeople();
				} else if (that.model.popContentActionFrom == "edit") {
					that.sureEditPeople();
				}
			});
		},
		/*****************************年度计划start************************************/
		queryPlan: function () {
			let that = this;
			let url = 'queryPlansForCenter?pageNum=1&pageSize=10';
			apiPost(url, "", function (data) {
				data = {
					success: true,
					content: {
						content: [{
							"id": 13,
							"createUserId": 1,
							"createTime": "2018-12-14 20:42:32",
							"updateUserId": 1,
							"updateTime": "2018-12-14 20:54:44",
							"status": null,
							"expireTime": "2018-12-12 00:00:00",
							"name": "自选活动标题",
							"type": null,
							"content": "内容",
							"planStatus": null,
							"complete": null,
							"checkStatus": 3,
							"selectType": 2,
							"accessory": "附件",
							"centerId": 8,
							"integral": null,
							"countryId": 1
						}]
					}
				};

				if (!data || !data.success || !data.content || !data.content.content) {
					showAlert("接口报错，请稍后重试~");
					return;
				}

				let planArr = data.content.content;

				if (planArr.length == 0) {
					showAlert("暂无数据，可以去新增~");
				}
				let planHtml = "";
				for (let i = 0; i < planArr.length; i++) {
					let item = planArr[i];

					let checkStatus = "";
					if (item.checkStatus == 0) {
						checkStatus = "未开始";
					}
					if (item.checkStatus == 1) {
						checkStatus = "进行中";
					}
					if (item.checkStatus == 2) {
						checkStatus = "已完成";
					}
					if (item.checkStatus == 3) {
						checkStatus = "已过期";
					}

					planHtml += `<tr>
						<th class="cpd-select" data-id="${item.id}"><p></p></th>
						<td class="cpd-no">${i}</td>
						<td class="cpd-endline">${item.expireTime}</td>
						<td class="cpd-name">${item.name}</td>
						<td class="cpd-section">${item.content}</td>
						<td class="cpd-status">${checkStatus}</td>
						<td class="cpd-percent">${item.planStatus}</td>
						<td class="cpd-action"><span data-id="${item.id}" class="track">跟踪</span><span>附件</span></td>
					</tr>`;

					$(".c-plan-data tbody").html(planHtml);

					that.trackPlanStatus();
				}
			})
		},
		//跟踪事件，查看目前计划的状态
		trackPlanStatus: function () {
			$(".c-plan-data .track").off().on("click", function (e) {
				let planId = e.currentTarget.dataset.id
				let url = `afterResult?planId=${planId}&pageNum=1&pageSize=10`;
				apiPost(url, "", function (data) {
					data = {
						success: true,
						content: {
							afterResultDTOS: [{
								countryName: "宝华村",
								status: "已完成",
								resultId: 5
							}]
						}
					};
					if (!data || !data.success || !data.content || !data.content.afterResultDTOS) {
						showAlert("请求跟踪数据失败");
						return;
					}
					let trackPlanArr = data.content.afterResultDTOS;
					if (trackPlanArr.length == 0) {
						showAlert("暂无更新");
						return;
					}
					let trackPlanHtml = "";
					for (let i = 0; i < trackPlanArr.length; i++) {
						let item = trackPlanArr[i];
						trackPlanHtml += `<div><span>${item.countryName}</span><span>${item.status}</span></div>`;
					}

					$(".trackpop .track-cnt").html(trackPlanHtml);
					delNoneFn('.trackpop');
					$(".track-close").off().on("click", function () {
						addNoneFn('.trackpop');
					})
				});
			})
		},
		/*****************************文明实践点的操作start************************************/
		//加载文明实践点数据
		loadCiviPracData: function () {
			let that = this;
			apiPost("queryCenterPractice?centerId=" + params.id, "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂无数据，可以去新增~");
					$(".cp-group").html();
					return;
				}
				let centerPracArr = data.contents;
				let cpHtml = "";
				for (let i = 0; i < centerPracArr.length; i++) {
					let item = centerPracArr[i];

					cpHtml += `<div class="cpg-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".cp-group").html(cpHtml);

				$(".cp-group .item").off().on("click", function (e) {
					let pracId = e.currentTarget.dataset.id;

					addNoneFn(".org-menu, .org-group-menu");
					delNoneFn(".org-group-menu");

					that.loadCenterGroupDetail(pracId);
				})

				that.deleteCiviPrac();
				that.editCiviPrac();
			})
		},
		//删除文明实践点
		deleteCiviPrac: function () {
			let that = this;
			$(".cpg-item .item-dele").off().on("click", function (e) {
				let pracId = e.currentTarget.dataset.id;
				apiPost("delPractice?practiceId=" + pracId, "", function (data) {
					// alert("删除实践点成功");
					//删除办公室组数据之后重新请求文明数据
					that.loadCiviPracData();
				})
			})
		},
		//编辑文明实践点
		editCiviPrac: function () {
			$(".cpg-item .item-edit").off().on("click", function (e) {
				showAlert("暂无接口")
				// $('.pop').removeClass('none');
				// $('.pop-edit').removeClass('none');
				let pracId = e.currentTarget.dataset.id;

			})
		},
		//编辑文明实践点接口
		editcenter: function (officeId) {
			console.log('officeId', officeId)
			var that = this;
			var name = $('.pop-edit .pop_title input').val();
			apiPost("updateCenterName?id=" + officeId + '&name=' + name, "", function (data) {
				if (data.success) {
					//编辑成功
					$('.pop').addClass('none');
					$('.pop-edit').addClass('none');
					that.loadCenterZuData();

				} else {
					alert('编辑失败,请稍后再试')
					$('.pop').addClass('none');
					$('.pop-edit').addClass('none');
				}

			})
		},
		//新增文明实践点点击事件
		addCiviPracticeData: function () {
			let that = this;
			$(".cb-add").off().on("click", function () {
				delNoneFn(".civiPra-add-popup");

				that.sureAddCiviPrac();
				that.cancelAddCiviPrac();
			})
		},
		//确定添加文明实践点
		sureAddCiviPrac: function () {
			let that = this;
			$(".cpap-sure-add").off().on("click", function () {
				let name = $("#cgName").val(),
					lon = $("#cgLon").val(),
					lat = $("#cgLat").val();

				let param = {
					"centerId": centerId,
					"name": name,
					"lon": lon,
					"lat": lat
				}
				if (!validate(param, false)) return;
				addNoneFn(".civiPra-add-popup");
				apiPost("addPractice", param, function (data) {
					if (data.success) {
						// alert("添加成功")
					} else {
						showAlert("添加失败")
					}

					that.loadCiviPracData();
				})
			})
		},
		//取消添加文明实践点
		cancelAddCiviPrac: function () {
			let that = this;
			$(".cpap-cancel-add").off().on("click", function () {
				addNoneFn(".civiPra-add-popup");
			})
		},
		/*****************************文明实践点的操作end************************************/
		//进入分中心实践点详细
		loadCenterGroupDetail: function (pracId) {
			let htmlPath = "./html/center/cgroupdetail.html";
			let jsPath = "./center/cgroupdetail";

			$.get(htmlPath, [], function (html) {
				let currentMod;
				$(".main-bottom").html(html);
				if (jsPath === "./center/cgroupdetail") {
					require.ensure(
						[],
						function (require) {
							currentMod = require("../center/cgroupdetail");
							currentMod.init({
								"id": pracId,
								"centerId": params.id
							});
						},
						"cgroupdetail"
					);
				}
			});
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
	cgroup.init();
}


module.exports = {

	init: initialize
}
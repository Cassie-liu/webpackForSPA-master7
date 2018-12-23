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
	let source = params.source, //来源功能室还是村站
		groupId = params.id; //对应的id
	let groupchild = {
		init: function () {
			$(".scgroup-menu").removeClass("active");
			$(".cfg-org").addClass("active");

			addNoneFn(".scgroup-btn");
			delNoneFn(".cfg-back, .cfg-switch");

			addNoneFn(".sc-module");
			delNoneFn(".sc-org");
			this.querySubGroupOrg();
			this.switchMenu();
			this.switchOrgToTable();
			this.clickEvents();
			this.downLoadFile();
			hideAlert();
		},
		//菜单切换
		switchMenu: function () {
			let that = this;
			$(".scgroup-menu").off().on("click", function (e) {
				e.stopPropagation();

				if ($(this).hasClass("active")) return;

				$(".scgroup-menu").removeClass("active");
				$(this).addClass("active");

				addNoneFn(".scgroup-btn");
				addNoneFn(".sc-module");

				let menuId = $(this).attr("id");
				if (menuId == "cfgorg") {
					delNoneFn(".cfg-back, .cfg-switch");
					delNoneFn(".sc-org");

					that.querySubGroupOrg();
				} else if (menuId == "cfgprac") {
					delNoneFn(".cfg-back, .cfg-add");
					delNoneFn(".sc-prac");

					that.querySubGroupPractice();
					that.addSubGroupPractice();
				} else if (menuId == "cfgplan") {
					delNoneFn(".cfg-back, .cfg-export, .cfg-count");
					delNoneFn(".sc-plan");

					that.queryPlan();
				} else {
					showAlert("功能暂未开启")
				}
			})
		},
		/**************************组织架构********************************************/
		//查询子项目的组织架构
		querySubGroupOrg: function () {
			let that = this;
			let param = {};
			if (source == "country") {
				param.countryId = groupId;
			} else {
				param.townRoomId = groupId;
			}
			//请求组织数据
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂无数据，可以去新增~")
					return;
				};

				let orgArr = data.contents;
				let orgHtml = "";
				for (let i = 0; i < orgArr.length; i++) {
					let item = orgArr[i];
					orgHtml += `<div class="c-org-detail">
									<div>${item.positionName}</div>
									<div>${item.userName}</div>
								</div>`;
				}
				$(".sc-o-cnt").html(orgHtml);
			})
		},
		//查询子项目的表格数据
		querySubGroupTable: function () {
			let that = this;
			let param = {
				"pageSize": 10,
				"pageNum": 1,
			};
			if (source == "country") {
				param.countryId = groupId;
			} else {
				param.townRoomId = groupId;
			}
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content) {
					showAlert("暂无数据，可以去新增~")
					return;
				};
				if (!data.content.jrUserList) {
					showAlert("暂无数据，可以去新增~")
					return;
				};
				let tableArr = data.content.jrUserList.content;

				if (tableArr.length == 0) {
					showAlert("暂无数据，可以去新增~")
					return;
				};

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
						<th class="scd-select" data-id="${item.id}"><p></p></th>
						<td class="scd-no">${i}</td>
						<td class="scd-name">${item.userName}</td>
						<td class="scd-sex">${gender}</td>
						<td class="scd-section">${position}</td>
						<td class="scd-range">${item.notice}</td>
					</tr>`;
				}
				$(".sc-data tbody").html(tableHtml);
				that.forLeaderAddSelect();
			});
		},
		//给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".sgd-data table").off().on("click", ".sd-select", function () {
				// debugger
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})


			//功能室
			$(".sc-data table").off().on("click", ".scd-select", function () {
				// debugger
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
		},
		//删除表格的数据
		deleteTableData: function (tableArr) {
			$(".sgd-data .delete").off().on("click", function () {
				// debugger
				let leaderTableData = $(".sgd-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("没有数据可以删除");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".sd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".sd-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						showAlert("删除成功")
						$(selectedData).remove();
					} else {
						showAlert("删除失败")
					}
				})
			})

			//功能室
			$(".sc-data .delete").off().on("click", function () {
				debugger
				let leaderTableData = $(".sc-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("没有数据可以删除");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".scd-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					showAlert("请选择要删除的数据");
					return;
				}

				let deleId = $(selectedData).find(".scd-select").attr("data-id");

				apiPost("delUser?id=" + deleId, "", function (data) {
					if (data.success) {
						showAlert("删除成功")
						$(selectedData).remove();
					} else {
						showAlert("删除失败")
					}
				})
			})
		
		},

		

		//切换子项目组织架构To表格
		switchOrgToTable: function () {
			let that = this;
			$(".cfg-switch").off().on("click", function () {
				if ($(".sc-org").hasClass("none")) {
					//显示组织
					addNoneFn(".sc-module");
					delNoneFn(".sc-org");

					that.querySubGroupOrg();
				} else {
					//显示表格
					addNoneFn(".sc-module");
					delNoneFn(".sc-data");

					that.querySubGroupTable();
				}
			})
		},
		/**************************年度计划********************************************/
		//查询年度计划
		queryPlan: function () {
			let that = this;
			let url = "";
			if (source == "country") {
				url = 'queryPlansForCountry?pageNum=1&pageSize=10';

			} else {
				url = 'queryPlansForTownRoom?pageNum=1&pageSize=10';
			}

			apiPost(url, "", function (data) {
				
				if (!data || !data.success || !data.content || !data.content.content) {
					showAlert("接口报错，请稍后重试~");
					return;
				}

				let planArr = data.content.content;
				// planArr=[
				// 	{
				// 		"id": 21,
				// 		"createUserId": 1,
				// 		"createTime": "2018-12-19 10:21:19",
				// 		"updateUserId": null,
				// 		"updateTime": "2018-12-19 10:21:19",
				// 		"status": null,
				// 		"expireTime": "2018-12-27 00:00:00",
				// 		"name": "党务宣传",
				// 		"type": null,
				// 		"content": "顶顶顶顶大多",
				// 		"planStatus": null,
				// 		"complete": null,
				// 		"checkStatus": 1,
				// 		"selectType": 1,
				// 		"accessory": "1545186078043.png",
				// 		"centerId": 1,
				// 		"integral": 34,
				// 		"countryId": null,
				// 		"townRoomId": null
				// 	}
				// ];

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
						<th class="scpd-select" data-id="${item.id}"><p></p></th>
						<td class="scpd-no">${i}</td>
						<td class="scpd-endline">${item.expireTime}</td>
						<td class="scpd-name">${item.name}</td>
						<td class="scpd-status">${checkStatus}</td>
						
						<td class="scpd-action"><span class="track" data-id="${item.id}">跟踪</span><span cass="loadaccessory">附件</span></td>
					</tr>`;

					$(".sc-plan tbody").html(planHtml);

					that.trackPlanStatus();
				}
			})
		},
		//跟踪事件，查看目前计划的状态
		trackPlanStatus: function () {
			$(".sc-plan .track").off().on("click", function (e) {
				e.stopPropagation();
				$('.sc-plan').addClass('none');
				$('.sc-track').removeClass('none');

				let planId = e.currentTarget.dataset.id
				let url = `afterResult?planId=${planId}&pageNum=1&pageSize=10`;
				apiPost(url, "", function (data) {
					
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
						// trackPlanHtml += `<div><span>${item.countryName}</span><span>${item.status}</span></div>`;
						trackPlanHtml += `<tr>
						<td class="scpd-no"></td>
						<td class="scpd-endline">${item.countryName}</td>
						<td class="scpd-status">${item.status}</td>
						<td class="scpd-status">${item.status}</td>
						<td class="scpd-action"><span class="track" data-id="${item.resultId}">查看</span></td>
					</tr>`;


					}

					$(".sc-track tbody").html(trackPlanHtml);
					// delNoneFn('.trackpop');
					$(".track-close").off().on("click", function () {
						addNoneFn('.trackpop');
					})
				});
			})
		},
		//附件下载
		downLoadFile:function(){
			$(".loadaccessory").off().on("click", function () {
				var $eleForm = $("<form method='get'></form>");
	
				$eleForm.attr("action","https://codeload.github.com/douban/douban-client/legacy.zip/master");
	
				$(document.body).append($eleForm);
	
				//提交表单，实现下载
				$eleForm.submit();
			});
		},

		/**************************实践点********************************************/
		//查询实践点
		querySubGroupPractice: function () {
			let that = this;
			let url = "queryCenterPractice";
			if (source == "country") {
				url = url + '?countryId=' + groupId;
			} else {
				url = url + '?townRoomId=' + groupId;
			}
			apiPost(url, "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("暂实践点数据，可以去新增~")
					$(".sc-prac").html();
					return;
				}
				let pracArr = data.contents;
				let praHtml = "";
				for (let i = 0; i < pracArr.length; i++) {
					let item = pracArr[i];

					praHtml += `<div class="sgds-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".sc-prac").html(praHtml);

				that.scanSubGroupPractice();
				that.deleSubGroupPractice();
				that.editSubGroupPractice();
			})
		},
		//添加实践点
		addSubGroupPractice: function () {
			let that = this;
			$(".cfg-add").off().on("click", function () {
				delNoneFn(".scpgroup-add-popup");

				that.sureAddSubGP();
				that.cancelAddSubGP();
			})
		},
		//确定添加实践点
		sureAddSubGP: function () {
			let that = this;
			$(".scpap-sure-add").off().on("click", function () {
				var name = $('#scpName').val();
				var scpLon = $('#scpLon').val();
				var scpLat = $('#scpLat').val();
				let param = {
					"name": name,
					"lon": scpLon,
					"lat": scpLat
				}

				if (source == "country") {
					param.countryId = groupId;
				} else {
					param.townRoomId = groupId;
				}

				apiPost("addPractice", param, function (data) {
					if (!data.success) {
						showAlert("添加失败")
						return;
					} else {
						showAlert("添加成功")
					}
					that.querySubGroupPractice();

					addNoneFn(".scpgroup-add-popup");
				})
			})
		},
		//取消添加实践点
		cancelAddSubGP: function () {
			$(".scpap-cancel-add").off().on("click", function () {
				addNoneFn(".scpgroup-add-popup");
			})
		},
		//删除实践点
		deleSubGroupPractice: function () {
			let that = this;
			$(".sgds-group-item .item-dele").off().on("click", function (e) {
				let pracId = e.currentTarget.dataset.id;
				apiPost("delPractice?practiceId=" + pracId, "", function (data) {
					alert("删除实践点成功");
					that.querySubGroupPractice();
				})
			})
		},
		//编辑实践点
		editSubGroupPractice: function () {
			let that = this;
			$(".sgds-group-item .item-edit").off().on("click", function (e) {
				let pracId = e.currentTarget.dataset.id;
				showAlert("暂无接口")
			})
		},
		//查看实践点
		scanSubGroupPractice: function () {
			let that = this;
			$(".sgds-group-item .item").off().on("click", function (e) {
				e.stopPropagation();

				let pracId = e.currentTarget.dataset.id;

				let htmlPath = "./html/stop/groupdetail.html";
				let jsPath = "./stop/groupdetail";

				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/groupdetail") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/groupdetail");
								currentMod.init({
									"id": pracId,
								});
							},
							"groupdetail"
						);
					}
				});
			})
		},
		clickEvents: function () {
			var that = this;
			$('.sgd .add').on('click', function () {
				$('.pop').removeClass('none');
				$('.pop-content').removeClass('none');
			});
			
			$('.pop-content .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
			});
			//功能室取消
			$('.pop-contenttown .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
			});
			
			$('.pop-content .button .yes').on('click', function () {
				that.addpeople();
			});

			//功能室确定
			$('.pop-contenttown .button .yes').on('click', function () {
				that.addpeople();
			});

			//点击跟踪的查看按钮
			$(".sc-track").on("click",".track",function(event){
				$('.scpgroup-search-popup').removeClass('none');
			});

			//功能室跟踪按钮取消
			$('.scpgroup-search-popup .pop-search .notice_cancel').on('click', function () {
				$('.scpgroup-search-popup').addClass('none');
				// $('.scpgroup-search-popup .pop-content').addClass('none');
			});
			//功能室跟踪按钮取消
			$('.scpgroup-search-popup .pop-search .yes').on('click', function () {
				$('.scpgroup-search-popup').addClass('none');
			});

			// $('.sc .add').on('click', function () {
			// 	alert('2')
			// 	$('.pop').removeClass('none');
			// 	$('.pop-contenttown').removeClass('none');
			// });

			//村新增人员,功能室组织架构新增
			$('.sc-data .add').on('click', function () {
				$('.pop').removeClass('none');
					$('.pop-contenttown').removeClass('none');
			// 	$('.village-pop').removeClass('none');
			// 	$('.village-pop .pop-content').removeClass('none');
			});



			
		
			that.deleteTableData();
			that.backToPre();
		},

		//返回到上一层
		backToPre: function () {
			$(".cfg-back").off().on("click", function () {
				alert('待处理')
			})
		},

		//添加人@todo
		addpeople: function () {
			var that = this;
			var position = $('#orgrazation option:selected').val();
			var gender = $('#gender option:selected').val();
			var name = $('#addname').val();
			var param = {
				userName: name,
				gender: parseInt(gender),
				position: parseInt(position),
				townRoomId: groupId
			};
			// if (!peopleValidate(param)) return;
			apiPost("addUser", param, function (data) {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
				if (data.success) {
					that.querySubGroupTable();
				} else {
					showAlert('接口请求失败')
				}


			})
		},
	};
	groupchild.init();
}


module.exports = {

	init: initialize
}
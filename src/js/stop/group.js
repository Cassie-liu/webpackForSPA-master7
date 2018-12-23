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

	let townId = params.id;
	// console.log('townId',townId)
	let backSource = params.backSource; //功能室和村站的返回源
	let sgroup = {
		init: function () {
			
			if (backSource == "country") {
				//初始化村站
				addNoneFn(".sd-module");
				delNoneFn(".sgd-country");

				addNoneFn(".sgd-btn");
				delNoneFn(".sgdb-back, .sgdb-cAdd");

				$(".sgd-meu").removeClass("actiive");
				$(".sgdm-country").addClass("active");

				this.queryCountryGroup();
			} else if (backSource == "func") {
				//初始化功能室
				addNoneFn(".sd-module");
				delNoneFn(".sgd-func");

				addNoneFn(".sgd-btn");
				delNoneFn(".sgdb-back, .sgdb-fAdd");

				$(".sgd-meu").removeClass("actiive");
				$(".sgdm-func").addClass("active");

				this.queryFuncGroup();
			} else {
				//初始化组织架构
				addNoneFn(".sd-module");
				delNoneFn(".sgd-org");

				addNoneFn(".sgd-btn");
				delNoneFn(".sgdb-back, .sgdb-switch");

				$(".sgd-meu").removeClass("actiive");
				$(".sgdm-org").addClass("active");

				this.queryTownOrg();
			}
			this.switchMenu();
			this.switchTownOrgToData();
			this.backToPre();
			this.clickEvents();
			hideAlert();
		},
		switchMenu: function () {
			let that = this;
			$(".sgd-meu").off().on("click", function () {
				$(".sgd-meu").removeClass("active");
				addNoneFn(".sd-module");
				addNoneFn(".sgd-btn");

				let spanId = $(this).attr("id");
				switch (spanId) {
					case "sorg": //组织架构
						$(".sgdm-org").addClass("active");
						delNoneFn(".sgd-org");
						delNoneFn(".sgdb-back, .sgdb-switch");

						that.queryTownOrg();
						break;
					case "sfunc": //功能室
						$(".sgdm-func").addClass("active");
						delNoneFn(".sgd-func");
						delNoneFn(".sgdb-back, .sgdb-fAdd");

						that.addFuncGroup();
						that.queryFuncGroup();
						break;
					case "scountry": //村
						$(".sgdm-country").addClass("active");
						delNoneFn(".sgd-country");
						delNoneFn(".sgdb-back, .sgdb-cAdd");

						that.addCountryGroup();
						that.queryCountryGroup();
						break;
					default:
						$(".sgdm-org").addClass("active");
						delNoneFn(".sgd-org");
						delNoneFn(".sgdb-back, .sgdb-switch");

						that.queryTownOrg();
				}
			})
		},
		//返回到上一层
		backToPre: function () {
			$(".sgdb-back").off().on("click", function () {
				let htmlPath = "./html/stop/stop.html";
				let jsPath = "./stop/stop";

				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".stop-box").html(html);
					if (jsPath === "./stop/stop") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/stop");
								currentMod.init();
							},
							"stop"
						);
					}
				});
			})
		},
		/****************************************组织架构分割线************************************************/
		//切换镇点的组织和数据
		switchTownOrgToData: function () {
			let that = this;
			$(".sgdb-switch").off().on("click", function () {
				if ($(".sgd-org").hasClass("none")) {
					//显示组织
					addNoneFn(".sd-module");
					delNoneFn(".sgd-org");

					that.queryTownOrg();
				} else {
					//显示表格
					addNoneFn(".sd-module");
					delNoneFn(".sgd-data");

					that.queryTownData();
				}
			})
		},
		//查询镇点的组织架构@todo
		queryTownOrg: function () {
			let param = {
				// townId
				"townId": townId
			};
			apiPost("queryUserOrganization", param, function (data) {
				if (!data.success) {
					showAlert("请求接口失败")
					return;
				} else {
					if (!data.contents || data.contents.length == 0) {
						showAlert("未获取到镇组织数据，请稍后重试~")
						return;
					};
					let townOrgArr = data.contents;
					let townOrgHtml = "";
					for (let i = 0; i < townOrgArr.length; i++) {
						let item = townOrgArr[i];
						townOrgHtml += `<div class="sgd-org-detail">
											<div>${item.positionName}</div>
											<div>${item.userName}</div>
										</div>`;
					}
					$(".sgd-o-cnt").html(townOrgHtml);
				}


			})
		},
		//查询镇点的组织数据@todo
		queryTownData: function () {
			let that = this;
			let param = {
				// townId
				"townId": townId,
				"pageSize": 10,
				"pageNum": 1,
			};
			apiPost("queryUserList", param, function (data) {
				if (!data.success || !data.content || data.content.length == 0) {
					showAlert("未获取到领导组织数据，请稍后重试~")
					$(".sgd-data tbody").html();
					return;
				};

				let tableArr = data.content.jrUserList.content;
				let tableHtml = "";

				for (let i = 0; i < tableArr.length; i++) {
					let item = tableArr[i];

					var gender = '';
					var position = '';
					if (item.gender == 1) {
						gender = '男';
					} else {
						gender = '女';
					}

					if (item.position == 1) {
						position = '所长';
					} else {
						position = '副所长';
					}

					tableHtml += `<tr>
						<th class="sd-select" data-id="${item.id}"><p></p></th>
						<td class="sd-no">${i}</td>
						<td class="sd-name">${item.userName}</td>
						<td class="sd-sex">${gender}</td>
						<td class="sd-section">${position}</td>
						<td class="sd-range">${item.notice}</td>
					</tr>`;
				}
				$(".sgd-data tbody").html(tableHtml);
				that.forLeaderAddSelect();
			});
		},
		//删除表格的数据
		deleteTableData: function (tableArr) {
			$(".sgd-data .delete").off().on("click", function () {
				// debugger
				let leaderTableData = $(".sgd-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					showAlert("没有数据可以删除了")
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
		},

	
		/****************************************功能室分割线************************************************/
		//查询功能室的组数据
		queryFuncGroup: function () {
			let that = this;
			apiPost("queryTownRoom?id=" + townId, "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("未查询到功能室数据,快去添加吧");
					$(".sgdf-group").html();
					return;
				}

				let funcGroupArr = data.contents;
				let funcGroupHtml = "";
				for (let i = 0; i < funcGroupArr.length; i++) {
					let item = funcGroupArr[i];
					funcGroupHtml += `<div class="sgdf-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".sgdf-group").html(funcGroupHtml);

				that.funcGroupDetail();
				that.deleFuncGroup();
				that.editFuncGroup();
			})
		},
		//新增功能室的组数据
		addFuncGroup: function () {
			let that = this;
			$(".sgdb-fAdd").off().on("click", function () {
				delNoneFn(".sfunc-add-popup");

				that.sureAddFunc();
				that.cancelAddFunc();
			})
		},
		//确认添加新的功能室
		sureAddFunc: function () {
			let that = this;
			$(".sfap-sure-add").off().on("click", function () {
				let name = $("#sfName").val(),
					lon = $("#sfLon").val(),
					lat = $("#sfLat").val(),
					centerId = $("#sfBelong").val();

				let param = {
					"centerId": centerId,
					"townId": townId,
					"name": name,
					"lon": lon,
					"lat": lat
				}
				if (!validate(param, true)) return;

				addNoneFn(".sfunc-add-popup");

				apiPost("addTownRoom", param, function (data) {
					if (data.success) {
						showAlert("添加成功")
					} else {
						showAlert("添加失败,请稍后重试")
					}

					that.queryFuncGroup();
				})
			})
		},
		//取消添加新的功能室
		cancelAddFunc: function () {
			$(".sfap-cancel-add").off().on("click", function () {
				addNoneFn(".sfunc-add-popup");
			})
		},
		//edit功能室的组数据
		editFuncGroup: function () {
			let that = this;
			$(".sgdf-group .item-edit").off().on("click", function (e) {
				let countryGroupId = e.currentTarget.dataset.id;
				$('.pop').removeClass('none');
				$('.pop .pop-edit').removeClass('none');
				let name = "";

				$('.pop-edit .button .yes').on('click', function () {

					name = $('#b-name').val();
					apiPost("updateTownRoomName?id=" + countryGroupId + "&name=" + name, "", function (data) {
						$('.pop').addClass('none');
						$('.pop .pop-edit').addClass('none');
						if (data.success) {
							// alert('编辑成功')
						} else {
							showAlert('编辑失败')
						}
						that.queryFuncGroup();
					})
				});


			})
		},
		//dele功能室的组数据
		deleFuncGroup: function () {
			let that = this;
			$(".sgdf-group .item-dele").off().on("click", function (e) {
				let countryGroupId = e.currentTarget.dataset.id;

				apiPost("delTownRoom?id=" + countryGroupId, "", function (data) {
					if (data.success) {
						// alert("删除功能室成功");
					} else {
						showAlert("删除功能室失败");
					}

					that.queryFuncGroup();
				})
			})
		},
		//功能室的组的详细页面
		funcGroupDetail: function () {
			$(".sgdf-group .item").off().on("click", function (e) {
				let funcGroupId = e.currentTarget.dataset.id;

				e.stopPropagation();

				let htmlPath = "./html/stop/groupchild.html";
				let jsPath = "./stop/groupchild";
				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/groupchild") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/groupchild");
								currentMod.init({
									townId:townId,
									id: funcGroupId,
									source: "func"
								});
							},
							"groupchild"
						);
					}
				});
			})
		},
		/****************************************村分割线************************************************/
		//查询村的组数据
		queryCountryGroup: function () {
			let that = this;
			apiPost("queryCountryByTownId?id=" + townId, "", function (data) {
				if (!data.success || !data.contents || data.contents.length == 0) {
					showAlert("未查询到村站数据,快去添加吧");
					$(".sgdc-group").html();
					return;
				}

				let countryGroupArr = data.contents;
				let countryGroupHtml = "";
				for (let i = 0; i < countryGroupArr.length; i++) {
					let item = countryGroupArr[i];
					countryGroupHtml += `<div class="sgdc-group-item">
								<p class="item" data-id="${item.id}">
									<a href="javascript:void(0)"><span>${item.name}</span></a>
								</p>
								<div class="item-operate">
									<div class="item-edit" data-id="${item.id}">编辑</div>
									<div class="item-dele" data-id="${item.id}">删除</div>
								</div>
							</div>`;
				}

				$(".sgdc-group").html(countryGroupHtml);

				that.CountryGroupDetail();
				that.deleCountryGroup();
				that.editCountryGroup();
			})
		},
		//新增村的组数据
		addCountryGroup: function () {
			let that = this;
			$(".sgdb-cAdd").off().on("click", function () {
				delNoneFn(".sc-add-popup");

				that.sureAddCountry();
				that.cancelAddCountry();
			})
		},
		//确认添加新的村站
		sureAddCountry: function () {
			let that = this;
			$(".scap-sure-add").off().on("click", function () {
				let name = $("#scName").val(),
					lon = $("#scLon").val(),
					lat = $("#scLat").val();

				let param = {
					"name": name,
					"lon": lon,
					"lat": lat
				}
				if (!validate(param, false)) return;
				addNoneFn(".sc-add-popup");
				apiPost("addCountry", param, function (data) {
					if (data.success) {
						showAlert("添加成功")
					} else {
						showAlert("添加失败,请稍后重试")
					}

					that.queryCountryGroup();
				})
			})
		},
		//取消添加新的村站
		cancelAddCountry: function () {
			$(".scap-cancel-add").off().on("click", function () {
				addNoneFn(".sc-add-popup");
			})
		},
		//edit村的组数据
		editCountryGroup: function () {
			let taht = this;
			$(".sgdc-group .item-edit").off().on("click", function (e) {
				let countryGroupId = e.currentTarget.dataset.id;
				let name = "";

				$('.pop').removeClass('none');
				$('.pop .pop-edit').removeClass('none');

				$('.pop-edit .button .yes').on('click', function () {

					name = $('#b-name').val();
					apiPost("updateCountryName?id=" + countryGroupId + "&name=" + name, "", function (data) {
						$('.pop').addClass('none');
						$('.pop .pop-edit').addClass('none');
						if (data.success) {
							showAlert('编辑成功')

						} else {
							showAlert('编辑失败')
							// if (!data.success || !data.contents || data.contents.length == 0) {
							// 	// alert("未查询到功能室数据,快去添加吧");
							// 	$(".sgdf-group").html();
							// 	return;
							// }
						}


						that.queryCountryGroup();
					})
				});

			})
		},
		//dele村的组数据
		deleCountryGroup: function () {
			let that = this;
			$(".sgdc-group .item-dele").off().on("click", function (e) {
				let countryGroupId = e.currentTarget.dataset.id;

				apiPost("delCountry?countryId=" + countryGroupId, "", function (data) {
					if (data.success) {
						showAlert("删除成功");
					} else {
						showAlert("删除失败");
					}

					that.queryCountryGroup();
				})
			})
		},
		//村的组的详细页面
		CountryGroupDetail: function () {
			$(".sgdc-group .item").off().on("click", function (e) {
				let countryGroupId = e.currentTarget.dataset.id;

				e.stopPropagation();

				let htmlPath = "./html/stop/groupchild.html";
				let jsPath = "./stop/groupchild";
				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/groupchild") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/groupchild");
								currentMod.init({
									townId:townId,
									id: countryGroupId,
									source: "country"
								});
							},
							"groupchild"
						);
					}
				});
			})
		},

		CountryGroup: function (townId, countryGroupId) {

				let htmlPath = "./html/stop/groupchild.html";
				let jsPath = "./stop/groupchild";
				$.get(htmlPath, [], function (html) {
					let currentMod;
					$(".main-bottom").html(html);
					if (jsPath === "./stop/groupchild") {
						require.ensure(
							[],
							function (require) {
								currentMod = require("../stop/groupchild");
								currentMod.init({
									townId: townId,
									id: countryGroupId,
									outerParam: params.outerParam
								});
							},
							"groupchild"
						);
					}
				});
			
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
			$('.pop-edit .notice_cancel').on('click', function () {
				$('.pop').addClass('none');
				$('.pop-edit').addClass('none');
			});
			$('.pop-content .button .yes').on('click', function () {
				that.addpeople();
			});
			that.deleteTableData();
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
				jrId: '',
				// townId
				townId: townId
			};
			// if (!peopleValidate(param)) return;
			apiPost("addUser", param, function (data) {
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
				if (data.success) {
					that.queryTownData();
				} else {
					showAlert('接口请求失败')
				}


			})
		},

	};
	sgroup.init();
}


module.exports = {

	init: initialize
}
import {
	apiPost,
	delNoneFn,
	addNoneFn,
	showAlert
} from "../../util/util.js"

function initialize(params) {

	if (__DEV__) {
		console.log(params);
	}

	let cgroupdetail = {
		model: {
			content: '',
		},
		init: function () {
			addNoneFn(".cgroup-btn");
			delNoneFn(".cg-back");

			$(".cgroup-menu").removeClass("active");
			$(".cg-general").addClass("active");

			addNoneFn(".cgroup-subpage");
			delNoneFn(".cgeneral-cnt");

			this.judgePracHaveContent();
			this.switchGeneralOrAct();
			this.backToPracGroup();
			this.clickEvents();
		},
		//判断实践点是否有概况
		judgePracHaveContent: function () {
			let that = this;
			apiPost("practiceContenthave?id=" + params.id, "", function (data) {
				if (!data) {
					showAlert("请求数据失败，请稍后重试");
					return;
				}

				if (data.content) {
					//值为true查询实践点的概况
					that.queryPracGeneral();
				} else {
					//显示兜底图todo
					addNoneFn(".cgeneral-wrap .cnt");
					delNoneFn(".cgeneral-wrap .no-cnt");
				}
			})
		},
		//查询某个实践点详情
		queryPracGeneral: function () {
			let that = this;
			apiPost("queryPracticeInfo?practiceId=" + params.id, "", function (data) {
				if (!data.success && !data.content && !data.pic) {
					return;
				}

				let cGroupCnt = data.content;
				let cGroupContentHtml = `<div class="cgeneral-slide">
												<ul>
													<li>
														<img src="${cGroupCnt.pic}" alt="">
													</li>
												</ul>
											</div>
											<div class="cgeneral-right">
												<div class="g-tit">${cGroupCnt.name}</div>
												<p>${cGroupCnt.content}</p>
											</div>`;
				$(".cgeneral-wrap .cnt").html(cGroupContentHtml);

				addNoneFn(".cgeneral-wrap .no-cnt");
				delNoneFn(".cgeneral-wrap .cnt");
			})
		},
		//新建实践点概况内容
		addPracContent: function () {
			var _this = this;
			var pic =_this.model.content;
			let content=$('.pop_content').val();
			let param = {
				"id": params.id,
				"pic": pic,
				"content": content
			};
			apiPost("addPracticeContent", param, function (data) {
				if (!data.success) {
					alert("新建概况失败")
					return;
				} else {
					alert('新建概况成功')
				}
				_this.queryPracGeneral();

			})
		},
		//切换菜单
		switchGeneralOrAct: function () {
			var that=this;
			$(".cgroup-menu").off().on("click", function () {
				//活动
				if ($(this).hasClass("cg-act")) {
					addNoneFn('.cgeneral-wrap');
					delNoneFn('.cgroup-activityshow');
					that.loadactivity();
					// return;
				}
				if ($(this).hasClass("active")) {
					return;
				}
				$(".cgroup-menu").removeClass("active");
				$(this).addClass("active");
			})
		},

		//活动
		loadactivity:function(){
			// sp-general-act
			apiPost("queryFeatureForFront?pageNum=1&pageSize=10&practiceId="+params.id, "", function (data) {
				if (!data.success) {
					showAlert("接口请求失败")
					return;
				}else{
					if(data.content.list.length>0){
						var pichtml='';
						for(var i=0;i<data.content.list.length;i++){
							var item=data.content.list[i];
							pichtml+=`<li>
									<dl>
										<dt>
											<img src="${item.pic[0]}">
										</dt>
										<dd>
											<p>
												<span>${item.planName}</span>
											</p>
										</dd>
									</dl>
								</li>`;
						}

						$('.c-show .activity-content ul').html(pichtml);
					}else{
						showAlert("没有活动数据哦")
					}
				}

			})
		},

		//点击返回
		backToPracGroup: function () {
			$(".cg-back").off().on("click", function (e) {
				e.stopPropagation();

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
									"id": params.centerId,
									"from": "cgroupdetail"
								});
							},
							"cgroup"
						);
					}
				});
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
						alert('上传成功')
					} else {
						alert('接口返回数据失败')
					}
				}
			})
		},
		clickEvents: function () {
			var that = this;
			//弹出新增概况的弹框
			$(".add-cg-cnt").on("click", function () {
				delNoneFn(".main-popup .general-popup")
				
			});
			//概况确认addPracticeContent
			$('.pop-generalsituation .button .yes').on('click', function () {
				addNoneFn(".general-popup");
				that.addPracContent();
			});
			//取消
			$('.general-popup .button .notice_cancel').on('click', function () {
				addNoneFn(".pop .general-popup");
			});
			

			//上传文件
			$('#addPhotoBtn').change(function (e) {
				var files = e.target.files || e.dataTransfer.files;
				that.uploadFiles(files);
			});
		},

	};
	cgroupdetail.init();
}


module.exports = {

	init: initialize
}
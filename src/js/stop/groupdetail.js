import {
	apiPost,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"

// 概况

function initialize(params) {

	if (__DEV__) {
		console.log(params);
	}

	let pracId = params.id;
	let groupdetail = {
		model:{
			content:'',
		},
		init: function () {
			$(".sp-group-menu").removeClass("active");
			$(".sp-group-general").addClass("active");

			addNoneFn(".sp-group-btn");
			delNoneFn(".sp-group-back");

			addNoneFn(".sp-group-subpage");
			delNoneFn(".sp-general-cnt");

			this.checkPracticeHaveContent(this.queryPracticeDetail);
			this.switchGeneralOrAct();
			this.backToPracticeGroup();
			this.clickEvents();
			hideAlert();
		},
		//判断某个实践点是否有概况
		checkPracticeHaveContent: function (fn) {
			let that = this;
			apiPost("practiceContenthave?id=" + pracId, "", function (data) {
				if (!data) {
					showAlert("请求接口错误");
					return;
				}

				if (data.content) {
					//有,查询实践点详情
					fn && fn(pracId);
				} else {
					//显示兜底图todo
					addNoneFn(".sp-general-wrap .cnt");
					delNoneFn(".sp-general-wrap .no-cnt");
				}
			})
		},
		//查询某个实践点详情
		queryPracticeDetail: function (pracId) {
			let that = this;
			apiPost("queryPracticeInfo?practiceId=" + pracId, "", function (data) {
				if (!data.success || !data.content.content || !data.content.pic) {
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
				$(".sp-general-wrap .cnt").html(cGroupContentHtml);

				addNoneFn(".sp-general-wrap .no-cnt");
				delNoneFn(".sp-general-wrap .cnt");

				
			})
		},
	
		//添加实践点的概况
		addPracticeContent: function () {
			let _this = this;
			var pic='http://47.254.44.188:8088/files/'+_this.model.content;
			var content=$('.pop-generalsituation .pop_content input').val();
			console.log('content',content)
			let param = {
				"id": pracId,
				"pic": pic,
				"content": content
			};
			apiPost("addPracticeContent", param, function (data) {
				if (!data.success) {
					showAlert("新建实践点失败")
					return;
				}else{
					showAlert('新建成功')
				}
				_this.queryPracticeDetail(pracId);

			})
		},
		//切换菜单
		switchGeneralOrAct: function () {
			$(".sp-group-menu").off().on("click", function () {
				if ($(this).hasClass("sp-group-act")) {
					showAlert("暂未开放")
					return;
				}
				if ($(this).hasClass("active")) {
					return;
				}
				$(".sp-group-menu").removeClass("active");
				$(this).addClass("active");
			})
		},
		//点击返回
		backToPracticeGroup: function () {
			$(".sp-group-back").off().on("click", function (e) {
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

								});
							},
							"groupchild"
						);
					}
				});
			})
		},

		/**
       * 上传文件@todo
       */
      uploadFiles:function(files){
        var _this=this;
        var formData = new FormData();
      
        formData.append('file', files[0]);
      
        $.ajax({
          type:"Post",
          url:"http://47.254.44.188:8088/upload",
          contentType: false, 
          processData: false,
          data:formData,
          dataType:"json",
            success: function (response) {
            if(response.success){
              _this.model.content=response.content;
			  showAlert('上传成功')
            }else{
				showAlert('接口返回数据失败')
            }
        }
      })
      },
		clickEvents:function(){
			var that=this;
			$('.add').on('click',function(){
				$('.pop').removeClass('none');
				$('.pop-content').removeClass('none');
			});
			$('.pop-content .notice_cancel').on('click',function(){
				$('.pop').addClass('none');
				$('.pop-content').addClass('none');
			});
			// $('.pop-edit .notice_cancel').on('click',function(){
			// 	$('.pop').addClass('none');
			// 	$('.pop-edit').addClass('none');
			// });
			$('.pop-content .button .yes').on('click',function () {
				that.addpeople();
			});

			$(".add-sp-cnt").on("click", function () {
				$('.pop').removeClass('none');
				$('.pop-generalsituation').removeClass('none');
				// that.addPracticeContent();
			})

			//概况确认
			$('.pop-generalsituation .button .yes').on('click',function () {
				that.addPracticeContent();
				$('.pop').addClass('none');
				$('.pop-generalsituation').addClass('none');
			});
			//取消
			$('.pop-generalsituation .button .notice_cancel').on('click',function () {
				$('.pop').addClass('none');
				$('.pop-generalsituation').addClass('none');
			});


			$('#addPhotoBtn').change(function(e){
				var files = e.target.files || e.dataTransfer.files;
				//上传文件
				that.uploadFiles(files);
			  });
		},
	};
	groupdetail.init();
}


module.exports = {

	init: initialize
}
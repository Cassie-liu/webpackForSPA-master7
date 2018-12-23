import {
	apiPost,
	validate,
	delNoneFn,
	addNoneFn,
	showAlert,
	hideAlert
} from "../../util/util.js"


function initialize(params) {
    if (__DEV__) {
      console.log(params);
    }
  
    var activity = {
	  model:{
		  content:'',
		  plantotalpage:1,
		  activitystatus:'通过',//活动审核的是否通过
		  taskstatus:'通过',
		  userType:$.cookie('userType'), //1-文明中心；2-分中心；4-镇；6-村；8-镇（室）；9-办公室；10-办公室（组）
		  
	  },
      init: function() {
        //初始化组菜单的样式
		$(".office-group-btn").removeClass("active");
		$(".group-general").addClass("active");

		addNoneFn(".group-menu");
		delNoneFn(".g-back");

		addNoneFn(".group-subpage");
		delNoneFn(".general-cnt");

		
	
       
        this.loadPlanData();
		this.switchtab();
		
		this.clickEvents();
		this.makePlanClicks();
		this.bindEvent();
		this.pageFunc();
		hideAlert();
		
		


	
	
	
      },

      //加载计划制定的数据
		loadPlanData: function () {
      		let that = this;
			
			if(that.model.userType==2){
				 $('.makeplans').addClass('active');
			  //计划制定 分中心
				apiPost("queryPlan?pageNum=1&pageSize=20", "", function (data) {
					if (!data.success || !data.content || data.content.content.length == 0) {
						showAlert("暂无数据，可以去新增~")
						$(".c-group").html();
						return;
					}
					let centerGroupArr = data.content.content;
					that.model.plantotalpage=data.totalPages;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="md-select" data-id="${item.id}"><p></p></th>
							<td class="md-no">${i}</td>
							<td class="md-name">${item.name}</td>
							<td class="md-section">${item.expireTime}</td>
							<td class="md-range"><em data-id="${item.id}">查看</em></td>
						</tr>`;
					}
					$(".l-data tbody").html(tableHtml);

				})

				//没有自选活动
				$('.selfchooseactivity').addClass('none');

				that.forPlanAddSelect();	
			}else if(that.model.userType==8){
				//功能室
				$('.makeplans').addClass('none');
				$('.l-data').addClass('none');
				
				$('.selfchooseactivity').addClass('none');

				//展示审核模块
				$('.activitycheckout').removeClass('none');
				$('.activitycheckout').addClass('active')
				$('.activiymana').removeClass('none');
				that.loadfunctionroomActivityManage();
			}else{
				$('.makeplans').addClass('none');
				$('.l-data').addClass('none');
				//初始化自选活动
				$('.selfchoose').removeClass('none');
				$('.selfchooseactivity').addClass('active')
				that.loadSelfActivity();
			}
		},

		//加载自选活动
		loadSelfActivity:function(){
			let that=this;
			//自选活动(只有村有)
			if(that.model.userType==6){
				apiPost("querySelfPlanList?pageNum=1&pageSize=10", "", function (data) {
					if (!data.success || !data.content || data.content.list.length == 0) {
						showAlert("暂无数据，可以去新增~")
						$(".c-group").html();
						return;
					}
					let centerGroupArr = data.content.list;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="ald-select" data-id="${item.id}" id="self-select"><p></p></th>
							<td class="ald-no">${i}</td>
							<td class="ald-name">${item.name}</td>
							<td class="ald-sex">${item.centerName}</td>
							<td class="ald-sex">${item.checkStatus}</td>
							<td class="ald-sex">${item.expireTime}</td>
							<td class="ald-range"><em data-id="${item.id}">查看</em></td>
						</tr>`;
					}
					$(".self-data tbody").html(tableHtml);
				})
			}else{
				$('.selfchooseactivity').addClass('none');

			}
			
			
		},

		//加载任务审核
		loadTaskManage:function(){
			var that=this;
			//镇审核和分中心审核
			// 1-文明中心；2-分中心；4-镇；6-村；8-镇（室）；9-办公室；10-办公室（组）
			
			if(that.model.userType==8){
				//功能室审核
				apiPost("checkPlanListForTownRoom?pageNum=1&pageSize=10", "", function (data) {
					if (!data.success || !data.content || data.content.checkForTownRoomDTOS.length == 0) {
						showAlert("暂无数据")
						$(".c-group").html();
						return;
					}

	
					let centerGroupArr = data.content.checkForTownRoomDTOS;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="ad-select" data-id="${item.resultId}"><p></p></th>
							<td class="ad-no">${i}</td>
							<td class="ad-name">${item.townName}</td>
							<td class="ad-sex">${item.countryName}</td>
							<td class="ad-section">${item.planName}</td>
							<td class="ad-sex">${item.completeTime}</td>
							<td class="ad-range"><em data-id="${item.resultId}">审核</em></td>
						</tr>`;
					}
					$(".a-data tbody").html(tableHtml);
				})
				$('.gongnnegshi').removeClass('none');
			}else if(that.model.userType==2){
				//分中心审核
				apiPost("checkPlanListForCenter?pageNum=1&pageSize=10", "", function (data) {
					if (!data.success || !data.content || data.content.checkForTownRoomDTOS.length == 0) {
						showAlert("暂无数据")
						$(".c-group").html();
						return;
					}
					let centerGroupArr = data.content.checkForTownRoomDTOS;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="ad-select" data-id="${item.resultId}"><p></p></th>
							<td class="ad-no">${i}</td>
							<td class="ad-name">${item.townName}</td>
							<td class="ad-sex">${item.countryName}</td>
							<td class="ad-section">${item.planName}</td>
							<td class="ad-sex">${item.completeTime}</td>
							<td class="ad-range"><em data-id="${item.resultId}">审核</em></td>
						</tr>`;
					}
					$(".a-data tbody").html(tableHtml);
				})
				$('.fenzhongxin').removeClass('none');
			}
			
			
		},

		//加载活动管理
		loadfunctionroomActivityManage:function(){
			var that=this;
			//判断是功能室还是分中心8,zhen4
			
			if(that.model.userType==8){
				//功能室 
				apiPost("querySelfPlanCheckListForTownRoom?pageNum=1&pageSize=10", "", function (data) {
					if (!data.success || !data.content || data.content.checkForTownRoomDTOS.length == 0) {
						showAlert("暂无数据，可以去发布~")
						$(".c-group").html();
						return;
					}
					
				
					let centerGroupArr = data.content.checkForTownRoomDTOS;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="ac-select" data-id="${item.resultId}"><p></p></th>
							<td class="ac-no">${i}</td>
							<td class="ac-name">${item.townName}</td>
							<td class="ac-sex">${item.countryName}</td>
							<td class="ac-section">${item.planName}</td>
							<td class="ac-sex">${item.completeTime}</td>
							<td class="ac-range audit"><em data-id="${item.resultId}">审核</em></td>
						</tr>`;
					}
					$(".al-data tbody").html(tableHtml);
				})

				
				$('.gongnnegactivity').removeClass('none');
				
			}else if(that.model.userType==2){
				//分中心
				apiPost("querySelfPlanCheckListForCenter?pageNum=1&pageSize=10", "", function (data) {
					if (!data.success || !data.content || data.content.checkForTownRoomDTOS.length == 0) {
						showAlert("暂无数据，可以去发布~")
						$(".c-group").html();
						return;
					}

					let centerGroupArr = data.content.checkForTownRoomDTOS;
					let tableHtml = "";
					for (let i = 0; i < centerGroupArr.length; i++) {
						let item = centerGroupArr[i];
						tableHtml += `<tr>
							<th class="ac-select" data-id="${item.resultId}"><p></p></th>
							<td class="ac-no">${i}</td>
							<td class="ac-name">${item.townName}</td>
							<td class="ac-sex">${item.countryName}</td>
							<td class="ac-section">${item.planName}</td>
							<td class="ac-sex">${item.completeTime}</td>
							<td class="ac-range audit"><em data-id="${item.resultId}">审核</em></td>
						</tr>`;
					}
					$(".al-data tbody").html(tableHtml);
				})

				$('.centeractivity').removeClass('none');
			}
		
		},


      //切换活动
      switchtab: function() {
		  let that=this;
        $('.main-detail li').on('click',function(){
          $(this).addClass("active").siblings().removeClass("active");     
          var index=$(this).data('index');
		  $('.main-bottom ul li').eq(index).removeClass('none').siblings().addClass("none");
		  if(!$('.selfchoose').hasClass('none')){
			//显示自选活动
			that.loadSelfActivity();
		  }else if(!$('.activiymana').hasClass('none')){
			//显示活动管理
			that.loadfunctionroomActivityManage();
		  }else if(!$('.taskmana').hasClass('none')){
			//显示任务审核
			that.loadTaskManage();
		  }
       });
	},

	//计划制定给表格数据添加选择方法
	forPlanAddSelect: function () {
		$(".l-data table").off().on("click", ".ld-select", function () {
			//移除其他ld-select的子元素p的selected类名
			$(this).parent("tr").siblings().find("p").removeClass("checked");
			//选中的元素添加selected类名
			$(this).find("p").addClass("checked");
		})
	},
	
	//计划制定删除表格的数据
	deletePlanData: function (tableArr) {
		$(".l-data .delete").off().on("click", function () {
			let leaderTableData = $(".l-data tbody").children(); //领导的表格数据
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
				if ($(item).find(".md-select p").hasClass("checked")) {
					ishasDeleteData = true;
					selectedData = item;
				};
			}
			if (!ishasDeleteData) {
				showAlert("请选择要删除的数据");
				return;
			}

			let deleId = $(selectedData).find(".md-select").attr("data-id");

			apiPost("delPlan?planId=" + deleId, "", function (data) {
				if (data.success) {
					showAlert("删除成功")
					$(selectedData).remove();
				} else {
					showAlert("删除失败")
				}
			})
		})
	},


	//自选活动删除表格的数据
	deleteSelfData: function (tableArr) {
		$(".self-data .delete").off().on("click", function () {
			// debugger
			let leaderTableData = $(".self-data tbody").children(); //领导的表格数据
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
				if ($(item).find(".ald-select p").hasClass("checked")) {
					ishasDeleteData = true;
					selectedData = item;
				};
			}
			if (!ishasDeleteData) {
				showAlert("请选择要删除的数据");
				return;
			}

			let deleId = $(selectedData).find(".ald-select").attr("data-id");

			apiPost("delPlan?planId=" + deleId, "", function (data) {
				if (data.success) {
					showAlert("删除成功")
					$(selectedData).remove();
				} else {
					showAlert("删除失败")
				}
			})
		})
	},
			
	clickEvents:function(){
		let that=this;
		that.selfChooseActivity();

		

		//自选活动
		$('.self-data .add').on('click', function () {
			$('.selfativity-pop').removeClass('none');
			$('.selfativity-pop .pop-content').removeClass('none');
			$('body').css('overflow','hidden');
			var centerName=[];
			var html='';

			//查询分中心的下拉列表
			apiPost("queryCenter", "", function (data) {
				if(data.success){
					for(var i=0;i<data.contents.length;i++){
						html+=`<option value="${data.contents[i].id}">${data.contents[i].name}</option>`;
					}
					$('#selfcenter').html(html);
				}else{
					alert('调取接口失败')
				}
				$('.selfcenter').html();
			})

		});

		//自选活动取消
		$('.selfativity-pop .pop-content .notice_cancel').on('click', function () {
			$('.selfativity-pop').addClass('none');
			$('.selfativity-pop .pop-content').addClass('none');
		});

		$('.selfativity-pop .pop-search .notice_cancel').on('click', function () {
			$('.selfativity-pop').addClass('none');
			$('.selfativity-pop .pop-search').addClass('none');
		});

		$('.selfativity-pop .pop-content .yes').on('click', function () {
			$('.selfativity-pop').addClass('none');
			$('.selfativity-pop .pop-content').addClass('none');
			
			that.publishSelfPlan();
		});

		//活动审核
		$(".al-data").on("click",".ac-range em",function(event){
			//移除其他ld-select的子元素p的selected类名
			var target = $(event.target);
			var id=target.data('id');
			
			//调取接口
			that.loadactivityAuditInfo(id);
		});

		//任务审核
		$(".a-data").on("click",".ad-range em",function(event){
			//移除其他ld-select的子元素p的selected类名
			var target = $(event.target);
			var id=target.data('id');
			
			//调取接口
			that.loadtaskAuditInfo(id);
		});

		//任务审核
		$('.taskcheck-pop .notice_cancel').on('click', function () {
			$('.taskcheck-pop').addClass('none');
			$('.taskcheck-pop .pop-content').addClass('none');
		});

		$('.taskcheck-pop .yes').on('click', function (event) {
			var target = $(event.target);
			var id=target.data('id');
			$('.taskcheck-pop').addClass('none');
			$('.taskcheck-pop .pop-content').addClass('none');
			var status='';
			var remark=$('#completesituation').val();
			if(that.model.userType==8){
				//功能室
				if(that.model.taskstatus=='通过'){
					status=2;
				}else{
					status=4
				}
			}else if(that.model.userType==2){
				//分中心
				if(that.model.taskstatus=='通过'){
					status=3;
				}else{
					status=4
				}
			}

			//点击确认
			that.audittaskClick(id,status,remark);
		});


		//活动审核
		$('.activitycheck-pop .notice_cancel').on('click', function () {
			$('.activitycheck-pop').addClass('none');
			$('.activitycheck-pop .pop-content').addClass('none');
			
		});

		$('.activitycheck-pop .yes').on('click', function (event) {
			var target = $(event.target);
			var id=target.data('id');
			$('.activitycheck-pop').addClass('none');
			$('.activitycheck-pop .pop-content').addClass('none');
			var status='';
			var remark=$('#completesituation').val();
		
			// return;

			if(that.model.userType==8){
				//功能室
				if(that.model.activitystatus=='通过'){
					status=2;
				}else{
					status=4
				}
			}else if(that.model.userType==2){
				//分中心
				if(that.model.activitystatus=='通过'){
					status=3;
				}else{
					status=4
				}
			}
			console.log('status',status)
			// return;




			//点击确认
			that.auditactivityClick(id,status,remark);
		});

		//计划制定给表格数据添加选择方法
		$(".l-data table").off().on("click", ".md-select", function () {
			//移除其他ld-select的子元素p的selected类名
			$(this).parent("tr").siblings().find("p").removeClass("checked");
			//选中的元素添加selected类名
			$(this).find("p").addClass("checked");
		});

		//自选活动给表格数据添加选择方法
		$(".self-data table").off().on("click", ".ald-select", function () {
			//移除其他ld-select的子元素p的selected类名
			$(this).parent("tr").siblings().find("p").removeClass("checked");
			//选中的元素添加selected类名
			$(this).find("p").addClass("checked");
		});

		//活动审核给表格数据添加选择方法
		$(".al-data table").off().on("click", ".ac-select", function () {
			//移除其他ld-select的子元素p的selected类名
			$(this).parent("tr").siblings().find("p").removeClass("checked");
			//选中的元素添加selected类名
			$(this).find("p").addClass("checked");
		});

		//任务审核给表格数据添加选择方法
		$(".a-data table").off().on("click", ".ad-select", function () {
			//移除其他ld-select的子元素p的selected类名
			$(this).parent("tr").siblings().find("p").removeClass("checked");
			//选中的元素添加selected类名
			$(this).find("p").addClass("checked");
		});

		$('#agender').change(function(e){
			
			// var target=$("#gender option:selected");
			// var status=$('#gender option:selected').text();
			var status=$("#agender").find("option:selected").text();
			that.model.activitystatus=status;
			// console.log('statusssss',status)
			// if(target.val()==4){
			// 	//不通过
			// 	$('.pop_remark').removeClass('none');
			// }else{
			// 	$('.pop_remark').addClass('none');
			// }

		})

		$('#tgender').change(function(e){
			
			var status=$("#tgender").find("option:selected").text();
			that.model.taskstatus=status;

		})


	
		

		


		
		//删除计划制定
		that.deletePlanData();
		//删除自选活动
		that.deleteSelfData();



		$('#planPhotoBtn').change(function(e){
			var files = e.target.files || e.dataTransfer.files;
			//上传文件
			that.uploadFiles(files);
			});

		$('#selfplanPhotoBtn').change(function(e){
			var files = e.target.files || e.dataTransfer.files;
			//上传文件
			that.uploadFiles(files);
			});
	},

	//计划制定
	makePlanClicks:function(){
		let that=this;
		
		//制定计划
		$('.l-data .add').on('click', function () {
			$('.ativity-pop').removeClass('none');
			$('.ativity-pop .pop-content').removeClass('none');
			$('body').css('overflow','hidden');
		});
		$('.ativity-pop .pop-content .notice_cancel').on('click', function () {
			$('.ativity-pop').addClass('none');
			$('.ativity-pop .pop-content').addClass('none');
			$('body').css('overflow','auto');
		});

		$('.ativity-pop .pop-search .notice_cancel').on('click', function () {
			$('.ativity-pop').addClass('none');
			$('.ativity-pop .pop-search').addClass('none');
			$('body').css('overflow','auto');
		});

		$('.ativity-pop .pop-content .yes').on('click', function () {
			$('.ativity-pop').addClass('none');
			$('.ativity-pop .pop-content').addClass('none');
			$('body').css('overflow','auto');
			
			that.addPlan();
		});

		$('.ativity-pop .pop-search .yes').on('click', function () {
			$('.ativity-pop').addClass('none');
			$('.ativity-pop .pop-search').addClass('none');
			$('body').css('overflow','auto');
		});

		//委托  点击查看
		$(".l-data").on("click",".md-range em",function(event){
			var target = $(event.target);
			var id=target.data('id');

			apiPost("querySinglePlan?planId="+id, "", function (data) {
				if(data.success){
					$('.ativity-pop').removeClass('none');
					$('.ativity-pop .pop-search').removeClass('none');
					$('.ativity-pop .pop-search .plan-title').html(data.content.name);
					$('.ativity-pop .pop-search .plan-content').html(data.content.content);
					$('.ativity-pop .pop-search .plan-interal').html(data.content.integral);
					$('.ativity-pop .pop-search .plan-center').html(data.content.centerName);
					if(data.content.accessory==null){
						$('.ativity-pop .pop-search .plan-extral span').html('无');
						$('.ativity-pop .pop-search .plan-extral img').attr('src','');
					}else{
						$('.ativity-pop .pop-search .plan-extral span').html('');
						$('.ativity-pop .pop-search .plan-extral img').attr('src',data.content.accessory)
					}
					
				}else{
					alert('网络异常，请稍后再试')
				}
			})
		

		})
	
	},


	//自选活动
	selfChooseActivity:function(){
			//委托  点击查看
			$(".self-data").on("click",".ald-range em",function(event){
				// alert('暂无接口')
				var target = $(event.target);
				var id=target.data('id');
				apiPost("querySinglePlan?planId="+id, "", function (data) {
					if(data.success){
						$('.selfativity-pop').removeClass('none');
						$('.selfativity-pop .pop-search').removeClass('none');
						$('.selfativity-pop .pop-search .plan-title').html(data.content.name);
						$('.selfativity-pop .pop-search .plan-content').html(data.content.content);
						$('.selfativity-pop .pop-search .plan-interal').html(data.content.integral);
						$('.selfativity-pop .pop-search .plan-extral img').html('src',data.content.accessory);
						$('.selfativity-pop .pop-search .plan-center').html(data.content.centerName);
					}else{
						alert('网络异常，请稍后再试')
					}
				})
			
	
			})
	},


		//任务审核
		audittaskClick:function(id,status,remark){
			var _this=this;
			if(_this.model.userType==8){
				//功能室-审核
				apiPost("checkPlanForTownRoom?jrPlanExecuteResultId="+id+"&checkStatus="+status+"&memo="+remark, "", function (data) {
					if(data.success){
						showAlert('审核成功')
					}else{
						showAlert('审核异常，请稍后再试')
					}
				})
			}else if(_this.model.userType==2){
				//分中心-审核
				apiPost("checkPlanForCenter?jrPlanExecuteResultId="+id+"&checkStatus="+status+"&memo="+remark, "", function (data) {
					if(data.success){
						showAlert('审核成功')
					}else{
						showAlert('审核异常，请稍后再试')
					}
					
				})
			}
			
		},


		//活动审核
		auditactivityClick:function(id,status,remark){
			var _this=this;
			if(_this.model.userType==8){
				//功能室-审核
				apiPost("checkSelfPlanForTownRoom?planId="+id+"&status="+status, "", function (data) {
					if(data.success){
						showAlert('审核成功')
					}else{
						showAlert('审核异常，请稍后再试')
					}
				})
			}else if(_this.model.userType==2){
				//分中心-审核
				apiPost("checkSelfPlanForTownRoom?planId="+id+"&status="+status, "", function (data) {
					if(data.success){
						showAlert('审核成功')
					}else{
						showAlert('审核异常，请稍后再试')
					}
					
				})
			}
			
		},


		//加载任务审核信息
		loadtaskAuditInfo:function(id){
			var _this=this;
			// 1-文明中心；2-分中心；4-镇；6-村；8-镇（室）；9-办公室；10-办公室（组）
			
			// if(_this.model.userType==8){
				//功能室-审核信息展示
				apiPost("queryPlanForTownRoom?resultId="+id, "", function (data) {
					if(!data.success){
						showAlert('审核接口调取失败');
					}else{
						$('.taskcheck-pop').removeClass('none');
						$('.taskcheck-pop .pop-content').removeClass('none');
						$('.taskcheckName').html(data.content.planName);
						$('.taskcheckcontent').html(data.content.planContent);
						$('.taskcheckexpretime').html(data.content.completeTime);
						$('.taskcheckcenter').html(data.content.centerName);
						$(".taskcheckcompletesituation img").attr("src", data.content.planAccessory);
						$('.taskcheck-pop .yes').attr('data-id',id);
					}
				})
			// }else if(_this.model.userType==2){
			// 	//分中心-审核信息展示
			// 	apiPost("checkSelfPlanForTownRoom?planId=13&status=3", "", function (data) {
			// 		if(!data.success){
			// 			showAlert('审核接口调取失败')
			// 		}else{
			// 			$('.check-pop').removeClass('none');
			// 			$('.check-pop .pop-content').removeClass('none');
			// 		}
			// 	})
			// }
			

		},

			//加载活动审核信息
		loadactivityAuditInfo:function(id){
			var _this=this;
			// 1-文明中心；2-分中心；4-镇；6-村；8-镇（室）；9-办公室；10-办公室（组）
			
			// if(_this.model.userType==8){
				//功能室-审核信息展示
				apiPost("querySinglePlan?planId="+id, "", function (data) {
					if(!data.success){
						showAlert('审核接口调取失败');
					}else{
						$('.activitycheck-pop').removeClass('none');
						$('.activitycheck-pop .pop-content').removeClass('none');
						$('.activitycheckName').html(data.content.name);
						$('.activitycheckcontent').html(data.content.content);
						$('.activitycheckinteral').html(data.content.integral);
						$('.activitycheckcenter').html(data.content.centerName);
						$('.activitycheckexpretime').html(data.content.expireTime);
						$(".activitycompletesituation img").attr("src", data.content.accessory);
						$('.activitycheck-pop .yes').attr('data-id',id);
					}
				})
			// }else if(_this.model.userType==2){
			// 	//分中心-审核信息展示
			// 	apiPost("checkSelfPlanForTownRoom?planId=13&status=3", "", function (data) {
			// 		if(!data.success){
			// 			showAlert('审核接口调取失败')
			// 		}else{
			// 			$('.check-pop').removeClass('none');
			// 			$('.check-pop .pop-content').removeClass('none');
			// 		}
			// 	})
			// }
			

		},

		//制定计划
		addPlan:function(){
			var _this=this;
			var name=$('#planName').val();
			var content=$('#plancontent').val();
			var integral=$('#plangrade').val();
			var expireTime=$('#ativityexpretime').val();
			var pic=_this.model.content;

			var params={
				name:name,
				content:content,
				accessory:pic,
				integral:parseInt(integral),
				expireTime:expireTime
			};
			apiPost("publishPlan", params, function (data) {
				if(data.success){
					// alert('发布计划成功')
					_this.loadPlanData();
				}else{
					// alert('发布计划失败')
				}
			});
			//重新加载页面
			
		},


		//制定计划
		publishSelfPlan:function(){
			var _this=this;
			var name=$('#selfplanName').val();
			var content=$('#selfplancontent').val();
			var expireTime=$('#selfexpretime').val();
			var pic=_this.model.content;
			var centerId=$('#selfcenter').val();

			var params={
				name:name,
				content:content,
				accessory:pic,
				expireTime:expireTime,
				centerId:centerId
			};
			apiPost("publishSelfPlan", params, function (data) {
				if(data.success){
					//重新加载页面
					_this.loadSelfActivity();
				}else{
					alert('发布计划失败')
				}
			});
			
		},

		/*
		*
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
			 }else{
				showAlert('接口返回数据失败')
			 }
		 }
	   })
	   },
 

 //将时间格式转化为yyyy-mm-nn
 formatDate: function (date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	return y + '-' + m + '-' + d;
},
   
    
    
    

    bindEvent: function () {
		var _this = this;
		//日历弹框
		// laydate.render({
		// 	elem: '#ativityexpretime' //指定元素
		// });
		// laydate.render({
		// 	elem: '#selfexpretime' //指定元素
		// });
		$("#ativityexpretime").click(function () {
			var $this = $(this);
			var startDate = new Date(),
			currentDate = new Date(),
			endDate = new Date();
			startDate.setFullYear(startDate.getFullYear() - 1);
			cal.pick({
				elem: $this,
				startDate: startDate,
				offset: { left: 2, top: 12 },
				currentDate: currentDate,
				unsyncValue: true
			});
		});
	},


	 // 分页事件
	 pageFunc:function(current){
		var  _this = this;
		if (!_this.model.plantotalpage) {
			$("#page").hide();
			return;
		}
		$("#page").show();
		$("#page").createPage({
			pageCountBtn:"true", // 是否显示总页数
			pageCount:_this.model.plantotalpage, // 总页数
			firstpageBtn:'true', // 是否显示页首页按钮
			prevpageText:'上一页',
			nextpageText:'下一页',
			lastpageBtn:'true', // 是否显示尾页按钮
			current:current,// 当前页
			turndown:'true',// 是否显示跳转框，显示为true，不现实为false,一定记得加上引号...
			totalCount:_this.model.totalCount, // 总条数
			totalBtn:'false', // 是否显示总条数
			backFn:function(p){
				_this.getEmployeeList(p);//获取行程列表信息
				$('body,html').animate({scrollTop:0},200);
			}
		});
	},
}

    
  
    activity.init();
  }
  
  module.exports = {
    init: initialize
  };
  
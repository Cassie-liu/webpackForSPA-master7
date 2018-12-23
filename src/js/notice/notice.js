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

  var notice = {
    model:{
      totalpage:0,
      content:'',
      id:'',
    },
    init: function() {
     var _this=this;

     _this.switchLeadModule();
     _this.initnotice(1);
     _this.pageFunc();
      setTimeout(function(){
        _this.clickEvent();
      },3000)
      
    },
    //切换组织架构和办公室
    switchLeadModule: function() {
     
    },
    
    /**
     * 初始化通知公告列表
     */
    initnotice:function(target){
      var _this=this;

      apiPost("queryInformation?pageNum="+target+"&pageSize=8", "", function (response) {
            if(response.success){
                var listHtml='';
                var contentList=response.content.content;
                var organizationName='';
                _this.model.totalpage=response.content.totalPages;
                if(!contentList.length){
                  alert('没有返回数据')
                }else{
                  for(var i=0;i<contentList.length;i++){
                    if(contentList[i].organizationType==1){
                      organizationName='实践点';
                    }else if(contentList[i].organizationType==2){
                      organizationName='实践站';
                    }else if(contentList[i].organizationType==3){
                      organizationName='实践所';
                    }
                    listHtml+='<tr>\
                                <td class="ld-select" data-id="'+contentList[i].id+'"><p id="choose" data-id="'+contentList[i].id+'"></p></td>\
                                <td class="ld-no">'+contentList[i].id+'</td>\
                                <td class="ld-name">'+contentList[i].title+'</td>\
                                <td class="ld-sex">'+organizationName+'</td>\
                                <td class="ld-section">'+contentList[i].content+'</td>\
                                <td class="ld-operation"><i></i>附件</td>\
                              </tr>';
                  }

                  $(".l-data tbody").html(listHtml);
                  
                }

              
            }else{
              alert('接口返回数据失败')
            }
			})
    //   $.ajax({
    //     type:"Post",
    //     url:"http://47.254.44.188:8088/queryInformation",
    //     headers: {
    //       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUFAiLCJ1c2VyX2lkIjoiMSIsImlzcyI6IlNlcnZpY2UiLCJleHAiOjE1NzYxMzE4NDAsImlhdCI6MTU0NDU5NTg0MH0.goO7uO85rxsRa5coymsb_KKx94e-cGIEE4AFDT692mk"
    //     },
    //     data:{
    //       "pageNum":1,
    //       "pageSize":10
    //     },
    //       success: function (response) {
         
    //   }
    //  })
       _this.forLeaderAddSelect();

    },

  

    /**
     * 新增通知公告
     */
    addNotice:function(title,name,content){
     var _this=this;
     var accessory='http://47.254.44.188:8088/files/544614817781.png';
      accessory='http://47.254.44.188:8088/files/'+_this.content;
      var params={
          title:title,
          organizationType:1,
          content:content,
          accessory: accessory  //附件路径
      };


      apiPost("addInformation", params, function (data) {
            if(data.success){
                //
                alert('请求成功')

            }else{
                alert('接口请求失败')
            }
            _this.initnotice(1);
            $('.pop').addClass('none');
            $('.pop .pop-content').addClass('none');
			})


      // $.ajax({
      //   type: "Post",
      //   url: "http://47.254.44.188:8088/addInformation",
      //   headers: {
      //     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUFAiLCJ1c2VyX2lkIjoiMSIsImlzcyI6IlNlcnZpY2UiLCJleHAiOjE1NzYxMzE4NDAsImlhdCI6MTU0NDU5NTg0MH0.goO7uO85rxsRa5coymsb_KKx94e-cGIEE4AFDT692mk"
      //   },
      //   data:JSON.stringify(params),
      //   contentType: "application/json; charset=utf-8",
      //   dataType: "json",
      //   success: function (response) {
            
      //   }
      // });
    },

    //修改表格数据
		updateTableData: function () {
			let that = this;
			$(".l-data .edit").off().on("click", function () {
        alert('无接口');
        return;
        // addNoneFn(".l-organize, .l-data");
			  delNoneFn(".edit-pop");
				let leaderTableData = $(".l-data tbody").children(); 
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
		},

    /**
     * 分页
     */
    pageFunc: function () {

      var _this = this;
      setTimeout(function(){
          if (!_this.model.totalpage) {
              $("#page").hide();
              return;
          }
          $("#page").show();
          $("#page").createPage({
              pageCount: _this.model.totalpage, // 总页数
              firstpageBtn: 'true', // 是否显示页首页按钮
              current: 1,// 当前页
              lastpageBtn: 'true', // 是否显示尾页按钮
              pageCountBtn: 'true', // 是否显示总页数
              turndown: 'true',// 是否显示跳转框，显示为true，不现实为false,一定记得加上引号...
              totalBtn: 'false', // 是否显示总条数
              backFn: function (p) {
                  _this.initnotice(p);//获取行程列表信息
                  $('body,html').animate({ scrollTop: 0 }, 200);
              }
          });
      }, 2000);
     
    },

    //给表格数据添加选择方法
		forLeaderAddSelect: function () {
			$(".l-data table").off().on("click", ".ld-select", function () {
				// debugger
				//移除其他ld-select的子元素p的selected类名
				$(this).parent("tr").siblings().find("p").removeClass("checked");
				//选中的元素添加selected类名
				$(this).find("p").addClass("checked");
			})
    },

    	//删除表格的数据
		deleteTableData: function (tableArr) {
			$(".l-data .delete").off().on("click", function () {
				let leaderTableData = $(".l-data tbody").children(); //领导的表格数据
				let len = leaderTableData.length;
				if (len == 0) {
					alert("没有数据可以删除");
					return;
				}

				//遍历数据中已选择的数据
				let ishasDeleteData = false;
				let selectedData = "";
				for (let i = 0; i < len; i++) {
					let item = leaderTableData[i];
					if ($(item).find(".ld-select p").hasClass("checked")) {
						ishasDeleteData = true;
						selectedData = item;
					};
				}
				if (!ishasDeleteData) {
					alert("请选择要删除的数据");
					return;
				}

        let deleId = $(selectedData).find(".ld-select").attr("data-id");
        let params={
          informationId:deleId
        };

        apiPost("delInformation", params, function (data) {
              if(data.success){
                alert('删除数据成功')
                $(selectedData).remove();
              }else{
                alert('接口返回数据失败')
              }
        })

        
      //   $.ajax({
      //     type:"Post",
      //     url:"http://47.254.44.188:8088/delInformation",
      //     headers: {
      //       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUFAiLCJ1c2VyX2lkIjoiMSIsImlzcyI6IlNlcnZpY2UiLCJleHAiOjE1NzYxMzE4NDAsImlhdCI6MTU0NDU5NTg0MH0.goO7uO85rxsRa5coymsb_KKx94e-cGIEE4AFDT692mk"
      //     },
      //     data:{
            
      //     },
      //     success: function (response) {
           
      //   }
      // })

		
			})
		},

		


    /**
     * 点击事件
     */
    clickEvent:function(){
        var _this=this;
        $('.add').on('click',function(){
          $('.pop').removeClass('none');
        });

        $('.notice_cancel').on('click',function(){
            $('.pop').addClass('none');
        });

        $('#addPhotoBtn').change(function(e){
          var files = e.target.files || e.dataTransfer.files;
          //上传文件
          _this.uploadFiles(files);
        });

        $('.button .yes').on('click',function(){
          var title=$('.pop_title input').val();
          var name=$('.pop_name input').val();
          var content=$('.pop_content input').val();
          _this.addNotice(title,name,content);
        })

       

        _this.deleteTableData();
        _this.updateTableData();
        
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
        headers: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUFAiLCJ1c2VyX2lkIjoiMSIsImlzcyI6IlNlcnZpY2UiLCJleHAiOjE1NzYxMzE4NDAsImlhdCI6MTU0NDU5NTg0MH0.goO7uO85rxsRa5coymsb_KKx94e-cGIEE4AFDT692mk"
        },
        contentType: false, 
        processData: false,
        data:formData,
        dataType:"json",
          success: function (response) {
          if(response.success){
            _this.content=response.content;
             alert('上传成功')
          }else{
            alert('接口返回数据失败')
          }
      }
    })


      // $.ajax({
      //   type: "Post",
      //   url: "http://47.254.44.188:8088/upload",
      //   data:{
      //     file:files
      //   },
      //   success: function (response) {
      //       if(response.success){
      //           //
                
      //       }else{
      //           //
      //       }
      //   }
      // });
    },


    //控制显隐的方法
    controlFn: function() {}
  };

  notice.init();
}

module.exports = {
  init: initialize
};

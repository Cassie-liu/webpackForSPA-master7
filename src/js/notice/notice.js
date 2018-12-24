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
      totalCount:'',
      content:'',
      id:'',
      editId:'',
      popContentActionFrom:'add'
    },
    init: function() {
     var _this=this;

     _this.initnotice(1);
     _this.pageFunc(1);
      // setTimeout(function(){
        _this.clickEvent();
      // },1000)
      
    },
  
    
    /**
     * 初始化通知公告列表
     */
    initnotice:function(target){
      var _this=this;

      apiPost("queryInformation?pageNum="+target+"&pageSize=10", "", function (response) {
            if(response.success){
                var listHtml='';
                var contentList=response.content.content;
                var organizationName='';
                _this.model.totalpage=response.content.totalPages;
					      _this.model.totalCount=response.content.totalCount;
                if(!contentList.length){
                  showAlert('暂无数据')
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
                  _this.pageFunc(target);
                }

              
            }else{
              showAlert('接口返回数据失败')
            }
			})
       _this.forLeaderAddSelect();

    },

  

    /**
     * 新增通知公告
     */
    addNotice:function(title,name,content){
     var _this=this;
      var accessory=_this.content;
      var params={
          title:title,
          organizationType:1,
          content:content,
          accessory: accessory  //附件路径
      };


      apiPost("addInformation", params, function (data) {
            if(data.success){
                
                showAlert('请求成功')

            }else{
              showAlert('接口请求失败')
            }
            _this.initnotice(1);
            $('.pop').addClass('none');
            $('.pop .pop-content').addClass('none');
			})
    },

    

    //修改表格数据
		updateTableData: function () {
      let that = this;
      $(".l-data").on("click",".edit",function(event){
				that.model.popContentActionFrom = "edit";
				let leaderTableData = $(".l-data tbody").children(); //领导的表格数据
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
				$('#addtownname').val(selectName);
				//打开编辑弹窗
				delNoneFn(".edit-pop");
				//保存编辑人的id
				that.model.editId = $(selectedData).find(".ld-select").attr("data-id");
			})
			
		},

    /**
     * 分页
     */
    pageFunc:function(current){
      var  _this = this;
      if (!_this.model.totalpage) {
        $("#page").hide();
        return;
      }
      $("#page").show();
      $("#page").createPage({
        pageCountBtn:"true", // 是否显示总页数
        pageCount:_this.model.totalpage, // 总页数
        firstpageBtn:'true', // 是否显示页首页按钮
        prevpageText:'上一页',
        nextpageText:'下一页',
        lastpageBtn:'true', // 是否显示尾页按钮
        current:current,// 当前页
        turndown:'true',// 是否显示跳转框，显示为true，不现实为false,一定记得加上引号...
        totalCount:_this.model.totalCount, // 总条数
        totalBtn:'false', // 是否显示总条数
        backFn:function(p){
          _this.initnotice(p);
          $('body,html').animate({scrollTop:0},200);
        }
      });
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

        $('.pop.button .yes').on('click',function(){
          var title=$('.pop_title input').val();
          var name=$('.pop_name input').val();
          var content=$('.pop_content input').val();
          _this.addNotice(title,name,content);
        });

        //确认添加
			$('.edit-pop .yes').off().on('click', function () {
				addNoneFn(".pop");
				if (_this.model.popContentActionFrom == "add") {
					_this.addPeople();
				} else if (_this.model.popContentActionFrom == "edit") {
					_this.editNotice();
				}
			});

       

        _this.deleteTableData();
        _this.updateTableData();
        
    },

    //编辑人
		editNotice: function () {
			let that = this;
			let userName = $('#etitle').val();
			let organizationType = $('#ename option:selected').val();
			let content = $('#econtent option:selected').val();
			let param = {
				id: this.model.editId,
				title: userName,
				organizationType: organizationType,
        content: content,
        accessory:''
			}
			apiPost("updateInformation", param, function (data) {
				if (data.success) {
          addNoneFn('.edit-pop')
					that.initnotice(1);
				} else {
					showAlert("编辑失败，请重试")
				}
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


      
    },


    //控制显隐的方法
    controlFn: function() {}
  };

  notice.init();
}

module.exports = {
  init: initialize
};

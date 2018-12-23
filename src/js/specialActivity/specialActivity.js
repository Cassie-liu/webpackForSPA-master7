import {
    addNoneFn,
    apiPost,
    delNoneFn,
    showAlert,
    hideAlert
} from "../../util/util";

function initialize(params) {
    if (__DEV__) {
      console.log(params);
    }
  
    var organize = {
        model: {
            pageNum: 1,
            pageSize: 20,
            totalpage:0,
            currentPage:1,
            popContentActionFrom: "add", //打开内容弹窗的操作来源
            editId: "", //选择编辑的人员id
        },
      init: function() {
        //进入组织架构模块初始化数据
          this.switchLeadModule();
          this.loadCenterData();
          this.loadTownData();
          this.changeTownData();
          this.queryActivityData();
          this.pageFunc();
          this.clickEvents();
          hideAlert();
      },
      //切换组织架构和办公室
      switchLeadModule: function() {
       
      },
      //控制显隐的方法
      controlFn: function() {},
      //  加载分中心数据
      loadCenterData:function(){
          apiPost("queryCenter", "", function (data) {
              if (!data.success || !data.contents) {
                  showAlert("请求数据失败，请稍后重试");
                  return;
              }
              if (data && data.contents.length>0) {
                  var centerHtml = '';
                  centerHtml += `
                                <option value="">--请选择</option>
                                <option value="">所有</option>
                            `;
                  data.contents.forEach((item,$index)=>{
                      centerHtml += `<option value="${item.id}">${item.name}</option>`
                  })
              };
              $('#center').html(centerHtml);
          })
      },
        //加载实践所数据
        loadTownData:function(){
            apiPost("queryTown", "", function (data) {
                if (!data.success || !data.contents) {
                    showAlert("请求数据失败，请稍后重试");
                    return;
                }
                if (data && data.contents.length>0) {
                    var townHtml = '';
                    townHtml += `
                                <option value="">--请选择</option>
                                <option value="">所有</option>
                            `;
                    data.contents.forEach((item,$index)=>{
                        townHtml += `<option value="${item.id}">${item.name}</option>`
                    })
                };
                $('#town').html(townHtml);
            })
        },
        //改变实践所重新加载实践站数据
        changeTownData:function(){
          var self = this;
          $('#town').on('change',function(e){
              console.log(e.currentTarget.value);
              var townId = e.currentTarget.value;
              $('#country').html(`<option value="">--请选择--</option>`);
              self.loadCountryDataByTownId(townId)
          });
        },
        //加载实践站数据
        loadCountryDataByTownId:function(townId){
            apiPost("queryCountryByTownId?townId="+ townId,'', function (data) {
                if (!data.success || !data.contents) {
                    showAlert("请求数据失败，请稍后重试");
                    return;
                }
                if (data && data.contents.length>0) {
                    var countryHtml = '';
                    countryHtml += `
                                <option value="">--请选择</option>
                                <option value="">所有</option>
                            `;
                    data.contents.forEach((item,$index)=>{
                        countryHtml += `<option value="${item.id}">${item.name}</option>`
                    })
                };
                $('#country').html(countryHtml);
            })
        },
        // 查询特色活动数据
        queryActivityData :function(p) {
          var self = this;
            $('.btn-wrap .query').on('click',function(e){
                let params = {
                    pageNum: p || self.model.pageNum,
                    pageSize:self.model.pageSize,
                    centerId : document.getElementById('center').value,
                    townId : document.getElementById('town').value,
                    countryId : document.getElementById('country').value
                };
                if (!params.centerId && !params.townId && !params.countryId) {
                    showAlert('查询条件不能为空');
                    return ;
                } else {
                    self.loadSpecialActivityData(params);
                }
            });
        },
        // 加载特色活动数据
        loadSpecialActivityData:function(params){
            var self = this;
            let url = 'pageNum=' + params.pageNum + '&pageSize='+params.pageSize+'&centerId='+params.centerId + '&townId='+params.townId + '&countryId=' +params.countryId;
            apiPost("queryFeatureForFront?"+url, "", function (data) {
                if (!data.success) {
                    showAlert("请求数据失败，请稍后重试");
                    return;
                }
                var activiryContent = '';
                if (data && data.content && data.content.paginator){
                    let paginator = data.content.paginator;
                    self.model.totalpage = paginator.totalPage;
                    self.model.totalCount = paginator.totalCount;
                    self.model.currentPage = paginator.currentPage;
                }
                if (data && data.content && data.content.list.length>0) {
                    data.content.list.forEach((item,$index)=>{
                       activiryContent +=`<li data-id="${item.resultId}">
                                            <dl>
                                                <dt><img src='${item.pic[0]}'/></dt>
                                                <dd><p><span>${item.planName}</span></p></dd>
                                            </dl>
                                           </li>`;
                    })
                } else {
                    showAlert('暂无数据');
                }
                $('.activitydetail .activity-content .activity').html(activiryContent);
                self.pageFunc();
                self.loadActivityDetails();
            });
        },
        // 查看特色活动详情
        loadActivityDetails :function() {
            var self = this;
            $('.activity li').on('click', function(event){
                var id=event.currentTarget.dataset.id;
                self.showActivityModal(id);
                $('.pop-content').removeClass('none');
                $('.pop-content .special-activity').removeClass('none');
            });
        },
        // 显示特色活动模态框
        showActivityModal(resultId) {
            apiPost("querySingleFeature?resultId="+ resultId,'', function (data) {
                if (!data.success || !data.content) {
                    showAlert("请求数据失败，请稍后重试");
                    return;
                }
                if (data && data.content) {
                    var detailHtml = '';
                    console.log(data);
                    $('.item-wrap .left').html(`<img src="${data.content.resultPic[0]}" />`);
                    $('.item-wrap .right .header h4').html(data.content.planName);
                    $('.item-wrap .right .activity-time').html(`活动时间：${data.content.expireTime}`);
                    $('.item-wrap .right .activity-address').html(`活动时间：${data.content.practiceName}`);
                    $('.item-wrap .activity-contents').html(`<p>${data.content.resultContent}</p>`);
                    var videoHtml ="";
                    //  // resultVideo 为数组时
                    if (data.content && data.content.resultVideo &&  data.content.resultVideo instanceof Array){
                        if (data.content && data.content.resultVideo && data.content.resultVideo.length>0) {
                            data.content.resultVideo.forEach((item,index)=>{
                                videoHtml+=`<li>
                                                <video src="${item}" controls = "true"></video>
                                            </li>`;
                            })
                        }
                    } else {
                        // resultVideo 为字符串时
                        videoHtml+=`<li>${data.content.resultVideo}</li>`;
                    }
                    if (data.content && data.content.resultPic && data.content.resultPic.length>0) {
                        data.content.resultPic.forEach((item,index)=>{
                            videoHtml+=`<li>
                                            <img src="${item}"/>
                                        </li>`;
                        })
                    }
                    $('.activity-picture .pictures').html(videoHtml);
                }
            })
        },
        // 分页
        pageFunc: function () {
            var _this = this;
            if (!_this.model.totalpage && _this.model.totalpage<1) {
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
                turndown:'true',// 是否显示跳转框，显示为true，不现实为false,一定记得加上引号...
                current:_this.model.currentPage,// 当前页
                totalCount:_this.model.totalCount, // 总条数
                totalBtn:'false', // 是否显示总条数
                backFn: function (p) {
                    var params = {
                        pageNum: p,
                        pageSize: _this.model.pageSize,
                        centerId: document.getElementById('center').value,
                        townId: document.getElementById('town').value,
                        countryId: document.getElementById('country').value
                    };
                    if (!params.centerId && !params.townId && !params.countryId) {
                        showAlert('查询条件不能为空');
                        return ;
                    } else {
                        _this.loadSpecialActivityData(params);
                    }
                }
            });

        },
        // 点击事件
        clickEvents: function() {
            let self = this;
            $('.special-activity .notice_cancel').on('click',function(){
                $('.pop-content').addClass('none');
                $('.pop-content .special-activity').addClass('none');
            });
            $('.special-activity .yes').on('click',function(){
                $('.pop-content').addClass('none');
                $('.pop-content .special-activity').addClass('none');
            });
            $('.img-wrap area').on('click',function(e){
                $('.activity-contents').addClass('none');
                $('.activity-picture').addClass('none');
                if(e.currentTarget.className === 'left-image') {
                    self.changeImage(1)
                } else if(e.currentTarget.className === 'right-image'){
                    self.changeImage(0)
                }
            });
        },
        // 改变图片
        changeImage:function(flag) {
            var pictures = document.getElementById("pictures");
            if (flag) {
                pictures.setAttribute("src", "/src/img/icon/activity-content.png");
                $('.activity-contents').removeClass('none');
            } else {
                pictures.setAttribute("src", "/src/img/icon/activity-picture.png");
                $('.activity-picture').removeClass('none');
            }
        }
    };
    organize.init();
  }
  
  module.exports = {
    init: initialize
  };
  
function initialize(params) {
    if (__DEV__) {
      console.log(params);
    }
  
    var organize = {
      init: function() {
        //进入组织架构模块初始化数据
       
  
        this.switchLeadModule();
      },
      //切换组织架构和办公室
      switchLeadModule: function() {
       
      },
      //控制显隐的方法
      controlFn: function() {}
    };
  
    organize.init();
  }
  
  module.exports = {
    init: initialize
  };
  
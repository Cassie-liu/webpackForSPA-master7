//分页插件
/**
 * 2017-08-08
 * @author
 */
(function($){
	var ms = {
		init:function(obj,args){
			return (function(){
				ms.fillHtml(obj,args);
				ms.bindEvent(obj,args);
			})();
		},
		//填充html
		fillHtml:function(obj,args){
			return (function(){
				obj.empty();
				//上一页
				if(args.current > 1){
					obj.append(args.firstpageBtn == 'true'?'<a href="javascript:;" class="firstPage" data-value="1">首页</a><a href="javascript:;" class="prevPage">'+args.prevpageText+'</a>':'<a href="javascript:;" class="prevPage">'+args.prevpageText+'</a>');
				}else{
					obj.remove('.prevPage');
					obj.append(args.firstpageBtn == 'true'?'<span class="disabled">首页</span><span class="disabled">'+args.prevpageText+'</span>':'<span class="disabled">'+args.prevpageText+'</span>');
				}
				//中间页码
				if(args.current != 1 && args.current >= 4 && args.pageCount != 4){
					obj.append('<a href="javascript:;" class="tcdNumber">'+1+'</a>');
				}
				if(args.current-2 > 2 && args.current <= args.pageCount && args.pageCount > 5){
					obj.append('<span>...</span>');
				}
				var start = args.current -2,end = args.current+2;
				if((start > 1 && args.current < 4)||args.current == 1){
					end++;
				}
				if(args.current > args.pageCount-4 && args.current >= args.pageCount){
					start--;
				}
				for (;start <= end; start++) {
					if(start <= args.pageCount && start >= 1){
						if(start != args.current){
							obj.append('<a href="javascript:;" class="tcdNumber">'+ start +'</a>');
						}else{
							obj.append('<span class="current">'+ start +'</span>');
						}
					}
				}
				if(args.current + 2 < args.pageCount - 1 && args.current >= 1 && args.pageCount > 5){
					obj.append('<span>...</span>');
				}
				if(args.current != args.pageCount && args.current < args.pageCount -2  && args.pageCount != 4){
					obj.append('<a href="javascript:;" class="tcdNumber">'+args.pageCount+'</a>');
				}
				//下一页
				if(args.current < args.pageCount){
					obj.append(args.lastpageBtn == 'true'?'<a href="javascript:;" class="nextPage">'+args.nextpageText+'</a><a href="javascript:;" class="lastPage" data-value="'+args.pageCount+'">尾页</a>':'<a href="javascript:;" class="nextPage">'+args.nextpageText+'</a>');
				}else{
					obj.remove('.nextPage');
					obj.append(args.lastpageBtn == 'true'?'<span class="disabled noclick">'+args.nextpageText+'</span><span class="disabled">尾页</span>':'<span class="disabled noclick">'+args.nextpageText+'</span>');
				}
				if(args.pageCountBtn == 'true') {
					obj.append('<span class="pagecount">共' + args.pageCount + '页</span>');
				}
				//跳转页码
				if(args.turndown == 'true'){
					obj.append('<span class="countYe">到第<input type="text" maxlength='+args.pageCount.toString().length+'>页<a href="javascript:;" class="turndown">确定</a><span>');
				}
				if(args.totalBtn == 'true') {
					obj.append('<span class="totalCount">共'+args.totalCount+'条</span>');
				}
			})();
		},
		//绑定事件
		bindEvent:function(obj,args){
			return (function(){
				var options = {"pageCount":args.pageCount,"totalCount":args.totalCount,"pageCountBtn":args.pageCountBtn,"turndown":args.turndown,"totalBtn":args.totalBtn,"firstpageBtn":args.firstpageBtn,"lastpageBtn":args.lastpageBtn,"prevpageText":args.prevpageText,"nextpageText":args.nextpageText};
				obj.off("click","a.tcdNumber").on("click","a.tcdNumber",function(){
					var current = parseInt($(this).text());
					options.current = current;
					ms.fillHtml(obj,options);
					if(typeof(args.backFn)=="function"){
						args.backFn(current);
					}
				});
				//首页和尾页
				obj.off("click","a.firstPage,a.lastPage").on("click","a.firstPage,a.lastPage",function(){
					var current = parseInt($(this).attr("data-value"));
					options.current = current;
					ms.fillHtml(obj,options);
					if(typeof(args.backFn)=="function"){
						args.backFn(current);
					}
				});
				//上一页
				obj.off("click","a.prevPage").on("click","a.prevPage",function(){
					var current = parseInt(obj.children("span.current").text());
					options.current = current-1;
					ms.fillHtml(obj,options);
					if(typeof(args.backFn)=="function"){
						args.backFn(current-1);
					}
				});
				//下一页
				obj.off("click","a.nextPage").on("click","a.nextPage",function(){
					var current = parseInt(obj.children("span.current").text());
					options.current = current+1;
					ms.fillHtml(obj,options);
					if(typeof(args.backFn)=="function"){
						args.backFn(current+1);
					}
				});
				//跳转
				obj.off("click","a.turndown").on("click","a.turndown",function(){
					var page = parseInt($("span.countYe input").val());
					if(page>args.pageCount || !page){
						return;
					}
					options.current = page;
					ms.fillHtml(obj,options);
					if(typeof(args.backFn)=="function"){
						args.backFn(page);
					}
				});
			})();
		}
	}
	$.fn.createPage = function(options){
		var args = $.extend({
			pageCountBtn:true, // 是否显示总页数
			pageCount : 8, // 总页数
			current : 1, // 当前页
			firstpageBtn:true, // 是否显示页首页按钮
			prevpageText:'<上一页', // 上一页文本
			nextpageText:'下一页>', // 下一页文本
			lastpageBtn:true, // 是否显示尾页按钮
			turndown:true,  // 是否显示页码查询
			totalBtn:true, // 是否显示总条数
			totalCount:10,  // 总条数
			backFn : function(){}
		},options);
		ms.init(this,args);
	}
})(jQuery);
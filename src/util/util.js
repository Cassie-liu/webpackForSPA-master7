/** 
 * @param url 请求链接
 * @param param 请求参数
 * @param callBack 回调
 */
function apiPost(url, param, callBack) {
	let requestUrl = "http://47.254.44.188:8088/";
	let para = JSON.stringify(param);
	console.log('$.cookie',$.cookie('token'))
	$.ajax({
		type: "POST",
		headers: {
			token: $.cookie('token')
		},
		url: requestUrl + url,
		data: para,
		dataType: "json",
		contentType: 'application/json',
		success: function (data) {
			if (data) {
				callBack && callBack(data);
			} else {
				alert("请求失败，请稍后重试~")
			}
		}
	})
}

//添加隐藏方法
function addNoneFn(selectors) {
	$(selectors).addClass("none");
}

//删除隐藏方法
function delNoneFn(selectors) {
	$(selectors).removeClass("none");
}

//人员验证
function peopleValidate(params) {
	if (!params.userName) {
		showAlert("请填写名称!");
		return false;
	}

	if (!params.gender) {
		showAlert("请选择性别!");
		return false;
	}

	if (!params.position) {
		showAlert("请选择职位!");
		return false;
	}

	return true;
}

//验证方法
function validate(params, needCenterId) {
	if (!params.name) {
		showAlert("请填写名称!");
		return false;
	}

	if (!params.lon) {
		showAlert("请填写经度!");
		return false;
	}

	if (!params.lat) {
		showAlert("请填写纬度!");
		return false;
	}

	if (needCenterId) {
		if (!params.centerId) {
			showAlert("请填写分中心Id!");
			return false;
		}
	}

	return true;
}

function showAlert(text) {
	delNoneFn(".alert");
	$(".alert-text").html(text);
}

function hideAlert() {
	$(".alert-close").on("click", function (e) {
		e.stopPropagation();
		addNoneFn(".alert");
	})
}



export {
	apiPost as apiPost,
	addNoneFn as addNoneFn,
	delNoneFn as delNoneFn,
	validate as validate,
	peopleValidate as peopleValidate,
	showAlert as showAlert,
	hideAlert as hideAlert
}
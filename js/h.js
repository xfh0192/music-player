var $h = {};

$h.localDebug = function(){
	return false;
};

$h.home = function(){
	var host = window.location.host;
	var protocol = window.location.protocol;
	var returnUrl = protocol + "//" + host;
	/*if(window.location.href.indexOf(returnUrl + "/" + $h.ngAppName) < 0){
		returnUrl = returnUrl + "/" + $h.ngAppName;
	}*/
	if(window.location.href.indexOf("git") >= 0){
		returnUrl = returnUrl + "/" + $h.ngAppName;
	}
	return returnUrl;
}



$h.extendRootScope = function($rootScope){

	$rootScope.listen = function(broadcast, fn){
		this.$on("here-is-a-message", function(event, data){
			console.log("get a message: " + data.broadcast);
			if(broadcast == data.broadcast){
				fn(event, data.data);
			}
		})
	}
	$rootScope.report = function(broadcast, data){
		this.$emit("here-is-a-report", {broadcast: broadcast, data: data});
	}
	$rootScope.$on("here-is-a-report", function(event, data){
		console.log("get a report: " + data.broadcast);
		$rootScope.$broadcast("here-is-a-message", data);
	})

	$rootScope.home = function(){
		return $h.home();
	}
}

/*转自【B5教程网】:http://www.bcty365.com/content-74-1347-1.html*/
/*http://blog.csdn.net/qq_34986769/article/details/52161785*/
Date.prototype.format = function(fmt) { 
	var fmt = fmt || "yyyy-MM-dd hh:mm:ss";
	var o = { 
		"M+" : this.getMonth()+1,				 //月份 
		"d+" : this.getDate(),					//日 
		"h+" : this.getHours(),					//小时 
		"m+" : this.getMinutes(),				 //分 
		"s+" : this.getSeconds(),				 //秒 
		"q+" : Math.floor((this.getMonth()+3)/3), //季度 
		"S"  : this.getMilliseconds()			 //毫秒 
	}; 
	if(/(y+)/.test(fmt)) {
			fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	}
	for(var k in o) {
		if(new RegExp("("+ k +")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt; 
}


/** fix ie6-8 array.prototype缺失的forEac/map/filter等高级语法
 * 来自：http://www.zhangxinxu.com/study/201304/es5-array.js
 */
Array.prototype.forEach = Array.prototype.forEach || function (fn, thisObj) {
	for (var k = 0, length = this.length; k < length; k++) {
		fn.call(thisObj, this[k], k, this);
	}
};
Array.prototype.map = Array.prototype.map || function (fn, thisObj) {
	var arr = [];
	for (var k = 0, length = this.length; k < length; k++) {
		arr.push(fn.call(thisObj, this[k], k, this));
	}
	return arr;
};

Array.prototype.filter = Array.prototype.filter || function (fn, thisObj) {
	var arr = [];
	for (var k = 0, length = this.length; k < length; k++) {
		fn.call(thisObj, this[k], k, this) && arr.push(this[k]);
	}
	return arr;
};

Array.prototype.some = Array.prototype.some || function (fn, thisObj) {
	for (var k = 0, length = this.length; k < length; k++) {
		if(fn.call(thisObj, this[k], k, this)){
			return true;
		}
	}
	return false;
};

Array.prototype.every = Array.prototype.every || function (fn, thisObj) {
	for (var k = 0, length = this.length; k < length; k++) {
		if(!fn.call(thisObj, this[k], k, this)){
			return false;
		}
	}
	return true;
};

Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement, fromIndex) {
	fromIndex = fromIndex * 1 || 0;
	for (var k = fromIndex, length = this.length; k < length; k++) {
		if (this[k] === searchElement) {
			return k;
		}
	}
	return -1;
};

Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function (searchElement, fromIndex) {
	fromIndex = fromIndex * 1 || this.length - 1;
	for (var k = fromIndex; k > -1; k--) {
		if (this[k] === searchElement) {
			return k;
		}
	}
	return -1;
};

Array.prototype.reduce = Array.prototype.reduce || function (fn, initialValue ) {
	var previous = initialValue, startIndex = 0;
	if (typeof initialValue === "undefined") {
		previous = this[0];
		startIndex = 1;
	}
	
	for (var k = startIndex; k < this.length; k++) {
		previous = fn(previous, this[k], k, this);
	}
	return previous;
};

Array.prototype.reduceRight = Array.prototype.reduceRight || function (fn, initialValue ) {
	var previous = initialValue, startIndex = this.length - 1;
	if (typeof initialValue === "undefined") {
		previous = this[startIndex];
		startIndex--;
	}
	
	for (var k = startIndex; k >= 0; k--) {
		previous = fn(previous, this[k], k, this);
	}
	return previous;
};


angular.module($h.ngAppName)

/* 处理audio中的source，ng-src */
.filter("trustUrl", ["$sce", function($sce){
	return function(trustUrl){
		if(trustUrl){
			return $sce.trustAsResourceUrl(trustUrl);
		}
	}
}])

/* 处理时间格式，将纯秒数转为mm:ss */
.filter("timeCountFormat", function(){
	return function(timeCount){
		if(timeCount >= 0){
			var min = Math.floor(timeCount / 60);
			var second = Math.round(timeCount % 60);
			return pad(min) + ":" + pad(second);
		}
		return "00:00";
	}

	function pad(t){
		if(t || t === 0){
			return t >= 10 ? t : "0" + t;
		}
	}
})

/* 播放器 */
.directive("player", ["$q", "PlayerService", "$timeout", "$injector", function($q, PlayerService, $timeout, $injector){
	return {
		restrict: "E",
		replace: true,
		scope: {
			volume: "="
		},
		templateUrl: $h.home() + "/tpl/component/player.html",
		link: function(scope, ele, attrs){

			var audioEle = ele.find("audio")[0];
			var service = PlayerService;
			var audio = PlayerService.setAudio(audioEle, scope);
			//var songList = scope.songList || [];
			var progressBar = document.querySelector("p.progress-bar");		////进度条部分
			var playingBar = document.querySelector("p.progress-bar b.playing-bar");	//播放进度条
			var bufferedBar = document.querySelector("p.progress-bar b.buffered-bar");	//缓冲进度条
			var timer = null;	//进度条改变的定时器存储变量
			var rootScope = $injector.get("$rootScope");
			var uiFunction = $injector.get("uiFunction");
			var _loading;

			//调整音量
			scope.$watch("volume", function(newValue){
				//console.log(newValue)
				audio.adjustVolume(newValue);
			})
			/*//ios上貌似要触发一次play才会有canplay事件
			setTimeout(function(){
				audio._load();
			}, 0);*/

			//进来先获取默认歌曲
			service.getPlayingSong()
			.then(function(playingSong){
				scope.playingSong = playingSong;
				setTimeout(function(){			//在手机端上，必须触发load才会有canplay了（坑
					audio._load();				//而且必须setTimeout改变顺序，感觉load事件会很早触发
				}, 0)
				
			})
			//用于一开始的时候默认歌曲和点击歌曲相同无法触发canplay事件，监听歌曲列表点击的
			scope.$root.listen("start-play", function(){
				
				$q.when()
				.then(function(){
					service.setDefaultPlaying(true);	//关闭默认的阻止变量
					scope.pause();
					return service.getPlayingSong();
				})
				.then(function(playingSong){
					scope.playingSong = playingSong;
					
					setTimeout(function(){
						audio._load();
					}, 0)
				})
				//播放就交给下面的监听canplay执行
				/*.then(function(){
					scope.play();
				})*/
			})
			//
			scope.$root.listen("now-playing", function(){
				scope.play();
			})

			//假如要等待加载就加loading
			/*audio.addEventListener("loadedmetadata", function(){
				_loading = uiFunction.loading();	//加loading
			})*/
			//监听播放器页面中的切歌事件
			//监听是否可用，成功加载就设定歌曲长度和开始播放
			//audio需要监听canplay这个事件，才可以获取到音频长度
			audio.addEventListener("canplay", function(){
				scope.length = Math.round(audio.duration) || 0;
				scope.currentTime = audio.currentTime || 0;
				if(_loading){
					_loading();
					_loading = null;
				}
				//上面的钩子函数，_loading一直是undefined触发不了，强行清除loading。。。。
				//主要是因为这个是匿名函数，this指针
				var loading = document.querySelector("#loading");
				if(loading){
					loading.parentNode.removeChild(loading);
				}
				//if(!scope.$playing){
					//rootScope.defaultPlaying && scope.play();	//这里是调用play的一个例外，必须依赖canplay事件了，不属于用户触发的
					service.getDefaultPlaying() && scope.play();
				//}
				service.getPlayingSong()	//假如在歌单中点击，就要这里先拿一次播放歌曲了，索性所有操作都拿一次
				.then(function(data){
					scope.$root.report("song-has-loaded", scope.playingSong);
				}, function(reason){
					console.log(reason)
				})
				["finally"](function(){
					//scope.$apply();		//监听事件包装在原生eventlistener中，需要强制触发$degist
				})
			})

			//当一首歌播放结束，自动切换到下一首
			audio.addEventListener("ended", function(){
				console.log("ended");
				service.setIsEnd(true);
				scope.changeSong({}, "next");
				scope.$apply();
			})

			//播放，封装为promise
			scope.play = function($event){
				$q.when()
				.then(function(){
					service.setDefaultPlaying(true);
					_stopProgressBarChanging();		//暂停之后，拖动进度条再播放的话，需要先清除计时器再重新设置
				})
				.then(function(){
					scope.$playing = true;
					return audio._play();
				})
				.then(function(){
					return _setPlayingTime();
				})
				.then(function(){
					//alert("play!");
				}, function(){
					alert("error");
				})
			}
			//暂停
			scope.pause = function($event){
				$q.when()
				.then(function(){
					_stopProgressBarChanging();
				})
				.then(function(){
					scope.$playing = false;
					return audio._pause();
				})
				.then(function(){
					//alert("pause");
				}, function(){
					alert("error");
				})
			}
			
			//切歌，上/下一首
			scope.changeSong = function($event, target){
				_loading = uiFunction.loading();	//加loading
				$q.when()
				.then(function(){
					rootScope.defaultPlaying = true;
					scope.pause();
				})
				.then(function(){
					service.changeSong(target);	//改变$tabIndex
					return service.getPlayingSong();
				})
				.then(function(newSong){
					scope.playingSong = newSong;
					setTimeout(function(){
						audio._load();	//切歌需要先load一下
					}, 0)
					
					console.log("change-song-success!");
				}, function(reason){
					console.log("fail");
				})
			}

			//显示缓冲的进度条
			$timeout(function() {
				if(audio && audio.buffered && audio.buffered.length){
					var bufferedTime = audio.buffered.end(audio.buffered.length - 1);
					bufferedBar.style.cssText = "width: " + progressBar.clientWidth*bufferedTime/scope.length + "px;";
				}
				if(bufferedTime < scope.length){
					var _self = arguments.callee;
					$timeout(_self, 1000);
				}
			}, 0);

			
			//设定当前播放的时间秒数
			function _setPlayingTime(){
				//没有播放就不执行了
				if(!scope.$playing){
					return;
				}
				_stopProgressBarChanging();
				
				return ($timeout(function(){
					scope.currentTime = Math.round(audio.currentTime);
					if(scope.$playing){
						var selfFn = arguments.callee;
						timer = $timeout(selfFn, 1000);		//调用自己，刷新已播放时间。同时在这里赋值timer，确保每次清除都能清除到同一个的timer
						_setProgressBar();		//顺便更新进度条
					}
				}, 0));
			}
			
			/* 根据播放进度（时间）设定进度条长度 */
			function _setProgressBar(skipTo){
				var currentTime = skipTo || scope.currentTime;
				playingBar.style.cssText = "width:" + progressBar.clientWidth*currentTime/scope.length + "px";
				//假如解除了关联，重新关联上
				/*if(!timer){
					_setPlayingTime();
				}*/
			}
			/* 清除计时器，解除播放时间和进度条变化的关联 */
			function _stopProgressBarChanging(){
				if(timer){
					$timeout.cancel(timer);
				}
			}
			

			/* 监听部分，当摁住b标签拖动再松开时，改变播放进度 */
			var playingMark = document.querySelector("p.progress-bar b i");
			var _touchStart = progressBar.addEventListener("touchstart", _touchStartHandler);	//touchstart
			function _touchStartHandler($event){	//点击时的监听代理函数
				//var srcElement = $event.srcElement;
				//console.log(srcElement);
				/*if(srcElement.nodeName != "I"){
					return;
				}*/
				$event.preventDefault();
				//需要拖动时，先分离进度条和播放时间的关联
				_stopProgressBarChanging();

				var length = scope.length;
				var offsetPosition = progressBar.getBoundingClientRect();	//进度条四边距离窗口的距离
				var touch = event.targetTouches && event.targetTouches[0] || $event;

				window.addEventListener("touchmove", _touchMoveHandler);	//touchmove点击之后才添加的移动监听代理
				window.addEventListener("touchend", _touchUpHandler);		//touchend

				function _touchMoveHandler(e){
					e.preventDefault();
					/*if(e.srcElement.nodeName != "I"){	//参考网易云的做法，抓取icon才可以拖动改变进度
						return;
					}*/
					var touch = e.targetTouches && e.targetTouches[0] || e;		//触摸事件的属性
					
					if(touch.clientX < offsetPosition.left){
						playingBar.style.cssText = "width: 0px;";
						return;
					}
					if(touch.clientX > offsetPosition.right){
						playingBar.style.cssText = "width: " + progressBar.clientWidth + "px;";
						return;
					}
					playingBar.style.cssText = "width: " + (touch.clientX - offsetPosition.left) + "px;";
					return;
				}

				function _touchUpHandler(e){
					e.preventDefault();
					window.removeEventListener("touchmove", _touchMoveHandler);
					window.removeEventListener("touchend", _touchUpHandler);

					var touch = e.changedTouches && e.changedTouches[0] || e;
					//在控制范围内才可以设置
					if(playingBar.style.width && touch.clientX > offsetPosition.left && touch.clientX < offsetPosition.right){
						playingBar.style.cssText = "width: " + (touch.clientX - offsetPosition.left) + "px;";
						//playingBar.style.width = (touch.clientX - offsetPosition.left) + "px";	//如果通过style.width的方法修改，字符串最后不要带分号！坑了一脸！
						//计算进度条长度比例，设定播放时间
						var hasPlay = parseInt(playingBar.style.width) || 0;
						var skipTo = hasPlay / progressBar.clientWidth * scope.length;
						audio.currentTime = skipTo;		//设置播放时间正确显示
						playingMark.style.cssText = null;		//清除事件中添加的样式，i标签会根据默认样式自动吸附至进度条末端
					}
					_setProgressBar(skipTo);	//调整进度条
					_setPlayingTime();
				}
			}
		}
	}
}])
/* 将播放器方法封装为promise，调用同时可以触发自定义事件/发送广播 */
.factory("PlayerService", ["$q", function($q){
	return {
		setList: _setList,					//设定播放列表
		getList: _getList,					//获取播放列表
		addToList: _addToList,				//加一首歌到列表最后
		removeFromList: _removeFromList,	//从列表移除一首歌
		setPlayingSong: _setPlayingSong,	//设定播放歌曲
		getPlayingSong: _getPlayingSong,	//获取播放歌曲，默认为第一首
		changeSong: _changeSong,			//切歌之后获取新歌曲
		setDefaultPlaying: _setDefaultPlaying,	//播放器页一开始就加载了，canplay就会自动播放。因此增加设定是否默认播放的参数，控制是否可用默认播放
		getDefaultPlaying: _getDefaultPlaying,	//
		setIsEnd: _setIsEnd,				//针对判断歌曲是自动播放完的，还是在列表选择了其他歌曲切掉的变量。判断是否该弹出播放器
		getIsEnd: _getIsEnd,
		setAudio: _setAudio					//包装audio中的原生方法为promise并返回audio
		
	}

	//开始重构，将播放列表等一系列参数整合进service统一管理
	//将播放列表缓存进service里，不论切歌还是调取index都在这里弄
	var collectionList = [];
	var playingIndex;
	var defaultPlayingSwitch = false;
	var isEnd = false;		//针对播放器
	function _setList(songList){
		collectionList = songList || [];	//存到全局变量里
		return _promisePacking(function(){		//调用promise包装函数，返回promise.（这里还没想好怎么给作为参数的匿名函数传递参数
			_setPlayingSong();
			return collectionList;
		})
		/*var deferred = $q.defer();
		try{
			collectionList = songList || [];
			_getPlayingSong();
			deferred.resolve(collectionList);
		}
		catch(e){
			deferred.reject("load-collectionList-fail");
			console.log(e);
		}
		return deferred.promise;*/
	}

	function _getList(){
		return _promisePacking(function(){
			return collectionList;
		})
	}

	function _addToList(item){
		collectionList.push(item);
		return _promisePacking(function(){
			collectionList.$playingIndex = collectionList.length - 1 || 0;
		})
	}

	function _removeFromList(index){
		
		if(index > collectionList.$playingIndex){
			collectionList.splice(index, 1);
		}
		if(index <= collectionList.$playingIndex){
			collectionList.splice(index, 1);
			collectionList.$playingIndex--;
			collectionList.$playingIndex < 0 && (collectionList.$playingIndex = 0);
		}
		
		return _promisePacking(function(){
			return collectionList || [];
		})
	}

	function _setPlayingSong(index){
		playingIndex = index || 0;
		return _promisePacking(function(){
			collectionList.$playingIndex = playingIndex;
			return collectionList[collectionList.$playingIndex];
		})
	}

	function _getPlayingSong(){
		return _promisePacking(function(){		//调用promise包装函数，返回promise
			return collectionList[collectionList.$playingIndex];
		})
		/*var deferred = $q.defer();
		try{
			var playingIndex = index || 0;
			collectionList.$playingIndex = playingIndex;
			deferred.resolve(collectionList[collectionList.$playingIndex]); 
		}
		catch(e){
			deferred.reject("get-playing-song-fail");
			console.log(e);
		}
		return deferred.promise;*/
	}

	/* 设置songList的index,目前只支持顺序切换 */
	function _changeSong(target){
		var list = collectionList;
		var index = collectionList.$playingIndex || 0;
		var target = target || "next";
		if(target == "next"){
			index = index + 1;	//新的index
			index = index + 1 <= collectionList.length ? index : index - collectionList.length;	//超过length，index回到0
		}
		if(target == "previous"){
			index = index - 1;
			index = index >= 0 ? index : index + collectionList.length;
		}
		collectionList.$playingIndex = index;
	}

	function _setDefaultPlaying(boolen){
		defaultPlayingSwitch = boolen || false;
	}
	function _getDefaultPlaying(){
		return defaultPlayingSwitch;
	}

	function _setIsEnd(boolen){
		isEnd = boolen || false;
		//console.log(isEnd);
	}
	function _getIsEnd(){
		return isEnd;
	}


	function _promisePacking(fn){
		var deferred = $q.defer();
		try{
			var resolveData = fn();
			deferred.resolve(resolveData);
		}
		catch(e){
			deferred.reject("load-collectionList-fail");
			console.log(e);
		}
		return deferred.promise;
	}


	function _setAudio(audioEle, scope){
		//var audioEle = audioEle || {};
		var _this = audioEle;

		var deferred = $q.defer();
		/* 载入音乐 */
		/* 这里ios上的浏览器有个巨坑，canplay事件是触发不了的，需要调一次load（）才会触发 */
		_this._load = function(){
			$q.when()
			.then(function(){
				try{
					_this.load();
				}
				catch(e){
					return $q.reject("load-fail");
				}
			})
			.then(function(){
				return deferred.resolve()
			}, function(reason){
				return deferred.reject(reason);
			})
			return deferred.promise;
		}
		/* 播放音乐 */
		_this._play = function(){
			$q.when()
			.then(function(){
				//scope.$root.report("aaa")
				_this.play();
			})
			.then(function(){
				return deferred.resolve()
			}, function(reason){
				return deferred.reject(reason);
			})
			return deferred.promise;
		}

		_this._pause = function(){
			$q.when()
			.then(function(){
				_this.pause();
			})
			.then(function(){
				return deferred.resolve();
			}, function(){
				return deferred.reject();
			})
		}

		_this.adjustVolume = function(volume){
			$q.when()
			.then(function(){
				_this.volume = volume;
			})
			.then(function(){
				return deferred.resolve();
			}, function(){
				return deferred.reject();
			})
		}

		return audioEle;
	}

}])

/* 控制音量的水平拖拉条，作为一个指令，这种设置性的组件可以复用 */
.directive("volumeCtrl", ["$q", function($q){
	return {
		restrict: "EA",
		replace: true,
		scope: {
			volume : "="
		},
		template: "<div id='volume-ctrl'>"
				+ "		<i class='iconfont icon-yinliang'></i>"
				+ "		<p>"
				+ "			<b>"
				+ "				<i class='iconfont icon-icon2'></i>"
				+ "			</b>"
				+ "		</p>"
				+ "		<span>"
				+ "			{{(volume*100 | number: 0) + '%'}}"
				+ "		</span>"
				+ "</div>",
		link: function(scope, ele, attrs){
			var ctrlEle = document.querySelector("#volume-ctrl");
			var fullBar = ele.find("p")[0];
			var bElement = ele.find("b")[0];
			var ctrlMark = ele.find("i")[0];
			scope.volume = 0.5;	//默认音量
			setTimeout(function(){
				bElement.style.width = fullBar.clientWidth/2 + "px";
			}, 0)
			

			ctrlEle.addEventListener("touchstart", _mousedownHandler);	//touchstart
			function _mousedownHandler($event){
				$event.preventDefault();
				/*var srcElement = $event.srcElement;
				if(srcElement.nodeName != "I"){
					return;
				}*/
				var offsetPosition = fullBar.getBoundingClientRect();	//音量条四边距离窗口的距离

				var _move = window.addEventListener("touchmove", _touchMoveHandler);	//touchmove.点击之后才添加的移动监听代理
				var _mouseUp = window.addEventListener("touchend", _touchUpHandler);	//touchend

				function _touchMoveHandler(e){
					//e.preventDefault();
					var touch = e.targetTouches && e.targetTouches[0] || e;		//触摸事件的属性

					if(touch.clientX < offsetPosition.left){
						bElement.style.cssText = "width: 0;";
						_setVolume(bElement.style.width);
						return;
					}
					if(touch.clientX > offsetPosition.right){
						bElement.style.cssText = "width: " + fullBar.clientWidth + "px;";
						_setVolume(bElement.style.width);
						return;
					}
					bElement.style.cssText = "width: " + (touch.clientX - offsetPosition.left) + "px;";
					_setVolume(bElement.style.width);
				}

				function _touchUpHandler(e){
					//e.preventDefault();
					window.removeEventListener("touchmove", _touchMoveHandler);
					window.removeEventListener("touchend", _touchUpHandler);
					var touch = e.changedTouches && e.changedTouches[0] || e;		//触摸事件的属性
					//在控制范围内才可以设置
					if(bElement.style.width && touch.clientX < offsetPosition.right && touch.clientX > offsetPosition.left){
						bElement.style.cssText = "width: " + (touch.clientX - offsetPosition.left) + "px;";
						_setVolume(bElement.style.width);
					}
				}

				//设置音量
				function _setVolume(volumeWidth){
					var volume = (parseInt(volumeWidth) / fullBar.clientWidth) || 0;
					scope.volume = volume;
					scope.$apply();
				}
			}
		}
	}
}])

/* 播放器中的碟子的canvas，适配有点麻烦，先用老方法 */
.directive("disc", ["$q", function($q){
	return {
		restrict: "E",
		replace: true,
		scope: {
			discImage: "@"
		},
		//template: "<canvas class='disc'></canvas>",
		template: "<div class='disc'>"
				+ "		<div>"
				+ "			<img ng-src='{{discImage}}'/>"
				+ "			<span></span>"
				+ "		</div>"
				+ "</div>",
		link: function(scope, ele, attrs){
			/*var canvas = ele[0];
			var context = canvas.getContext("2d");	//context是一个封装了很多绘图功能的对象
			context.beginPath();
			context.arc(100, 100, 100, 0, Math.PI*2, true);
			context.closePath();
			context.fillStyle = "#ff6600";
			context.fill();*/
		}
	}
}])


/*
 	下面部分为常用ui库，以函数方式编写，即调即用
 */
.factory("uiFunction", ["$q", "$rootScope", "$compile", "$templateRequest", "$timeout", 
function($q, $rootScope, $compile, $templateRequest, $timeout){
	return {
		//toast: _toast,
		loading: _loading
	}

	//toast,出现一个短暂性透明div提示信息
	/*function _toast(){
		setTimeout(function(){
			loadingElement.style.opacity = 0;
			setTimeout(function(){
				document.body.removeChild(loadingElement);
				deferred.resolve();
			}, 500);
		}, 0);
	}*/

	//loading中
	function _loading(text, icon){
		if(document.getElementById("loading")){
			return;
		}
		var deferred = $q.defer();
		var text = text || "loading";
		var icon = icon || "fa-refresh";
		var innerHTML = "<p>"
						+ "		<i class='fa fa-spin " + icon + "'></i>"
						+ "		<b>" + text + "</b>"
						+ "</p>";

		var loadingElement = document.createElement("div");
		loadingElement.id = "loading";
		loadingElement.innerHTML = innerHTML;

		document.body.appendChild(loadingElement);

		return function(){
			document.body.removeChild(loadingElement);
		}
		
	}
	
}])

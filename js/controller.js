angular.module($h.ngAppName)

.controller("indexCtrl", ["$scope", "$q", "$injector", function($scope, $q, $injector){
	var stateName = $scope.$state.current.name || "";
	var tabMenu = [
						{index: 1, sref: "index.main"},
						{index: 2, sref: "index.collection"},
						{index: 3, sref: "index.account"}
					]

	//改变tab菜单
	$scope.changeTab = function(targetState){
		var targetState = _findState(targetState);
		$scope.stateName = targetState;
		$scope.$state.go(targetState);
	}
	$scope.changeTab();

	function _findState(targetState){
		var targetState = targetState || stateName;
		var result = "";
		tabMenu.some(function(item){
			if(item.sref == targetState){
				result = item.sref;
				return true;
			}
		})
		return result;
	}


	//打开player
	$scope.openPlayer = function($event){
		$event.preventDefault();
		var rootScope = $injector.get("$rootScope");
		rootScope.playerActived = true;
	}

	//切换路由，就马上隐藏播放器页
	//并且解决后退的时候，tab显示没有切换的问题
	var rootScope = $injector.get("$rootScope");
	$scope.$on("$viewContentLoaded", function(event, toState, toParams, fromState, fromParams){
		rootScope.playerActived = false;
		$scope.stateName = _findState($scope.$state.current.name);
		//console.log($scope.$state.current.name);
	})

	

}])
.controller("mainCtrl", ["$scope", "$q", "$injector", function($scope, $q, $injector){
	$scope.stateName = $scope.$state.current.name || "";
}])

.controller("collectionCtrl", ["$scope", "$q", "$injector", "$timeout", function($scope, $q, $injector, $timeout){
	$scope.stateName = $scope.$state.current.name || "";
	var rootScope = $injector.get("$rootScope");
	var service = $injector.get("PlayerService");
	var defaultPlayingSwitch = service.getDefaultPlaying() || false;

	service.getList()
	.then(function(data){
		$scope.list = data;
		return service.getPlayingSong();
	})
	.then(function(playingSong){
		$scope.playingSong = playingSong;
	}, function(){
		console.log("get-list-fail");
	})


	$scope.play = function(item, index){	//index为歌单中的index
		var index = index || 0;
		var playingSong = {};
		//service.getPlayingSong()	//promise先获取在播放的歌
		$q.when()
		.then(function(){
			playingSong = $scope.playingSong;
			if(item && item == playingSong){	//如果点击的歌是正在播放的，直接打开播放器而不是重新播放
				rootScope.playerActived = true;
				$scope.report("now-playing");
				return $q.reject("now-playing");
			}
		})
		.then(function(){
			//假如点击的是新歌，就切歌
			return service.setPlayingSong(index)
		})
		.then(function(data){
			//$scope.list.$playingIndex = index;
			$scope.playingSong = data;
			console.log(data);
			$scope.report("start-play");								//强制触发播放，不然一开始默认的歌再点就播放不了了
		}, function(reason){
			console.log(reason);
		})
		/*["finally"](function(){
			defaultPlayingSwitch = service.setDefaultPlaying(true);		//关闭默认的阻止变量，统一改为在指令中触发
		})*/
		
	}

	//唤出播放器。使用接收广播的方式是为了等待播放器中的封面等信息换好再打开播放器，以免造成信息闪切
	$scope.listen("discImage-has-loaded", function(){
		var isEnd = service.getIsEnd();
		if(service.getDefaultPlaying() && !isEnd){
			rootScope.playerActived = true;
			service.setIsEnd(false);
		}
	})

	$scope.remove = function(index){
		var index = index || 0;
		service.removeFromList(index)
		.then(function(data){
			$scope.list = data;
		}, function(reason){
			console.log(reason);
		})
	}

}])


.controller("playerCtrl", ["$scope", "$q", "$injector", "$timeout",  function($scope, $q, $injector, $timeout){
	var uiFunction = $injector.get("uiFunction");
	var rootScope = $injector.get("$rootScope");

	$scope.hide = function(){
		rootScope.playerActived = false;
	}

	//切歌换封面
	$scope.listen("song-has-loaded", function(event, data){
		$scope.playingSong = data;
		console.log(data);
		$scope.discImage = data.surface;
		//_changeDiscAndBg(data);
	})

	/*function _changeDiscAndBg(playingSong){
		var fullPage = document.querySelector("#player .bg");
		fullPage.style.cssText = "background: url(" + playingSong.surface + ") 50% no-repeat;"
								+ "background-size: cover;";
		$scope.discImage = playingSong.surface;
	}*/
	//播放器中的图片切换好了再进入，避免被看到闪切
	var fullPage = document.querySelector("#player .bg img");
	angular.element(fullPage).bind("load", function(){
		$scope.report("discImage-has-loaded");					//发送这个广播告诉其他页面，图片切换好了，可以进入播放器了
	})

}])

.controller("accountCtrl", ["$scope", "$q", "$injector", 
function($scope, $q, $injector){
	
}])


.factory("RecommendService", ["$injector", 
function($injector){
	return {
		getRecommendData: _getRecommendData,	//根据歌单id返回该歌单的数据(不包含歌曲信息，如果需要就再查一次)
		getRecommendList: _getRecommendList		//根据歌单id返回该歌单上的歌曲
	}

	function _getRecommendData(id){
		var songlists = $injector.get("showConfig") && $injector.get("showConfig").recommendSongList || [];
		var listId = id || 1;
		var result = {};
		songlists.some(function(item){
			if(item.id == listId){
				result = item;
				return true;
			}
		})
		return result;
	}

	function _getRecommendList(id){		
		var library = $injector.get("SongLibrary") || [];
		var songlists = $injector.get("showConfig") && $injector.get("showConfig").recommendSongList || [];
		var listId = id || 1;
		var result = [];
		songlists.some(function(item){
			if(item.id && item.id == listId){
				result = library.reduce(function(preValue, newValue){
					if(newValue && item.songIds.indexOf(newValue.id) >= 0){
						preValue.push(newValue);
					}
					return preValue;
				}, []);
				return true;
			}
		})
		return result;
	}

}])
.controller("recommendListCtrl", ["$scope", "$q", "$injector", 
function($scope, $q, $injector){
	var id = $scope.$stateParams.id || 1;
	var service = $injector.get("RecommendService");
	var PlayerService = $injector.get("PlayerService");
	var rootScope = $injector.get("$rootScope");

	var recommendData = service.getRecommendData(id);
	var songList = service.getRecommendList(id);

	recommendData.songList = songList;
	$scope.bean = recommendData;
	var bean = $scope.bean;

	$scope.bgStyle = {
		"background": "url(" + bean.img + ") 50% center / cover no-repeat no-repeat"
	}

	$scope.toPlayer = function(){
		rootScope.playerActived = true;
	}

	$scope.addToCollection = function(item){
		PlayerService.getPlayingSong()
		.then(function(data){
			var playingSong = data;
			if(item && playingSong == item){
				return $q.reject("now-playing");
			}
		})
		.then(function(){
			return PlayerService.addToList(item);
		})
		.then(function(){
			$scope.playingSong = item;
			//PlayerService.setDefaultPlaying(true);
		})
		.then(function(){
			$scope.report("start-play");
		}, function(reason){
			console.log(reason);
		})
		/*["finally"](function(){
			rootScope.playerActived = true;
		})*/
	}

	//唤出播放器。使用接收广播的方式是为了等待播放器中的封面等信息换好再打开播放器，以免造成信息闪切
	$scope.listen("discImage-has-loaded", function(){
		var isEnd = PlayerService.getIsEnd();
		if(PlayerService.getDefaultPlaying() && !isEnd){
			rootScope.playerActived = true;
			PlayerService.setIsEnd(false);
		}
	})


	//显示正在播放
	//1.进来页面先查一下
	PlayerService.getPlayingSong()
	.then(function(data){
		$scope.playingSong = data || {}
	}, function(reason){
		console.log(reason);
	})

	//2.播放器换歌就查一下当前列表有没有
	$scope.listen("song-has-loaded", function(event, data){
		$scope.playingSong = data;
	})
}])
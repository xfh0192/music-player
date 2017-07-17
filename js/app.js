$h.ngAppName = "music-player";

angular.module($h.ngAppName, ["ui.router", "ngAnimate"])

.config(["$stateProvider", "$urlRouterProvider",
function($stateProvider, $urlRouterProvider){

	//没有找到符合路由时就跳进url: index
	$urlRouterProvider.otherwise("/index/main");

	$stateProvider
		.state("index", {		//首页
			url: "/index",
			templateUrl: $h.home() + "/tpl/index.html"
		})
		.state("index.main", {
			url: "/main",
			templateUrl: $h.home() + "/tpl/main.html",
			controller: "mainCtrl"
		})
		.state("index.collection", {
			url: "/collection",
			templateUrl: $h.home() + "/tpl/collection.html",
			controller: "collectionCtrl"
		})
		.state("index.account", {
			url: "/account",
			templateUrl: $h.home() + "/tpl/account.html",
			controller: "accountCtrl"
		})
		.state("recommend", {
			url: "/recommend/list?{id:[0-9]}",
			templateUrl: $h.home() + "/tpl/recommend.html",
			controller: "recommendListCtrl"
		})
		
}])

.run(["$rootScope", "$injector", "$state", "$stateParams", "SongLibrary", 
	function($rootScope, $injector, $state, $stateParams, SongLibrary){
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
	/*$rootScope.stateName = $state.current.name || "";*/
	$h.extendRootScope($rootScope);
	$rootScope.showConfig = $injector.get("showConfig");

	//播放列表页和播放器页面交互
	$rootScope.playerActived = false;	//默认隐藏播放器
	/*$rootScope.SongLibrary = SongLibrary;
	SongLibrary.$playingIndex = 0;	//歌曲列表的序号
	$rootScope.playingSong = SongLibrary[0] || {};	//播放器默认显示第一首歌

	$rootScope.defaultPlaying = false;	//默认不播放歌曲*/

	//设定播放列表
	var PlayerService = $injector.get("PlayerService");
	var defaultPlayingList = SongLibrary.slice(0, 4) || [];		//我的音乐默认只有前四首
	PlayerService.setList(defaultPlayingList)
	.then(function(data){
		console.log(data);
		return PlayerService.getPlayingSong();
	})
	.then(function(playingSong){
		console.log(playingSong);
	})

	//某个版本的ui-router开始，这个事件就没有了...
	//就不降版本了，暂时用viewcontentload
	/*$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
		alert("abc");
	})*/
}])

.constant("SongLibrary", [
		{
			id: 1,
			name: "last surprise",
			author: "目黒将司",
			//url: $h.home() + "/song/library-1.mp3",
			//url: "http://mp3.flash127.com/music/12621.mp3",
			url: $h.localDebug() && ($h.home() + "/song/library-1.mp3") || "http://mp3.flash127.com/music/12621.mp3",
			//surface: $h.home() + "/image/surface-1.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-1.jpg") || "http://p1.music.126.net/wtTX_YSIbw7dYXXihlANCQ==/18642219650656143.jpg?param=130y130"
		},
		{
			id: 2,
			name: "春に一番近い街",
			author: "シャノ (chano)",
			//url: $h.home() + "/song/library-2.mp3",
			url: $h.localDebug() && ($h.home() + "/song/library-2.mp3") || "http://mp3.flash127.com/music/14252.mp3",
			//surface: $h.home() + "/image/surface-2.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-2.jpg") || "http://p4.music.126.net/S8p3CjMOSnbzPphm2meQdg==/2404631929969272.jpg?param=130y130"
		},
		{
			id: 3,
			name: "大きな世界",
			author: "40mp/シャノ",
			//url: $h.home() + "/song/library-3.mp3",
			url: $h.localDebug() && ($h.home() + "/song/library-3.mp3") || "http://mp3.flash127.com/music/15952.mp3",
			//surface: $h.home() + "/image/surface-3.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-3.jpg") || "http://p1.music.126.net/o5eiuV6ICCydRLimgxXpuQ==/925788790612394.jpg?param=130y130"
		},
		{
			id: 4,
			name: "光るなら",
			author: "Goose house (グースハウス)",
			url: $h.localDebug() && ($h.home() + "/song/library-4.mp3") || "http://mp3.flash127.com/music/15953.mp3",
			//surface: $h.home() + "/image/surface-4.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-4.jpg") || "http://p1.music.126.net/TM6SM2-ppcd1F66YyjR-Eg==/2537672838610591.jpg?param=130y130"
		},
		{
			id: 5,
			name: "TOMORROW",
			author: "甲田雅人",
			url: $h.localDebug() && ($h.home() + "/song/library-5.mp3") || "http://mp3.flash127.com/music/16243.mp3",
			//surface: $h.home() + "/image/surface-5.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-5.jpg") || "http://p3.music.126.net/K9JspNhWALNYoKgMczT5ww==/18720284976418411.jpg?param=177y177"
		},
		{
			id: 6,
			name: "ちいさな冒険者",
			author: "雨宮天,高橋李依,茅野愛衣",
			url: $h.localDebug() && ($h.home() + "/song/library-6.mp3") || "http://mp3.flash127.com/music/16282.mp3",
			//surface: $h.home() + "/image/surface-6.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-6.jpg") || "http://p3.music.126.net/sB9Dgytsw36PHYgB8Nxq1Q==/3386495816508708.jpg?param=177y177"
		},
		{
			id: 7,
			name: "fantastic dreamer",
			author: "Machico",
			url: $h.localDebug() && ($h.home() + "/song/library-7.mp3") || "http://mp3.flash127.com/music/16284.mp3",
			//surface: $h.home() + "/image/surface-7.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-7.jpg") || "http://p3.music.126.net/uj0jS9Qnc2cirRl6q0SK1A==/1418370000157194.jpg?param=130y130"
		},
		{
			id: 8,
			name: "ピースサイン",
			author: "米津玄師",
			url: $h.localDebug() && ($h.home() + "/song/library-8.mp3") || "http://mp3.flash127.com/music/16285.mp3",
			//surface: $h.home() + "/image/surface-8.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-8.jpg") || "http://p4.music.126.net/5oit8dbUPU1CauY_9Nkggw==/19000660439703907.jpg?param=130y130"
		},
		{
			id: 9,
			name: "HEROES",
			author: "Brian the Sun",
			url: $h.localDebug() && ($h.home() + "/song/library-9.mp3") || "http://mp3.flash127.com/music/16286.mp3",
			//surface: $h.home() + "/image/surface-9.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-9.jpg") || "http://p1.music.126.net/rnjvBG_wP8oNitMRLhywiA==/3433774815522737.jpg?param=130y130"
		},
		{
			id: 10,
			name: "茜さす",
			author: "Aimer",
			url: $h.localDebug() && ($h.home() + "/song/library-10.mp3") || "http://mp3.flash127.com/music/16287.mp3",
			//surface: $h.home() + "/image/surface-10.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-10.jpg") || "http://p3.music.126.net/imIdf78bmtZwduGmMNiCYQ==/18779658602840072.jpg?param=130y130"
		},
		{
			id: 11,
			name: "六等星の夜",
			author: "Aimer",
			url: $h.localDebug() && ($h.home() + "/song/library-11.mp3") || "http://mp3.flash127.com/music/16289.mp3",
			//surface: $h.home() + "/image/surface-11.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-11.jpg") || "http://p3.music.126.net/O0EE48Uv5cDxBLf2_Lkn6w==/1376588569408912.jpg?param=130y130"
		},
		{
			id: 12,
			name: "雨音ノイズ",
			author: "初音ミク",
			url: $h.localDebug() && ($h.home() + "/song/library-12.mp3") || "http://mp3.flash127.com/music/16292.mp3",
			//surface: $h.home() + "/image/surface-12.jpg"
			surface: $h.localDebug() && ($h.home() + "/image/surface-12.jpg") || "http://p3.music.126.net/H40ys2e027zTrNP8Jnmsxw==/18817041999595817.jpg?param=130y130"
		}
	]
)

.constant("showConfig", {
	refresh: {
		text: "正在寻找好听的音乐",
		icon: "crescent"
	},
	indexSlideImgs: [
		{
			url: "index",
			//img: $h.home() + "/image/music-0.jpg"
			img: "http://p1.music.126.net/KNlSlhh-8cGnR0THwtPyLw==/18613632348576109.jpg"
		},
		{
			url: "index",
			//img: $h.home() + "/image/music-1.jpg"
		},
		{
			url: "index",
			//img: $h.home() + "/image/music-2.jpg"
		},
		{
			url: "index",
			//img: $h.home() + "/image/music-3.jpg"
		}
	],
	recommend: [	//首页显示的歌单封面
		{
			id: 1,
			title: "为美好世界献上祝福-1",
			//img: $h.home() + "/image/recommend-1.jpg",
			img: "http://p3.music.126.net/K9JspNhWALNYoKgMczT5ww==/18720284976418411.jpg?param=177y177",
			count: "63万",
			songIds: [5,6,7]
		},
		{
			id: 2,
			title: "为美好世界献上祝福-2",
			//img: $h.home() + "/image/recommend-2.jpg",
			img: "http://p3.music.126.net/sB9Dgytsw36PHYgB8Nxq1Q==/3386495816508708.jpg?param=177y177",
			count: "68万",
			songIds: [6,7,8]
		},
		{
			id: 3,
			title: "我的英雄学院-1",
			//img: $h.home() + "/image/recommend-3.jpg",
			img: "http://p4.music.126.net/5oit8dbUPU1CauY_9Nkggw==/19000660439703907.jpg?param=130y130",
			count: "68万",
			songIds: [7,8,9]
		},
		{
			id: 4,
			title: "我的英雄学院-2",
			//img: $h.home() + "/image/recommend-4.jpg",
			img: "http://p1.music.126.net/rnjvBG_wP8oNitMRLhywiA==/3433774815522737.jpg?param=130y130",
			count: "63万",
			songIds: [8,9,10]
		},
		{
			id: 5,
			title: "Aimer",
			//img: $h.home() + "/image/recommend-5.jpg",
			img: "http://p3.music.126.net/O0EE48Uv5cDxBLf2_Lkn6w==/1376588569408912.jpg?param=130y130",
			count: "75万",
			songIds: [9,10,11]
		},
		{
			id: 6,
			title: "初音ミク",
			//img: $h.home() + "/image/recommend-6.jpg",
			img: "http://p3.music.126.net/H40ys2e027zTrNP8Jnmsxw==/18817041999595817.jpg?param=130y130",
			count: "120万",
			songIds: [10,11,12]
		}
		
	],

	recommendSongList: [	//具体每张歌单里面的数据
		{
			id: 1,
			title: "为美好世界献上祝福-1",
			img: "http://p3.music.126.net/K9JspNhWALNYoKgMczT5ww==/18720284976418411.jpg?param=177y177",
			count: "63万",
			songIds: [5,6,7]
		},
		{
			id: 2,
			title: "为美好世界献上祝福-2",
			img: "http://p3.music.126.net/sB9Dgytsw36PHYgB8Nxq1Q==/3386495816508708.jpg?param=177y177",
			count: "68万",
			songIds: [6,7,8]
		},
		{
			id: 3,
			title: "我的英雄学院-1",
			img: "http://p4.music.126.net/5oit8dbUPU1CauY_9Nkggw==/19000660439703907.jpg?param=130y130",
			count: "68万",
			songIds: [7,8,9]
		},
		{
			id: 4,
			title: "我的英雄学院-2",
			img: "http://p1.music.126.net/rnjvBG_wP8oNitMRLhywiA==/3433774815522737.jpg?param=130y130",
			count: "63万",
			songIds: [8,9,10]
		},
		{
			id: 5,
			title: "Aimer",
			img: "http://p3.music.126.net/O0EE48Uv5cDxBLf2_Lkn6w==/1376588569408912.jpg?param=130y130",
			count: "75万",
			songIds: [9,10,11]
		},
		{
			id: 6,
			title: "初音ミク",
			img: "http://p3.music.126.net/H40ys2e027zTrNP8Jnmsxw==/18817041999595817.jpg?param=130y130",
			count: "120万",
			songIds: [10,11,12]
		}
	]
})

import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios';
import VueAxios from 'vue-axios';
import index from './components/index.vue'
import main from './components/main.vue'
import collection from './components/collection.vue'
import account from './components/account.vue'

// 用 axios 进行 Ajax 请求
Vue.use(VueAxios, axios);

Vue.use(Router);
Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		count: 0,
		songData: {},
		recommendId: 1,
		showRecommend: false,
		collectionList: [],
		playingSong: {},
		isPlaying: false,		//判断是否在播放
		showMusicPlayer: false,
		audio: {},
		defaultPlaying: false	//第一次加载歌曲的时候不播放
	},
	mutations: {
		increment(state){
			state.count++
		},
		toggleRecommend(state, data){
			data.id && (state.recommendId = data.id || 1);
			//state.showRecommend = !state.showRecommend;
			state.showRecommend = data.status || false;
		},
		toggleMusicPlayer(state, data){
			//state.showMusicPlayer = !state.showMusicPlayer;
			state.showMusicPlayer = data.status || false;
		},
		changeSong(state, data){
			var target = data.target || "next";
			var collectionList = state.collectionList;
			var index = collectionList.$index || 0;
			if(target == "next"){
				index = index + 2 > collectionList.length ? (index + 1 - collectionList.length) : (index + 1);
			}
			if(target == "prev"){
				index = index - 1 < 0 ? (index - 1 + collectionList.length) : (index - 1);
			}
			collectionList.$index = index;
			state.playingSong = state.collectionList[index];
		},
		togglePlaying(state, status){
			state.isPlaying = status || false
		},
		setPlayingSong: (state, data) => {
			state.playingSong = data.song || {}									//设置好新歌

			var collectionList = state.collectionList;							//将collectionList的#tabIndex更新
			var playingSong = data.song;
			var resultIndex;
			collectionList.some((item, index) => {
				if(item.id == playingSong.id){
					resultIndex = index;
					return true;
				}
			})
			//从推荐列表添加的歌曲，先添加再触发设置为新歌
			collectionList.$index = resultIndex || resultIndex === 0 ? resultIndex : collectionList.length;
		},
		removeSong: (state, data) => {
			state.collectionList.$index = state.collectionList.length - 1 || 0;
			state.collectionList.splice(data.index, 1)
		},
		addSongToCollection: (state, data) => {
			var collectionList = state.collectionList;
			var newSong = data.song;
			var isNew = collectionList.every(function(item){
				if(item.id == newSong.id){
					return false;
				}
				return true;
			})
			isNew && state.collectionList.push(data.song)
		},
		closeDefaultPlaying: (state) => {
			state.defaultPlaying = true
		},
		startClose: function(state, $event){									//右划隐藏播放器和推荐歌单页
			var srcElement = $event.srcElement;
			if(srcElement.className.indexOf("progress-ctrl-mark") >= 0			//这部分只需要注意排除播放器的进度条就可以
				|| srcElement.className.indexOf("playing-bar") >= 0
				|| srcElement.className.indexOf("progress-bar") >= 0){
				return;
			}
			state.canClose = true;												//开关变量

			var touch = $event.targetTouches && $event.targetTouches[0] || $event;
			//console.log(touch.clientX)
			state.startCloseX = touch.clientX || 0;
		},
		endClose: function(state, data){
			if(!state.canClose){
				return;
			}
			state.canClose = false;

			var touch = data.$event.changedTouches && data.$event.changedTouches[0] || data.$event;
			//console.log(touch.clientX)
			var endCloseX = touch.clientX;
			if(endCloseX - state.startCloseX > document.body.clientWidth*0.2){
				store.commit(data.commitEvent, {status: false});
			}
		},
		rateSong: function(state){
			state.playingSong.rated = !!!state.playingSong.rated;
			//console.log(state.playingSong)
		}
	},
	actions: {
		getData({commit, state}){
			if(localStorage.songData !== "{}" && localStorage.songData){
				//state.songData = JSON.parse(localStorage.songData);
				//console.log(state.songData);
				//播放列表默认放4首吧
				//state.collectionList = state.songData.songLibrary.slice(4);
				var data = localStorage.songData || "{}";
				_setDefaultSong(JSON.parse(data));
				return;
			}
			return new Promise(function(resolve, reject){
				Vue.axios.get("./data.json")
				.then(function(rsp){
					var data = rsp.data || {};
					if(data){
						state.songData = data;
						localStorage.songData = state.songData && JSON.stringify(state.songData) || "{}";
						_setDefaultSong(data);
					}
				})
				.then(function(){
					//预留，
				}, function(reason){
					console.log(reason);
				})
			})

			//设定默认播放列表和默认装载歌曲
			function _setDefaultSong(data){
				state.songData = data;
				state.collectionList = state.songData.songLibrary.slice(0,4);			//播放列表默认放4首吧
				state.collectionList.$index = 0;
				state.playingSong = state.collectionList[state.collectionList.$index];
			}
		}
	}
})

const router = new Router({
	routes:[
		{path: "/", redirect: '/index'},	//重定向
		{path: "/index", component: main},
		{path: "/collection", component: collection},
		{path: "/account", component: account}
		//{path: "/recommend/:id", name: "recommend", component: recommend}
	]
})

//需要进行非父子组件之间通信，因而创建的作为消息中转站的实例
//var eventBus = new Vue({});


const app = new Vue({
	router: router,
	store,
	render: (createElement) => createElement(index),	//好像是运行时渲染需要加这个函数
	mounted: function(){
		//接收事件，打开或关闭推荐列表
		/*eventBus.$on("openRecommend", function(data){
			this.showRecommend = !this.showRecommend;
			if(data){
				this.recommendId = data.recommendId;
			}
		}.bind(this))*/
		//接收事件，打开或关闭播放器
		/*eventBus.$on("openPlayer", function(){
			this.showPlayer = !this.showPlayer;
			console.log(this.showPlayer);
		}.bind(this))*/
	}
}).$mount("#app")	//$mount:手动挂载dom
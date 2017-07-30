<template>
<div id="music-player">
	<div class="progress">
		<span class="playing-time">{{playingTime}}</span>
		<p class="progress-bar" @touchstart.prevent="touchStart($event)" @touchmove.prevent="touchMove($event)" @touchend.prevent="touchEnd($event)">
			<b class="playing-bar" v-bind:style="playingBarStyle">
				<i class="iconfont icon-icon2 progress-ctrl-mark"></i>
			</b>
			<b class="buffered-bar"></b>
		</p>
		<span class="length">{{songLength}}</span>
	</div>
	<p class="ctrl">
		<i class="iconfont icon-prev" @click="changeSong('prev')"></i>
		<i class="iconfont icon-iconbofangqizanting" v-if="!isPlaying" @click.prevent="play()"></i>
		<i class="iconfont icon-iconbofangqibofang" v-if="isPlaying" @click.prevent="pause()"></i>
		<i class="iconfont icon-next" @click="changeSong('next')"></i>
	</p>
	<audio v-bind:src="playingSong.url"></audio>
</div>
</template>

<script>
export default {
	name: 'musicPlayer',
	data: function(){
		return {
			audio: {},
			playingTime : "00:00",
			songLength: "00:00",
			playingBarWidth: 0,
			progressTimer: {},
			progressTimerFn: {}
		}
	},
	computed: {
		playingSong: function(){
			return this.$store.state.playingSong;
		},
		playerBackground: function(){
			//return "image/surface-1.jpg";
			return this.$store.state.playingSong.surface;
		},
		isPlaying(){
			return this.$store.state.isPlaying;
		},
		playingBarStyle(){
			return {
				width: this.playingBarWidth + "px"
			}
		}
	},
	watch: {
		playingSong: function(){
			
			//浏览器上面，事件触发顺序：load => canplay => play
			//iPhone上面，同步的情况下会不一样：load触发的时候canplay监听还没有注册，因此load必须用定时器延迟执行
			//不依赖load了。。浏览器和手机太坑了
			//alert("load")
			setTimeout(() => {
					this.audio.load();		
			}, 0)

		},
		//增加函数，使用isPlaying判断canplay事件触发后是否播放，导致点击新歌进入播放器都会使isPlaying=true，这里加一个判断修正
		isPlaying: function(){
			var isPlaying = !!!this.audio.paused;
			this.$store.commit("togglePlaying", isPlaying);
		}
	},
	methods: {
		play: function(){
			this.audio.play();
			this.$store.commit("togglePlaying", true)
		},
		pause: function(){
			this.audio.pause();
			this.$store.commit("togglePlaying", false)
		},
		changeSong: function(target){
			this.playingBarWidth = 0;
			this.audio.current = "00:00";
			this.$store.commit("changeSong", {target: target})
		},
		touchStart: function($event){
			clearTimeout(this.progressTimer)
		},
		touchMove: function($event){
			var touch = $event.targetTouches && $event.targetTouches[0] || $event;		//touchmove用targetTouches
			var progressBarRect = this.progressBar.getBoundingClientRect();
			this.playingBarWidth = touch.clientX - progressBarRect.left;
		},
		touchEnd: function($event){
			var touch = $event.changedTouches && $event.changedTouches[0] || $event;		//touchend用changedTouches
			var progressBarRect = this.progressBar.getBoundingClientRect();
			this.playingBarWidth = touch.clientX - progressBarRect.left;

			var setPlayingTime = this.playingBarWidth / this.progressBar.clientWidth * this.audio.duration;
			this.audio.currentTime = setPlayingTime || 0;
			this.playingTime = this.timeFormat(setPlayingTime);

			this.progressTimer = setTimeout(this.progressTimerFn = () => {					//这种写法可以成功清除绑定的定时器
				this.progressBar = document.querySelector("#music-player .progress .progress-bar")
				this.playingBarWidth = this.audio.currentTime / this.audio.duration * this.progressBar.clientWidth
				this.progressTimer = setTimeout(this.progressTimerFn, 500)
			}, 500)
		},
		timeFormat: (timeCount) => {
			var second = parseInt(timeCount) || 0;
			var min = Math.floor(second / 60);
			var sec = Math.round(second % 60);
			min = min < 10 ? ("0" + min) : min
			sec = sec < 10 ? ("0" + sec) : sec
			return min + ":" + sec;
		}
	},
	mounted: function(){
		this.audio = document.querySelector("audio");
		this.progressBar = document.querySelector("#music-player p.progress-bar")
		this.playingBar = document.querySelector("#music-player b.playing-bar");
		var timer;

		this.audio.addEventListener("canplay", () => {
			console.log("canplay")
											//不用这个默认开关了。。浏览器会先触发一次canplay，但是手机不会。。用不了
			//if(this.$store.state.defaultPlaying){//this.$store.state.isPlaying && this.$store.state.defaultPlaying
				this.audio.play()
			//}
			//this.$store.commit("closeDefaultPlaying")
			this.songLength = this.timeFormat(this.audio.duration) || "00:00"
		})
		
		this.audio.addEventListener("play", () => {
			console.log("play")
			this.$store.commit("togglePlaying", true)

			if(timer){
				clearTimeout(timer);
				timer = null;
			}
			var timeFn;
			timer = setTimeout(timeFn = () => {
				this.playingTime = this.timeFormat(this.audio.currentTime) || "00:00"
				//console.log(this.playingTime)
				if(timer){
					timer = setTimeout(timeFn, 1000)	//更新timer，以便其他操作的时候能正确清除timer
				}
			}, 1000)
		})
		this.audio.addEventListener("pause", () => {
			console.log("pause")
			this.$store.commit("togglePlaying", false)
			if(timer){
				clearTimeout(timer);
				timer = null;
			}
		})
		this.audio.addEventListener("ended", () => {
			this.changeSong("next")
			if(timer){
				clearTimeout(timer);
				timer = null;
			}
		})

		//进度条
		this.progressTimer = setTimeout(this.progressTimerFn = () => {
			this.progressBar = document.querySelector("#music-player .progress .progress-bar")
			this.playingBarWidth = this.audio.currentTime / this.audio.duration * this.progressBar.clientWidth
			this.progressTimer = setTimeout(this.progressTimerFn, 500)
		}, 0)

		//默认load一次，浏览器上面没有区别，但是手机上面就可以触发canplay去掉默认的播放开关变量了
		//setTimeout(() => {
		//		this.audio.load();
		//}, 0)

		//if($h.navigator() == "mobile"){
		//	this.$store.commit("closeDefaultPlaying")
		//}
	}
}
</script>

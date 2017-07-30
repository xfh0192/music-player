<template>
<div id="music-player-page" @touchstart="startClose($event)" @touchend="endClose($event)">
	<div class="bg">
		<img v-bind:src="playingSong.surface"/>
	</div>
	<header>
		<div>
			<button class="back" @click="back">
		 		<i class="iconfont icon-back"></i>
		 	</button>
		 	<h3>
		 		{{playingSong.name}}
		 		<p>{{playingSong.author}}</p>
		 	</h3>
		 	<button @click="rate">
		 		<i class="iconfont" :class="{'icon-recommend': !rated, 'icon-iconfontpraise': rated}"></i>
		 	</button>
		 </div>
	</header>
	<div class="content">
		<div class="disc">
			<div>
				<img v-bind:src="playingSong.surface">
				<span></span>
			</div>
		</div>
		<musicPlayer></musicPlayer>
	</div>
</div>
</template>

<script>
import musicPlayer from './musicPlayer.vue'
export default {
	name: 'musicPlayerPage',
	components: {
		musicPlayer
	},
	data: function(){
		return {
			canClose: false,
			startCloseX: 0,
			rated: false
		}
	},
	computed: {
		playingSong: function(){
			return this.$store.state.playingSong;
		}
	},
	watch: {
		playingSong: function(){
			this.rated = false;
		}
	},
	methods: {
		back: function(){
			this.$store.commit("toggleMusicPlayer", {status: false});
		},
		startClose: function($event){
			this.$store.commit("startClose", $event);
		},
		endClose: function($event){
			this.$store.commit("endClose", {$event: $event, commitEvent: "toggleMusicPlayer", status: false});
		},
		rate: function(){
			var ratePromise = new Promise((resolve, reject) => {
				resolve(this.$store.commit("rateSong"))
			})
			
			ratePromise.then(() => {
				this.rated = this.$store.state.playingSong.rated;
			}, (reason) => {
				console.log(reason)
			})
			
		}
	}
}
</script>
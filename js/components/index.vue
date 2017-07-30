<template>
	<div id="app">
		<div id="container">
			<indexHeader></indexHeader>
			<transition name="index">
				<router-view></router-view>
			</transition>
		</div>
	
		<!-- 推荐详情 -->
		<transition name="recommend">
			<recommend v-if="showRecommend"></recommend>
		</transition>
		<!-- 播放器 -->
		<transition name="player">
			<musicPlayerPage v-show="showMusicPlayer"></musicPlayerPage>
		</transition>
		<!-- audio标签 -->
		<!-- <audio></audio> -->
		<!-- <audio v-bind:src="playingSong.url"></audio> -->
	</div>

</template>

<script>
import indexHeader from './indexHeader.vue'
import recommend from './recommend.vue'
import musicPlayerPage from './musicPlayerPage.vue'

export default {
	name : 'index',
	components: {
		indexHeader: indexHeader,
		recommend: recommend,
		musicPlayerPage: musicPlayerPage
	},
	beforeCreate() {
	    this.$store.dispatch('getData');
	},
	computed: {
		showRecommend: function(){
			return this.$store.state.showRecommend;
		},
		showMusicPlayer: function(){
			return this.$store.state.showMusicPlayer;
		},
		playingSong: function(){
			return this.$store.state.playingSong;
		}
	}
}

</script>
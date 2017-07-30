<template>
<div id="recommend" @touchstart="startClose($event)" @touchend="endClose($event)">
	<header>
		<p>
			<i class="iconfont icon-back back" v-on:click="back"></i>
			<span>歌单</span>
			<i class="iconfont icon-zhengzaibofang playing" @click="openMusicPlayer()"></i>
		</p>
		
		<div class="bg" v-bind:style="{background:'url(' + bean.img + ') 50% center / cover no-repeat no-repeat'}"></div>
		<div>
			<img v-bind:src="bean.img"/>
			<h3>
				{{bean.title}}
			</h3>
		</div>
	</header>
	<div class="content">
		<ul>
			<li v-for="(row, index) in bean.songList" @click="setPlayingSong(row)" :class="{playing: row.id == playingSongId}">
				<i class="iconfont icon-yinliang" v-if="row.id == playingSongId"></i>
				<span v-if="row.id != playingSongId">
					{{index + 1}}.&nbsp;
				</span>
				{{row.name}}
			</li>
		</ul>
		<div class="listEnd">
			已经没有更多歌曲啦~
		</div>
	</div>
</div>
</template>

<script>

export default {
	name: 'recommend',
	data: function(){
		return {
			bgImg: "",
			bgStyle: {}
		}
	},
	computed: {
		//获取该推荐歌单中的数据以及歌曲
		bean: function(){
			var recommendId = this.$store.state.recommendId || 0;
			var songData = this.$store.state.songData || [];
			var recommendNav = songData.recommendNav || [];
			var songLibrary = songData.songLibrary || [];
			
			var result = {};
			recommendNav.some(function(item){
				if(item.id == recommendId){
					result = item;
					result.songList = songLibrary.reduce(function(preValue, nextValue){
						if(item.songIds.indexOf(nextValue.id) >= 0){
							preValue.push(nextValue);
						}
						return preValue;
					}, [])
					return true;
				}
			})
			return result;
		},
		//判断某首歌是否正在播放
		playingSongId: function(){
			var songId = this.$store.state.playingSong.id || 1;
			return songId;
		}
	},
	methods: {
		//发消息给根实例，关闭推荐列表
		back: function(){
			this.$store.commit("toggleRecommend", {status: false});
		},
		setPlayingSong: function(row){
			this.$store.commit("togglePlaying", true)
			this.$store.commit("addSongToCollection", {song: row})
			this.$store.commit("setPlayingSong", {song: row})
			this.$store.commit("toggleMusicPlayer", {status: true})
		},
		startClose: function($event){
			this.$store.commit("startClose", $event);
		},
		endClose: function($event){
			this.$store.commit("endClose", {$event: $event, commitEvent: "toggleRecommend"});
		},
		openMusicPlayer: function(){
			this.$store.commit("toggleMusicPlayer", {status: true})
		}
	}
}

</script>

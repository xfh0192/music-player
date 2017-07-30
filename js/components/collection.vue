<template>
	<div id="collection">
		<ul>
			<li v-for="(row, index) in list">
				<h3 @click="setPlayingSong(row)" v-bind:class="{playing: row.id == playingSongId}">
					<i class="iconfont icon-yinliang" v-if="row.id == playingSongId"></i>
					<b v-if="row.id != playingSongId">{{index + 1}}.</b>
					&nbsp;{{row.name}}
				</h3>
				<i class="iconfont icon-trash" @click="remove(index)"></i>
			</li>
		</ul>
		<div class="listEnd">
			已经没有更多歌曲啦~
		</div>
	</div>
</template>

<script>
export default {
	name: 'collection',
	data: function(){
		return {
			
		}
	},
	computed: {
		list: function(){
			return this.$store.state.collectionList || []
		},
		//判断某首歌是否正在播放
		playingSongId: function(){
			var songId = this.$store.state.playingSong.id || 1;
			return songId;
		}
	},
	methods: {
		setPlayingSong: function(row){
			this.$store.commit("togglePlaying", true)
			this.$store.commit("setPlayingSong", {song: row})
			this.$store.commit("toggleMusicPlayer", {status: true})
		},
		remove: function(index){
			this.$store.commit("removeSong", {index: index})
		}
	}
}

</script>
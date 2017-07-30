<template>
	<div id="recommendNav">
		<h2>推荐歌单</h2>
		<dl>
			<dd v-for="row in recommendNavList" v-on:click="toRecommend(row.id)">
				<label class="playedCount">
					<i class="iconfont icon-headphones"></i>
					{{row.count}}
				</label>
				<img v-bind:src="row.img || './image/loading.gif'"/>
				<p>{{row.title}}</p>
			</dd>
		</dl>
	</div>
</template>

<script>
export default {
	name: 'recommendNav',
	computed: {
		recommendNavList: function(){
			return this.$store.state.songData.recommendNav || []
		}
	},
	methods: {
		toRecommend: function(id){
			this.$store.commit("toggleRecommend", {id: id, status: true});
		}
	}
}

</script>


<template>
	<ul class="dailyNav">
		<li @click="toRecommend(1)">
			<i class="iconfont icon-leguansirendiantai"></i>
			<label>私人FM</label>
		</li>
		<li @click="toRecommend(2)">
			<i class="iconfont icon-rili"></i>
			<label>每日歌曲推荐</label>
		</li>
		<li @click="toRecommend(3)">
			<i class="iconfont icon-iconfontpaixingbang2"></i>
			<label>云音乐热歌榜</label>
		</li>
	</ul>
</template>

<script>
export default {
	name: 'dailyNav',
	methods: {
		toRecommend: function(id){
			this.$store.commit("toggleRecommend", {id: id, status: true});
		}
	}
}
</script>
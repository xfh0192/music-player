<template>
	<div id="indexHeader" class="header">
		<header class="main-header">
			<button></button>
			<h1>我的云音乐</h1>
			<button v-on:click="openPlayer">
				<i class="iconfont icon-zhengzaibofang"></i>
			</button>
		</header>
		<header class="sub-header">
			<router-link to="/index">音乐推荐</router-link>
			<router-link to="/collection">播放列表</router-link>
			<router-link to="/account">我的账号</router-link>
		</header>
	</div>

</template>

<script>
export default {
	name: 'indexHeader',
	methods: {
		openPlayer: function(){
			this.$store.commit("toggleMusicPlayer", {status: true})
		}
	}
}

</script>
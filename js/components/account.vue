<template>
	<div id="account">
		<div class="user-info">
			<img v-bind:src="headImg"/>
			<div>
				<h3>账户</h3>
				<label>等级：Lv0</label>
			</div>
		</div>
		<div class="operate">
			<ul>
				<li>
					<i class="iconfont icon-huiyuan"></i>
					会员中心
				</li>
				<li>
					<i class="iconfont icon-shangcheng"></i>
					商城
				</li>
				<li>
					<i class="iconfont icon-youjian"></i>
					消息
				</li>
			</ul>
			<ul>
				<li>
					<i class="iconfont icon-shezhi"></i>
					设置
				</li>
				<li>
					<i class="iconfont icon-skin"></i>
					个性换肤
				</li>
				<li>
					<i class="iconfont icon-guanyu"></i>
					关于
				</li>
			</ul>
			<div class="log-out">
				<i class="iconfont icon-kaiguan"></i>
				退出登录
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'account',
	data: function(){
		return {
			headImg: "./image/default-head.jpg"
		}
	}
}

</script>

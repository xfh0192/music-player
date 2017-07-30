
<template>
	<div id='main'>
		<ul id='slides'>
			<li>
				<router-link to='/index'>
					<img v-bind:src='indexSlideImgs[0].img'/>
				</router-link>
			</li>
		</ul>
		<dailyNav></dailyNav>
		<recommendNav data="data.songLibrary"></recommendNav>
	</div>
</template>

<script>
import dailyNav from './dailyNav.vue'
import recommendNav from './recommendNav.vue'
export default {
	name: 'main',
	data: function(){
		return {
			data: this.$route.data,
			indexSlideImgs: [
				{
					url: "index",
					//img: $h.home() + "/image/music-0.jpg"
					img: "http://p1.music.126.net/KNlSlhh-8cGnR0THwtPyLw==/18613632348576109.jpg"
				}
			]
		}
	},
	components: {
		'dailyNav' : dailyNav,
		'recommendNav' : recommendNav
	}
}
</script>
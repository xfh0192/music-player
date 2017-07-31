# music-player（移动端的，自己用ip6测试的）

2017/07/31
个人写的音乐播放器3.0.0（vue、vue-router、vuex、flexible、h5/css3、localstorage、es6、express、webpack、sass）/n
上一版用的ng，发现还是得赶紧更新技术栈，咬牙狠狠啃了一波教程/n
这次用vue写的，也参考了一些demo
1、使用vue2.0开发，vue-router作为路由，vuex控制组件间的状态同步
2、使用flexible进行适配，flex布局，页面横向切入切出使用transition和animate
3、播放器使用了audio标签
4、css方面研究了sass，使用最基本的嵌套写法，很方便修改
5、使用express在自己机子简单配置了服务器（纯粹跑起来，还没有开始写接口），顺便研究使用了webpack进行打包
6、看了一些es6的写法（箭头函数、promise等），觉得promise太棒了而且用法和ng的promise几乎一样（之前对ng的promise较为熟悉了）
7、简单使用localstorage存储了一下歌曲数据（localstorage只能存为json字符串）


2017/07/12 23:10
个人写的音乐播放器（angular、flexible、ui-router、h5/css3）
ps:没有放上来
2.0.0了，第一版用了ionic1发现比较坑，大改之后使用了flexible.js进行适配
ps：tab菜单的第一第三页暂时没有功能，主要功夫花在了播放列表和播放器（各种事件）

1、用express搭了简单服务器在本机进入index.html
2、用flexible.js进行适配处理
3、用angular作为框架，利用ui-router编写路由部分
4、播放器部分，封装为了指令
5、利用ng-animate和css3的animate属性，制作右侧切入效果
6、audio的src用的是qq音乐的外链

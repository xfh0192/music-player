# music-player

2017/07/12 23:10

个人写的音乐播放器
2.0.0了，第一版用了ionic1发现比较坑，大改之后使用了flexible.js进行适配
ps：tab菜单的第一第三页暂时没有功能，主要功夫花在了播放列表和播放器（各种事件）

1、用express搭了简单服务器在本机进入index.html
2、用flexible.js进行适配处理
3、用angular作为框架，利用ui-router编写路由部分
4、播放器部分，封装为了指令，部分功能感觉应该写进factory中而不是直接写在rootScope（后面再改）
5、利用ng-animate和css3的animate属性，制作右侧切入效果
6、audio的src用的是qq音乐的外链，但是好像会过期失效，明天研究看看

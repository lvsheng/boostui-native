# `boost-native`

## 为什么要有`boost-native`
* **native开发成本高、迭代慢、发版周期长**
* **h5体验差、交互不流畅、缺少本地能力**
* 传统hybird方案并不能解决交互不流畅的问题
* 即便使用react-native，仍需要针对每个平台各写一份代码，
且其完全摒弃了webView的运行环境、开发模式与API也与传统web差异极大，无论对传统web开发人员还是对native同学学习与使用成本都较高、更不可控

## `boost-native`是什么
* 一套前端js框架
* 完全web化的API
	* 类html、css、DOM API的接口
* 同一套代码即可运行于native（o2o插件环境）与web下
* 除了基本的视图元素，还提供了`ViewPager`、`Slider`、`Dialog`、`Toast`等组件、自定义动画、跟手动画，并且在o2o插件环境下用原生native组件来渲染，在web下使用web降级方案
* 提供了离线缓存、浮层加载新页面、地理定位、分享等本地能力

## `boost-native`的特性
* **一套代码，多端运行！**
* 类web的开发方式
* 在o2o插件下（目前已进地图、正在进框）访问，会使用**纯native的渲染与能力**
* 在普通web环境下访问， **自动退化为web方案**

## o2o插件环境中的特殊能力
* tab切换
系统组件，再复杂再多的内容，转场滑动依然流畅
![图片](http://bos.nj.bpc.baidu.com/v1/agroup/0349836bd08113426ba53d6cec86d6766f91e8a3)

* 动画
切换、转场、动画效果，都毫不费力
![图片](http://bos.nj.bpc.baidu.com/v1/agroup/a58526020192990698ce8705f842da5db26793e6)

* 浮层打开新页面
浮层中打开新页面，返回主页无需再次刷新，更像一个真正的app
![图片](http://bos.nj.bpc.baidu.com/v1/agroup/23586ff810ca044e76a11bdf0b685bd9632259ff)

>体验方式：在android版百度地图中，打开“附近”->“看演出” 就是啦

## 开始使用！
* [3分钟搞定`hello, world`](http://agroup.baidu.com/boost-native/md/article/35231)
* [接口文档](http://agroup.baidu.com/boost-native/md/article/34825)

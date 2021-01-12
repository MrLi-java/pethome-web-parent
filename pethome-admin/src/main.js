import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
// import Mock from './mock'
// Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'

import axios from 'axios'
//配置axios的全局基本路径
axios.defaults.baseURL='http://localhost:8080'
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

import BaiduMap from 'vue-baidu-map'
import BmNavigation from 'vue-baidu-map/components/controls/Navigation'　　//　缩放组件

Vue.use(BaiduMap, {
  ak: 'oVDUBxex0BIjhkiCxo2mNE6zxBX9X4on',

  enableScrollWheelZoom:true,

})

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

/*router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})*/

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')


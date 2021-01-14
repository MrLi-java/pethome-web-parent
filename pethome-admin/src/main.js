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
axios.defaults.baseURL='http://172.16.80.252:8080'
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

/**
 * axios的请求拦截器:
 *  为每次请求添加请求头
 */
axios.interceptors.request.use(config=>{
  //携带token
  let userToken =  sessionStorage.getItem("userToken");
  if(userToken){
    config.headers['userToken'] = userToken;
  }
  return config;
},error => {
  Promise.reject(error);
})


/**
 * axios的响应拦截器：
 *  每次发送完请求后，当响应消息传递回来的时候，先判断一下消息是不是noUser,
 *  如果是则直接跳转到登录页面，提示一下“请先登录！”
 */
axios.interceptors.response.use(result=>{
  console.log(result.data+"jjjjjjj");
  let data = result.data;
  if(!data.success && data.msg==="noUser"){
    alert("请先登录！");
    location.href='http://localhost:8081/#/login';
    // this.$router.push({path: '/login'});
  }
  return result;
},error => {
  Promise.reject(error);
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


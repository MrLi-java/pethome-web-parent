//配置axios的全局基本路径
axios.defaults.baseURL='http://localhost:8080'
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios
Vue.prototype.fastdfsHost = 'http://121.37.194.36'

/**
 * axios的请求拦截器:
 *  为每次请求添加请求头
 */
axios.interceptors.request.use(config=>{
    //携带token
    let userToken =  localStorage.getItem("userToken");
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
        location.href = "/login.html";
    }
    return result;
},error => {
    Promise.reject(error);
})


/**
 * 通过参数名称获取浏览器地址栏中的GET请求参数
 * @param name
 */
function getParameter(name){
    let url = location.href;        //获取地址栏的内容
    url = url.substring(url.indexOf("?") + 1);  //截取?后面的字符串
    let params = url.split("&");    //以&拆分字符串,得到数组   参数名称=参数值
    for(let i=0;i<params.length;i++){
        if(params[i].split("=")[0] === name){
            return params[i].split("=")[1]
        }
    }
    return null;
}
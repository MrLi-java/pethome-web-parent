<template>
    <el-form :model="adminLogin" :rules="rules2" ref="adminLogin" label-position="left" label-width="0px"
             class="demo-ruleForm login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="username">
            <el-input type="text" v-model="adminLogin.username" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input type="password" v-model="adminLogin.password" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click.native.prevent="loginSubmit" :loading="logining">登录
            </el-button>
        </el-form-item>
        <el-form-item style="width:100%;">
            <el-button type="warning" style="width:100%;" @click.native.prevent="settledIn">商家入驻
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    import {requestLogin} from '../api/api';
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                logining: false,
                adminLogin: {
                    username: 'admin',
                    password: '123456',
                    type:'admin'
                },
                rules2: {
                    username: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                    ]
                },
                checked: true
            };
        },
        methods: {
            loginSubmit() {
              this.$http.post("/lr/adminLogin",this.adminLogin)
                  .then(res=>{
                    let {success,msg,data} = res.data;

                    if(success){
                      //console.log(data);
                      sessionStorage.setItem("userToken",data.userToken);
                      sessionStorage.setItem("loginUser",data.loginUser);

                      this.$router.push({path: '/echarts'});
                    }else{
                      alert(msg);
                    }
                  })
                  .catch(res=>{
                    alert("系统错误！！！")
                  })
                /*this.$refs.adminLogin.validate((valid) => {
                    if (valid) {
                        //_this.$router.replace('/table');
                        this.logining = true;
                        //NProgress.start();
                        var loginParams = {username: this.adminLogin.username, password: this.adminLogin.password};
                        requestLogin(loginParams).then(data => {
                            this.logining = false;
                            //NProgress.done();
                            let {msg, code, user} = data;
                            if (code !== 200) {
                                this.$message({
                                    message: msg,
                                    type: 'error'
                                });
                            } else {
                                sessionStorage.setItem('user', JSON.stringify(user));
                                //路由跳转页面
                                this.$router.push({path: '/echarts'});
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });*/
            },
            //跳转到商家入驻的表单页面
            settledIn(){
                //路由跳转
                this.$router.push({path:'/settledIn'})
            }
        }
    }

</script>

<style lang="scss" scoped>
    .login-container {
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 80px auto;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }
        .remember {
            margin: 0px 0px 35px 0px;
        }
    }
</style>
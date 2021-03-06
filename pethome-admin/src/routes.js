import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import department from './views/org/Department.vue'
import employee from './views/org/Employee.vue'
import shop from './views/org/Shop.vue'
import SettledIn from './views/user/SettledIn.vue'
import Product from './views/product/Product'
import Adopt from './views/pet/Adopt'
import Pet from './views/pet/Pet'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '登陆页面',
        hidden: true
    },
    {
        path: '/settledIn',
        component: SettledIn,
        name: '商家入住',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        leaf: true,
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/department', component: department, name: '部门管理' },
            { path: '/employee', component: employee, name: '员工管理' },
            { path: '/shop', component: shop, name: '门店管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '商品服务管理',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/product', component: Product, name: '商品服务管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '宠物管理',
        iconCls: 'fa fa-address-card',
        children: [
            { path: '/adopt', component: Adopt, name: '宠物寻主管理' },
            { path: '/pet', component: Pet, name: '宠物列表管理' }
        ]
    },

    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;
<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getShops">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="shops" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="name" label="门店名称" width="100" sortable>
			</el-table-column>
			<el-table-column prop="tel" label="门店电话"  sortable>
			</el-table-column>
			<el-table-column prop="registerTime" label="注册时间" width="180"  sortable>
			</el-table-column>
      <el-table-column prop="state" label="状态" width="180" sortable>
        <template scope="scope">
          <span v-if="scope.row.state == -1" style="color: green">禁用</span>
          <span v-if="scope.row.state == 0" style="color: green">正常</span>
          <span v-if="scope.row.state == 1" style="color: green">待审核</span>
          <span v-if="scope.row.state == 2" style="color: green">待激活</span>
        </template>
      </el-table-column>
			<el-table-column prop="logo" label="图标" width="180" sortable>
        <template scope="scope">
          <el-avatar :src="'http://121.37.194.36'+scope.row.logo"></el-avatar>
        </template>
      </el-table-column>
			<el-table-column prop="admin_id" label="管理员" width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" :disabled="scope.row.state!=1" @click="handleEdit(scope.$index, scope.row)">审核</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="total,sizes,prev, pager, next" @current-change="handleCurrentChange" @size-change="handleSizeChange"
                     :current-page="page"
                     :page-size="pageSize"
                     :page-sizes="[5,10,15,20]"
                     :total="total"
                     style="float:right;">
			</el-pagination>
		</el-col>

		<!--审核-->
		<el-dialog title="审核" :visible.sync="shopFormVisible" :close-on-click-modal="false">
			<el-form :model="shopForm" label-width="80px" :rules="shopFormRules" ref="shopForm">
        <el-form-item label="门店Logo:">
          <img :src="'http://121.37.194.36'+shopForm.logo" style="width: 80px;">
        </el-form-item>
				<el-form-item label="门店名称:">
					<el-input  v-model="shopForm.name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="门店电话:">
          <el-input v-model="shopForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="注册时间:">
<!--          <el-input v-model="shopForm.registerTime" auto-complete="off"></el-input>-->
          <el-date-picker
              v-model="shopForm.registerTime"
              type="date"
              placeholder="选择日期:">
          </el-date-picker>
        </el-form-item>
				<el-form-item label="状态:">
            <span v-if="shopForm.state == -1" style="color: green">禁用</span>
            <span v-if="shopForm.state == 0" style="color: green">正常</span>
            <span v-if="shopForm.state == 1" style="color: green">待审核</span>
            <span v-if="shopForm.state == 2" style="color: green">待激活</span>
				</el-form-item>
        <el-form-item label="门店地址:" prop="address">
          <el-input v-model="shopForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="管理员:" prop="admin_id">
          <el-input v-model="shopForm.admin_id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="审核操作:">
          <el-radio-group v-model="radio">
            <el-radio  :label="1">不通过</el-radio>
            <el-radio  :label="2">驳回</el-radio>
            <el-radio  :label="3">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核信息">
          <el-input type="textarea" :rows="2" v-model="shopForm.auditMsg"></el-input>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="shopFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="shopSubmit" :loading="shopLoading">提交</el-button>
			</div>
		</el-dialog>


	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	// import { getshopListPage, removeshop, batchRemoveshop, editshop, addshop } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
          keyWord: ''
				},
        radio:3,
				shops: [],
				total: 0,
				page: 1,
        pageSize: 10,
				listLoading: false,
				sels: [],//列表选中列

				shopFormVisible: false,//编辑界面是否显示
				shopLoading: false,
				shopFormRules: {
					name: [
						{ required: true, message: '请输入部门名称', trigger: 'blur' }
					],
          sn: [
            { required: true, message: '请输入部门描述', trigger: 'blur' }
          ]
				},
				//编辑界面数据
				shopForm: {
					id: null,
					name: '',
					tel:'',
          registerTime:null,
          state:0,
          address:'',
          logo:'',
          admin_id:null,
          type:0,
          auditMsg:''
        },


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        //console.log(newValue, oldValue);
        this.keyWord = newValue;
        this.getShops();
      },

    },
		methods: {

			handleCurrentChange(val) {
				this.page = val;
				this.getShops();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getShops();
      },
			//获取部门列表
			getShops() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize: this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/shop",para)
            .then(res=>{
              this.listLoading = false;
              //res = res.data;
              this.total = res.data.total;
              this.shops = res.data.rows;
            })
        .catch(res=>{
          alert("系统错误！！");
          this.listLoading = false;
        })
			},

			//显示审核界面
			handleEdit: function (index, row) {
				this.shopFormVisible = true;
				this.shopForm = Object.assign({}, row);
			},

			//审核
			shopSubmit: function () {
						this.$confirm('确认提交审核么吗？', '提示', {}).then(() => {
							this.shopLoading = true;
							//NProgress.start();
              this.shopForm.type = this.radio;
              this.$http.get("/shop/"+this.shopForm.id+"/"+this.shopForm.type+"/"+this.shopForm.auditMsg)
                  .then(result=>{
                    result = result.data;
                    if(result.success){//true
                      //this.$message.success(result.message);
                      this.page = 1;//定位第一页
                      this.getShops();//刷新页面
                      this.shopFormVisible = false;  //关闭模态框
                    }else{//false
                      this.$message.error(result.message);
                    }
                  })
                  .catch(result=>{
                    alert("系统错误！！！")
                  })
						});
			},

			selsChange: function (sels) {
				this.sels = sels;
			},
		},
		mounted() {
			this.getShops();
		}
	}

</script>

<style scoped>

</style>
<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getEmployees">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="employees" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="username" label="姓名" width="100" sortable>
			</el-table-column>
			<el-table-column prop="email" label="邮箱" width="180"  sortable>
			</el-table-column>
			<el-table-column prop="phone" label="电话" width="110"  sortable>
			</el-table-column>
      <el-table-column prop="password" label="密码"  sortable>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="100"  sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100" sortable>
        <template scope="scope">
          <span v-if="scope.row.state == 1" style="color: green">上班</span>
          <span v-else-if="scope.row.state == 0" style="color: green">休息</span>
          <span v-else="" style="color: green">未知</span>
        </template>
      </el-table-column>
			<el-table-column prop="department.name" label="所在部门" width="100" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="total,sizes,prev, pager, next" @current-change="handleCurrentChange" @size-change="handleSizeChange"
                     :current-page="page"
                     :page-size="pageSize"
                     :page-sizes="[5,10,15,20]"
                     :total="total"
                     style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑或添加界面-->
		<el-dialog title="添加或修改" :visible.sync="employeeFormVisible" :close-on-click-modal="false">
			<el-form :model="employeeForm" label-width="80px" :rules="employeeFormRules" ref="employeeForm">
				<el-form-item label="姓名" prop="username">
					<el-input v-model="employeeForm.username" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="employeeForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="employeeForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="employeeForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="employeeForm.age" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="state">
					<el-radio-group v-model="employeeForm.state">
						<el-radio class="radio" :label="1">上班</el-radio>
						<el-radio class="radio" :label="0">休息</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item label="部门" prop="department">
<!--          <el-input v-model="employeeForm.manager" auto-complete="off"></el-input>-->
          <el-select v-model="employeeForm.department" placeholder="请选择" value-key="id">
            <el-option
                v-for="item in departments"
                :key="item.id"
                :label="item.name"
                :value="item">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sn }}</span>
            </el-option>
          </el-select>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="employeeFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="employeeSubmit" :loading="employeeLoading">提交</el-button>
			</div>
		</el-dialog>


	</section>
</template>

<script>
	// import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	// import { getemployeeListPage, removeemployee, batchRemoveemployee, editemployee, addemployee } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
          keyWord: ''
				},
				employees: [],
				total: 0,
				page: 1,
        pageSize: 10,
        departments:[],
				listLoading: false,
				sels: [],//列表选中列

				employeeFormVisible: false,//编辑界面是否显示
				employeeLoading: false,
				employeeFormRules: {
					username: [
						{ required: true, message: '请输入员工姓名', trigger: 'blur' }
					],
          email: [
            { required: true, message: '请输入员工邮箱', trigger: 'blur' }
          ]
				},
				//编辑界面数据
				employeeForm: {
					id: null,
					username: '',
					email:'',
          phone:'',
          password:'',
          age:null,
          state:1,
          department:null
        },


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        //console.log(newValue, oldValue);
        this.keyWord = newValue;
        this.getEmployees();
      },

      /*filters:{//深度监听，可监听到对象、数组的变化
        handler(newVal, oldVal){
          console.log(newVal, oldVal);
        },
        deep:true //true 深度监听
      }*/
    },
		methods: {
			//性别显示转换state
			formatSex: function (row, column) {
				return row.state == 0 ? '启用' : row.state == -1 ? '禁用' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getEmployees();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getEmployees();
      },
			//获取部门列表
			getEmployees() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize:this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/employee",para)
            .then(res=>{
              this.listLoading = false;
              //res = res.data;
              this.total = res.data.total;
              this.employees = res.data.rows;
            })
        .catch(res=>{
          alert("系统错误！！");
          this.listLoading = false;
        })
			},

			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let url = "/employee/"+row.id
					this.$http.delete(url)
              .then(res=>{
                this.listLoading = false;
                res = res.data
                if(res.success){
                  this.page = 1;
                  this.$message({
                    message: res.msg,
                    type: 'success'
                  });
                }else {
                  this.$message({
                    message: res.msg,
                    type: 'error'
                  });
                }
                this.getEmployees();
              })
              .catch(res=>{
                alert("系统错误")
              })
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.employeeFormVisible = true;
        this.$refs['employeeForm'].resetFields();//重置表单校验
				this.employeeForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.employeeFormVisible = true;
				this.employeeForm = {
          id: null,
          username: '',
          email:'',
          phone:'',
          password:'',
          age:null,
          state:1,
          department:null
				};
			},
			//编辑或添加
			employeeSubmit: function () {
				this.$refs.employeeForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.employeeLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.employeeForm);
							// para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
              console.log(para)

              this.$http.put("/employee",para)
                  .then(result=>{
                    result = result.data;
                    if(result.success){
                      this.$message({
                        message: '提交成功',
                        type: 'success'
                      });
                    }else {
                      this.$message({
                        message: '提交失败',
                        type: 'error'
                      });
                    }
                    this.page=1
                    this.employeeLoading = false;
                    this.$refs['employeeForm'].resetFields();
                    this.employeeFormVisible = false;
                    this.getEmployees();
                  })
                  .catch(result=>{
                    alert("系统错误！！！")
                  })
						});
					}
				});
			},

			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id);
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					// let para = { ids: ids };
					// console.log(para)
					this.$http.patch("/employee", ids)
              .then(res=>{
                res = res.data;
                if(res.success){
                  this.$message({
                    message: res.msg,
                    type: 'success'
                  });
                }else{
                  this.$message({
                    message: res.msg,
                    type: 'error'
                  });
                }
                this.listLoading=false;
                this.page=1;
                this.getEmployees();
              })
              .catch(res=>{
                alert("系统错误！！！")
              })
				}).catch(() => {

				});
			},
      getDepartments(){
			  this.$http.get("/dept")
            .then(result=>{
              if(result){
                this.departments = result.data;
              }
            })
            .catch(result=>{
              alert("系统错误！！！")
            })
      }
		},
		mounted() {
			this.getEmployees();
			this.getDepartments();
		}
	}

</script>

<style scoped>

</style>
<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getDepartments">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="departments" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="name" label="部门名称" width="180" sortable>
			</el-table-column>
			<el-table-column prop="sn" label="部门描述" width="180"  sortable>
			</el-table-column>
			<el-table-column prop="dirPath" label="路径"  sortable>
			</el-table-column>
      <el-table-column prop="state" label="状态" width="180" sortable>
        <template scope="scope">
          <span v-if="scope.row.state == 0" style="color: green">启用</span>
          <span v-else-if="scope.row.state == -1" style="color: green">禁用</span>
          <span v-else="" style="color: green">未知</span>
        </template>
      </el-table-column>
			<el-table-column prop="manager.username" label="管理员" width="180" sortable>
			</el-table-column>
			<el-table-column prop="parent.name" label="父路径" width="180" sortable>
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
		<el-dialog title="添加或修改" :visible.sync="departmentFormVisible" :close-on-click-modal="false">
			<el-form :model="departmentForm" label-width="80px" :rules="departmentFormRules" ref="departmentForm">
				<el-form-item label="部门名称" prop="name">
					<el-input v-model="departmentForm.name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="部门标识" prop="sn">
          <el-input v-model="departmentForm.sn" auto-complete="off"></el-input>
        </el-form-item>
				<el-form-item label="state">
					<el-radio-group v-model="departmentForm.state">
						<el-radio class="radio" :label="0">启用</el-radio>
						<el-radio class="radio" :label="-1">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item label="管理员" prop="manager">
<!--          <el-input v-model="departmentForm.manager" auto-complete="off"></el-input>-->
          <el-select v-model="departmentForm.manager" placeholder="请选择" value-key="id">
            <el-option
                v-for="item in employees"
                :key="item.id"
                :label="item.username"
                :value="item">
              <span style="float: left">{{ item.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.email }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父部门" prop="parent">
<!--          <el-input v-model="departmentForm.parent" auto-complete="off"></el-input>-->
          <el-cascader
              v-model="departmentForm.parent"
              :options="deptTree"
              :props="{
                checkStrictly: true ,
                value:'id',
                label:'name',
              }"
              clearable></el-cascader>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="departmentFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="departmentSubmit" :loading="departmentLoading">提交</el-button>
			</div>
		</el-dialog>


	</section>
</template>

<script>
	// import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	// import { getdepartmentListPage, removedepartment, batchRemovedepartment, editdepartment, adddepartment } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
          keyWord: ''
				},
				departments: [],
        deptTree:[],
				total: 0,
				page: 1,
        pageSize: 10,
        employees:[],
				listLoading: false,
				sels: [],//列表选中列

				departmentFormVisible: false,//编辑界面是否显示
				departmentLoading: false,
				departmentFormRules: {
					name: [
						{ required: true, message: '请输入部门名称', trigger: 'blur' }
					],
          sn: [
            { required: true, message: '请输入部门描述', trigger: 'blur' }
          ]
				},
				//编辑界面数据
				departmentForm: {
					id: null,
					name: '',
					sn:'',
          state:0,
          manager:null,
          parent:null
        },


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        //console.log(newValue, oldValue);
        this.keyWord = newValue;
        this.getDepartments();
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
				this.getDepartments();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getDepartments();
      },
			//获取部门列表
			getDepartments() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize: this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/dept",para)
            .then(res=>{
              this.listLoading = false;
              //res = res.data;
              this.total = res.data.total;
              this.departments = res.data.rows;
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
					let url = "/dept/"+row.id
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
                this.getDepartments();
              })
              .catch(res=>{
                alert("系统错误")
              })
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.departmentFormVisible = true;
        this.$refs['departmentForm'].resetFields();//重置表单校验
				this.departmentForm = Object.assign({}, row);
        let arr = this.departmentForm.dirPath.split("/");
        let temp = [];
        for(let i=1;i<arr.length-1;i++){
          temp[i-1] = parseInt(arr[i]);
        }
        this.departmentForm.parent=temp;
				this.getDeptTree();
			},
			//显示新增界面
			handleAdd: function () {
				this.departmentFormVisible = true;
				this.departmentForm = {
				  id:null,
					name: '',
					sn:'',
          state:0,
          manager:null,
          parent:null
				};
				this.getDeptTree();
			},
			//编辑或添加
			departmentSubmit: function () {
				this.$refs.departmentForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.departmentLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.departmentForm);
							// para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');

              if(para.parent){
                let parent = {"id":para.parent[para.parent.length-1]}
                para.parent = parent;
              }
              this.$http.put("/dept",para)
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
                    this.departmentLoading = false;
                    this.$refs['departmentForm'].resetFields();
                    this.departmentFormVisible = false;
                    this.getDepartments();
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
					this.$http.patch("/dept", ids)
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
                this.getDepartments();
              })
              .catch(res=>{
                alert("系统错误！！！")
              })
				}).catch(() => {

				});
			},
      getEmployees(){
			  this.$http.get("/util/employee")
            .then(result=>{
              if(result){
                this.employees = result.data;
              }
            })
            .catch(result=>{
              alert("系统错误！！！")
            })
      },
      getDeptTree(){
        this.$http.get("/dept/deptTree")
            .then(result=>{
              if(result){
                this.deptTree = result.data;
              }
            })
            .catch(result=>{
              alert("系统错误！！！")
            })
      }
		},
		mounted() {
			this.getDepartments();
			this.getEmployees();
		}
	}

</script>

<style scoped>

</style>
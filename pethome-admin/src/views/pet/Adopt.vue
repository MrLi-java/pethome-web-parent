<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getAdopts">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="adopts" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
      <el-table-column prop="title" label="标题" width="150"></el-table-column>
      <el-table-column prop="name" label="宠物名称" width="80"></el-table-column>
      <el-table-column prop="price" label="价格" width="60"></el-table-column>
      <el-table-column prop="age" label="年龄" width="50"></el-table-column>
      <el-table-column prop="gender" label="性别" width="50" >
        <template scope="scope">
          <span v-if="scope.row.gender == 0" style="color: #11b95c">母</span>
          <span v-else style="color: #8c939d">公</span>
        </template>
      </el-table-column>
      <el-table-column prop="coatColor.name" label="毛色" width="50"></el-table-column>
      <el-table-column prop="petType.name" label="宠物类型" width="80"></el-table-column>
      <el-table-column prop="state" label="状态" width="100" >
        <template scope="scope">
          <span v-if="scope.row.state == 0" style="color: #11b95c">已处理</span>
          <span v-else style="color: #8c939d">待处理</span>
        </template>
      </el-table-column>
      <el-table-column prop="user.username" label="发布人" width="100"></el-table-column>
      <el-table-column prop="address" label="发布人地址" width="180"></el-table-column>
      <el-table-column label="操作" width="120">
        <template scope="scope">
          <el-button size="small" type="success" :disabled="scope.row.state==0" @click="handleEdit(scope.row)" icon="el-icon-edit">处理</el-button>
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

		<!--编辑或添加界面-->
		<el-dialog title="处理" :visible.sync="adoptFormVisible" :close-on-click-modal="false">
			<el-form :model="adoptForm" label-width="80px"  ref="adoptForm">
        <el-row>
          <el-col :span="24">
            <img :src="fastdfsHost+ adoptForm.resources.split(',')[0]" style="width: 100px;height: 100px;" />
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="标题">{{adoptForm.title}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宠物名称">{{adoptForm.name}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宠物类型">{{adoptForm.petType.name}}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="年龄">{{adoptForm.age}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别">{{adoptForm.gender}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格">{{adoptForm.price}}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="毛色">{{adoptForm.coatColor.name}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布人">{{adoptForm.user.username}}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="地址">{{adoptForm.address}}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处理结果">
              <el-radio-group v-model="handleResult">
                <el-radio :label="1">接受</el-radio>
                <el-radio :label="2">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="adoptFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="adoptSubmit" :loading="adoptLoading">提交</el-button>
			</div>
		</el-dialog>


	</section>
</template>

<script>


	export default {

		data() {
			return {
				filters: {
          keyWord: ''
				},
				adopts: [],
				total: 0,
				page: 1,
        pageSize: 10,
				listLoading: false,
				sels: [],//列表选中列
        fileList:[],
        adoptResource:[],
				adoptFormVisible: false,//编辑界面是否显示
				adoptLoading: false,

				//编辑界面数据
				adoptForm: {
          id: null,
          name: '',
          resources: '',
          state: 1,
          price:'',
          title:'',
          age: '',
          gender: '',
          address: '',
          petType:{
            id:'',
            name:''
          },
          user:{
            id:'',
            username:''
          },
          coatColor:{
            id:'',
            name:''
          }
        },
        handleResult:1


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        this.keyWord = newValue;
        this.getAdopts();
      },
    },
		methods: {

			handleCurrentChange(val) {
				this.page = val;
				this.getAdopts();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getAdopts();
      },
			//获取商品列表
			getAdopts() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize:this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/adopt",para)
            .then(res=>{
              this.listLoading = false;
              this.total = res.data.total;
              this.adopts = res.data.rows;
            })
        .catch(res=>{
          alert("系统错误！！");
          this.listLoading = false;
        })
			},


			//显示编辑界面
			handleEdit: function (row) {
        //先清空fileList
        this.fileList = []
        //先重置表单
        this.adoptForm = {
          id: null,
          name: '',
          resources: '',
          state: 1,
          price:'',
          title:'',
          age: '',
          gender: '',
          address: '',
          petType:{
            id:'',
            name:''
          },
          user:{
            id:'',
            username:''
          },
          coatColor:{
            id:'',
            name:''
          }
        }
        this.adoptFormVisible = true;//弹出编辑框
        //Object.assign  克隆数据
        this.adoptForm = Object.assign({}, row);//数据回显
			},

			//编辑或添加
			adoptSubmit: function () {
				this.$refs.adoptForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.adoptLoading = true;


              this.$http.get("/pet/"+this.adoptForm.id+"/"+this.handleResult)
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
                    this.adoptLoading = false;
                    this.$refs['adoptForm'].resetFields();
                    this.adoptFormVisible = false;
                    this.getAdopts();
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


		},
		mounted() {
			this.getAdopts();
		}
	}

</script>

<style>
  .el-dialog{width: 70%;}
  .ql-editor{height: 100px!important;}
</style>
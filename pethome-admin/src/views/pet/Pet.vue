<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getPets">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onsale">上架</el-button>
          <el-button type="primary" @click="offsale">下架</el-button>
        </el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="pets" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
      <el-table-column prop="name" label="宠物名称" width="160" sortable>
      </el-table-column>
      <el-table-column prop="petType.name" label="宠物类型" width="80">
      </el-table-column>
      <el-table-column prop="coatColor.name" label="宠物毛发" width="80">
      </el-table-column>
      <el-table-column prop="costprice" label="成本价" width="100" sortable>
      </el-table-column>
      <el-table-column prop="saleprice" label="销售价" width="100" sortable>
      </el-table-column>
      <el-table-column prop="offsaletime" label="下架时间" width="120" sortable>
      </el-table-column>
      <el-table-column prop="onsaletime" label="上架时间" width="120" sortable>
      </el-table-column>
      <el-table-column prop="user.username" label="购买人" width="120" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80"  sortable>
        <template scope="scope">
          <span v-if="scope.row.state == 0" style="color: #11b95c">已上架</span>
          <span v-else style="color: #8c939d">已下架</span>
        </template>
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
			<el-pagination layout="total,sizes,prev, pager, next" @current-change="handleCurrentChange" @size-change="handleSizeChange"
                     :current-page="page"
                     :page-size="pageSize"
                     :page-sizes="[5,10,15,20]"
                     :total="total"
                     style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑或添加界面-->
		<el-dialog title="添加或修改" :visible.sync="petFormVisible" :close-on-click-modal="false">
			<el-form :model="petForm" label-width="80px" :rules="petFormRules" ref="petForm">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="name">
              <el-input v-model="petForm.name" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宠物类型" prop="name">
<!--              <el-input v-model="petForm.petType.name" size="mini" auto-complete="off"></el-input>-->
              <el-select v-model="petForm.petType.name" value-key="id" placeholder="请选择">
                <el-option
                    v-for="item in pet_types"
                    :key="item.id"
                    :label="item.name"
                    :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="成本价" prop="costprice">
              <el-input v-model="petForm.costprice" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零售价" prop="saleprice">
              <el-input v-model="petForm.saleprice" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="资源" prop="resources">
          <!--<el-input v-model="petsForm.resources" size="mini" auto-complete="off"></el-input>-->
          <el-upload
              class="upload-demo"
              action="http://localhost:8080/fastdfs/upload"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="fileList"
              list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>


			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="petFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="petSubmit" :loading="petLoading">提交</el-button>
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
				pets: [],
				total: 0,
				page: 1,
        pageSize: 10,
        shops:[],
				listLoading: false,
				sels: [],//列表选中列
        fileList:[],
        petResource:[],
				petFormVisible: false,//编辑界面是否显示
				petLoading: false,
        pet_types:[],
				petFormRules: {
					username: [
						{ required: true, message: '请输入员工姓名', trigger: 'blur' }
					],
          email: [
            { required: true, message: '请输入员工邮箱', trigger: 'blur' }
          ]
				},
				//编辑界面数据
				petForm: {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          offsaletime:'',
          onsaletime:'',
          createtime:'',
          petType:{
            id:null,
            name:''
          },
          user:{
            id:null,
            username:''
          }
        },


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        this.keyWord = newValue;
        this.getPets();
      },
    },
		methods: {

			handleCurrentChange(val) {
				this.page = val;
				this.getPets();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getPets();
      },
			//获取商品列表
			getPets() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize:this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/pet",para)
            .then(res=>{
              this.listLoading = false;
              this.total = res.data.total;
              this.pets = res.data.rows;
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

          let imgs = row.resources.split(",")
          for(let i=0 ;i<imgs.length;i++){
            this.$http.delete("/fastdfs/delete/?path="+imgs[i])
                .then(res=>{
                  if(res.data.success){
                    this.$message({
                      message: '删除成功!',
                      type: 'success'
                    });
                  }else{
                    this.$message({
                      message: '删除失败!',
                      type: 'error'
                    });
                  }
                })
          }
					this.listLoading = true;
					//NProgress.start();
					let url = "/pet/"+row.id
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
                this.getPets();
              })
              .catch(res=>{
                alert("系统错误")
              })
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
        //先清空fileList
        this.fileList = []
        //先重置表单
        this.petForm = {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          offsaletime:'',
          onsaletime:'',
          createtime:'',
          petType:{
            id:null,
            name:''
          },
          user:{
            id:null,
            username:''
          }
        }
        this.petFormVisible = true;//弹出编辑框
        //Object.assign  克隆数据
        this.petForm = Object.assign({}, row);//数据回显
        //回填el-upload组件的图片
        //先以逗号分隔字符串
        let imgUrls = row.resources.split(",");
        for(let i=0;i<imgUrls.length;i++){
          //获取图片名称：最后一个斜杠后面的内容
          let name = imgUrls[i].substring(imgUrls[i].lastIndexOf("/") + 1)
          let url = "http://121.37.194.36" + imgUrls[i]
          this.fileList.push({
            name,
            url
          })
        }
			},
			//显示新增界面
			handleAdd: function () {
				this.petFormVisible = true;
        this.fileList = []
				this.petForm = {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          offsaletime:'',
          onsaletime:'',
          createtime:'',
          petType:{
            id:null,
            name:''
          },
          user:{
            id:null,
            username:''
          }
				};
			},
			//编辑或添加
			petSubmit: function () {
				this.$refs.petForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.petLoading = true;
							let para = Object.assign({}, this.petForm);

              this.$http.put("/pet",para)
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
                    this.petLoading = false;
                    this.$refs['petForm'].resetFields();
                    this.petFormVisible = false;
                    this.getPets();
                  })
                  .catch(result=>{
                    alert("系统错误！！！")
                  })
						});
					}
				});
			},
      handleSuccess(response, file, fileList){
        this.petResource.push(response.data)
        this.petForm.resources = this.petResource.join(",")
      },
      handleRemove(file, fileList){
        let filePath =file.response.data;
        alert(filePath)
        this.$http.delete("/fastdfs/delete/?path="+filePath)
            .then(res=>{
              if(res.data.success){
                this.$message({
                  message: '删除成功!',
                  type: 'success'
                });
              }else{
                this.$message({
                  message: '删除失败!',
                  type: 'error'
                });
              }
            })
      },

			selsChange: function (sels) {
				this.sels = sels;
			},

      onsale(){

        let ids = this.sels.map(item => item.id);
        let states = this.sels.map(item => item.state)
        if(!this.sels || this.sels.length  <1){
          this.$message({ message: '您没有选中宠物....',type: 'error'});
          return;
        }
        states.forEach(item => {
          if(item===0){
            this.$message({ message: '您选中的宠物有已经上架的，不能重复上架....',type: 'error'});
            return ;
          }
        })
        this.$http.patch("/pet/onsale",ids).then(res=>{
          let {success,msg} = res.data;
          if(success){
            this.page = 1;
            this.getPets();
            this.$message.success("上架成功");
          }else {
            alert(msg);
          }
        }).catch(res=>{
          alert("系统错误！！！");
        })

      },

      offsale(){
        var ids = this.sels.map(item => item.id);
        if(!this.sels || this.sels.length  <1){
          this.$message({ message: '您没有选中商品....',type: 'error'});
          return;
        }
        this.$http.patch("/pet/offsale",ids).then(res=>{
          let {success,msg} = res.data;
          if(success){
            this.page = 1;
            this.getPets();
            this.$message.success("下架成功");
          }else {
            alert(msg);
          }
        }).catch(res=>{
          alert("系统错误！！！");
        })
      },
      loadPetType(){
        this.$http.get("/pettype").then(res=>{
          this.pet_types = res.data;
        })
      },


		},
		mounted() {
			this.getPets();
			this.loadPetType()
		}
	}

</script>

<style>
  .el-dialog{width: 70%;}
  .ql-editor{height: 100px!important;}
</style>
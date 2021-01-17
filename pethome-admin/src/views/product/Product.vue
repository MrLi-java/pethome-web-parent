<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model.trim="filters.keyWord" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getProducts">查询</el-button>
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
		<el-table :data="products" :height="350"  highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
      <el-table-column prop="name" label="商品名称" width="160" sortable>
      </el-table-column>
      <el-table-column prop="costprice" label="成本价" width="100" sortable>
      </el-table-column>
      <el-table-column prop="saleprice" label="零售价" width="100" sortable>
      </el-table-column>
      <el-table-column prop="offsaletime" label="下架时间" width="120" sortable>
      </el-table-column>
      <el-table-column prop="onsaletime" label="上架时间" width="120" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80"  sortable>
        <template scope="scope">
          <span v-if="scope.row.state == 0" style="color: #11b95c">已上架</span>
          <span v-else style="color: #8c939d">已下架</span>
        </template>
      </el-table-column>
      <el-table-column prop="salecount" label="销量" width="80" sortable>
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
		<el-dialog title="添加或修改" :visible.sync="productFormVisible" :close-on-click-modal="false">
			<el-form :model="productForm" label-width="80px" :rules="productFormRules" ref="productForm">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="productForm.name" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成本价" prop="costprice">
              <el-input v-model="productForm.costprice" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="零售价" prop="saleprice">
              <el-input v-model="productForm.saleprice" size="mini" auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="资源" prop="resources">
          <!--<el-input v-model="productsForm.resources" size="mini" auto-complete="off"></el-input>-->
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
        <el-form-item label="商品简介" prop="intro">
          <!--<el-input v-model="productsForm.productDetail.intro" size="mini" auto-complete="off"></el-input>-->
          <quill-editor v-model="productForm.productDetail.intro" :options="quillConfig"></quill-editor>
        </el-form-item>
        <el-form-item label="下单须知" prop="orderNotice">
          <!--<el-input v-model="productsForm.productDetail.orderNotice" size="mini" auto-complete="off"></el-input>-->
          <quill-editor v-model="productForm.productDetail.orderNotice" :options="quillConfig"></quill-editor>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="productFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="productSubmit" :loading="productLoading">提交</el-button>
			</div>
		</el-dialog>


	</section>
</template>

<script>
	// import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	// import { getproductListPage, removeproduct, batchRemoveproduct, editproduct, addproduct } from '../../api/api';
  import { quillEditor } from "vue-quill-editor"; //调用编辑器
  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';
  import 'quill/dist/quill.bubble.css';
  import quillConfig from '../../common/js/quill-config';

	export default {
    components: {	//自定义局部组件
      quillEditor //ES6语法：json对象属性名称与属性值的变量名称一致的时候，可以省略冒号及后面内容
    },
		data() {
			return {
        quillConfig:quillConfig,	//自定义组件属性
				filters: {
          keyWord: ''
				},
				products: [],
				total: 0,
				page: 1,
        pageSize: 10,
        shops:[],
				listLoading: false,
				sels: [],//列表选中列
        fileList:[],
        productResource:[],
				productFormVisible: false,//编辑界面是否显示
				productLoading: false,
				productFormRules: {
					username: [
						{ required: true, message: '请输入员工姓名', trigger: 'blur' }
					],
          email: [
            { required: true, message: '请输入员工邮箱', trigger: 'blur' }
          ]
				},
				//编辑界面数据
				productForm: {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          productDetail:{
            intro:'',
            orderNotice:''
          }
        },


			}
		},
    watch:{
		  "filters.keyWord"(newValue, oldValue){
        this.keyWord = newValue;
        this.getProducts();
      },
    },
		methods: {

			handleCurrentChange(val) {
				this.page = val;
				this.getProducts();
			},
      handleSizeChange(val){
			  this.pageSize = val;
			  this.getProducts();
      },
			//获取商品列表
			getProducts() {
				let para = {
					currentPage: this.page,
          keyWord: this.filters.keyWord,
          pageSize:this.pageSize
				};
				this.listLoading = true;
				this.$http.post("/product",para)
            .then(res=>{
              this.listLoading = false;
              this.total = res.data.total;
              this.products = res.data.rows;
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
					let url = "/product/"+row.id
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
                this.getProducts();
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
        this.productForm = {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          productDetail:{
            intro:'',
            orderNotice:''
          }
        }
        this.productFormVisible = true;//弹出编辑框
        //Object.assign  克隆数据
        this.productForm = Object.assign({}, row);//数据回显
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
				this.productFormVisible = true;
				this.productForm = {
          id: null,
          name: '',
          resources: '',
          state: -1,
          costprice:'',
          saleprice:'',
          salecount: 0,
          productDetail:{
            intro:'',
            orderNotice:''
          }
				};
			},
			//编辑或添加
			productSubmit: function () {
				this.$refs.productForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.productLoading = true;
							let para = Object.assign({}, this.productForm);

              this.$http.put("/product",para)
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
                    this.productLoading = false;
                    this.$refs['productForm'].resetFields();
                    this.productFormVisible = false;
                    this.getProducts();
                  })
                  .catch(result=>{
                    alert("系统错误！！！")
                  })
						});
					}
				});
			},
      handleSuccess(response, file, fileList){
        this.productResource.push(response.data)
        this.productForm.resources = this.productResource.join(",")
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
			  alert(this.sels)
        var ids = this.sels.map(item => item.id);
        if(!this.sels || this.sels.length  <1){
          this.$message({ message: '您没有选中商品....',type: 'error'});
          return;
        }
        this.$http.patch("/product/onsale",ids).then(res=>{
          let {success,msg} = res.data;
          if(success){
            this.page = 1;
            this.getProducts();
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
        this.$http.patch("/product/offsale",ids).then(res=>{
          let {success,msg} = res.data;
          if(success){
            this.page = 1;
            this.getProducts();
            this.$message.success("下架成功");
          }else {
            alert(msg);
          }
        }).catch(res=>{
          alert("系统错误！！！");
        })
      }


		},
		mounted() {
			this.getProducts();
		}
	}

</script>

<style>
  .el-dialog{width: 70%;}
  .ql-editor{height: 100px!important;}
</style>
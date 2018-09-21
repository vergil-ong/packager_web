<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="patch名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getPatches">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="patches" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="patch_type" label="patch类型" width="140" sortable>
			</el-table-column>
			<el-table-column prop="patch_name" label="patch名称" sortable>
			</el-table-column>
			<el-table-column prop="patch_version" label="patch版本" width="250" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="props">
					<el-button size="small" @click="handleEdit(props.$index, props.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(props.$index, props.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="pach类型" prop="patch_type">
					<el-select v-model="editForm.patch_type" placeholder="请选择" @change="completePatchName(1)">
						<el-option
								v-for="item in patchTypeOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="patch版本">
					<el-input v-model="editForm.patch_version" @change="completePatchName(0)"></el-input>
				</el-form-item>
				<el-form-item label="patch名称">
					<el-input v-model="editForm.patch_name"></el-input>
				</el-form-item>
				<el-form-item label="META-INF">
					<el-input class="meta-textarea" :autosize="true" type="textarea" v-model="editForm.meta"></el-input>
				</el-form-item>
				<el-form-item label="patch脚本">
					<el-input type="textarea" v-model="editForm.patch_shell"></el-input>
				</el-form-item>
				<el-button type="primary" @click="addUser">添加文件</el-button>
				<div class="moreRules">
					<div class="moreRulesIn" v-for="(item, index) in ruleForm.moreNotifyObject" :key="item.key">
						<el-form-item class="rules"
									  label="文件:"
						>
							<!--<el-input v-model="item.notifyobject" placeholder="请输入文件" :disabled="isReadonly" class="el-select_box"></el-input>-->
							<el-upload
									class="upload-demo"
									action="https://jsonplaceholder.typicode.com/posts/"
									:on-preview="handlePreview"
									:on-remove="handleRemove"
									:before-remove="beforeRemove"
									multiple
									:on-exceed="handleExceed"
									:file-list="item.fileList">
								<el-button size="small" type="primary">点击上传</el-button>
								<!--<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
							</el-upload>
						</el-form-item>

						<el-form-item class="rules"
									  label="文件路径:"
						>
							<el-input v-model="item.email" placeholder="请输入文件路径" :disabled="isReadonly" class="el-select_box"></el-input>
						</el-form-item>
						<el-button @click="deleteRules(item, index)" :disabled="isReadonly">删除</el-button>
					</div>
				</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="pach类型" prop="patch_type">
					<el-select v-model="addForm.patch_type" placeholder="请选择" @change="completePatchName(0)">
						<el-option
								v-for="item in patchTypeOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="patch版本">
					<el-input v-model="addForm.patch_version" @change="completePatchName(0)"></el-input>
				</el-form-item>
				<el-form-item label="patch名称">
					<el-input v-model="addForm.patch_name"></el-input>
				</el-form-item>
				<el-form-item label="META-INF">
					<el-input class="meta-textarea" :autosize="true" type="textarea" v-model="addForm.meta"></el-input>
				</el-form-item>
				<el-form-item label="patch脚本">
					<el-input type="textarea" v-model="addForm.patch_shell"></el-input>
				</el-form-item>
				<el-button type="primary" @click="addUser">添加文件</el-button>
				<div class="moreRules">
					<div class="moreRulesIn" v-for="(item, index) in ruleForm.moreNotifyObject" :key="item.key">
						<el-form-item class="rules"
									  label="文件:"
									  >
							<!--<el-input v-model="item.notifyobject" placeholder="请输入文件" :disabled="isReadonly" class="el-select_box"></el-input>-->
							<el-upload
									class="upload-demo"
									action="https://jsonplaceholder.typicode.com/posts/"
									:on-preview="handlePreview"
									:on-remove="handleRemove"
									:before-remove="beforeRemove"
									multiple
									:on-exceed="handleExceed"
									:file-list="item.fileList">
								<el-button size="small" type="primary">点击上传</el-button>
								<!--<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
							</el-upload>
						</el-form-item>

						<el-form-item class="rules"
									  label="文件路径:"
									  >
							<el-input v-model="item.email" placeholder="请输入文件路径" :disabled="isReadonly" class="el-select_box"></el-input>
						</el-form-item>
						<el-button @click="deleteRules(item, index)" :disabled="isReadonly">删除</el-button>
					</div>
				</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>
<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import { getPatchListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';


    export default {
        data() {
            return {
                isReadonly:false,
                ruleForm:{
                    moreNotifyObject: [{
                        fileList: [],
                        email: ''
                    }]
                },
                filters: {
                    name: ''
                },
                patches: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    patch_name: '',
                    patch_version: '',
                    patch_type: '',
                    meta:'',
                    patch_shell:'',
                    moreNotifyObject: [{
                        fileList: [],
                        email: ''
                    }]
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                addForm: {
                    patch_name: '',
                    patch_version: '5.0.0.0',
                    patch_type: '',
                    meta:'',
					patch_shell:'!/bin/shell',
                    moreNotifyObject: [{
                        fileList: [],
                        email: ''
                    }]
                },
				patchTypeOptions:[{
                    value:'application',
					label:'application'
				},{
                    value:'ad',
                    label:'ad'
                },{
                    value:'database',
                    label:'database'
                },{
                    value:'datacenter',
                    label:'datacenter'
                },{
                    value:'queue',
                    label:'queue'
                },{
                    value:'search',
                    label:'search'
                },{
                    value:'vedio',
                    label:'vedio'
                }]
            }
        },
        methods: {
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getPatches();
            },
            //获取用户列表
            getPatches() {
                let para = {
                    page: this.page,
                    name: this.filters.name
                };
                this.listLoading = true;
                //NProgress.start();
                getPatchListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.patches = res.data.patches;
                    this.listLoading = false;
                    //NProgress.done();
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { id: row.id };
                    removeUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getPatches();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    patch_name: '',
                    patch_version: '5.0.0.0',
                    patch_type: '',
                    meta:'',
                    patch_shell:'#!/bin/bash\n/bin/cp -rpf ./dir/* /'
                };
                this.ruleForm.moreNotifyObject = [];
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    patch_name: '',
                    patch_version: '5.0.0.0',
                    patch_type: '',
					 meta:'',
                    patch_shell:'#!/bin/bash\n/bin/cp -rpf ./dir/* /'
                };
                this.ruleForm.moreNotifyObject = [];
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            editUser(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getPatches();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            addUser(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getPatches();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { ids: ids };
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getPatches();
                    });
                }).catch(() => {

                });
            },
			//自动补全 0：新增 1：编辑
            completePatchName:function (complete_type) {
                if (complete_type == 0) {
                    let current_timestamp = util.formatDate.format(new Date(), 'yyyyMMddhhmmss');
                    let current_patch_name = 'patch-'+ this.addForm.patch_type + '-' + this.addForm.patch_version + '-' + current_timestamp;
                    this.addForm.patch_name = current_patch_name + '.tgz';
                    // let patch_meta_str = 'patch-name:'+current_patch_name+'\n';
                    let patch_meta_str = '';
                    patch_meta_str += 'Patch-Version:'+current_timestamp+'\n';
                    patch_meta_str += 'For-Version:'+this.addForm.patch_version+'\n';
                    patch_meta_str += 'Depends-Patch:\n';
                    patch_meta_str += 'Created-By:wangshuo\n';
                    patch_meta_str += 'Patch-Description:\n';
                    this.addForm.meta = patch_meta_str;
                } else if (complete_type && complete_type == 1) {
                    let current_timestamp = util.formatDate.format(new Date(), 'yyyyMMddhhmmss');
                    let current_patch_name = 'patch-'+ this.editForm.patch_type + '-' + this.editForm.patch_version + '-' + current_timestamp;
                    this.editForm.patch_name = current_patch_name + '.tgz';
                    // let patch_meta_str = 'patch-name:'+current_patch_name+'\n';
                    let patch_meta_str = '';
                    patch_meta_str += 'Patch-Version:'+current_timestamp+'\n';
                    patch_meta_str += 'For-Version:'+this.editForm.patch_version+'\n';
                    patch_meta_str += 'Depends-Patch:\n';
                    patch_meta_str += 'Created-By:wangshuo\n';
                    patch_meta_str += 'Patch-Description:\n';
                    this.editForm.meta = patch_meta_str;
                }
            },
            addUser() {
                this.ruleForm.moreNotifyObject.push({
                    fileList: [],
                    email: ''
                })
            },
            deleteRules(item, index) {
                this.index = this.ruleForm.moreNotifyObject.indexOf(item)
                if (index !== -1) {
                    this.ruleForm.moreNotifyObject.splice(index, 1)
                }
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${ file.name }？`);
            }
        },
        mounted() {
            this.getPatches();
            this.ruleForm.moreNotifyObject = []
        }
    }

</script>

<style scoped>
.meta-textarea{
	/*height: 100px;*/
}
</style>

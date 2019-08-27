<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
    <el-table v-loading="listLoading" :data="users" style="width: 100%" border highlight-current-row>
      <el-table-column prop="id" label="用户id"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="name" label="昵称"></el-table-column>
      <el-table-column label="角色">
        <template slot-scope="scope">
          <el-tag v-for="role in scope.row.roleList" :key="role.rid" style="margin: 2px;">{{ role.rname }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="updated_at" label="更新时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button circle plain size="medium" type="danger" icon="el-icon-delete" @click="handleDelete(scope.$index,scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination :page="page"></pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px">
        <el-form-item v-if="dialogStatus=='create'" label="用户名" prop="username">
          <el-input v-model="temp.username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password_confirmation">
          <el-input v-model="temp.password_confirmation" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roles" multiple placeholder="选择角色" filterable clearable>
            <el-option v-for="role of roleOptions" :key="role.id" :label="role.name" :value="role.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog></div>
</template>

<script>
import { getUsers, addUser, updateUser } from '@/api/user'
import { getRoles } from '@/api/role'
import Pagination from '@/components/Pagination'
import { resetTemp } from '@/utils'

export default {
  name: 'User',
  components: {
    Pagination
  },
  data() {
    const validateName = (rule, value, callback) => {
      if (this.dialogStatus === 'create' && value === '') {
        callback(new Error('必填'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.password !== '') {
          this.$refs.dataForm.validateField('password_confirmation')
        }
        callback()
      }
    }
    const validatePasswordConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.temp.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      users: [],
      page: {},
      listLoading: false,
      dialogFormVisible: false,
      editRolesDialogVisible: false,
      dialogStatus: '',
      temp: {
        idx: null, // tableData中的下标
        id: null,
        username: null,
        name: null,
        password: null,
        password_confirmation: null,
        roles: []
      },
      textMap: {
        update: '编辑用户',
        create: '新增用户'
      },
      rules: {
        uname: [{ validator: validateName, trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        password_confirmation: [{ validator: validatePasswordConfirm, trigger: 'change' }]
      },
      checkAll: false,
      isIndeterminate: true,
      // 所有角色(管理员除外)
      roleOptions: [],
      roleMap: new Map(),
      // 更新用户的角色的数据
      updateUserRolesData: {
        idx: null,
        uid: null,
        rids: []
      }
    }
  },
  watch: {
    $route: {
      async handler(newVal) {
        this.listLoading = true
        console.log(newVal.query)
        const { data, meta } = await getUsers(newVal.query)
        this.users = data
        this.page = meta
        this.listLoading = false
      },
      immediate: true
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      const { data } = await getRoles({ all: 1 })
      this.roleOptions = data
    },
    // 新增
    handleCreate() {
      resetTemp(this.temp)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        addUser(this.temp).then((res) => {
          const { data } = res
          this.temp.id = data.id// 后台传回来新增记录的id
          this.temp.created_at = data.created_at// 后台传回来新增记录的时间
          this.temp.updated_at = data.updated_at
          this.temp.roles = []
          this.users.unshift(Object.assign({}, this.temp))
          ++this.page.total
          this.dialogFormVisible = false
          this.$message.success('添加成功')
        })
      })
    },
    handleUpdate(idx, row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.idx = idx
      this.temp.password = null
      this.temp.password_confirmation = null
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const tempData = Object.assign({}, this.temp)// copy obj
        updateUser(tempData.id, tempData).then(res => {
          const { data } = res
          tempData.updated_at = data.updated_at
          this.users.splice(tempData.idx, 1, tempData)
          this.dialogFormVisible = false
          this.$message.success('更新成功')
        })
      })
    }
  }
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style>>

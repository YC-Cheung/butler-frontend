<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
    <el-table v-loading="listLoading" :data="users" style="width: 100%" border highlight-current-row>
      <el-table-column prop="id" label="用户id"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="name" label="昵称"></el-table-column>
      <el-table-column label="角色">
        <template slot-scope="scope">
          <el-tag v-for="roleId in scope.row.roles" :key="roleId" style="margin: 2px;">{{ roleMap.get(roleId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="updated_at" label="更新时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button circle plain size="medium" type="info" icon="el-icon-edit" @click="handleUpdate(scope.$index,scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button circle plain size="medium" type="danger" icon="el-icon-delete" @click="handleDelete(scope.$index,scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination :page="page"></pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px">
        <el-form-item v-if="dialogStatus=='create'" label="用户名" prop="username">
          <el-input v-model="temp.username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" :class="{ 'is-required': passwordRequired }">
          <el-input v-model="temp.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password_confirmation" :class="{ 'is-required': passwordRequired }">
          <el-input v-model="temp.password_confirmation" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roles" multiple placeholder="选择角色" filterable clearable>
            <el-option v-for="option of roleOptions" :key="option.id" :label="option.name" :value="option.id"></el-option>
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
import { getUsers, addUser, updateUser, deleteUser } from '@/api/user'
import { getRoleOptions } from '@/api/role'
import Pagination from '@/components/Pagination'
import { resetTemp } from '@/utils'

export default {
  name: 'SystemUser',
  components: {
    Pagination
  },
  data() {
    const validateName = (rule, value, callback) => {
      if (this.dialogStatus === 'create' && !value) {
        callback(new Error('必填'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (this.passwordRequired && !value) {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.password !== '') {
          this.$refs.dataForm.validateField('password_confirmation')
        }
        callback()
      }
    }
    const validatePasswordConfirm = (rule, value, callback) => {
      if (this.passwordRequired && !value) {
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
        username: '',
        name: '',
        password: null,
        password_confirmation: null,
        roles: []
      },
      textMap: {
        update: '编辑用户',
        create: '新增用户'
      },
      rules: {
        username: [{ required: true, validator: validateName, trigger: 'blur' }],
        name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        password: [{ required: this.dialogStatus === 'create', validator: validatePassword, trigger: 'blur' }],
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
  computed: {
    passwordRequired() {
      return this.dialogStatus === 'create'
    }
  },
  watch: {
    $route: {
      async handler(newVal) {
        this.listLoading = true
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
      const { data } = await getRoleOptions()
      data.forEach(obj => {
        this.roleOptions.push(obj)
        this.roleMap.set(obj.id, obj.name)
      })
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
          this.temp.id = data.id
          this.temp.created_at = data.created_at
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
      this.temp = Object.assign({}, row)
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
        const tempData = Object.assign({}, this.temp)
        const { updateId, updateData } = this.getUpdateData(this.temp)
        updateUser(updateId, updateData).then(res => {
          const { data } = res
          tempData.updated_at = data.updated_at
          this.users.splice(tempData.idx, 1, tempData)
          this.dialogFormVisible = false
          this.$message.success('更新成功')
        })
      })
    },
    handleDelete(idx, row) {
      this.$confirm('您确定要永久删除该用户？', '提示', confirm).then(() => {
        deleteUser(row.id).then(res => {
          this.users.splice(idx, 1)
          --this.page.total
          this.dialogFormVisible = false
          this.$message.success('删除成功')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    getUpdateData(temp) {
      const tempData = Object.assign({}, temp)
      const updateId = tempData.id
      const updateData = {
        name: tempData.name,
        password: tempData.password,
        password_confirmation: tempData.password_confirmation,
        roles: tempData.roles
      }

      return { updateId, updateData }
    }
  }
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style>>

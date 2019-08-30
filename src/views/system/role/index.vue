<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
    <el-table v-loading="listLoading" :data="items" style="width: 100%" border highlight-current-row>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="角色名称"></el-table-column>
      <el-table-column prop="slug" label="标识"></el-table-column>
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
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"></el-input>
        </el-form-item>
        <el-form-item label="标识" prop="slug">
          <el-input v-model="temp.slug"></el-input>
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
import { getRoles, addRole, updateRole, deleteRole } from '@/api/role'
import Pagination from '@/components/Pagination'
import { resetTemp } from '@/utils'

export default {
  name: 'SystemRole',
  components: {
    Pagination
  },
  data() {
    return {
      items: [],
      page: {},
      listLoading: false,
      dialogFormVisible: false,
      editRolesDialogVisible: false,
      dialogStatus: '',
      temp: {
        idx: null, // tableData中的下标
        id: null,
        slug: null,
        name: null
      },
      textMap: {
        update: '编辑角色',
        create: '新增角色'
      },
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        slug: [{ required: true, message: '请输入唯一标识', trigger: 'blur' }]
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
    }
  },
  watch: {
    $route: {
      async handler(newVal) {
        this.listLoading = true
        const { data, meta } = await getRoles(newVal.query)
        this.items = data
        this.page = meta
        this.listLoading = false
      },
      immediate: true
    }
  },
  created() {
    // this.initData()
  },
  methods: {
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
        addRole(this.temp).then((res) => {
          const { data } = res
          this.temp.id = data.id
          this.temp.created_at = data.created_at
          this.temp.updated_at = data.updated_at
          this.items.unshift(Object.assign({}, this.temp))
          ++this.page.total
          this.dialogFormVisible = false
          this.$message.success('添加成功')
        })
      })
    },
    handleUpdate(idx, row) {
      this.temp = Object.assign({}, row)
      this.temp.idx = idx
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const tempData = Object.assign({}, this.temp)
        const { updateId, updateData } = this.getUpdateData(this.temp)
        updateRole(updateId, updateData).then(res => {
          const { data } = res
          tempData.updated_at = data.updated_at
          this.items.splice(tempData.idx, 1, tempData)
          this.dialogFormVisible = false
          this.$message.success('更新成功')
        })
      })
    },
    handleDelete(idx, row) {
      this.$confirm('您确定要永久删除该权限？', '提示', confirm).then(() => {
        deleteRole(row.id).then(res => {
          this.items.splice(idx, 1)
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
        slug: tempData.slug
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

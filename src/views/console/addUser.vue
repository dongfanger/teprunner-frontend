<template>
  <div class="page-wrap">
    <el-dialog :title="dialogTitle" :visible="visible" width="600px" :close-on-click-modal="false" @close="onResetForm">
      <el-form :model="userForm" ref="userFormRef" label-width="100px" :rules="rules" class="form-common">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" class="input-380"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" class="input-380"></el-input>
        </el-form-item>
        <template v-if="!id">
          <el-form-item label="设置密码" prop="isDefault" style="margin-bottom: 10px;">
            <el-radio-group v-model="userForm.isDefault">
              <el-radio :label="true">默认</el-radio>
              <el-radio :label="false">自定义密码</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="!userForm.isDefault">
            <el-form-item prop="password">
              <el-input v-model.trim="userForm.password" :show-password="true" placeholder="请输入密码" class="input-380"
                @input="clearChinese($event, 'password')" />
            </el-form-item>
            <el-form-item prop="confirmPWD">
              <el-input v-model.trim="userForm.confirmPWD" :show-password="true" placeholder="请再次输入密码"
                class="input-380" />
            </el-form-item>
          </template>
        </template>
        <el-form-item class="has-avatar" label="关联角色" prop="roleNames">
          <div v-if="userForm.roleNames.length" class="role-list">
            <el-tag :key="index" v-for="(item, index) in userForm.roleNames" closable :disable-transitions="false"
              @close="delRole(userForm.roleNames, index)">
              <span class="tag-name">{{ item.name }}</span>
            </el-tag>
          </div>
          <el-button icon="el-icon-plus" @click="rolePanelVisible = true">选择角色</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onResetForm">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isLoading">确 定</el-button>
      </div>
    </el-dialog>

    <selection-panel title="选择关联角色" :show="rolePanelVisible" :selectedItem="userForm.roleNames" :single-choice="true"
      v-bind="rolePanelParams" dialogWidth="600px" @confirm="confirmSelection"
      @dataChange="changeRoleParams"></selection-panel>
  </div>
</template>

<script>
import { nameValidator, pwdValidator, chineseReg, blankSpaceReg } from "@/utils/const";
import SelectionPanel from "@/components/SelectionPanel";
import { filterNullValue } from "@/utils/commonMethods";

export default {
  name: "AddAccount",
  props: {
    dialogTitle: {
      type: String,
      default: "新增",
    },
    dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
  },
  computed: {
    visible() {
      return this.dialogFormVisible;
    },
  },
  watch: {
    rolePanelVisible(val) {
      if (val) {
        this.getRoleList(1);
      }
    },
    dialogFormVisible(val) {
      if (val && this.id) {
        this.getDetail();
      }
    },
  },
  components: { SelectionPanel },
  data() {
    return {
      isLoading: false,
      rolePanelVisible: false,
      rolePanelParams: {
        columns: [
          {
            prop: "name",
            label: "角色名称",
          },
        ],
        tableData: [],
        total: 0,
      },
      userForm: {
        username: "",
        nickname: "",
        password: "",
        confirmPWD: "",
        roleNames: [],
        isDefault: true,
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: nameValidator, trigger: "blur" },
        ],
        nickname: [
          { required: true, message: "请输入昵称", trigger: "blur" },
          { validator: nameValidator, trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            validator: pwdValidator,
            trigger: "blur",
          },
        ],
        confirmPWD: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.userForm.password) {
                callback("两次输入密码不一致");
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        roleNames: [
          {
            type: "array",
            required: true,
            message: "请选择关联角色",
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    getDetail() {
      this.$http.get(`/users/${this.id}`).then(({ data }) => {
        const { username, nickname, roleNames } = data;
        this.userForm.username = username;
        this.userForm.nickname = nickname;
        this.userForm.roleNames = roleNames || [];
      });
    },
    onResetForm() {
      this.$refs.userFormRef.resetFields();
      this.isLoading = false;
      this.userForm.roleNames = [];
      if (this.id) {
        this.userForm.username = "";
        this.userForm.password = "";
        this.userForm.confirmPWD = "";
      }
      this.$emit("update:dialogFormVisible", false);
    },
    onSubmit() {
      this.$refs.userFormRef.validate(valid => {
        if (valid) {
          this.userForm.username = this.userForm.username.trim();
          this.userForm.nickname = this.userForm.nickname.trim();
          this.isLoading = true;
          this.onRequest();
        }
      });
    },
    onRequest() {
      const { username, nickname, password, roleNames, isDefault } = this.userForm;
      let params = {
        username,
        nickname,
        roleNames: roleNames.map(item => item.name),
      };
      if (!this.id) {
        if (!isDefault) {
          params.password = password;
        }
      }
      let $method = "post";
      let $url = "/users/";
      if (this.id) {
        $method = "put";
        $url = `/users/${this.id}`;
      }
      this.$http[$method]($url, params)
        .then(() => {
          this.$notifyMessage("保存成功", { type: "success" });
          this.onResetForm();
          this.$emit("success");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    changeRoleParams({ page, searchInfo }) {
      this.getRoleList(page, searchInfo);
    },
    getRoleList(page, roleName = "") {
      let params = {
        page,
        keyword: roleName,
        perPage: 10,
      };
      this.$http.get("/users/roles", { params: filterNullValue(params) }).then(({ data }) => {
        const { totalNum, items } = data;
        let tableData = [];

        this.rolePanelParams.total = totalNum;
        if (items && items.length) {
          tableData = items.map(item => ({
            id: item.id,
            name: item.name,
          }));
        }
        this.rolePanelParams.tableData = tableData;
      });
    },
    confirmSelection(data) {
      if (data) {
        this.userForm.roleNames = data;
      }
      this.rolePanelVisible = false;
    },
    delRole(roleNames, index) {
      roleNames.splice(index, 1);
    },
    clearChinese(val, key) {
      this.userForm[key] = val.replace(chineseReg, "").replace(blankSpaceReg, "");
    },
  },
};
</script>

<style>
.role-list ::v-deep.el-tag {
  margin-bottom: 15px;
}
</style>

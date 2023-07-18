<template>
  <div style="clear: both;" class="content-info">
    <div class="content-header">
      <div class="info-name">
        基本信息
      </div>
    </div>
    <el-form class="form-box" label-width="124px" ref="form" :model="form" :rules="rules">
      <el-form-item class="custom-size" prop="name" label="任务名称">
        <el-input v-model="form.name" placeholder="请输入任务名称"></el-input>
      </el-form-item>
      <el-form-item class="custom-size" prop="taskStatus" label="定时任务">
        <el-switch :active-text="taskText" active-value="1" active-color="rgb(22,140,0)" inactive-value="0"
          inactive-color="rgb(200,0,0)" v-model="form.taskStatus" @change="changeScheduleSwitch()">
          >
        </el-switch>
      </el-form-item>
      <el-form-item class="custom-size" prop="taskRunEnv" label="运行环境" v-if="form.taskStatus === '1'">
        <el-select v-model="form.taskRunEnv" @click.native="getEnvList">
          <el-option v-for="(item, index) in envList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="custom-size" prop="taskCrontab" label="计划时间" v-if="form.taskStatus === '1'">
        <el-input v-model="form.taskCrontab" placeholder="请输入crontab表达式">
          <el-popover slot="suffix" placement="right" width="450" trigger="hover">
            <div>
              <pre>
<b>crontab表达式，共5位，最小粒度为分钟</b>
*    *    *    *    *
-    -    -    -    -
|    |    |    |    |
|    |    |    |    +----- 星期中星期几 (0 - 6) (星期天 为0)
|    |    |    +---------- 月份 (1 - 12)
|    |    +--------------- 一个月中的第几天 (1 - 31)
|    +-------------------- 小时 (0 - 23)
+------------------------- 分钟 (0 - 59)
【每分钟】
* * * * *
【每小时的第一分】
1 * * * *
【每天7:50】
50 7 * * *
【每两个小时】
0 */2 * * *
【每月1号和15号】
0 0 1,15 * *
【每周一至周五3点钟】
00 03 * * 1-5
【每月的1、11、21、31日的6:30】
30 6 */10 * *
【每月每天的午夜0点20分, 2点20分, 4点20分】
20 0-23/2 * * *
【在12月内, 每天的早上6点到12点，每隔3个小时0分钟】
0 6-12/3 * 12 *
             </pre>
            </div>
            <i slot="reference" class="el-icon-question"></i>
          </el-popover>
        </el-input>
      </el-form-item>
      <el-form-item class="custom-size"></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :loading="saving">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        name: "",
        taskRunEnv: "",
        taskStatus: "0",
        taskCrontab: "",
      },
      rules: {
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
        taskRunEnv: [{ required: true, message: "请选择运行环境", trigger: "blur" }],
        taskCrontab: [{ required: true, message: "请输入crontab表达式", trigger: "blur" }],
      },
      saving: false,
      taskId: "",
      curEnvName: "",
      envList: [],
      curProjectId: "",
      projectEnvList: [],
      popoverActive: false,
      taskText: "关闭",
    };
  },
  created() {
    let taskInfo = localStorage.getItem("taskInfo");
    if (taskInfo) {
      taskInfo = JSON.parse(taskInfo);
      this.taskId = taskInfo.id;
      this.form.name = taskInfo.name;
      this.form.taskRunEnv = taskInfo.taskRunEnv;
      this.form.taskStatus = taskInfo.taskStatus;
      this.form.taskCrontab = taskInfo.taskCrontab;
    }
    this.getProjectEnv();
  },
  methods: {
    getProjectEnv() {
      let localProjectEnvList = JSON.parse(localStorage.getItem("projectEnvList"));
      if (localProjectEnvList) {
        this.projectEnvList = localProjectEnvList;
      }
    },
    getCurProjectId() {
      let localCurProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      if (localCurProjectEnv) {
        this.curProjectId = localCurProjectEnv.curProjectId;
      }
    },
    getEnvList() {
      this.getCurProjectId();
      this.projectEnvList.forEach(item => {
        if (item.projectId === this.curProjectId) {
          this.envList = item.envList;
        }
      });
    },
    setTaskText() {
      if (this.form.taskStatus === "1") {
        this.taskText = "开启";
      }
      if (this.form.taskStatus === "0") {
        this.taskText = "关闭";
      }
    },
    changeScheduleSwitch() {
      this.setTaskText();
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saving = true;
          this.form.name = this.form.name.trim();
          this.form.taskCrontab = this.form.taskCrontab.trim();
          let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
          let projectId = curProjectEnv.curProjectId;
          let param = {
            name: this.form.name,
            taskRunEnv: this.form.taskRunEnv,
            taskStatus: this.form.taskStatus,
            taskCrontab: this.form.taskCrontab,
            projectId,
          };
          if (this.taskId) {
            let url = `/teprunner/tasks/${this.taskId}`;
            this.$http.put(url, param).then(() => {
              this.back();
              this.$notifyMessage("修改任务成功", { type: "success" });
            });
          } else {
            let url = `/teprunner/tasks`;
            this.$http.post(url, param).then(() => {
              this.back();
              this.$notifyMessage("新增任务成功", { type: "success" });
            });
          }
          this.saving = false;
        } else {
          return false;
        }
      });
    },
    back() {
      this.$router.go(-1);
    },
  },
};
</script>
<style>
.form-box {
  margin-top: 16px;
}

.form-box .custom-size .el-form-item__content,
.custom-size .el-select,
.custom-size .el-select>.el-input {
  width: 380px;
}
</style>

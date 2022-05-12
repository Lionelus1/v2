<template>
  <div>
    <Button :label="$t('common.perform')" icon="pi pi-check" @click="openBasic" class="p-mr-2"/>
  </div>

  <Sidebar
      v-model:visible="showWorkPlanExecuteSidebar"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
  >
    <div class="p-col-12" v-if="plan && plan.is_oper && resultData && resultData.reject_history">
      <label>{{ $t('common.message.resultSentToCorrect') }}</label>
      <Message severity="warn" :closable="false" title="">{{ resultData.reject_history.message }}</Message>
    </div>
    <div class="p-col-12">
      <div>
        <Menubar :model="menu" :key="active"
                 style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-fluid">
      <div class="p-field">
        <label>{{ $t('workPlan.eventName') }}</label>
        <InputText v-model="event.event_name" disabled/>
      </div>
      <div class="p-field">
        <label>{{ $t('common.result') }}</label>
        <Textarea ref="resultContainer" v-if="plan && !plan.is_oper" v-model="result" @input="resultInput" rows="10"
                  style="resize: vertical"/>
        <Textarea ref="resultContainer" v-if="plan && resultData && plan.is_oper" v-model="resultData.event_result"
                  @input="resultInput" rows="10" style="resize: vertical"/>
        <Textarea ref="resultContainer" v-if="plan && !resultData && plan.is_oper" v-model="result" @input="resultInput"
                  rows="10" style="resize: vertical"/>
      </div>
      <div class="p-field" v-if="resultData && resultData.result_files">
        <label>{{ $t('workPlan.attachments') }}</label>
        <div >
          <Button
              v-for="(item, index) of resultData.result_files" :key="index"
              icon="pi pi-download"
              class="p-button-rounded p-button-success p-mr-2"
              @click="downloadFile(item)"
          />
        </div>
      </div>
      <div class="p-field">
        <FileUpload
            ref="form"
            mode="basic"
            :customUpload="true"
            @uploader="uploadFile($event)"
            :auto="true"
            :multiple="true"
            :chooseLabel="$t('smartenu.chooseAdditionalFile')"
        ></FileUpload>
      </div>
      <div class="p-field">
        <div ref="content" class="p-fileupload-content">
          <div class="p-fileupload-files">
            <div class="p-fileupload-row" v-for="(file, index) of files" :key="index">
              <span class="p-mr-3"><i class="pi pi-paperclip"></i></span>
              <span>{{file.name}}</span>
              <span class="p-ml-5">
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)" />
              </span>
            </div>
          </div>
          <div class="p-fileupload-empty" v-if="files.length === 0">
            <slot name="empty"></slot>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import axios from "axios";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanExecute",
  props: ['data', 'planData'],
  data() {
    return {
      showWorkPlanExecuteSidebar: false,
      event: this.data,
      plan: this.planData,
      result: null,
      file: null,
      isDisabled: true,
      active: null,
      menu: null,
      resultData: null,
      files: []
    }
  },
  methods: {
    openBasic() {
      this.showWorkPlanExecuteSidebar = true;
      if (this.plan && this.plan.is_oper)
        this.getData();
      else
        this.initMenu();
    },
    closeBasic() {
      this.showWorkPlanExecuteSidebar = false;
    },
    getData() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanEventResult/${this.event.work_plan_event_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.resultData = res.data;
              this.isDisabled = !this.resultData.event_result;
              this.$nextTick(() => {
                const textarea = this.$refs.resultContainer.$el;
                textarea.style.height = textarea.scrollHeight + 10 + 'px';
              });
            }
            this.initMenu();
          }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    initMenu() {
      this.menu = [
        {
          label: "",
          icon: "pi pi-fw pi-refresh",
          visible: this.showWorkPlanExecuteSidebar && this.plan && this.plan.is_oper === true,
          command: () => {
            this.getData();
            this.$toast.add({severity: 'success', detail: this.$t('common.success'), life: 3000});
          },
        },
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: this.showWorkPlanExecuteSidebar && this.isDisabled,
          command: () => {
            this.saveResult();
          },
        },
        {
          label: this.$t('common.toCorrect'),
          icon: "pi pi-fw pi-send",
          visible: this.showWorkPlanExecuteSidebar && this.plan && this.plan.is_oper === true && this.resultData !== null && this.resultData.event_result !== null,
          disabled: this.showWorkPlanExecuteSidebar && this.resultData && !this.resultData.event_result,
          command: () => {
            this.sendResultForVerification();
          },
        },
      ];
    },
    saveResult() {
      const fd = new FormData();
      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.resultData ? this.resultData.event_result : this.result);
      if (this.plan && this.plan.is_oper)
        fd.append("is_partially", true);
      if (this.plan && this.plan.is_oper && this.resultData)
        fd.append("result_id", this.resultData.event_result_id);
      if (this.files.length > 0) {
        for (let file of this.files) {
          fd.append('files', file)
        }
      }
      fd.append("test", [1,2,3,4,5])
      axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getMultipartHeader()}).then(res => {
        this.emitter.emit("workPlanEventIsCompleted", true);
        this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        this.showWorkPlanExecuteSidebar = false;
        this.clearModel();
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    sendResultForVerification() {
      axios.post(smartEnuApi + `/workPlan/sendEventResultForVerify`, {event_id: parseInt(this.event.work_plan_event_id), result_id: parseInt(this.resultData.event_result)}, {headers: getHeader()})
          .then(res => {
            if (res.data.is_success) {
              this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
              this.showWorkPlanExecuteSidebar = false;
              this.emitter.emit("workPlanResultSentToVerify", true);
            }
          }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      })
    },
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.menu[1].disabled = false;
      } else {
        this.menu[1].disabled = true;
      }
      this.resizeArea();
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.selectedUsers = null;
    },
    uploadFile(event) {
      /*this.file = event.files[0];*/
      this.files = [];
      let files = event.files;
      for (let file of files) {
        console.log(file)
        this.files.push(file);
      }
      this.clearFiles();
      this.isDisabled = false;

    },
    resizeArea() {
      this.$nextTick(() => {
        const textarea = this.$refs.resultContainer.$el;
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    },
    removeFile(index) {
      let removedFile = this.files.splice(index, 1)[0];
      this.files = [...this.files];
      console.log(this.files)
      this.$emit('remove', {
        file: removedFile,
        files: this.files
      });

    },
    clearFiles() {
      this.$refs.form.clear();
      this.$refs.form.uploadedFileCount = 0;
    },
    downloadFile(filePath) {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanResultFile`,
          {file_path: filePath}, {headers: getHeader()}).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", filePath);
        link.download = filePath;
        link.click();
        URL.revokeObjectURL(link.href);
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
  }
}
</script>

<style scoped>
.p-fileupload-content {
  position: relative;
}

.p-fileupload-row {
  display: flex;
  align-items: center;
}

.p-fileupload-row > div {
  flex: 1 1 auto;
  width: 25%;
}

.p-fileupload-row > div:last-child {
  text-align: right;
}

.p-fileupload-content .p-progressbar {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.p-button.p-fileupload-choose input[type=file] {
  display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type=file] {
  display: none;
}

.p-fileupload-filename {
  word-break: break-all;
}

.p-fluid .p-fileupload .p-button {
  width: auto;
}
</style>

<template>
  <div>
    <Button :label="$t('common.perform')" icon="pi pi-check" @click="openBasic" class="p-mr-2"/>
  </div>
  <vue-element-loading :active="isBlockUI" is-full-screen color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)"/>
  <Sidebar
      v-model:visible="showWorkPlanExecuteSidebar"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll"
  >
    <div class="col-12" v-if="plan && plan.is_oper && resultData && resultData.reject_history">
      <label class="p-text-bold">{{ $t('common.resultSentToCorrect') }}</label>
      <Message severity="warn" :closable="false" title="">{{ resultData.reject_history.message }}</Message>
    </div>
    <div class="col-12">
      <div>
        <Menubar :model="menu" :key="active"
                 style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="col-12 p-fluid">
      <div class="p-field">
        <label class="p-text-bold">{{ $t('workPlan.eventName') }}</label>
        <InputText v-model="event.event_name" disabled/>
      </div>
      <div class="p-field">
        <label class="p-text-bold">{{ $t('common.result') }}</label>
        <RichEditor v-if="plan && !plan.is_oper" v-model="result" editorStyle="height:300px;" @text-change="editorChange">
          <template v-slot:toolbar>
            <span class="ql-formats">
              <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
              <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
              <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
            </span>
          </template>
        </RichEditor>
        <div v-if="plan && resultData && plan.is_oper" v-html="resultData.event_result" class="p-mb-4"></div>
        <RichEditor v-if="plan && plan.is_oper" v-model="newResult" editorStyle="height:300px;" @text-change="editorChange">
          <template v-slot:toolbar>
            <span class="ql-formats">
              <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
              <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
              <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
            </span>
          </template>
        </RichEditor>
      </div>
      <div class="p-field" v-if="resultData && resultData.result_files">
        <label class="p-text-bold">{{ $t('workPlan.attachments') }}</label>
        <div>
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
              <span>{{ file.name }}</span>
              <span class="p-ml-5">
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/>
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

  <Sidebar
      v-model:visible="showOperPlanExecute"
      position="right"
      style="overflow-y: scroll; width: 50%;"
      v-if="event"
      @hide="sideBarClosed"
  >
    <WorkPlanEventResult :result-id="event.work_plan_event_id"/>
  </Sidebar>
</template>

<script>
import axios from "axios";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";
import RichEditor from "../documents/editor/RichEditor";
import {WorkPlanService} from '../../service/work.plan.service'

export default {
  name: "WorkPlanExecute",
  components: {RichEditor},
  props: ['data', 'planData'],
  data() {
    return {
      showWorkPlanExecuteSidebar: false,
      showOperPlanExecute: false,
      event: this.data,
      plan: this.planData,
      result: null,
      file: null,
      isDisabled: true,
      active: null,
      menu: null,
      resultData: null,
      files: [],
      newResult: null,
      fact: null,
      isBlockUI: false,
      planService: new WorkPlanService()
    }
  },
  methods: {
    openBasic() {
      if (this.plan && this.plan.is_oper) {
        //this.$router.push({name: 'WorkPlanEventResult', params: {id: this.event.work_plan_event_id}});
        this.showOperPlanExecute = true;
      } else {
        this.showWorkPlanExecuteSidebar = true;
        this.initMenu();
      }
    },
    closeBasic() {
      this.showWorkPlanExecuteSidebar = false;
    },
    sideBarClosed() {
      this.emitter.emit("workPlanSideBarClosed", true);
    },
    getData() {
      this.planService.getEventResult(this.event.work_plan_event_id).then(res => {
        if (res.data) {
          this.resultData = res.data;
          this.isDisabled = !this.resultData.event_result;
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
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: this.showWorkPlanExecuteSidebar && this.isDisabled,
          command: () => {
            this.saveResult();
          },
        },
      ];
    },
    saveResult() {
      const fd = new FormData();
      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.plan.is_oper ? this.newResult : this.result);
      if (this.plan && this.plan.is_oper) {
        fd.append("is_partially", true);
        fd.append("fact", this.fact)
      }
      if (this.plan && this.plan.is_oper && this.resultData)
        fd.append("result_id", this.resultData.event_result_id);
      if (this.files.length > 0) {
        for (let file of this.files) {
          fd.append('files', file)
        }
      }
      this.planService.saveEventResult(fd).then(res => {
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
      let data = {
        event_id: parseInt(this.event.work_plan_event_id),
        result_id: parseInt(this.resultData.event_result_id)
      };
      this.planService.sendResultToVerify(data).then(res => {
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
    editorChange() {
      if ((this.result != null && this.result.length > 0) || (this.newResult != null && this.newResult.length > 0)) {
        this.menu[0].disabled = false;
      } else {
        this.menu[0].disabled = true;
      }
    },
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.menu[0].disabled = false;
      } else {
        this.menu[0].disabled = true;
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
      if (event.files.length > 5) {
        this.$toast.add({
          severity: "info",
          summary: this.$t('workPlan.message.maxFileUploadSize'),
          life: 3000,
        });
        this.clearFiles();
        return;
      }
      this.files = [];
      let files = event.files;
      for (let file of files) {
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
      this.isBlockUI = true;
      fetch(smartEnuApi + `/serve?path=${filePath}`, {
        method: 'GET',
        headers: getHeader()
      }).then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filePath;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            this.isBlockUI = false;
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
        this.isBlockUI = false;
      });
    },
  }
}
</script>

<style scoped lang="scss">

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

.sidebar-custom {
  width: 50% !important;
}

</style>

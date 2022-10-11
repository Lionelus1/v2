<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <div class="p-col-12" v-if="plan && event">
    <div class="card">
      <div v-if="!resultId" @click="navigateToBack" class="p-d-inline-block"><i class="fa-solid fa-arrow-left p-mr-3"
                                                               style="font-size: 16px;cursor: pointer"></i></div>
      <div class="p-mb-0 p-mt-0 p-d-inline-block" style="font-size: 24px"> {{ $t('common.result') }}</div>
    </div>

    <div class="card" v-if="resultData && event && resultData.reject_history">
      <div class="p-fluid">
        <div class="p-field">
          <label>{{ $t('common.state') }}:</label>
          <div>
            <span v-if="event" :class="'customer-badge status-' + event.status.work_plan_event_status_id">{{
                event.status.name_ru
              }}</span>
          </div>
        </div>
        <div class="p-field" v-if="resultData.reject_history.user">
          <label>{{ $t('contracts.assigner') }}:</label>
          <div>
            <b>{{ resultData.reject_history.user.fullName }}</b>
          </div>
        </div>
        <div class="p-field" v-if="resultData.reject_history.created_date">
          <label>{{ $t('common.date') }}:</label>
          <div>
            <b>{{ formatDateMoment(resultData.reject_history.created_date) }}</b>
          </div>
        </div>
        <div class="p-field">
          <label>{{ $t('common.comment') }}:</label>
          <div>
            <Message :closable="false" severity="warn"><span v-html="resultData.reject_history.message"></span>
            </Message>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <TabView v-model:activeIndex="activeIndex" @tab-change="changeTab">
        <TabPanel :header="$t('common.properties')">
          <div
              v-if="event && (event.status.work_plan_event_status_id === 1 || event.status.work_plan_event_status_id === 4 || event.status.work_plan_event_status_id === 6)">
            <Menubar :model="userMenuItems" :key="active"
                     style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
          </div>
          <div
              v-if="plan && plan.is_oper && plan.user.id === loginedUserId && event && event.status.work_plan_event_status_id === 5">
            <Menubar :model="verifyMenu" :key="active"
                     style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
          </div>
          <div class="p-grid p-mt-3">
            <div class="p-fluid p-sm-12 p-md-12 p-lg-6 p-xl-6"
                 v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)">
              <div class="p-field">
                <label>{{ $t('workPlan.eventName') }}</label>
                <InputText v-model="event.event_name" disabled/>
              </div>
              <div class="p-field" v-if="plan && plan.is_oper">
                <label>{{ $t('common.fact') }}</label>
                <InputText v-model="fact" @input="factChange"/>
              </div>
              <div class="p-field">
                <label>{{ $t('common.result') }}</label>
                <RichEditor v-if="plan && !plan.is_oper" v-model="result" editorStyle="height:300px;"
                            @text-change="editorChange">
                  <template v-slot:toolbar>
                    <span class="ql-formats">
                      <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                      <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                      <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                    </span>
                  </template>
                </RichEditor>
                <RichEditor v-if="plan && plan.is_oper" v-model="newResult" editorStyle="height:300px;"
                            @text-change="editorChange">
                  <template v-slot:toolbar>
                    <span class="ql-formats">
                      <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                      <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                      <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                    </span>
                  </template>
                </RichEditor>
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
            <div class="p-sm-12 p-md-12 p-lg-12 p-xl-6">
              <div class="p-field" v-if="event">
                <label class="p-text-bold">{{ $t('common.fact') }}: </label>
                <div>{{ event.fact }}</div>
              </div>
              <div class="p-field" v-if="plan && resultData && plan.is_oper">
                <label class="p-text-bold">{{ $t('common.result') }}</label>
                <div v-for="(item, index) of resultData.result_text" :key="index" class="p-mb-2">
                  <Inplace
                      v-if="item.userId === loginedUserId && event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)"
                      :active="item.isActive" @open="openInplace(item)">
                    <template #display>
                      <div>
                        <span class="p-mr-1" style="float:left;"><i class="fa-solid fa-pen color-success"></i></span>
                        <p class="p-p-0 p-m-0" v-html="item.text"></p>
                      </div>
                    </template>
                    <template #content>
                      <div class="p-py-2">
                        <Button :label="$t('common.save')" icon="pi pi-check" class="p-button p-button-success"
                                @click="saveEditResult(item)" :loading="loading"/>
                        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-ml-1"
                                @click="cancelEdit(item)"/>
                        <Button :label="$t('common.delete')" icon="pi pi-trash" class="p-button p-button-danger p-ml-1"
                                @click="deleteConfirmItem($event, item)"/>
                      </div>
                      <div class="p-field">
                        <RichEditor v-model="item.text" editorStyle="height:200px;">
                          <template v-slot:toolbar>
                            <span class="ql-formats">
                              <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
                              <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
                              <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
                            </span>
                          </template>
                        </RichEditor>
                      </div>
                    </template>
                  </Inplace>
                  <div v-else class="p-p-0">
                    <small style="color: #a3a3a3;"><i class="fa-solid fa-user p-mr-1"></i>{{
                        item.user.fullName
                      }}</small>
                    <p v-html="item.text"></p>
                  </div>

                </div>
              </div>
              <div class="p-field" v-if="resultData && resultData.result_files">
                <label class="p-text-bold">{{ $t('workPlan.attachments') }}</label>
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of resultData.result_files" :key="index">
                      <span class="p-mr-3" style="cursor: pointer;" @click="downloadFile(file.event_result_file)"><i
                          class="fa-solid fa-file-arrow-down fa-2x color-success"></i></span>
                      <span @click="downloadFile(file)"
                            style="cursor: pointer;">{{
                          file.file_name ? file.file_name : file.event_result_file
                        }}</span>
                      <span class="p-ml-5" v-if="file.user_id && file.user_id === loginedUserId"><Button
                          icon="pi pi-times" class="p-button-rounded p-button-text"
                          v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)"
                          @click="deleteFileConfirm($event, file.id)"/></span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel :header="$t('common.history')">
          <DataTable :value="history" class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="id" header="ID"></Column>
            <Column :header="$t('common.date')">
              <template #body="{ data }">
                {{ formatDateMoment(data.modi_date) }}
              </template>
            </Column>
            <Column field="user" :header="$t('common.user')">
              <template #body="{ data }">
                {{ data.modi_user.fullName }}
              </template>
            </Column>
            <Column field="state" :header="$t('common.actionTitle')">
              <template #body="{ data }">
                {{ data.state ? $t(`common.states.${data.state}`) : "" }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  </div>

  <Sidebar v-model:visible="toCorrectSidebar"
           position="right"
           class="p-sidebar-lg "
           style="overflow-y: scroll" >
    <div class="p-col-12">
      <h3>{{ $t('workPlan.toCorrect') }}</h3>
    </div>
    <div class="p-col-12">
      <div>
        <Menubar :model="rejectMenu" :key="active" style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="p-col p-fluid">
      <div class="p-field">
        <label>{{ $t('common.comment') }}</label>
        <RichEditor v-model="rejectComment" editorStyle="height:300px;">
          <template v-slot:toolbar>
            <span class="ql-formats">
              <button class="ql-bold" v-tooltip.bottom="'Bold'"></button>
              <button class="ql-italic" v-tooltip.bottom="'Italic'"></button>
              <button class="ql-underline" v-tooltip.bottom="'Underline'"></button>
            </span>
          </template>
        </RichEditor>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {getMultipartHeader} from "../../config/config";
import RichEditor from "../documents/editor/RichEditor";
import moment from "moment";

export default {
  name: "WorkPlanEventResult",
  components: {RichEditor},
  props: ['resultId'],
  data() {
    return {
      event: null,
      plan: null,
      result: null,
      file: null,
      isDisabled: true,
      active: null,
      menu: null,
      resultData: null,
      files: [],
      newResult: null,
      fact: null,
      event_id: this.resultId,
      activeIndex: 0,
      history: null,
      toCorrectSidebar: false,
      rejectComment: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      itemActive: false,
      isFactChanged: false,
      loading: false
    }
  },
  computed: {
    userMenuItems() {
      return this.initMenu();
    },
    verifyMenu() {
      return [
        {
          label: this.$t('common.action.accept'),
          icon: "pi pi-fw pi-check",
          visible: this.plan && this.plan.is_oper === true,
          command: () => {
            this.verify(true);
          },
        },
        {
          label: this.$t('workPlan.toCorrect'),
          icon: "pi pi-fw pi-times",
          command: () => {
            this.showToCorrectSidebar();
          },
        },
      ];
    },
    rejectMenu() {
      return [
        {
          label: this.$t('common.save'),
          icon: "pi pi-fw pi-check",
          command: () => {
            this.verify(false);
          },
        }
      ];
    }
  },
  created() {
    if (!this.event_id) {
      this.event_id = this.$route.params.id;
    }
    this.getEvent();
  },
  methods: {
    getEvent() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanEventById/${this.event_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.event = res.data.event;
              this.plan = res.data.plan;
              this.getData();
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
      });
    },
    getData() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanEventResult/${this.event.work_plan_event_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.resultData = res.data;
              if (this.resultData.result_text != null) {
                this.resultData.result_text.map(e => {
                  e.isActive = false;
                });
              }
              this.fact = this.resultData.fact;
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
      });
    },
    initMenu() {
      let menu = [
        {
          label: "",
          icon: "pi pi-fw pi-refresh",
          command: () => {
            this.getData();
            this.$toast.add({severity: 'success', detail: this.$t('common.success'), life: 3000});
          },
        },
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: this.isDisabled,
          command: () => {
            this.saveResult();
          },
        },
        {
          label: this.$t('common.toCorrect'),
          icon: "pi pi-fw pi-send",
          disabled: !this.resultData,
          command: () => {
            this.sendResultForVerification();
          },
        },
      ];
      return menu;
    },
    saveResult() {
      const fd = new FormData();
      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.plan.is_oper ? this.newResult ? this.newResult : "" : this.result);
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
      axios.post(smartEnuApi + `/workPlan/saveResult`, fd, {headers: getMultipartHeader()}).then(res => {
        if (res.data.is_success || res.data.is_fact_success) {
          this.getData();
          this.getEvent();
          this.clearModel();
        }
        this.files = [];
        this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
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
      axios.post(smartEnuApi + `/workPlan/sendEventResultForVerify`, {
        event_id: parseInt(this.event.work_plan_event_id),
        result_id: parseInt(this.resultData.event_result_id)
      }, {headers: getHeader()})
          .then(res => {
            if (res.data.is_success) {
              this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
              this.getEvent();
              this.getData();
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
      });
    },
    getResultHistory() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanEventResultHistory/${this.resultData.event_result_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.history = res.data;
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
      });
    },
    showToCorrectSidebar() {
      this.toCorrectSidebar = true;
    },
    verify(status) {
      const data = {};
      data.is_success = status;
      data.event_id = this.event.work_plan_event_id;
      if (!status) {
        data.comment = this.rejectComment;
        data.result_id = this.resultData.event_result_id;
      }

      axios.post(smartEnuApi + `/workPlan/verifyEventResult`, data, {headers: getHeader()})
          .then(res => {
            //console.log(res);
            if (res.data && res.data.is_success) {
              this.toCorrectSidebar = false;
              this.$toast.add({
                severity: 'success',
                summary: this.$t('common.success'),
                life: 3000,
              });
              this.getData();
              this.getEvent();
              //this.$router.push({name: 'WorkPlanEvent', params: {id: this.event.work_plan_id}});
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
      });
    },
    changeTab() {
      if (this.activeIndex === 1) {
        this.getResultHistory();
      }
    },
    editorChange() {
      if ((this.result != null && this.result.length > 0) || (this.newResult != null && this.newResult.length > 0)) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    },
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.initMenu()[1].disabled = false;
      } else {
        this.initMenu()[1].disabled = true;
      }
      this.resizeArea();
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.newResult = null;
      this.selectedUsers = null;
    },
    navigateToBack() {
      this.$router.push({name: 'WorkPlanEvent', params: {id: this.plan.work_plan_id}});
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

    },
    resizeArea() {
      this.$nextTick(() => {
        const textarea = this.$refs.resultContainer.$el;
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    },
    factChange(event) {
      this.isDisabled = false;
      this.isFactChanged = true;
    },
    removeFile(index) {
      let removedFile = this.files.splice(index, 1)[0];
      this.files = [...this.files];
      this.$emit('remove', {
        file: removedFile,
        files: this.files
      });

    },
    openInplace(item) {
      item.isActive = true;
    },
    saveEditResult(item) {
      this.loading = true;
      const fd = new FormData();
      fd.append("result_id", Number(this.resultData.event_result_id))
      fd.append("result_text_id", Number(item.id))
      fd.append("work_plan_event_id", this.event.work_plan_event_id)
      if (this.isFactChanged)
        fd.append("fact", this.fact)
      fd.append("text", item.text)
      axios.post(smartEnuApi + `/workPlan/editResult`, fd, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.getData();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
          item.isActive = false;
          this.loading = false;
        }
      }).catch((error) => {
        this.loading = false;
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
    cancelEdit(item) {
      item.isActive = false;
    },
    deleteConfirmItem(event, item) {
      this.$confirm.require({
        target: event.currentTarget,
        group: 'deleteResult',
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteItem(item.id);
        }
      });
    },
    deleteItem(id) {
      axios.post(smartEnuApi + `/workPlan/deleteResult/${id}`, null, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.getData();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
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
    deleteFileConfirm(event, id) {
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteFile(id);
        }
      });
    },
    deleteFile(id) {
      axios.post(smartEnuApi + `/workPlan/deleteResultFile/${id}`, null, {headers: getHeader()}).then(res => {
        if (res.data.is_success) {
          this.getData();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
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
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    },
    formatDate(value) {
      let result = "";
      if (value == null) {
        return result;
      }
      let date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    clearFiles() {
      this.$refs.form.clear();
      this.$refs.form.uploadedFileCount = 0;
    },
    downloadFile(file) {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanResultFile`,
          {file_path: file.event_result_file}, {headers: getHeader()}).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", file.file_name ? file.file_name : file.event_result_file);
        link.download = file.file_name ? file.file_name : file.event_result_file;
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

<style scoped lang="scss">
.p-fileupload-content {
  position: relative;
}

.p-fileupload-row {
  display: flex;
  align-items: center;
  padding: 5px;
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

.color-success {
  color: #689F38;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
  display: inline-block;
  text-align: center;

  &.status-6 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-5 {
    background: #f1c21b;
    color: #fff;
  }

  &.status-4 {
    background: #d9873e;
    color: #ffffff;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }
}

::v-deep(.p-inplace-display) {
  padding: 0;
}
</style>
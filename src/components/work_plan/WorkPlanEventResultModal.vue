<template>
  <div>
    <Button
        type="button"
        icon="fa-solid fa-eye"
        class="p-button p-button-info p-ml-1 p-mb-1"
        label=""
        @click="openModal"
    ></Button>
  </div>
  <vue-element-loading :active="isBlockUI" is-full-screen color="#FFF" size="80" :text="$t('common.loading')"
                       backgroundColor="rgba(0, 0, 0, 0.4)"/>
  <Sidebar
      v-model:visible="eventResultModal"
      position="right"
      class="p-sidebar-lg "
      style="overflow-y: scroll"
  >
    <div class="p-col-12">
      <h3>{{ $t('common.result') }}</h3>
    </div>
    <div class="p-col-12"
         v-if="plan && plan.is_oper && plan.user.id === loginedUserId && event && event.status.work_plan_event_status_id === 5">
      <div>
        <Menubar :model="menu" :key="active"
                 style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="p-col p-fluid">
      <div class="p-field" v-if="data.result_text">
        <div v-for="(item, index) in data.result_text" :key="index">
          <span v-html="item.text"></span>
        </div>
      </div>
      <div class="p-field" v-if="data.event_result_file">
        <label class="p-text-bold">{{ $t('workPlan.attachments') }}</label>
        <div>
          <Button
              icon="pi pi-download"
              class="p-button-rounded p-button-success p-mr-2"
              @click="downloadFile(data.event_result_file)"
          />
        </div>
      </div>
      <div class="p-field" v-else-if="data.result_files">
        <label class="p-text-bold">{{ $t('workPlan.attachments') }}</label>
        <div>
          <Button
              v-for="(item, index) of data.result_files" :key="index"
              icon="pi pi-download"
              class="p-button-rounded p-button-success p-mr-2"
              @click="downloadFile(item)"
          />
        </div>
      </div>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="toCorrectSidebar"
           position="right"
           class="p-sidebar-lg "
           style="overflow-y: scroll"
  >
    <div class="p-col-12">
      <h3>{{ $t('workPlan.toCorrect') }}</h3>
    </div>
    <div class="p-col-12">
      <div>
        <Menubar :model="rejectMenu" :key="active"
                 style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="p-col p-fluid">
      <label>{{ $t('common.comment') }}</label>
      <Textarea inputId="textarea" rows="5" cols="30" v-model="rejectComment"></Textarea>
    </div>
  </Sidebar>
  <Sidebar
      v-model:visible="showOperPlanExecute"
      position="right"
      class="p-sidebar-lg"
      style="overflow-y: scroll; width: 50%;"
      v-if="event"
      @hide="sideBarClosed"
  >
    <WorkPlanEventResult :result-id="event.work_plan_event_id"/>
  </Sidebar>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import WorkPlanEventResult from "./WorkPlanEventResult";

export default {
  name: "WorkPlanEventResultModal",
  props: ['eventResult', 'eventData', 'planData'],
  data() {
    return {
      eventResultModal: false,
      toCorrectSidebar: false,
      showOperPlanExecute: false,
      data: this.eventResult,
      plan: this.planData,
      event: this.eventData,
      active: null,
      menu: [
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
          disabled: this.showWorkPlanExecuteSidebar && this.isDisabled,
          command: () => {
            this.showToCorrectSidebar();
          },
        },
      ],
      rejectMenu: [
        {
          label: this.$t('common.save'),
          icon: "pi pi-fw pi-check",
          command: () => {
            this.verify(false);
          },
        }
      ],
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      rejectComment: null,
      isBlockUI: false,
    }
  },
  methods: {
    openModal() {
      if (this.plan && this.plan.is_oper) {
        //this.$router.push({name: 'WorkPlanEventResult', params: {id: this.event.work_plan_event_id}});
        this.showOperPlanExecute = true;
      } else {
        this.eventResultModal = true;
        this.$nextTick(() => {
          const textarea = this.$refs.resultContainer.$el;
          textarea.style.height = textarea.scrollHeight + 10 + 'px';
        });
      }
    },
    closeModal() {
      this.eventResultModal = false;
    },
    downloadFile(item) {
      let filePath = ""
      if (item && typeof item === 'string') {
        filePath = item;
      } else {
        filePath = item.event_result_file;
      }
      this.isBlockUI = true;
      fetch(smartEnuApi + `/serve?path=${filePath}`, {
        method: 'GET',
        headers: getHeader()
      }).then(response => response.blob())
          .then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = item && item.file_name ? item.file_name : filePath;
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
    showToCorrectSidebar() {
      this.toCorrectSidebar = true;
    },
    sideBarClosed() {
      this.emitter.emit("workPlanEventSideBarClosed", true);
    },
    verify(status) {
      const data = {};
      data.is_success = status;
      data.event_id = this.event.work_plan_event_id;
      if (!status) {
        data.comment = this.rejectComment;
        data.result_id = this.data.event_result_id;
      }

      axios.post(smartEnuApi + `/workPlan/verifyEventResult`, data, {headers: getHeader()})
          .then(res => {
            //console.log(res);
            this.toCorrectSidebar = false;
            this.eventResultModal = false;
            this.emitter.emit("workPlanResultVerified", true);
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
    }
  }
}
</script>

<style scoped>

</style>
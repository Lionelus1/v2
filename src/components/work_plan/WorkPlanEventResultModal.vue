<template>
  <div>
    <Button
        type="button"
        icon="pi pi-eye"
        class="p-button p-button-info p-ml-1 p-mb-1"
        label=""
        @click="openModal"
    ></Button>
  </div>

  <Sidebar
      v-model:visible="eventResultModal"
      position="right"
      class="p-sidebar-lg "
      style="overflow-y: scroll"
  >
    <div class="p-col-12">
      <h3>{{ $t('common.result') }}</h3>
    </div>
    <div class="p-col-12" v-if="plan && plan.is_oper && plan.user.id === loginedUserId && event && event.status.work_plan_event_status_id === 5">
      <div>
        <Menubar :model="menu" :key="active"
                 style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
      </div>
    </div>
    <div class="p-col p-fluid">
      <div class="p-field" v-if="data.event_result">
        <Textarea ref="resultContainer" v-model="data.event_result" disabled rows="10"
                  style="resize: vertical"></textarea>
      </div>
      <div class="p-field" v-if="data.event_result_file">
        <label>{{ $t('workPlan.attachments') }}</label>
        <div>
          <Button
              icon="pi pi-download"
              class="p-button-rounded p-button-success p-mr-2"
              @click="downloadFile()"
          />
        </div>
      </div>
      <div class="p-field" v-else-if="data.result_files">
        <label>{{ $t('workPlan.attachments') }}</label>
        <div >
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
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanEventResultModal",
  props: ['eventResult', 'eventData', 'planData'],
  data() {
    return {
      eventResultModal: false,
      toCorrectSidebar: false,
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
      rejectComment: null
    }
  },
  methods: {
    openModal() {
      this.eventResultModal = true;
      this.$nextTick(() => {
        const textarea = this.$refs.resultContainer.$el;
        textarea.style.height = textarea.scrollHeight + 10 + 'px';
      });
    },
    closeModal() {
      this.eventResultModal = false;
    },
    downloadFile(name) {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanResultFile`,
          {file_path: name ? name : this.data.event_result_file}, {headers: getHeader()}).then(res => {
        const link = document.createElement("a");
        link.href = "data:application/octet-stream;base64," + res.data;
        link.setAttribute("download", name ? name : this.data.event_result_file);
        link.download = name ? name : this.data.event_result_file;
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
    showToCorrectSidebar() {
      this.toCorrectSidebar = true;
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
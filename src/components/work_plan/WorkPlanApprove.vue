<template>
  <Button
      type="button"
      icon="pi pi-send"
      class="p-button-success p-ml-2"
      label="На согласование"
      @click="openModal"
  ></Button>

  <PdfContent ref="pdf" v-if="data" :data="data" :planId="data.work_plan_id" style="display: none;"></PdfContent>

  <Dialog header="Отправить на согласование" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="p-field">
      <label>Выберите</label>
      <ApproveComponent @add="approveChange" :stepValue="selectedUsers" v-model="selectedUsers" @changeStep="changeStep"></ApproveComponent>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button label="Отправить" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2" @click="approve"/>
    </template>
  </Dialog>
</template>

<script>
import ApproveComponent from "@/components/work_plan/ApproveComponent";
import PdfContent from "@/components/work_plan/PdfContent";
import html2pdf from "html2pdf.js";
import axios from "axios";
import {getHeader, getMultipartHeader, signerApi, smartEnuApi} from "@/config/config";

export default {
  name: "WorkPlanApprove",
  components: {ApproveComponent, PdfContent},
  props: ['docId', 'plan', 'events'],
  data() {
    return {
      data: this.plan,
      showModal: false,
      selectedUsers: null,
      steps: 3,
      step: 1,
      items: [{
        label: 'Personal',
        to: '/steps'
      },
        {
          label: 'Seat',
          to: '/steps/seat'
        },
        {
          label: 'Payment',
          to: '/steps/payment'
        },
        {
          label: 'Confirmation',
          to: '/steps/confirmation'
        }],
      approval_users: [],
      currentStageUsers: null,
      currentStage: 1,
      prevStage: 0,
      loginedUserId: 0,
      fd: null
    }
  },
  created() {
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    approve() {
      let workPlanId = this.data.work_plan_id;
      let pdfOptions = {
        margin: 10,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: {scale: 3},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
          hotfixes: ["px_scaling"]
        },
        pagebreak: {avoid: 'tr'},
        filename: "file.pdf"
      };
      const pdfContent = this.$refs.pdf.$refs.htmlToPdf;
      const worker = html2pdf().set(pdfOptions).from(pdfContent);

      worker.toPdf().output("blob").then((pdf) => {
        const fd = new FormData();
        fd.append('wpfile', pdf);
        fd.append('fname', pdfOptions.filename)
        fd.append('work_plan_id', workPlanId)
        this.approvePlan(fd);
      });
    },
    approvePlan(fd) {
      fd.append("doc_id", this.plan.doc_id)
      fd.append("approval_users", JSON.stringify(this.approval_users))
      axios.post(smartEnuApi + `/workPlan/savePlanFile`, fd, {headers: getMultipartHeader()}).then(res => {
        if (res.data && res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: "План успешно отправлен на согласование",
            life: 3000,
          });
          this.emitter.emit("planSentToApprove", true)
        }
        this.showModal = false;
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
    approveChange(result) {
      if (result.stage === this.currentStage) {
        if (this.approval_users.length === 0) {
          this.approval_users.push(result);
        } else {
          const foundIndex = this.approval_users.findIndex(x => x.stage === this.currentStage);
          if (foundIndex !== -1) {
            this.approval_users[foundIndex].users = result.users;
          } else {
            this.approval_users.push(result);
          }
        }
      }
    },
    changeStep(step) {
      this.prevStage = this.currentStage;
      this.currentStage = step;
      this.currentStageUsers = "";
      const foundIndex = this.approval_users.findIndex(x => x.stage === step);
      if (foundIndex !== -1 && step === this.approval_users[foundIndex].stage) {
        this.selectedUsers = this.approval_users[foundIndex];
        this.$emit('stepChanged', this.approval_users[foundIndex]);
        this.approval_users[foundIndex].users.forEach(e => {
          this.currentStageUsers += `${e.fullName}, `
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
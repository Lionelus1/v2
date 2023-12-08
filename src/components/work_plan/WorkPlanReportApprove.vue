<template>
  <Button
      type="button"
      icon="pi pi-send"
      class="p-button-success ml-2"
      :label="$t('common.toapprove')"
      @click="openModal"
  ></Button>
  <Button :label="$t('workPlan.toCorrect')" icon="pi pi-check"
                @click="openRejectPlan"
                class="p-button p-button-danger ml-2"/>
{{ data }}
  <PdfContent ref="pdf" v-if="data" :data="data" :planId="data.work_plan_id" style="display: none;"></PdfContent>
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal"
            :style="{width: '50vw'}" class="p-fluid">
      <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
      <div class="field">
        <ApprovalUsers :approving="approving" v-model="approval_users"
                       @closed="closeModal"
                       @approve="approve($event)" :stages="stages" :mode="'standard'"></ApprovalUsers>
      </div>
  </Dialog>
  <!-- <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="field">
      <label>{{ $t('common.select') }}</label>
      <ApproveComponent @add="approveChange" :stepValue="selectedUsers" v-model="selectedUsers" @changeStep="changeStep"></ApproveComponent>
      <small class="p-error" v-if="submitted && formValid.approvals">{{ $t('workPlan.errors.approvalUserError') }}</small>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button :label="$t('common.send')" :disabled="submitted" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              @click="approvePlan"/>
    </template>
  </Dialog> -->
</template>

<script>
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import ApproveComponent from "@/components/work_plan/ApproveComponent";
import PdfContent from "@/components/work_plan/PdfContent";
import html2pdf from "html2pdf.js";
import axios from "axios";
import {getHeader, getMultipartHeader, signerApi, smartEnuApi} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";

export default {
  name: "WorkPlanReportApprove",
  components: {ApprovalUsers},
  props: ['docId', 'report', 'events'],
  data() {
    return {
      data: this.report,
      showModal: false,
      selectedUsers: null,
      steps: 3,
      step: 1,
      // approval_users: [],
      approval_users: [
      {
          stage: 1,
          users:[],
          certificate: {
            namekz: "Жеке тұлғаның сертификаты",
            nameru: "Сертификат физического лица",
            nameen: "Certificate of an individual",
            value: "individual"
          }
        }
      ],
      currentStageUsers: null,
      currentStage: 1,
      prevStage: 0,
      loginedUserId: 0,
      fd: null,
      submitted: false,
      formValid: {
        approvals: false
      },
      doc_id: this.docId,
      report_id: this.report,
      planService: new WorkPlanService(),
      approveComponentKey: 0,
      approving: false,
      stages: null
    }
  },
  created() {
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
  },
  mounted() {
    this.emitter.on("reportFD", (data) => {
      if (data) {
        this.fd = data;
      }
    });
  },
  methods: {
    openModal() {
      this.showModal = true;
      this.approveComponentKey++;
    },
    closeModal() {
      this.showModal = false;
    },
    // approvePlan() {
    //   this.submitted = true;
    //   if (!this.validate()) {
    //     return;
    //   }
    //   let userIds = [];
    //   this.selectedUsers.forEach(e => {
    //     userIds.push(e.userID);
    //   });
    //   this.fd.append("approval_users", JSON.stringify(this.approval_users));
    //   this.fd.append("doc_id", this.doc_id);
    //   this.fd.append("report_id", this.report_id)
    //   this.planService.approvePlan(this.fd).then(res => {
    //     if (res.data.is_success) {
    //       this.$toast.add({
    //         severity: "success",
    //         summary: this.$t('workPlan.message.reportSentToApprove'),
    //         life: 3000,
    //       });
    //       this.emitter.emit("reportSentToApprove", true)
    //       this.closeModal();
    //     }
    //   }).catch(error => {
    //     if (error.response && error.response.status === 401) {
    //       this.$store.dispatch("logLout");
    //     } else {
    //       this.$toast.add({
    //         severity: "error",
    //         summary: error,
    //         life: 3000,
    //       });
    //     }
    //   });
    // },
    approve(event) {
      this.approval_users = event
      this.submitted = true;
      this.approving = true;
      let workPlanReport = this.report_id;
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
        fd.append('report_id', workPlanReport)
        this.approvePlan(fd);
      });
    },
    approvePlan(fd) {
      fd.append("doc_id", this.doc_id)
      fd.append("approval_users", JSON.stringify(this.approval_users))
      this.planService.savePlanFile(fd).then(res => {
        if (res.data && res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.message.succesSendToApproval'),
            life: 3000,
          });
          this.emitter.emit("planSentToApprove", true);
          this.submitted = false;
        }
        this.approving = false;
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
        this.submitted = false;
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
    },
    validate() {
      this.formValid.approvals = this.selectedUsers.length === 0;

      return !this.formValid.approvals;
    }
  }
}
</script>

<style scoped>

</style>
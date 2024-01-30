<template>
  <!-- <ReportPdf ref="pdf" v-if="!isSciencePlan" :data="data" :report-title="r" :plan="plan" style="display: none;"></ReportPdf> -->
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal" :style="{ width: '50vw' }" class="p-fluid" @closed="closeModal" @hide="closeModal"
          :closeOnEscape="true">
    <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="approving">
      <div class="field">
        <ApprovalUsers :approving="approving" v-model="approval_users" @closed="closeModal" @approve="approve($event)" :stages="stages" :mode="'standard'">
        </ApprovalUsers>
      </div>
    </BlockUI>
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
import ReportPdf from "@/components/work_plan/RerportPdf";
import html2pdf from "html2pdf.js";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index"

export default {
  name: "WorkPlanReportApprove",
  components: {ApprovalUsers},
  props: ['visible', 'docId', 'report', 'events', 'approvalStages', 'plan', 'reportFd'],
  emits: ['sentToApprove', 'closed'],
  data() {
    return {
      data: this.report,
      showModal: this.visible,
      selectedUsers: null,
      steps: 3,
      step: 1,
      // approval_users: [],
      approval_users: [
        {
          stage: 1,
          users: [],
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
      fd: this.reportFd ? this.reportFd : new FormData(),
      submitted: false,
      formValid: {
        approvals: false
      },
      doc_id: this.docId,
      report_id: this.data ? this.data.id : null,
      planService: new WorkPlanService(),
      approveComponentKey: 0,
      approving: false,
      stages: this.approvalStages ? this.approvalStages : null,
      Enum: Enum
    }
  },
  created() {
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
  },
  // mounted() {
  //   this.emitter.on("reportFD", (data) => {
  //     console.log("reportFD mounted", data);
  //     if (data) {
  //       this.fd = data;
  //     }
  //   });
  // },
  methods: {
    closeModal() {
      this.showModal = false;
      this.$emit('closed', true)
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
      this.approving = true;
      this.approval_users = event
      this.submitted = true
      this.fd.append("report_id", this.data.id)

      this.fd.append("doc_id", this.doc_id)
      this.fd.append("approval_users", JSON.stringify(this.approval_users))
      this.planService.approvePlan(this.fd).then(res => {
        if (res.data && res.data.is_success) {
          this.$toast.add({severity: "success", summary: this.$t('common.message.succesSendToApproval'), life: 3000});
          this.$emit('sentToApprove')
          this.submitted = false;
        }
        this.approving = false;
        this.showModal = false;
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
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
    },
  },
  computed: {
    isSciencePlan() {
      console.log(this.plan.plan_type.code)
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    }
  }
}
</script>

<style scoped></style>
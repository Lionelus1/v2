<template>
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal" :style="{ width: '50vw' }"
          class="p-fluid" @closed="closeModal"
          @hide="closeModal" :closeOnEscape="true">
    <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="approving">
      <div class="field">
        <ApprovalUsers :approving="approving" v-model="approval_users" @closed="closeModal" @approve="approve($event)"
                       :stages="stages" :mode="'standard'">
        </ApprovalUsers>
      </div>
    </BlockUI>
  </Dialog>
</template>

<script>
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index"
import {b64toBlob} from "@/config/config";

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
      step: 1,
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
        },
      ],
      currentStageUsers: null,
      currentStage: 1,
      prevStage: 0,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
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
      Enum: Enum,
      file: null
    }
  },
  created() {
    this.getWorkPlanReportData();
  },
  methods: {
    closeModal() {
      this.showModal = false;
      this.$emit('closed', true)
    },
    approve(event) {
      this.approving = true;
      this.approval_users = event
      this.submitted = true
      const fd = new FormData()
      fd.append("file", this.file)
      fd.append("report_id", this.data.id)
      fd.append("doc_id", this.doc_id)
      fd.append("approval_users", JSON.stringify(this.approval_users))
      this.planService.approvePlan(fd).then(res => {
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
    getWorkPlanReportData() {
      let data = {
        work_plan_id: parseInt(this.plan.work_plan_id),
        quarter: this.report.report_type === 2 ? this.report.quarter : null,
        halfYearType: this.report.report_type === 3 ? this.report.halfYearType : null,
        department_id: this.report.department_id ? this.report.department_id : null,
        report_id: this.report.id,
        is_report: true
      };
      this.planService.getWorkPlanData(data).then(res => {
        this.file = this.b64toBlob(res.data);
      }).catch(error => {
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
    b64toBlob(b64Data, sliceSize = 512) {
      const byteCharacters = window.atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {type: "application/pdf"});
      return blob;
    },
  },
  computed: {
    isSciencePlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    }
  }
}
</script>

<style scoped></style>

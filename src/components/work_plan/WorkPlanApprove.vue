<template>
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal"
          :style="{width: '50vw'}" class="p-fluid">
    <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="approving">
      <div class="field">
        <ApprovalUsers :approving="approving" v-model="approval_users" @closed="closeModal"
                       @approve="approve($event)" :stages="stages" :mode="'standard'"></ApprovalUsers>
      </div>
    </BlockUI>
  </Dialog>
</template>

<script>
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import {b64toBlob} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index"

export default {
  name: "WorkPlanApprove",
  components: {ApprovalUsers},
  props: ['visible', 'docId', 'plan', 'events', 'approvalStages'],
  emits: ['isSent', 'hide'],
  data() {
    return {
      data: this.plan,
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
        }
      ],
      currentStageUsers: null,
      currentStage: 1,
      prevStage: 0,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      submitted: false,
      planService: new WorkPlanService(),
      approveComponentKey: 0,
      approving: false,
      stages: this.approvalStages || null,
      enum: Enum,
      file: null
    }
  },
  created() {
    //this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.approveComponentKey++;
    this.getWorkPlanContentData();
  },
  methods: {
    closeModal() {
      this.$emit('hide')
    },
    approve(event) {
      this.approving = true;
      this.submitted = true;
      this.approval_users = event
      let workPlanId = this.data.work_plan_id;
      const fd = new FormData()
      fd.append("file", this.file)
      fd.append("work_plan_id", workPlanId)
      fd.append("doc_id", this.plan.doc_id)
      fd.append("approval_users", JSON.stringify(this.approval_users))
      
      this.planService.savePlanFile(fd).then(res => {
        if (res.data && res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.message.succesSendToApproval'),
            life: 3000,
          });
          this.$emit('isSent', true)
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
    getWorkPlanContentData() {
      let isProtocolEvent = false;
      if(this.plan?.plan_type?.code === Enum.WorkPlanTypes.Directors){
        isProtocolEvent = true;
      }
      let data = {
        work_plan_id: parseInt(this.data.work_plan_id),
        is_report: false,
        is_protocol_event: isProtocolEvent,
      };
      this.planService.getWorkPlanData(data).then(res => {
        if(this.plan?.plan_type?.code === Enum.WorkPlanTypes.Directors){
          
          this.file = this.b64toBlob(res.data.generate_byte);
        }else{
          this.file = this.b64toBlob(res.data);
        }
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

      const blob = new Blob(byteArrays, { type: "application/pdf" });
      return blob;
    },
  }
}
</script>

<style scoped>

</style>

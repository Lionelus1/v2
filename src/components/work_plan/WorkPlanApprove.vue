<template>
  <PdfContent ref="pdf" v-if="data" :data="data" :planId="data.work_plan_id" :plan="plan" style="display: none;"></PdfContent>
  <!-- <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
    <div class="field">
      <label>{{ $t('common.select') }}</label>
      <ApproveComponent @add="approveChange" :stepValue="selectedUsers" v-model="selectedUsers" @changeStep="changeStep"></ApproveComponent>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button ref="approveBtn" :disabled="submitted" :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
              @click="getGeneratedPdf"/>
    </template>
  </Dialog> -->
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
//import ApproveComponent from "@/components/work_plan/ApproveComponent";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import PdfContent from "@/components/work_plan/PdfContent";
import html2pdf from "html2pdf.js";
import {getHeader, getMultipartHeader, signerApi, smartEnuApi} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan/index"

export default {
  name: "WorkPlanApprove",
  components: {PdfContent, ApprovalUsers},
  props: ['visible', 'docId', 'plan', 'events'],
  emits: ['isSent', 'hide'],
  data() {
    return {
      data: this.plan,
      showModal: this.visible,
      selectedUsers: null,
      steps: 3,
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
      loginedUserId: 0,
      fd: null,
      submitted: false,
      planService: new WorkPlanService(),
      approveComponentKey: 0,
      approving: false,
      stages: null,
      enum: Enum,
    }
  },
  created() {
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.approveComponentKey++;
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
      this.planService.savePlanFile(fd).then(res => {
        if (res.data && res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.message.succesSendToApproval'),
            life: 3000,
          });
          // this.emitter.emit("planSentToApprove", true);
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
    getGeneratedPdf() {
      this.submitted = true
      const pdfContent = this.$refs.pdf.$refs.htmlToPdf.innerHTML;
      this.planService.generatePdf(pdfContent).then(res => {
        let blob = this.b64toBlob(res.data)
        this.source = "data:application/pdf;base64," + res.data;
        const fd = new FormData();
        fd.append('wpfile', blob);
        fd.append('fname', "file.pdf")
        fd.append('work_plan_id', this.data.work_plan_id)
        this.approvePlan(fd);
      }).catch(error => {
        //console.log(error)
      })
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
    initStage() {
      if (this.plan && this.plan.plan_type && this.plan.plan_type.code === this.enum.WorkPlanTypes.Science) {
        this.stages = []
      }
    }
  }
}
</script>

<style scoped>

</style>
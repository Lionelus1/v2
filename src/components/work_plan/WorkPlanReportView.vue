<template>
  <div>
    <div class="p-col-12">
      <div class="card" v-if="isPlanCreator && !isApproval">
        <WorkPlanReportApprove :doc-id="doc_id" :report="report_id"></WorkPlanReportApprove>
        <Button label="" icon="pi pi-download" @click="download"
                class="p-button p-button-info p-ml-2"/>
      </div>
      <div class="card" v-if="isApproval && !isApproved">
        <Button v-if="isApproval && !isRejected" label="Согласовать" icon="pi pi-check" @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval && !isRejected" label="Отменить" icon="pi pi-check" @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>
      <div class="card" v-if="approval_users">
        <h5>{{ report_name }}</h5>
        <Timeline :value="approvals">
          <template #content="slotProps">
            <div v-for="(item, index) of slotProps.item" :key="index">
              {{ item.user.fullName }}
              <i v-if="item.is_success" class="pi pi-check-circle p-ml-2 p-message-success" style="font-size: 1.2rem;color: #3eaf7c"></i>
              <i v-if="!item.is_success" class="pi pi-spinner p-ml-2" style="font-size: 1.2rem;color: #c63737"></i>
            </div>
          </template>
        </Timeline>
      </div>
      <h5>Превью</h5>
      <div class="card">
        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                :data="source"></object>
      </div>
    </div>

    <div v-if="items">
      <ReportPdf ref="report" :data="items" :report-title="report_name"
                 style="display: none;"></ReportPdf>
    </div>

    <Dialog header="Отправить на корректировку" v-model:visible="showRejectPlan" :style="{width: '450px'}"
            class="p-fluid">
      <div class="p-field">
        <label>Комментарий</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import html2pdf from "html2pdf.js";
import ReportPdf from "./RerportPdf";
import {getHeader, signerApi, smartEnuApi} from "@/config/config";
import treeToList from "@/service/treeToList";
import WorkPlanReportApprove from "@/components/work_plan/WorkPlanReportApprove";
import {NCALayerClient} from "ncalayer-js-client";

export default {
  name: "WorkPlanReportView",
  components: {WorkPlanReportApprove, ReportPdf},
  props: ['id'],
  data() {
    return {
      source: null,
      document: null,
      work_plan_id: 0,
      isApproval: false,
      isRejected: false,
      loginedUserId: 0,
      plan: null,
      rejectComment: "",
      showRejectPlan: false,
      CMSSignature: null,
      documentByteArray: null,
      isApproved: false,
      reportType: null,
      quarter: null,
      report_name: null,
      items: null,
      report_id: null,
      doc_id: null,
      report: null,
      isPlanCreator: false,
      pdfOptions: {
        margin: 0.5,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: {scale: 3, letterRendering: true},
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'landscape',
        },
        pagebreak: {avoid: 'tr'},
        filename: "work_plan_report.pdf",
      },
      approval_users: [],
      approvals: []
    }
  },
  created() {
    this.report_id = parseInt(this.$route.params.id);
    this.work_plan_id = parseInt(this.$route.params.work_plan_id);
    this.quarter = parseInt(this.$route.params.quarter);
    this.report_name = this.$route.params.name;
    this.reportType = parseInt(this.$route.params.type);
    this.doc_id = this.$route.params.doc_id;
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    //this.plan = JSON.parse(localStorage.getItem("workPlan"));
    //this.getReport();
    this.getFile();
    this.getPlan();
    this.getReport();
    this.getReportApprovalUsers();
  },
  mounted() {
    this.emitter.on("reportSentToApprove", (data) => {
      if (data) {
        this.getReportApprovalUsers();
      }
    });
  },
  methods: {
    getPlan() {
      this.loading = true;
      axios.get(smartEnuApi + `/workPlan/getWorkPlanById/${this.work_plan_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.plan = res.data;
              if (this.plan && this.plan.user.id === this.loginedUserId) {
                this.isPlanCreator = true;
              }
              //this.getFile();
            }
            this.loading = false;
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
        this.loading = false;
      });
    },
    getReport() {
      axios.get(smartEnuApi + `/workPlan/getWorkPlanReportById/${this.report_id}`, {headers: getHeader()})
      .then(res => {
        console.log(res);
        this.report = res.data;
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
    getFile() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanReportFile`,
          {doc_id: this.doc_id},
          {headers: getHeader()}).then(res => {
        if (res.data) {
          this.source = `data:application/pdf;base64,${res.data}`;
          this.document = res.data;
        } else {
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
    initReportFile() {
      //let workPlanId = this.data.work_plan_id;
      const pdfContent = this.$refs.report.$refs.toPdf;
      const worker = html2pdf().set(this.pdfOptions).from(pdfContent);
      const worker1 = html2pdf().set(this.pdfOptions).from(pdfContent);

      worker.toPdf().output("datauristring").then((pdf, item) => {
        if (!this.source)
          this.source = pdf;
      });

      worker1.toPdf().output("blob").then((pdf) => {
        const fd = new FormData();
        fd.append('file', pdf);
        fd.append('filename', this.pdfOptions.filename)
        //this.fileFd.append('work_plan_id', workPlanId)
        this.emitter.emit("reportFD", fd);
      });
    },
    getData() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanReportData`, {
        work_plan_id: parseInt(this.work_plan_id),
        quarter: this.reportType === 2 ? this.quarter : null
      }, {headers: getHeader()}).then(res => {
        ///// FLATTEN ARRAY
        this.items = treeToList(res.data, 'children');
        if (!this.source) {
          this.$nextTick(() => {
            this.initReportFile();
          });
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
    download() {
      const pdfContent = this.$refs.report.$refs.toPdf;
      html2pdf().set(this.pdfOptions).from(pdfContent).save();
    },
    getReportApprovalUsers() {
      axios.get(smartEnuApi + `/workPlan/getReportApprovalUsers/${this.report_id}`, {headers: getHeader()})
      .then(res => {
        console.log(res)
        if (res.data) {
          this.approvals = [];
          const d = res.data;
          //console.log(d.every(x => x.is_success === true));
          const unique = [...new Set(d.map(item => item.stage))];
          unique.forEach(r => {
            let f = d.filter(x => x.stage === r);
            this.approvals.push(f);
          });
          this.approval_users = res.data;
          this.init();
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
    init() {
      const currentUser = this.approval_users.findIndex(x => x.user.id === this.loginedUserId);
      const last = this.approval_users?.at(-1);
      const prevObj = this.approval_users[currentUser - 1];
      const currentObj = this.approval_users[currentUser];
      const findUserFromSignatures = this.signatures && prevObj ? this.signatures.find(x => x.userId === prevObj.user.id) : null;
      if (prevObj == null && !currentObj.is_success) {
        this.isApproval = true;
      } else if (prevObj && currentObj.stage === prevObj.stage && !findUserFromSignatures) {
        this.isApproval = true;
      } else if (prevObj && prevObj.is_success && !currentObj.is_success && prevObj.stage === currentObj.stage) {
        this.isApproval = true;
      } else if (prevObj && currentObj.stage !== prevObj.stage && this.approval_users.filter(x => x.stage === 1 && x.is_success === true).length > 0) {
        this.isApproval = true;
      } else {
        this.isApproval = false;
      }

      if (last.stage === currentObj.stage) {
        this.isLast = true;
      }
    },
    getSignatures() {
      axios.post(smartEnuApi + `/workPlan/getSignatures`,
          {doc_id: this.plan.doc_id},
          {headers: getHeader()}).then(res => {
        if (res.data) {
          this.signatures = res.data;
          const signUser = res.data.find(x => x.userId === this.loginedUserId);
          if (signUser) {
            this.isCurrentUserApproved = true;
          }
        } else {
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.noData'),
            life: 3000
          });
        }
      }).catch(error => {
        this.$toast.add({
          severity: 'error',
          summary: error,
          life: 3000
        });
      })
    },
    async openApprovePlan() {
      let NCALaClient = new NCALayerClient();

      try {
        await NCALaClient.connect();
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('ncasigner.failConnectToNcaLayer'),
          life: 3000
        });
        return;
      }
      try {
        this.CMSSignature = await NCALaClient.createCAdESFromBase64('PKCS12', this.document, 'SIGNATURE', false)
        this.sendSignature();
      } catch (error) {
        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
      }
    },
    sendSignature() {
      axios.post(smartEnuApi + '/workPlan/reportSignature', {
        uuid: this.doc_id,
        sign: this.CMSSignature,
        report_id: this.report_id,
        is_last: this.isLast
      }, {headers: getHeader()}).then((response) => {
        console.log(response)
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: 'Успешно!',
            life: 3000,
          });
          this.getSignatures();
          this.getReportApprovalUsers();
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
    rejectPlan() {
      this.loading = true;
      this.plan.comment = this.rejectComment;
      axios.post(smartEnuApi + '/workPlan/reject', this.plan,
          {headers: getHeader()}
      ).then(res => {
        if (res.data.is_success) {
          this.loading = false;
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({name: 'WorkPlanEvents', params: {id: this.plan.work_plan_id}});
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
        this.loading = false;
      })
    },
    openRejectPlan() {
      this.showRejectPlan = true;
    },
    closeModal() {
      this.showRejectPlan = false;
    },
  }
}
</script>

<style scoped>
::v-deep(.p-timeline-event-opposite) {
  flex: 0;
}
</style>

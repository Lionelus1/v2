<template>
  <vue-element-loading :active="loading" is-full-screen color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)" />
  <div>
    <div class="col-12">
      <div class="card" v-if="report && report?.doc_info && report?.doc_info.docHistory.stateId === 2">
        <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')" @click="openDoc"></Button>
      </div>
      <div class="card" v-if="!isReportSentApproval && visibleSendToApprove">
        <Button v-if="visibleSendToApprove" type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')"
          @click="openModal"></Button>
        <!--        <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')" @click="openModal"></Button>-->
        <WorkPlanReportApprove v-if="showModal" :visible="showModal" :doc-id="report.doc_id" :approvalStages="approval_users" :report="report" :plan="plan"
          @sent-to-approve="getReport" @closed="closeApproveModal" />
        <!--        <Button label="" icon="pi pi-download" @click="download"
                        class="p-button p-button-info ml-2"/>-->
      </div>
      <!--      <div class="card" v-if="isPlanReportApproved && (isPlanCreator || (isApproval || isCurrentUserApproved))">
              <Button :label="$t('common.signatures')" icon="pi pi-file"
                      @click="viewSignatures"
                      class="p-button ml-2"/>
              <Button label="" icon="pi pi-download" v-if="plan && plan.is_oper"
                      @click="downloadWord"
                      class="p-button p-button-info ml-2"/>
            </div>-->
      <!--      <div class="card" v-if="!isPlanReportApproved && isReportSentApproval">
              <Button v-if="isApproval && !isRejected" :label="$t('common.action.approve')" icon="pi pi-check"
                      @click="openApprovePlan"
                      class="p-button p-button-success ml-2"/>
              <Button v-if="isApproval && !isRejected" :label="$t('workPlan.toCorrect')" icon="pi pi-check"
                      @click="openRejectPlan"
                      class="p-button p-button-danger ml-2"/>
            </div>-->
      <div class="card" v-if="report && report?.doc_info">
        <div>
          <TitleBlock :title="report.report_name" :show-back-button="true" />
          <span v-if="report" :class="'ml-3 customer-badge status-' + report?.doc_info.docHistory.stateEn">
            {{ $t('common.states.' + report?.doc_info.docHistory.stateEn) }}
          </span>
        </div>
        <!--        <Timeline :value="approvals">
                  <template #content="slotProps">
                    <div v-for="(item, index) of slotProps.item" :key="index">
                      {{ item.user.fullName }}
                      <i v-if="item.is_success" class="pi pi-check-circle ml-2 p-message-success"
                         style="font-size: 1.2rem;color: #3eaf7c"></i>
                      <i v-if="!item.is_success" class="pi pi-spinner ml-2" style="font-size: 1.2rem;color: #c63737"></i>
                    </div>
                  </template>
                </Timeline>-->
      </div>
      <div class="card" v-if="blobSource">
        <!--        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                        :data="source"></object>-->
        <embed :src="blobSource" style="width: 100%; height: 1000px" type="application/pdf" />
      </div>
    </div>

    <div v-if="items">
      <ReportPdf ref="report" :data="items" :report-title="report.report_name" :plan="plan" style="display: none;"></ReportPdf>
    </div>

    <Dialog :header="$t('workPlan.toCorrect')" v-model:visible="showRejectPlan" :style="{ width: '450px' }" class="p-fluid">
      <div class="field">
        <label>{{ $t('common.comment') }}</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="closeModal" />
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="rejectPlan" />
      </template>
    </Dialog>
  </div>

  <Sidebar v-model:visible="showReportDocInfo" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
    <DocSignaturesInfo :docIdParam="report.doc_id" :isInsideSidebar="true"></DocSignaturesInfo>
  </Sidebar>
</template>

<script>
import html2pdf from "html2pdf.js";
import ReportPdf from "./RerportPdf";
import { getHeader, signerApi, smartEnuApi } from "@/config/config";
import treeToList from "@/service/treeToList";
import WorkPlanReportApprove from "@/components/work_plan/WorkPlanReportApprove";
import { NCALayerClient } from "ncalayer-js-client";
import { runNCaLayer } from "../../helpers/SignDocFunctions";
import { WorkPlanService } from "@/service/work.plan.service";
import Enum from "@/enum/workplan";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";

export default {
  name: "WorkPlanReportView",
  components: { WorkPlanReportApprove, ReportPdf, DocSignaturesInfo },
  props: ['id'],
  data() {
    const loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
    return {
      loginedUser: loginedUser,
      source: null,
      showModal: false,
      showReportDocInfo: false,
      blobSource: null,
      document: null,
      isApproval: false,
      isRejected: false,
      loginedUserId: loginedUser.userID,
      plan: null,
      rejectComment: "",
      showRejectPlan: false,
      CMSSignature: null,
      documentByteArray: null,
      isApproved: false,
      quarter: null,
      items: null,
      report_id: parseInt(this.$route.params.id),
      doc_id: null,
      work_plan_id: null,
      report: null,
      isPlanCreator: false,
      pdfOptions: {
        margin: 0.5,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: { scale: 2.8, },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'landscape',
        },
        pagebreak: {
          avoid: ['tr']
        },
        filename: "work_plan_report.pdf",
      },
      approval_users: [],
      respUsers: [],
      planCreator: null,
      approvals: [],
      reject: {
        report_id: 0,
        doc_id: null,
        comment: null,
        report_name: null
      },
      isReportSentApproval: false,
      isCurrentUserApproved: false,
      isPlanReportApproved: false,
      loading: false,
      planService: new WorkPlanService(),

    }
  },
  mounted() {
    this.emitter.on("reportSentToApprove", (data) => {
      if (data) {
        this.getReport();
      }
    });
    //this.work_plan_id = parseInt(this.report.work_plan_id);
    //this.getRespUsers(this.report.work_plan_id);
  },
  computed: {
    isSciencePlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    },
    visibleSendToApprove() {
      return (this.loginedUser && this.respUsers.some(user => user.id === this.loginedUser.userID)) || (this.plan && this.plan.user.id === this.loginedUser.userID);
    },
  },
  created() {
    this.getReport();
  },

  methods: {
    getPlan() {
      this.planService.getPlanById(this.report.work_plan_id).then(res => {
        if (res.data) {
          this.plan = res.data;
          if (this.plan && this.plan.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
            this.planCreator = this.plan.user.id
          }
          //this.getFile();
        }
      }).catch(error => {
        this.$toast.add({ severity: "error", summary: error, life: 3000 });
      });
    },
    getRespUsers() {
      console.log(this.report);
      this.planService.getRespUsers(this.report.work_plan_id).then(res => {
        this.respUsers = res.data
      }).catch(error => {
        console.log(error);
        this.$toast.add({ severity: "error", summary: error, life: 3000 });
      });
    },
    getReport() {
      this.planService.getPlanReportById(this.report_id).then(res => {
        this.report = res.data;
        this.getPlan();
        //this.getRespUsers();
        this.getFile();
        this.getReportApprovalUsers();
        this.getRespUsers()
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
      this.planService.getPlanReportFile(this.report.doc_id).then(res => {
        if (res.data) {
          this.source = `data:application/pdf;base64,${res.data}`;
          this.blobSource = URL.createObjectURL(this.b64toBlob(res.data));
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
      this.getGeneratedPdf();

      /*const worker = html2pdf().set(this.pdfOptions).from(pdfContent);
      const worker1 = html2pdf().set(this.pdfOptions).from(pdfContent);

      worker.toPdf().output("datauristring").then((pdf, item) => {
        if (!this.source) {
          let pdfSplit = pdf.split(',');
          this.blobSource = this.b64toBlob(pdfSplit[1])
          this.source = pdf;
        }

        if (!this.document)
          this.document = pdf.replace("data:application/pdf;base64,", "")
      });

      worker1.toPdf().output("blob").then((pdf) => {
        const fd = new FormData();
        fd.append('file', pdf);
        fd.append('filename', this.pdfOptions.filename)
        //this.fileFd.append('work_plan_id', workPlanId)
        this.emitter.emit("reportFD", fd);
      });*/
    },
    getData() {
      this.loading = true;
      let data = {
        work_plan_id: parseInt(this.report.work_plan_id),
        quarter: this.report.report_type === 2 ? this.report.quarter : null,
        halfYearType: this.report.report_type === 3 ? this.report.halfYearType : null,
        department_id: this.report.department_id ? this.report.department_id : null,
        //eventUserId: this.report.respUserId ? Number(this.report.respUserId) : null
      };
      this.planService.getWorkPlanData(data).then(res => {
        ///// FLATTEN ARRAY
        this.items = treeToList(res.data, 'children', this.plan.lang);
        if (!this.source) {
          this.$nextTick(() => {
            this.getGeneratedPdf();
            //this.initReportFile();
            this.loading = false;
          });
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
    download() {
      const pdfContent = this.$refs.report.$refs.toPdf;
      html2pdf().set(this.pdfOptions).from(pdfContent).save();
    },
    getReportApprovalUsers() {
      this.planService.getReportApprovalUsers(this.report_id).then(res => {
        if (res.data) {
          this.approvals = [];
          this.isReportSentApproval = true;
          const d = res.data;
          this.isPlanReportApproved = d.every(x => x.is_success);
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
      if (currentUser !== -1) {
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
      }
    },
    getSignatures() {
      let data = { doc_id: this.report.doc_id };
      this.planService.getSignatures(data).then(res => {
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
    openApprovePlan() {
      runNCaLayer(this.$t, this.$toast, this.document, 'cms', null, false, this.$i18n.locale)
        .then(sign => {
          if (sign !== undefined) {
            this.CMSSignature = sign;
            this.sendSignature();
          }
        }).catch(error => {
          this.$toast.add({ severity: 'error', summary: error, life: 3000 });
        });
    },
    sendSignature() {
      let data = {
        uuid: this.report.doc_id,
        sign: this.CMSSignature,
        report_id: this.report_id,
        is_last: this.isLast
      };
      this.planService.signPlanReport(data).then((response) => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('ncasigner.success.signSuccess'),
            life: 3000,
          });
          this.getReport();
          this.getSignatures();
          this.getReportApprovalUsers();
        }
      }).catch(error => {
        if (error.response.status === 405) {
          this.CMSSignature = null;
          this.$toast.add({
            severity: "error",
            summary: this.$t(error.response.data),
            life: 3000,
          });
        }
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
      if (this.rejectComment) {
        this.reject.comment = this.rejectComment;
      }
      this.reject.doc_id = this.report.doc_id;
      this.reject.report_id = this.report_id;
      this.reject.report_name = this.report.report_name;
      this.planService.rejectReport(this.reject).then(res => {
        if (res.data.is_success) {
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({ name: 'WorkPlanReport', params: { id: this.report.work_plan_id } });
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
      })
    },
    async downloadWord() {
      this.getData();
      const header = `<html>`;
      const html = this.$refs.report.$refs.toPdf.innerHTML;
      let css = (
        '<style>' +
        '@page WordSection1{size: 841.9pt 595.3pt;mso-page-orientation: landscape;}' +
        'div.WordSection1 {page:WordSection1;}' +
        'table{width:100%;border-collapse:collapse;border:1px gray solid;font-size: 10.0pt !important;}td{border:1px gray solid;padding:0cm 5.4pt 0cm 5.4pt;}' +
        '.header {font-weight: bold}' +
        '</style>'
      );

      let blob = new Blob(['\ufeff', header + css + '</head><body>' + html + "</body></html>"], {
        type: 'application/msword'
      });
      let url = URL.createObjectURL(blob);
      let link = document.createElement('a');
      link.href = url;
      link.download = this.report.report_name + '.docx';
      link.click();
    },
    getGeneratedPdf() {
      let html = this.$refs.report.$refs.toPdf.innerHTML;
      html = html.replace(/<h1[^>]*>/g, '<p>').replace(/<\/h1>/g, '</p>');
      this.planService.generatePdf(html).then(res => {
        const blob = this.b64toBlob(res.data);
        this.blobSource = URL.createObjectURL(blob);
        this.source = "data:application/pdf;base64," + res.data;
        this.document = res.data;
        const fd = new FormData();
        fd.append('file', blob);
        fd.append('filename', this.pdfOptions.filename)
        this.emitter.emit("reportFD", fd);
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

      const blob = new Blob(byteArrays, { type: "application/pdf" });
      return blob;
    },
    viewSignatures() {
      this.$router.push({name: 'DocSignaturesInfo', params: {docIdParam: this.report.doc_id}})
    },
    openRejectPlan() {
      this.showRejectPlan = true;
    },
    closeModal() {
      this.showRejectPlan = false;
    },
    openModal() {
      this.showModal = true;
      if (this.plan.plan_type.id === 2) {
        this.approval_users = [
          {
            stage: 1,
            users: [this.loginedUser],
            titleRu: "",
            titleKz: "",
            titleEn: "",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            }
          },
          {
            stage: 2,
            users: [],
            titleRu: "",
            titleKz: "",
            titleEn: "",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            }
          }
        ]
      } else {
        this.approval_users = [
          {
            stage: 1,
            users: [],
            titleRu: "",
            titleKz: "",
            titleEn: "",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            }
          },
          {
            stage: 2,
            users: [],
            titleRu: "",
            titleKz: "",
            titleEn: "",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            }
          }
        ]
      }

    },
    openDoc() {
      this.showReportDocInfo = true;
    },
    reloadPage() {
      window.location.reload();
    },
    closeApproveModal() {
      this.showModal = false
    }
  }
}
</script>

<style lang="scss">
::v-deep(.p-timeline-event-opposite) {
  flex: 0;
}
</style>

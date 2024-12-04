<template>
  <vue-element-loading :active="loading" is-full-screen color="#FFF" size="80" :text="$t('common.loading')"
                       backgroundColor="rgba(0, 0, 0, 0.4)"/>
  <div>
    <div class="col-12" v-if="report && plan">
      <div class="card" v-if="report && report?.doc_info">
        <div>
          <TitleBlock :title="report.report_name" :show-back-button="true"/>
          <span v-if="report" :class="'ml-3 customer-badge status-' + report?.doc_info.docHistory.stateEn">
            {{ $t('common.states.' + report?.doc_info.docHistory.stateEn) }}
          </span>
        </div>
      </div>
      <div class="card"
           v-if="report && report?.doc_info && !(report?.doc_info.docHistory.stateId === 1 || report?.doc_info.docHistory.stateId === 4)">
        <Button type="button" icon="pi pi-eye" class="p-button-outlined" :label="$t('educomplex.tooltip.document')"
                @click="openDoc"></Button>
      </div>
      <div class="card" v-if="visibleSendToApprove">
        <Button type="button" icon="pi pi-send" class="p-button-success ml-2" :label="$t('common.toapprove')"
                @click="openModal"></Button>
        <WorkPlanReportApprove v-if="showModal" :report-fd="this.fd" :visible="showModal" :doc-id="report.doc_id"
                               :approvalStages="approval_users"
                               :report="report" :plan="plan" @sent-to-approve="getReport" @closed="closeApproveModal"/>

      </div>
      <div class="card" v-if="blobSource">
        <embed :src="blobSource" style="width: 100%; height: 1000px" type="application/pdf"/>
      </div>
    </div>

    <Dialog :header="$t('workPlan.toCorrect')" v-model:visible="showRejectPlan" :style="{ width: '450px' }"
            class="p-fluid">
      <div class="field">
        <label>{{ $t('common.comment') }}</label>
        <Textarea inputId="textarea" rows="3" cols="30" v-model="rejectComment"></Textarea>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeModal"/>
        <Button :label="$t('common.send')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                @click="rejectPlan"/>
      </template>
    </Dialog>
  </div>

  <Sidebar v-model:visible="showReportDocInfo" position="right" class="p-sidebar-lg" style="overflow-y: scroll"
           @hide="closeSideModal">
    <DocSignaturesInfo :docIdParam="report.doc_id" :isInsideSidebar="true"
                       @sentToRevision="rejectPlanReport($event)"></DocSignaturesInfo>
  </Sidebar>
</template>

<script>
import html2pdf from "html2pdf.js";
import WorkPlanReportApprove from "@/components/work_plan/WorkPlanReportApprove";
import {WorkPlanService} from "@/service/work.plan.service";
import Enum from "@/enum/workplan";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import {log} from "qrcode/lib/core/galois-field";

export default {
  name: "WorkPlanReportView",
  components: {WorkPlanReportApprove, DocSignaturesInfo},
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
        html2canvas: {scale: 2.8,},
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
      reject: {
        report_id: 0,
        doc_id: null,
        comment: null,
        report_name: null
      },
      isCurrentUserApproved: false,
      isPlanReportRevision: false,
      loading: false,
      planService: new WorkPlanService(),
      fd: new FormData(),
      isSciencePlan: false,
      reportPath: null,
    }
  },
  mounted() {
    this.emitter.on("reportSentToApprove", (data) => {
      if (data) {
        this.getReport();
      }
    });
  },
  computed: {
    visibleSendToApprove() {
      return ((this.loginedUser && this.respUsers?.some(user => user.id === this.loginedUser.userID)) || this.isPlanCreator) && (this.report && this.report.doc_info && (this.report.doc_info.docHistory.stateId === 1 || this.report.doc_info.docHistory.stateId === 4));
    },
  },
  created() {
    this.getReport();
    if (this.doc_info && this.doc_info.docHistory.stateId === 4) {
      this.isPlanReportRevision = true
    }
  },

  methods: {
    closeSideModal() {
      this.showReportDocInfo = false;
      this.$emit('closed', true)
    },
    getPlan() {
      this.planService.getPlanById(this.report.work_plan_id).then(res => {
        if (res.data) {
          this.plan = res.data;
          if (this.plan && this.plan.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
            this.planCreator = this.plan.user.id
            this.isSciencePlan = this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
          }
        }
      }).catch(_ => {
      });
    },
    getRespUsers() {
      this.planService.getRespUsers(this.report.work_plan_id).then(res => {
        this.respUsers = res.data
      }).catch(_ => {
      });
    },
    getReport() {
      this.planService.getPlanReportById(this.report_id).then(res => {
        this.report = res.data;
        this.getPlan();
        this.getFile();
        // this.getReportApprovalUsers();
        this.getRespUsers()
      });
    },
    getFile() {
      this.planService.getPlanReportFile(this.report.doc_id).then(res => {
        if (res.data && this.report && this.report.doc_info.docHistory.stateId !== 4) {
          //kelisimge jiberilger bolsa daiyn filedi alam
          this.source = `data:application/pdf;base64,${res.data}`;
          this.blobSource = URL.createObjectURL(this.b64toBlob(res.data));
          this.document = res.data;
        } else {
          this.getData();
        }
      });
    },
    getData() {
      this.loading = true;
      let data = {
        work_plan_id: parseInt(this.report.work_plan_id),
        quarter: this.report.report_type === 2 ? this.report.quarter : null,
        halfYearType: this.report.report_type === 3 ? this.report.halfYearType : null,
        department_id: this.report.department_id ? this.report.department_id : null,
        report_id: this.report_id,
        is_report: true
      };
      if (this.plan?.plan_type?.code === Enum.WorkPlanTypes.Masters) {
        data.quarter = this.report?.quarter
      }
      this.planService.getWorkPlanData(data).then(res => {
        this.source = `data:application/pdf;base64,${res.data}`;
        this.blobSource = URL.createObjectURL(this.b64toBlob(res.data));
        this.loading = false;
      }).catch(_ => {
        this.loading = false;
      });
    },
    download() {
      const pdfContent = this.$refs.report.$refs.toPdf;
      html2pdf().set(this.pdfOptions).from(pdfContent).save();
    },
    getReportApprovalUsers() {
      this.planService.getReportApprovalUsers(this.report_id).then(res => {
        if (res.data) {
          this.approval_users = res.data;
        }
      })
    },
    rejectPlanReport(comment) {
      this.reject.comment = comment;
      this.reject.doc_id = this.report.doc_id;
      this.reject.report_id = this.report_id;
      this.reject.report_name = this.report.report_name;
      this.planService.rejectReport(this.reject).then(res => {
        if (res.data.is_success) {
          this.showRejectPlan = false;
          this.emitter.emit("planRejected", true);
          this.$router.push({name: 'WorkPlanReport', params: {id: this.report.work_plan_id}});
        }
        this.getReport()
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
    closeModal() {
      this.showRejectPlan = false;
    },
    openModal() {
      this.showModal = true;
      if (this.plan.plan_type.id === 2 && !this.isPlanCreator) {
        this.approval_users = [
          {
            stage: 1,
            users: [this.loginedUser],
            titleRu: "Структурное подразделение",
            titleKz: "Құрылымдық бөлім",
            titleEn: "Structural department",
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
            titleRu: "Начальник отдела стратегического планирования",
            titleKz: "Стратегиялық жоспарлау бөлімінің бастығы",
            titleEn: "Head of the Strategic Planning Department",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            }
          }
        ]
      } else if (this.plan.plan_type.id === 5 || this.plan.plan_type.id === 6) {
        this.approval_users = [
          {
            stage: 1,
            users: [this.loginedUser],
            titleRu: 'Студент',
            titleKz: 'Студент',
            titleEn: 'Student',
            certificate: {
              namekz: 'Жеке тұлғаның сертификаты',
              nameru: 'Сертификат физического лица',
              nameen: 'Certificate of an individual',
              value: 'individual',
            },
          },
          {
            stage: 2,
            users: null,
            titleRu: "Научный руководитель",
            titleKz: "Ғылыми жетекші",
            titleEn: "Scientific adviser",
            certificate: {
              namekz: "Жеке тұлғаның сертификаты",
              nameru: "Сертификат физического лица",
              nameen: "Certificate of an individual",
              value: "individual"
            },
          },
          {
            stage: 3,
            users: null,
            titleRu: "Заведующий кафедры",
            titleKz: "Кафедра меңгерушісі",
            titleEn: "Head of Department",
            certificate: {
              namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
              nameru: "Для внутреннего документооборота (ГОСТ)",
              nameen: "For internal document management (GOST)",
              value: "internal"
            },
          },
        ];
      } else {
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
          }
        ]
      }
      if (this.plan.plan_type.id === 6) {
        this.approval_users.push({
          stage: 4,
          users: null,
          titleRu: 'Декан факультета',
          titleKz: 'Факультет деканы',
          titleEn: 'Dean of the Faculty',
          certificate: {
            namekz: 'Ішкі құжат айналымы үшін (ГОСТ)',
            nameru: 'Для внутреннего документооборота (ГОСТ)',
            nameen: 'For internal document management (GOST)',
            value: 'internal',
          },
        },)
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

.customer-badge {

  &.status-5 {
    background: #ff3838;
    color: #ffffff;
  }

  &.status-4 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-2 {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }
}
</style>

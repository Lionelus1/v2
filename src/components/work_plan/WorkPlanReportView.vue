<template>
  <div>
    <div class="p-col-12">
      <div class="card" v-if="isApproval && !isApproved">
        <Button v-if="isApproval && !isRejected" label="Согласовать" icon="pi pi-check" @click="openApprovePlan"
                class="p-button p-button-success p-ml-2"/>
        <Button v-if="isApproval && !isRejected" label="Отменить" icon="pi pi-check" @click="openRejectPlan"
                class="p-button p-button-danger p-ml-2"/>
      </div>
      <div class="card">
        <object src="#toolbar=0" style="width: 100%; height: 1000px" v-if="source" type="application/pdf"
                :data="source"></object>
      </div>
    </div>


    <ReportPdf ref="reportpdf" :data="items" :report-title="report_name" style="display: none"></ReportPdf>

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
import {getHeader, smartEnuApi} from "../../config/config";

export default {
  name: "WorkPlanReportView",
  components: {ReportPdf},
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
      items: []
    }
  },
  created() {
    this.work_plan_id = this.$route.params.id;
    this.quarter = parseInt(this.$route.params.quarter);
    this.report_name = this.$route.params.name;
    this.reportType = parseInt(this.$route.params.type);
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.plan = JSON.parse(localStorage.getItem("workPlan"));
    this.getData();
  },
  methods: {
    initReportFile() {
      //let workPlanId = this.data.work_plan_id;
      let pdfOptions = {
        margin: 15,
        image: {
          type: 'jpeg',
          quality: 1,
        },
        html2canvas: {scale: 3},
        jsPDF: {
          unit: 'px',
          format: 'a4',
          //orientation: 'p',
          hotfixes: ["px_scaling"]
        },
        filename: "work_plan_report.pdf"
      };
      const pdfContent = this.$refs.reportpdf.$refs.htmlToPdf;
      const worker = html2pdf().set(pdfOptions).from(pdfContent);

      worker.toPdf().output("datauristring").then((pdf, item) => {
        this.source = pdf;
      });
    },
    getData() {
      axios.post(smartEnuApi + `/workPlan/getWorkPlanReportData`, {
        work_plan_id: parseInt(this.work_plan_id),
        quarter: this.reportType === 2 ? this.quarter : null
      }, {headers: getHeader()}).then(res => {
        console.log("report", res)
        let ind = 1;
        let parentIndex = 0;
        res.data.map(e => {
          this.items.push(e);
          if (e.parent_id) {
            e.index = `${parentIndex}.${ind++}`
          } else {
            e.index = ind++;
            parentIndex = e.index
          }
          if (e.children) {
            let chInd = 1;
            e.children.forEach(ec => {
              ec.index = `${e.index}.${chInd++}`
              if (ec.quarter) {
                ec.quarter = this.initQuarter(ec.quarter.String);
              }
              this.items.push(ec);
            });
          }
          if (e.quarter) {
            e.quarter = this.initQuarter(e.quarter.String);
          }
        });
        this.initReportFile();
      }).catch(error => {
        if (error.response.status === 401) {
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
    initQuarter(quarter) {
      let res = '';
      switch (quarter) {
        case "1":
          res = 'I';
          break;
        case "2":
          res = 'II';
          break;
        case "3":
          res = 'III';
          break;
        case "4":
          res = 'IV';
          break;
        case "5":
          res = 'Весь год';
          break;
      }
      return res;
    }
  }
}
</script>

<style scoped>

</style>

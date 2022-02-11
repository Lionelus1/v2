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
import {getHeader, smartEnuApi} from "@/config/config";
import treeToList from "@/service/treeToList";

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
      items: null,
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
        margin: 10,
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
        pagebreak: {avoid: 'tr'},
        filename: "work_plan_report.pdf"
      };
      const pdfContent = this.$refs.report.$refs.toPdf;
      console.log("ddd")
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
        ///// FLATTEN ARRAY
        this.items = treeToList(res.data, 'children');
        this.$nextTick(() => {
          this.initReportFile();
        })
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
    }
    /*initChild(e, parentIndex, ind) {
      this.items.push(e);
      if (e.parent_id) {
        e.index = `${parentIndex}.${ind++}`
      } else {
        e.index = ind++;
        parentIndex = e.index
      }
      if (e.quarter) {
        e.quarter = this.initQuarter(e.quarter.String);
      }
      if (e.children) {
        let chInd = 1;
        e.children.forEach((ec, index) => {
          this.items.push(ec);
          ec.index = `${e.index}.${index + 1}`
          if (ec.quarter) {
            ec.quarter = this.initQuarter(ec.quarter.String);
          }
          this.initChild(ec, parentIndex, index)
        });
      }
    }*/
  }
}
</script>

<style scoped>

</style>

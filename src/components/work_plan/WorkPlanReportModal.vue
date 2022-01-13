<template>
  <Button
      type="button"
      icon="pi pi-document"
      class="p-button p-button-info p-ml-2"
      label="Отчет"
      @click="openModal"
  ></Button>

  <PdfContent ref="pdf" v-if="work_plan_id" :planId="work_plan_id" style="display: none;"></PdfContent>

  <Dialog header="Отчет" v-model:visible="selectQuarterModal" :style="{width: '450px'}"
          class="p-fluid">
    <div class="p-field">
      <label>Наименование отчета</label>
      <InputText v-model="report_name" />
    </div>
    <div class="p-field">
      <label>Выберите тип</label>
      <Dropdown v-model="type" :options="reportTypes" optionLabel="name" optionValue="id" placeholder="Выберите"
                @select="selectReportType"/>
    </div>
    <div class="p-field" v-if="type === 2">
      <label>Квартал</label>
      <Dropdown v-model="quarter" :options="reportQuarters" optionLabel="name" optionValue="id" placeholder="Выберите" />
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
              @click="closeModal"/>
      <Button label="Ок" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"
              @click="initReport(true)"/>
    </template>
  </Dialog>
</template>

<script>
import PdfContent from "@/components/work_plan/PdfContent";
import html2pdf from "html2pdf.js";

export default {
  components: [PdfContent],
  name: "WorkPlanReportModal",
  props: ['planId', 'plan'],
  data() {
    return {
      selectQuarterModal: false,
      quarter: null,
      type: null,
      work_plan_id: this.planId,
      report_name: this.plan.work_plan_name,
      reportTypes: [
        {
          id: 1,
          name: 'Годовой'
        },
        {
          id: 2,
          name: 'Квартальный'
        },
      ],
      reportQuarters: [
        {
          id: 1,
          name: 'I'
        },
        {
          id: 2,
          name: 'II'
        },
        {
          id: 3,
          name: 'III'
        },
        {
          id: 4,
          name: 'IV'
        }
      ],
    }
  },
  methods: {
    selectReportType() {
      /*if (this.type === 1) {

      } else if (this.type === 2) {

      }*/
    },
    initReportFile() {
      let workPlanId = this.data.work_plan_id;
      let pdfOptions = {
        margin: 15,
        image: {
          type: 'jpeg',
          quality: 1,
        },
        html2canvas: {scale: 3},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'p',
        },
        filename: "work_plan_report.pdf"
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
    openModal() {
      this.selectQuarterModal = true;
    },
    closeModal() {
      this.selectQuarterModal = false;
    }
  }
}
</script>

<style scoped>

</style>
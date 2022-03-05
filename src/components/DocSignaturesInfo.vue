<template>
  <div>
    <div class="p-col-12">
      <div class="card">
        <Button :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download"
                @click="downloadSignatures"
                class="p-button p-ml-2"/>
      </div>
      <div class="card">
        <work-plan-qr-pdf ref="qrToPdf" v-if="signatures" :signatures="signatures" :title="docInfo.name"></work-plan-qr-pdf>
<!--        <div v-if="signatures" class="p-m-2">
          <div v-for="(item, index) of signatures" :key="index" style="border: 1px solid #000; padding: 5px; margin: 5px;display: inline-block;">
            <p v-if="item.user"><b>{{item.user.fullName}}</b> ({{$t('ncasigner.IIN')}} <em>{{item.user.IIN}}</em>) <br/> {{$t('ncasigner.signed')}} {{ new Date(item.signDate).toLocaleDateString() + ", " + new Date(item.signDate).toLocaleTimeString() }}</p>
            <qrcode-vue class="p-m-2" margin="1" size="300" render-as="svg"  :value="item.signature" level="L"></qrcode-vue>
          </div>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script>
import WorkPlanQrPdf from "@/components/work_plan/WorkPlanQrPdf";
import QrcodeVue from 'qrcode.vue'
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import html2pdf from "html2pdf.js";

export default {
  name: "DocSignaturesInfo",
  components: {WorkPlanQrPdf},
  data() {
    return {
      signatures: null,
      plan: null,
      doc_id: this.$route.params.uuid,
      docInfo: null
    }
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      axios.get(smartEnuApi + `/getDocInfo/${this.doc_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.docInfo = res.data;
              this.signatures = res.data.signatures;
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
    getSignatures() {
      axios.post(smartEnuApi + `/workPlan/getSignatures`,
          {doc_id: this.plan.doc_id},
          {headers: getHeader()}).then(res => {
        if (res.data) {
          console.log(res.data)
          this.signatures = res.data;
          const signUser = res.data.find(x => x.userId === this.loginedUserId);
          if (signUser) {
            this.isApproved = true;
          }
        }
      }).catch(error => {
        this.$toast.add({
          severity: 'error',
          summary: error,
          life: 3000
        });
      })
    },
    downloadSignatures() {
      let pdfOptions = {
        margin: 10,
        image: {
          type: 'jpeg',
          quality: 0.95,
        },
        html2canvas: {scale: 3, letterRendering: true},
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          hotfixes: ["px_scaling"]
        },
        pagebreak: {avoid: '#qr'},
        filename: this.docInfo.name + ".pdf"
      };
      const pdfContent = this.$refs.qrToPdf.$refs.qrToPdf;
      html2pdf().set(pdfOptions).from(pdfContent).save();
    }
  }
}
</script>

<style scoped>

</style>
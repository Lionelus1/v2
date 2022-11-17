<template>
  <div v-if="!loading">
    <DocInfo :document="docInfo" v-if="!incorrect" :docID="doc_id"/>
    <ProgressBar v-if="signing" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="signing" :fullScreen="true"></BlockUI>
    <TabView v-model:activeIndex="active" @tab-change="showFile">
      <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
        <div class="p-col-12" v-if="isShow">
          <Button :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" @click="downloadSignatures"
                  class="p-button p-ml-2"/>
          <SignatureQrPdf ref="qrToPdf" :signatures="signatures" :title="docInfo.name"></SignatureQrPdf>
        </div>
        <div class="p-col-12" v-else>
          <div class="card">
            <Message severity="error">{{ $t('common.message.accessDenied') }}</Message>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('ncasigner.goToDoc')" :disabled="!isShow">
        <div class="card">
          <embed :src="file" style="width: 100%; height: 1000px" v-if="file" type="application/pdf"/>

        </div>
      </TabPanel>
      <TabPanel v-if="docInfo.docHistory.stateId==2 ||docInfo.docHistory.stateId==6" :header="$t('ncasigner.sign')"
                :disabled="isSignShow">
        <div class="p-mt-2">
          <Panel>
            <template #header>
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </template>
            <div class="p-d-flex p-jc-center">
              <Button icon="pi pi-user-edit"
                      class="p-button-primary p-md-5" @click="sign" :label="$t('ncasigner.sign')" :loading="signing"/>
            </div>
          </Panel>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";
import {runNCaLayer, makeTimestampForSignature} from "@/helpers/SignDocFunctions"

import axios from "axios";
import {getHeader, smartEnuApi, b64toBlob} from "@/config/config";
import html2pdf from "html2pdf.js";
import DocInfo from "@/components/ncasigner/DocInfo";


export default {
  name: "DocSignaturesInfo",
  components: {SignatureQrPdf, DocInfo},
  props: {
    docIdParam: {
      type: String,
      default: null
    },
    signerIinParam: {
      type: String,
      default: null
    },
    signerTypeParam: {
      type: String,
      default: null
    },
    showAllSignsParam: {
      type: Boolean,
      default: false
    },
    /**
     * Парамер метки времени
     * default - false. Метка времени отключена.
     * Для того, чтобы поставить метку времени надо задать значение true.
     */
    tspParam: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      signatures: null,
      plan: null,
      doc_id: this.$route.params.uuid,
      isTspRequired: Boolean,
      signerIin: null,
      signerType: null,
      docInfo: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      isShow: false,
      showAllSigns: false,
      loading: true,
      signing: false,
      file: null,
      active: 0,
      isSignShow: false
    }
  },
  created() {
    if (!this.doc_id) {
      this.doc_id = this.docIdParam
    }
    this.isTspRequired = this.tspParam
    this.signerIin = this.signerIinParam
    this.signerType = this.signerTypeParam
    this.showAllSigns = this.showAllSignsParam
    this.getData();
  },
  methods: {
    b64toBlob: b64toBlob,
    showMessage(msgtype, message, content) {
      this.$toast.add({severity: msgtype, summary: message, detail: content, life: 3000});
    },
    showFile() {
      if (this.active == 1 && !this.file) { // showFileTab
        axios.post(
            smartEnuApi + "/downloadFile", {
              filePath: this.docInfo.filePath
            }, {
              headers: getHeader()
            }
        )
            .then(response => {
              (
                  this.file = this.b64toBlob(response.data)
              )
            })
      }
    },
    getData() {
      axios.get(smartEnuApi + `/getDocInfo/${this.doc_id}`, {headers: getHeader()})
          .then(res => {
            if (res.data) {
              this.docInfo = res.data;
              this.signatures = res.data.signatures;
              this.showAllSignsParam ? this.isShow = true :
                  this.isShow = this.signatures.some(x => x.userId === this.loginedUserId) || this.docInfo.docHistory.setterId === this.loginedUserId;
              this.isSignShow = this.signatures.some(x => x.userId === this.loginedUserId && (x.signature || x.signature !== ''));
              this.signatures.map(e => {
                e.sign = this.chunkString(e.signature, 1200)
              });
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
    sign() {
      this.signing = true;
      axios.post(
          smartEnuApi + "/downloadFile", {
            filePath: this.docInfo.filePath
          }, {
            headers: getHeader()
          }
      )
          .then(response => {
            (
                runNCaLayer(this.$t, this.$toast, response.data, 'cms',this.signerType, this.isTspRequired, this.$i18n.locale)
                    .then(sign => {
                      if (sign != undefined) {
                          this.sendRequest(sign)
                      }
                    }).catch(e => {
                  console.log(e)
                  this.signing = false;
                })
            ).catch(error => {
              this.signing = false;
              if (error.response.status == 401) {
                this.$store.dispatch("logLout");
              }
            })
          })
    },
    sendRequest(signature) {
      var req = {
        userID: this.$store.state.loginedUser.userID,
        docUUID: this.docInfo.uuid,
        sign: signature,
        signerIin: this.signerIin,
        isTspRequired: this.isTspRequired
      };
      this.signing = true

      axios.post(smartEnuApi + "/doc/sign", req, {headers: getHeader()})
          .then(response => {
            this.signing = false
            this.getData()
            this.showMessage('success', this.$t('ncasigner.signDocTitle'), this.$t('ncasigner.success.signSuccess'));
          })
          .catch(error => {
            this.signing = false
            if (error.response.status == 405) {
              this.$toast.add({
                severity: "error",
                summary: this.$t(error.response.data),
                life: 3000,
              });
            }
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else
              this.signing = false;
          })
    },
    getSignatures() {
      axios.post(smartEnuApi + `/workPlan/getSignatures`, {doc_id: this.plan.doc_id}, {headers: getHeader()}).then(res => {
        if (res.data) {
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
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
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
    },
    chunkString(str, n) {
      const arr = [];
      for (let index = 0; index < str.length; index += n) {
        arr.push(str.slice(index, index + n));
      }
      return arr;
    }
  }
}
</script>

<style scoped>

</style>
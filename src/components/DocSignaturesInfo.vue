<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  </div>
  <div>
    <ProgressBar v-if="signing" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="signing" :fullScreen="true"></BlockUI>
  </div>
  <div v-if="!loading">
    <DocInfo :document="docInfo" v-if="!incorrect" :docID="doc_id"/>
    <TabView v-model:activeIndex="active" @tab-change="showFile">
      <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
        <div class="col-12" v-if="isShow">
          <Button v-if="signatures && signatures.length > 0 || approvalStages && showSign()" :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" @click="downloadSignatures"
                  class="p-button ml-2"/>
          <SignatureQrPdf ref="qrToPdf" :showSign="showSign()" :signatures="signatures" :title="docInfo.name" :approvalStages="approvalStages"></SignatureQrPdf>
        </div>
        <div class="col-12" v-else>
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
                :disabled="hideDocSign">
        <div class="mt-2">
          <Panel>
            <template #header>
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </template>
            <div class="flex justify-content-center">
              <Button icon="pi pi-user-edit"
                      class="p-button-primary md:col-5" @click="sign" :label="$t('ncasigner.sign')" :loading="signing"/>
            </div>
          </Panel>
          <div v-if="isIndivid" class="p-mt-2">
            <Panel>
              <template #header>
                <div class="p-d-flex p-jc-center">
                  <InlineMessage class="" severity="info">{{ $t('ncasigner.qrSinging') }}</InlineMessage>
                </div>
              </template>
              <div class="p-d-flex p-jc-center">
                <qrcode-vue size="350" render-as="svg" margin="2" :value="mgovSignUri"></qrcode-vue>
              </div>
            </Panel>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";
import {runNCaLayer, makeTimestampForSignature} from "@/helpers/SignDocFunctions"

import axios from "axios";
import {getHeader, smartEnuApi, socketApi, b64toBlob, findRole} from "@/config/config";
import html2pdf from "html2pdf.js";
import DocInfo from "@/components/ncasigner/DocInfo";
import QrcodeVue from "qrcode.vue";
import Enum from "@/enum/docstates/index";

export default {
  name: "DocSignaturesInfo",
  components: {SignatureQrPdf, DocInfo, QrcodeVue},
  props: {
    docIdParam: {
      type: String,
      default: null
    },
    signerIinParam: {
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
      approvalStages: null,
      plan: null,
      doc_id: this.$route.params.uuid,
      isTspRequired: Boolean,
      signerIin: null,
      docInfo: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      loginedUserForMgovws: JSON.parse(localStorage.getItem("loginedUser")),
      isShow: false,
      showAllSigns: false,
      loading: false,
      signing: false,
      file: null,
      active: 0,
      hideDocSign: true,
      isIndivid: false,
      mgovSignUri: null,
      enum: Enum
    }
  },
  created() {
    if (!this.doc_id) {
      this.doc_id = this.docIdParam
    }
    const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
    this.mgovSignUri = 'mobileSign:'+ smartEnuApi +'/mobileSignParams?docUuid=' + this.doc_id +
        "&token=" + tokenData.access_token
    this.isTspRequired = this.tspParam
    this.signerIin = this.signerIinParam
    this.showAllSigns = this.showAllSignsParam
    this.getData();
  },
  mounted() {
    this.wsconnect()
  },
  methods: {
    findRole: findRole,
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
      this.loading = true
      axios.post(smartEnuApi + `/agreement/getSignInfo`, {
        doc_uuid: this.doc_id,
      }, {
        headers: getHeader(),
      }).then(res => {
        if (res.data) {
          this.docInfo = res.data;
          this.signatures = res.data.signatures;

          if (this.showAllSignsParam) {
            this.isShow = true;
          } else {
            this.isShow = this.findRole(null, "career_moderator") || (this.signatures && this.signatures.some(x => x.userId === this.loginedUserId)) ||
              this.docInfo.docHistory.setterId === this.loginedUserId || this.docInfo.creatorID === this.loginedUserId;
          }


          if (this.signatures) {
            this.hideDocSign = !this.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));
            this.isIndivid = this.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === '') && (x.signRight && x.signRight !== '') && x.signRight === 'individual');

            this.signatures.map(e => {
              e.sign = this.chunkString(e.signature, 1200)
            });
          }

          if (this.docInfo.needApproval || this.docInfo.sourceType === this.enum.DocSourceType.FilledDoc) {
            this.approvalStages = res.data.approvalStages;

            if (!this.showAllSignsParam && !this.isShow && this.approvalStages) {
              for (let element of this.approvalStages) {
                this.isShow = this.isShow || (element.users && element.users.some(x => x.userID === this.loginedUserId));
                if (this.isShow) {
                  break;
                }
              }
            }

            if (this.hideDocSign && this.approvalStages) {
              for (let element of this.approvalStages) {
                if (!element.signatures) {
                  continue;
                }

                this.hideDocSign = !element.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));

                if (!this.hideDocSign) {
                  break;
                }
              }
            }

            if (this.approvalStages)
              this.approvalStages.map(stage => {
                if (stage.signatures)
                  stage.signatures.map(e => {
                    e.sign = this.chunkString(e.signature, 1200)
                  })
              });
          }
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
    showSign() {
      let showSign = false

      if (this.docInfo && this.docInfo.docHistory && this.docInfo.docHistory.stateId && this.docInfo.docHistory.stateId > this.enum.CREATED.ID) {
        showSign = true
      }

      return showSign
    },
    sign() {
      this.signing = true;
      axios.post(smartEnuApi + "/downloadFile", {
        filePath: this.docInfo.filePath
      }, {
        headers: getHeader()
      }).then(response => {
        runNCaLayer(this.$t, this.$toast, response.data, 'cms',this.signerType, this.isTspRequired, this.$i18n.locale).then(sign => {
          if (sign != undefined) {
            this.sendRequest(sign)
          }
        }).catch(e => {
          console.log(e)
          this.signing = false;
        })
      }).catch(error => {
        this.signing = false;
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      })
    },
    sendRequest(signature) {
      var req = {
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
        pagebreak: {avoid: ['#qr']},
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
    },
    wsconnect() {
      let t = this;
      this.connection =new WebSocket(socketApi+'/mgovws');
      this.connection.onmessage = function(data) {
        let response = JSON.parse(data.data)
        if (response.result === 'error') {
          t.$toast.add({
            severity: 'error',
            summary: response.errorMessage,
            life: 3000
          });
        } else if (response.result === 'success') {
          t.getData()
          t.showMessage('success', t.$t('ncasigner.signDocTitle'), t.$t('ncasigner.success.signSuccess'));
        } else if (response.result === 'unsigned') {
          this.$toast.add({
            severity: "error",
            summary: t.$t(response.errorMessage),
            life: 3000,
          });
        }
      }
      this.connection.onopen = function(event) {
        t.connection.send(JSON.stringify(t.loginedUserForMgovws));
      }
    },
  }
}
</script>

<style scoped>

</style>

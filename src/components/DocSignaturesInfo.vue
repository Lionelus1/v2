<template>
  <Toast v-if="!isInsideSidebar"/>
  <div v-if="!isInsideSidebar" class="layout-topbar no-print">
    <div class="layout-topbar-icons">
      <LanguageDropdown/>
    </div>
  </div>
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
    <TabView v-model:activeIndex="active" @tab-change="tabChanged">
      <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
        <div class="col-12" v-if="isShow">
          <Button v-if="signatures && signatures.length > 0 || approvalStages && showSign()"
                  :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" @click="downloadSignatures"
                  class="p-button ml-2"/>
          <SignatureQrPdf ref="qrToPdf" :showSign="showSign()" :signatures="signatures" :title="docInfo.name"
                          :approvalStages="approvalStages"></SignatureQrPdf>
        </div>
        <div class="col-12" v-else>
          <div class="card">
            <Message severity="error">{{ $t('common.message.accessDenied') }}</Message>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('ncasigner.goToDoc')" :disabled="!isShow">
        <div class="card" v-for="(item, index) of files" :key="index">
          <embed :src="item" style="width: 100%; height: 1000px" v-if="files.length > 0" type="application/pdf"/>

        </div>
      </TabPanel>
      <TabPanel v-if="docInfo && (docInfo.docHistory.stateId==2 ||docInfo.docHistory.stateId==6)"
                :header="$t('ncasigner.sign')">
        <div class="mt-2">
          <Panel>
            <template #header>
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </template>
            <div class="flex justify-content-center">
              <Button icon="pi pi-user-edit" :disabled="hideDocSign"
                      class="p-button-primary md:col-5" @click="sign" :label="$t('ncasigner.sign')" :loading="signing"/>
            </div>
          </Panel>
          <div class="p-mt-2">
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
      <TabPanel v-if="docInfo && docInfo.docHistory.stateId === Enum.INAPPROVAL.ID && (docInfo.sourceType === Enum.DocSourceType.FilledDoc ||
        (docInfo.docType && docInfo.docType === Enum.DocType.Contract))" :header="$t('common.revision')" :disabled="hideDocRevision">
        <div class="card">
          <label> {{ this.$t('common.comment') }} </label>
          <InputText v-model="revisionComment" style="width: 100%; margin-bottom: 2rem;"></InputText>
          <div class="flex justify-content-center">
            <Button icon="fa-regular fa-circle-xmark"
                    class="p-button-danger md:col-3" @click="revision" :label="$t('common.revision')"
                    :loading="loading"/>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";
import {runNCaLayer, makeTimestampForSignature} from "@/helpers/SignDocFunctions"
import LanguageDropdown from "@/LanguageDropdown";

import axios from "axios";
import {getHeader, smartEnuApi, socketApi, b64toBlob, findRole} from "@/config/config";
import html2pdf from "html2pdf.js";
import DocInfo from "@/components/ncasigner/DocInfo";
import QrcodeVue from "qrcode.vue";
import Enum from "@/enum/docstates/index";

export default {
  name: "DocSignaturesInfo",
  components: {SignatureQrPdf, DocInfo, QrcodeVue, LanguageDropdown},
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
    },
    isInsideSidebar: {
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
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")) ? JSON.parse(localStorage.getItem("loginedUser")).userID : null,
      loginedUserForMgovws: JSON.parse(localStorage.getItem("loginedUser")),
      isShow: false,
      showAllSigns: false,
      loading: false,
      signing: false,
      file: null,
      files: [],
      active: 0,
      hideDocSign: true,
      mgovSignUri: null,
      Enum: Enum,

      hideDocRevision: true,
      revisionComment: null,
    }
  },
  created() {
    if (!this.doc_id) {
      this.doc_id = this.docIdParam
    }
    const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
    if (tokenData !== null) {
      this.mgovSignUri = 'mobileSign:' + smartEnuApi + '/mobileSignParams?docUuid=' + this.doc_id +
          "&token=" + tokenData.access_token
    }
    this.isTspRequired = this.tspParam
    this.signerIin = this.signerIinParam
    this.showAllSigns = this.showAllSignsParam
    this.getData();
  },
  mounted() {
    this.wsconnect()
    this.emitter.on('downloadCMS', (data) => {
      if (data !== null) {
        axios
            .post(smartEnuApi + "/doc/downloadCms",
                {documentUuid: this.doc_id, signatureId: data},
                {headers: getHeader(),})
            .then(res => {
              console.log(res.data)
              let result = res.data
              var link = document.createElement('a');
              link.innerHTML = 'Download file';
              link.download = result.fileName;
              link.href = result.data;
              link.click();
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      }
    });
  },
  methods: {
    findRole: findRole,
    b64toBlob: b64toBlob,
    showMessage(msgtype, message, content) {
      this.$toast.add({severity: msgtype, summary: message, detail: content, life: 3000});
    },
    tabChanged() {
      if (this.active == 1 && !this.file) { // showFileTab
        if (this.docInfo.isManifest === true) {
          axios.post(
              smartEnuApi + "/downloadManifestFiles", {
                docId: this.docInfo.id
              }, {
                headers: getHeader()
              }
          )
              .then(response => {
                let filesBase64Array = response.data
                for (let i = 0; i < filesBase64Array.length; i++) {
                  this.files.push(this.b64toBlob(filesBase64Array[i]))
                }
              })
        } else {
          axios.post(
              smartEnuApi + "/downloadFile", {
                filePath: this.docInfo.filePath
              }, {
                headers: getHeader()
              }
          )
              .then(response => {
                (
                    this.files.push(this.b64toBlob(response.data))
                )
              })
        }
      } else if (this.active == 2 && this.loginedUserId === null) {
        this.$store.dispatch("solveAttemptedUrl", this.$route)
        this.$router.push({path: '/login'});
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
              this.docInfo.docHistory.setterId === this.loginedUserId;
          }


          if (this.signatures) {
            this.hideDocSign = !this.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));
            this.signatures.map(e => {
              e.sign = this.chunkString(e.signature, 1200)
            });
          }

          if (this.docInfo.needApproval || this.docInfo.sourceType === this.Enum.DocSourceType.FilledDoc) {
            this.approvalStages = res.data.approvalStages;

            if (!this.showAllSignsParam && !this.isShow && this.approvalStages) {
              for (let element of this.approvalStages) {
                this.isShow = this.isShow || (element.users && element.users.some(x => x.userID === this.loginedUserId));
                if (this.isShow) {
                  break;
                }
              }
            }

            if (this.approvalStages) {
              for (let element of this.approvalStages) {
                if (!element.signatures) {
                  continue;
                }

                if (this.hideDocSign) {
                  this.hideDocSign = !element.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));
                }

                if (this.hideDocRevision) {
                  this.hideDocRevision = !element.signatures.some(x => x.userId === this.loginedUserId && (!x.signature || x.signature === ''));
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

          if (this.docInfo.docType === this.Enum.DocType.PostAccreditationMonitoringReport) {
            this.isShow = true
          }
        }

        this.loading = false;
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else if (error.response && error.response.status === 403) {
          this.$store.dispatch("solveAttemptedUrl", this.$route)
          this.$router.push({path: '/login'});
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

      if (this.docInfo && this.docInfo.docHistory && this.docInfo.docHistory.stateId && this.docInfo.docHistory.stateId > this.Enum.CREATED.ID) {
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
        runNCaLayer(this.$t, this.$toast, response.data, 'cms', this.signerType, this.isTspRequired, this.$i18n.locale).then(sign => {
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
      this.connection = new WebSocket(socketApi + '/mgovws');
      this.connection.onmessage = function (data) {
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
      this.connection.onopen = function (event) {
        t.connection.send(JSON.stringify(t.loginedUserForMgovws));
      }
    },
    revision() {
      if (this.revisionComment === null || this.revisionComment.length < 1) {
        this.$toast.add({
          severity: "error",
          detail: this.$t("common.noComment"),
          life: 3000,
        })
        return
      }

      this.loading = true
      axios.post(smartEnuApi + `/doc/sendtorevision`, {
        comment: this.revisionComment,
        docID: this.docInfo.id,
      }, {
        headers: getHeader()
      }).then(res => {
        this.loading = false
        location.reload()
      }).catch(err => {
        if (err.response.status == 401) {
          this.$store.dispatch("logLout");
        }

        this.$toast.add({
          severity: "error",
          detail: this.$t("common.message.saveError"),
          life: 3000,
        })

        this.loading = false
      })
    },
  }
}
</script>
<style scoped>
@media print {
  .no-print, .no-print * {
    display: none !important;
  }
}

@media print {
  .show-print, .show-print * {
    display: block !important;
    width: 100% !important;
  }
}
</style>

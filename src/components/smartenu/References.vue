<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <div class="card">
    <Toolbar>
      <template #start>
        <Button :disabled="!reference || reference.isPublic" :label="$t('ref.createQr')" icon="fa-solid fa-qrcode" 
          class="mr-2" @click="share()"></Button>
        <Button :disabled="!reference || infoRequested" :label="$t('ref.requestInfo')" icon="fa-solid fa-circle-info" 
          class="mr-2" @click="infoRequest()"></Button>
      </template>
      <template #end>
        <Button :disabled="!reference" :label="$t('ref.errorReport')" icon="fa-solid fa-eraser"
          class="p-button-danger" @click="open('correctionMail')"></Button>
      </template>
    </Toolbar>
    <div class="p-inputgroup p-input-filled lg:col-6 mt-2 mb-2 p-0" v-if="url">
      <InputText :disabled="true" :value="url"/>
      <Button v-bind:label="$t('ncasigner.copy')" v-clipboard:copy="url" v-clipboard:success="onCopy" v-clipboard:error="onFail" class="p-button-secondary"/>
    </div>
    <div>
      <embed :src="pdf" style="width: 100%; height: 1000px" v-if="pdf" type="application/pdf"/>
    </div>
  </div>
  <Dialog :header="$t('ref.errorReport')" v-model:visible="visibility.correctionMail"
    :style="{width: '50vw'}" @hide="close('correctionMail')" :modal="true">
      <div class="field p-fluid m-0">
        <Textarea v-model="commentary" autoResize rows="5" cols="30" maxlength="1024"
          :placeholder="$t('ref.correction')"></Textarea>
      </div>
      <template #footer>
        <Button :disabled="!commentary || commentary.length < 10" :label="$t('ref.sendMail')" @click="correctionRequest()" />
      </template>
    </Dialog>
</template>
<script>
import axios from 'axios';

import { getHeader, smartEnuApi, apiDomain, b64toBlob } from "@/config/config";
import Enum from "@/enum/docstates/index";

export default {
  name: 'References',
  components: {},
  props: {
    
  },
  emits: [],
  data() {
    return {
      loading: false,

      visibility: {
        correctionMail: false,
      },

      reference: null,
      pdf: null,
      url: null,

      folderId: null,
      templateId: null,

      infoRequested: false,
      commentary: null,
    }
  },
  mounted() {
    this.getReference()
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
    },
    onCopy() {
      this.showMessage('success', this.$t('ncasigner.successCopy'));
    },
    onFail() {
      this.showMessage('warn', this.$t('ncasigner.failCopy'));
    },
    getReference() {
      this.loading = true

      axios.post(smartEnuApi + '/folders', {
        folderType: Enum.FolderType.References
      }, {
        headers: getHeader()
      }).then(res => {
        if (res.data.total < 1) {
          this.showMessage('warn', this.$t('common.recordsNotFound'), null)
          
          this.loading = false
          return
        }

        axios.post(smartEnuApi + '/folders', {
          folderType: Enum.FolderType.References,
          parentId: res.data.folders[0].id
        }, {
          headers: getHeader()
        }).then(res => {
          if (res.data.total < 1) {
            this.showMessage('warn', this.$t('common.recordsNotFound'), null)
            
            this.loading = false
            return
          }

          this.folderId = res.data.folders[0].id

          axios.post(smartEnuApi + '/doctemplates', {
            folderId: this.folderId
          }, {
            headers: getHeader()
          }).then(res => {
            if (res.data.total < 1) {
              this.showMessage('warn', this.$t('common.recordsNotFound'), null)
              
              this.loading = false
              return
            }

            this.templateId = res.data.doctemplates[0].id

            axios.post(smartEnuApi + '/documents', {
              docType: Enum.DocType.Reference,
              templateId: this.templateId
            }, {
              headers: getHeader()
            }).then(res => {
              if (res.data.total < 1) {
                this.createAndGetReference()
                return
              }

              this.reference = res.data.documents[res.data.documents.length-1];
              
              if (this.reference.isPublic) {
                this.url = apiDomain + '/document/' + this.reference.uuid
              }

              if (this.reference.requests) {
                this.reference.requests.forEach(req => {
                  if (req.type === Enum.DocumentRequestType.ReferenceInfoRequest) {
                    if (req.status !== 0) {
                      var previousDate = new Date(req.completedTime);
                      var currentDate = new Date();
                      var timeDifference = currentDate - previousDate;
                      var oneDayInMilliseconds = 24 * 60 * 60 * 1000;
                      var daysPassed = Math.floor(timeDifference / oneDayInMilliseconds);
                      if (daysPassed < 1) {
                        this.infoRequested = true
                      }
                    } else {
                      this.infoRequested = true
                    }
                  }
                });
              }

              this.getPdf();

              this.loading = false
            }).catch(err => {
              if (err.response && err.response.status == 401) {
                this.$store.dispatch("logLout")
              } else if (err.response && err.response.data && err.response.data.localized) {
                this.showMessage('error', this.$t(err.response.data.localizedPath), null)
              } else {
                console.log(err)
                this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
              }

              this.loading = false
            })
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false
          })
        }).catch(err => {
          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout")
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null)
          } else {
            console.log(err)
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
          }

          this.loading = false
        })
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    createAndGetReference() {
      this.loading = true

      axios.post(smartEnuApi + '/document/create', {
        templateId: this.templateId,
        docType: Enum.DocType.Reference,
      }, {
        headers: getHeader()
      }).then(res => {
        this.reference = res.data;

        this.getPdf()
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    share() {
      this.loading = true

      axios.post(smartEnuApi + '/document/share', {
        docId: this.reference.id,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.getPdf();

        this.url = apiDomain + '/document/' + this.reference.uuid
        this.reference.isPublic = true
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    infoRequest() {
      this.loading = true

      axios.post(smartEnuApi + '/document/newRequest', {
        requestType: Enum.DocumentRequestType.ReferenceInfoRequest,
        docId: this.reference.id,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.infoRequested = true
        this.showMessage('success', this.$t('ref.mailSent'), null)
        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('ref.mailFailed'))
        }

        this.loading = false
      })
    },
    correctionRequest() {
      this.loading = true

      axios.post(smartEnuApi + '/document/newRequest', {
        requestType: Enum.DocumentRequestType.ReferenceErrorCorrection,
        docId: this.reference.id,
        commentary: this.commentary,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.close('correctionMail')
        this.showMessage('success', this.$t('ref.mailSent'), null)
        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('ref.mailFailed'))
        }

        this.loading = false
      })
    },
    getPdf() {
      this.loading = true

      axios.post(smartEnuApi + '/document/download', {
        uuid: this.reference.uuid,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
  }
}
</script>
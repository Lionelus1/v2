<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" style="height: 100%;">
    <div class="flex flex-column" style="height: 100%;" v-if="reference && reference.docHistory.stateId !== Enum.REJECTED.ID">
      <Toolbar class="m-0 p-1 mb-2">
        <template #start>
          <div class="flex flex-wrap gap-2">
            <Button :disabled="reference.docHistory.stateId !== Enum.ISSUED.ID || reference.isPublic" 
              :label="$t('ref.createQr')" icon="fa-solid fa-qrcode" class="p-button-info align-items-center" 
              @click="share()" style="padding: 0.25rem 1rem;"></Button>
            <Button :disabled="reference.docHistory.stateId !== Enum.ISSUED.ID" 
              :label="$t('ref.errorReport')" icon="fa-solid fa-eraser" class="p-button-danger align-items-center" 
              @click="open('correctionMail')" style="padding: 0.25rem 1rem;"></Button>
          </div>
        </template>
      </Toolbar>
      <InlineMessage severity="info" class="justify-content-start mb-2" v-if="salaryRequested"> {{ $t("ref.salaryRequested") }} </InlineMessage>
      <div class="p-inputgroup p-input-filled lg:col-6 mb-2 p-0" v-if="url">
        <InputText :disabled="true" :value="url"/>
        <Button v-bind:label="$t('ncasigner.copy')" v-clipboard:copy="url" v-clipboard:success="onCopy" v-clipboard:error="onFail" class="p-button-secondary"/>
      </div>
      <div class="flex-grow-1 flex flew-row align-items-stretch">
        <embed :src="pdf" style="width: 100%;" v-if="pdf" type="application/pdf"/>
      </div>
    </div>
    <div class="flex flex-column" style="height: 100%;" v-else>
      <InlineMessage severity="error" class="justify-content-start"> {{ $t("ref.referenceRejected") }} </InlineMessage>
    </div>
  </BlockUI>
  <Dialog :header="$t('ref.errorReport')" v-model:visible="visibility.correctionMail"
    :style="{width: '50vw'}" @hide="close('correctionMail')" :modal="true">
      <div class="field p-fluid m-0">
        <Textarea v-model="commentary" autoResize rows="5" cols="30" maxlength="1024"
          :placeholder="$t('ref.correction')"></Textarea>
      </div>
      <template #footer>
        <Button :disabled="!commentary || commentary.length < 10" :label="$t('ref.send')" @click="correctionRequest()" />
      </template>
  </Dialog>
</template>
<script>
import { getHeader, smartEnuApi, apiDomain, b64toBlob } from "@/config/config";
import Enum from "@/enum/docstates/index";
import { DocService } from "@/service/doc.service";
export default {
  name: 'ReferencesOld',
  components: {},
  props: {
    referenceProp: null,
  },
  emits: [],
  data() {
    return {
      Enum: Enum,

      loading: false,

      visibility: {
        correctionMail: false,
      },

      reference: this.referenceProp,
      pdf: null,
      url: null,

      salaryRequested: false,
      commentary: null,
      docService: new DocService()
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
      if (!this.reference) {
        return
      }

      if (this.reference.isPublic) {
        this.url = apiDomain + '/document/' + this.reference.uuid
      }

      if (this.reference.requests) {
        this.reference.requests.forEach(req => {
          if (req.type === Enum.DocumentRequestType.ReferenceSalaryRequest && req.status === 0) {
            this.salaryRequested = true
          }
        });
      }

      if (this.reference.filePath) {
        this.getPdf();
      }
    },
    share() {
      this.loading = true
      const req = {
        docId: this.reference.id,
      }
      this.docService.share(req).then(res => {
        this.url = apiDomain + '/document/' + this.reference.uuid
        this.reference.isPublic = true

        this.getPdf();
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
    correctionRequest() {
      this.loading = true
      const req = {
        requestType: Enum.DocumentRequestType.ReferenceErrorCorrection,
        docId: this.reference.id,
        commentary: this.commentary,
      }
      this.docService.newRequest(req).then(res => {
        this.close('correctionMail')
        this.showMessage('success', this.$t('ref.sent'), null)
        this.loading = false
      }).catch(err => {
       if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('ref.failed'))
        }

        this.loading = false
      })
    },
    getPdf() {
      this.loading = true
      const req = {
        uuid: this.reference.uuid,
      }
      this.docService.documentDownload(req).then(res => {
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
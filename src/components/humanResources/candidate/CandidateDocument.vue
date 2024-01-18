<template>
  <Dialog v-model:visible="view" :style="{ width: '800px' }" :modal="true" :closable="true">
    <template #header>
      <h5>{{ $t('hr.doc.up').toUpperCase() }}</h5>
    </template>
    <div class="card">
      <!--  Трудовая книжка  -->
      <div class="field">
        <Label>{{ $t('hr.doc.eh') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.employmentHistory}"
            @uploader="uploadEmploymentHistory($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.employmentHistory">
          {{ $t('ncasigner.chosenFile', {fn: documents.employmentHistory ? documents.employmentHistory.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.employmentHistory"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   дипломы   -->
      <div class="field">
        <Label>{{ $t('hr.doc.diploma') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.diploma}"
            @uploader="uploadDiploma($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.diploma">
          {{ $t('ncasigner.chosenFile', {fn: documents.diploma ? documents.diploma.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.diploma"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   сертификаты   -->
      <div class="field">
        <Label>{{ $t('hr.doc.certs') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.certs}"
            @uploader="uploadCerts($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.certs">
          {{ $t('ncasigner.chosenFile', {fn: documents.certs ? documents.certs.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.certs"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   пенсионный   -->
      <div class="field">
        <Label>{{ $t('hr.doc.pension') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.pension}"
            @uploader="uploadPension($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.pension">
          {{ $t('ncasigner.chosenFile', {fn: documents.pension ? documents.pension.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.pension"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   075   -->
      <div class="field">
        <Label>{{ $t('hr.doc.medCert') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.medCert}"
            @uploader="uploadMedCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.medCert">
          {{ $t('ncasigner.chosenFile', {fn: documents.medCert ? documents.medCert.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.medCert"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   нарко   -->
      <div class="field">
        <Label>{{ $t('hr.doc.narcoCert') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.narcoCert}"
            @uploader="uploadNarcoCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.narcoCert">
          {{ $t('ncasigner.chosenFile', {fn: documents.narcoCert ? documents.narcoCert.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.narcoCert"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   ппсихо   -->
      <div class="field">
        <Label>{{ $t('hr.doc.psychoCert') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.psychoCert}"
            @uploader="uploadPsychoCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.psychoCert">
          {{ $t('ncasigner.chosenFile', {fn: documents.psychoCert ? documents.psychoCert.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.psychoCert"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   судимость   -->
      <div class="field">
        <Label>{{ $t('hr.doc.gcCert') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.gcCert}"
            @uploader="uploadGcCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.gcCert">
          {{ $t('ncasigner.chosenFile', {fn: documents.gcCert ? documents.gcCert.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.gcCert"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <hr>
      <!--   военный билет   -->
      <div class="field">
        <Label>{{ $t('hr.doc.mId') }}: </Label>
        <FileUpload
            class="mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.mId}"
            @uploader="uploadMilitaryId($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="mt-2"
                       show v-if="documents.mId">
          {{ $t('ncasigner.chosenFile', {fn: documents.mId ? documents.mId.name : ""}) }}
        </InlineMessage>
        <small
            class="p-error"
            v-if="validation.mId"
        >{{ $t("common.requiredField") }}</small>
      </div>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('common.action.submit')"
          icon="pi pi-check"
          class="p-button p-component p-button-primary"
          @click="sendData"
      />
    </template>
  </Dialog>
</template>

<script>
import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";


export default {
  name: "CandidateDocument",
  props: {
    visible: Boolean,
    vacancy: null
  },
  data() {
    return {
      documents: {
        employmentHistory: null,
        diploma: null,
        certs: null,
        pension: null,
        medCert: null,
        narcoCert: null,
        psychoCert: null,
        gcCert: null,
        mId: null
      },
      validation: {
        employmentHistory: false,
        diploma: false,
        certs: false,
        pension: false,
        medCert: false,
        narcoCert: false,
        psychoCert: false,
        gcCert: false,
        mId: false
      },
    }
  },
  mounted() {
    this.emitter.on('opencdd', (data) => {
      if (data === true) {
        this.view = true
      }
    });
  },

  methods: {
    uploadEmploymentHistory(event) {
      this.documents.employmentHistory = event.files[0]
    },
    uploadDiploma(event) {
      this.documents.diploma = event.files[0]
    },
    uploadCerts(event) {
      this.documents.certs = event.files[0]
    },
    uploadPension(event) {
      this.documents.pension = event.files[0]
    },
    uploadMedCert(event) {
      this.documents.medCert = event.files[0]
    },
    uploadNarcoCert(event) {
      this.documents.narcoCert = event.files[0]
    },
    uploadPsychoCert(event) {
      this.documents.psychoCert = event.files[0]
    },
    uploadGcCert(event) {
      this.documents.gcCert = event.files[0]
    },
    uploadMilitaryId(event) {
      this.documents.mId = event.files[0]
    },

    validateForm() {
      this.validation.employmentHistory = !this.documents.employmentHistory || this.documents.employmentHistory === ""
      this.validation.diploma = !this.documents.diploma || this.documents.diploma === ""
      this.validation.certs = !this.documents.certs || this.documents.certs === ""
      this.validation.pension = !this.documents.pension || this.documents.pension === ""
      this.validation.medCert = !this.documents.medCert || this.documents.medCert === ""
      this.validation.narcoCert = !this.documents.narcoCert || this.documents.narcoCert === ""
      this.validation.psychoCert = !this.documents.psychoCert || this.documents.psychoCert === ""
      this.validation.gcCert = !this.documents.gcCert || this.documents.gcCert === ""
      this.validation.mId = !this.documents.mId || this.documents.mId === ""
      return (
          !this.validation.employmentHistory &&
          !this.validation.diploma &&
          !this.validation.certs &&
          !this.validation.pension &&
          !this.validation.medCert &&
          !this.validation.narcoCert &&
          !this.validation.psychoCert &&
          !this.validation.gcCert &&
          !this.validation.mId
      )
    },

    sendData() {
      if (this.validateForm()) {
        const fd = new FormData()
        let request = {}
        request.vacancyId = this.vacancy.id
        request.candidateId = this.vacancy.candidateRelation[0].candidate.id
        fd.append('cvInfo', JSON.stringify(request))
        fd.append('eh', this.documents.employmentHistory)
        fd.append('diploma', this.documents.diploma)
        fd.append('certs', this.documents.certs)
        fd.append('pension', this.documents.pension)
        fd.append('medCert', this.documents.medCert)
        fd.append('narcoCert', this.documents.narcoCert)
        fd.append('psychoCert', this.documents.psychoCert)
        fd.append('gcCert', this.documents.gcCert)
        fd.append('mId', this.documents.mId)
        api.post('/candidate/documents/create', fd, {headers: getHeader()}).then(_ => {
          this.emitter.emit('closeDoc', true)
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
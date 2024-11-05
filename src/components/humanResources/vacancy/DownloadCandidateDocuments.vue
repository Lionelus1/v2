<template>
  <div class="card">
    <!--  Трудовая книжка  -->
    <div class="field">
      <Label>{{ $t('hr.doc.eh') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.employmentHistoryPath"
                @click="downloadFile(documentsPath.employmentHistoryPath, documentsPath.employmentHistoryName)"/>
        <Label v-if="!documentsPath.employmentHistoryPath" ><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   дипломы   -->
    <div class="field">
      <Label>{{ $t('hr.doc.diploma') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.diplomaPath"
                @click="downloadFile(documentsPath.diplomaPath, documentsPath.diplomaName)"/>
        <Label v-if="!documentsPath.diplomaPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   сертификаты   -->
    <div class="field">
      <Label>{{ $t('hr.doc.certs') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.certsPath"
                @click="downloadFile(documentsPath.certsPath, documentsPath.certsName)"/>
        <Label v-if="!documentsPath.certsPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   пенсионный   -->
    <div class="field">
      <Label>{{ $t('hr.doc.pension') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.pensionPath"
                @click="downloadFile(documentsPath.pensionPath, documentsPath.pensionName)"/>
        <Label v-if="!documentsPath.pensionPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   075   -->
    <div class="field">
      <Label>{{ $t('hr.doc.medCert') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.medCertPath"
                @click="downloadFile(documentsPath.medCertPath, documentsPath.medCertPath)"/>
        <Label v-if="!documentsPath.medCertPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   нарко   -->
    <div class="field">
      <Label>{{ $t('hr.doc.narcoCert') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.narcoCertPath"
                @click="downloadFile(documentsPath.narcoCertPath, documentsPath.narcoCertName)"/>
        <Label v-if="!documentsPath.narcoCertPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   ппсихо   -->
    <div class="field">
      <Label>{{ $t('hr.doc.psychoCert') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.psychoCertPath"
                @click="downloadFile(documentsPath.psychoCertPath, documentsPath.psychoCertName)"/>
        <Label v-if="!documentsPath.psychoCertPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   судимость   -->
    <div class="field">
      <Label>{{ $t('hr.doc.gcCert') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.gcCertPath"
                @click="downloadFile(documentsPath.gcCertPath, documentsPath.gcCertName)"/>
        <Label v-if="!documentsPath.gcCertPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
    <hr>
    <!--   военный билет   -->
    <div class="field">
      <Label>{{ $t('hr.doc.mId') }}: </Label>
      <div class="col-12 mb-2 pb-2 lg:col-3 mb-lg-0">
        <Button :label="$t('common.download')"
                icon="pi pi-download"
                :disabled="disabled"
                v-if="documentsPath.mIdPath"
                @click="downloadFile(documentsPath.mIdPath, documentsPath.mIdName)"/>
        <Label v-if="!documentsPath.mIdPath"><em>{{ $t('common.notUpload') }}</em></Label>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "UploadCandidateDocuments",
  props: {
    paths: null,
  },
  data() {
    return {
      documentsPath: this.paths,
      disabled: false
    }
  },
  methods: {
    downloadFile(path, name) {
      this.disabled = true
      api.post(
          '/candidate/documents/download',
          {filePath: path},
          {headers: getHeader()}
      ).then(response => {
        var link = document.createElement('a');
        link.innerHTML = 'Download file';
        link.download = name;
        link.href = response.data;
        link.click();
        this.disabled = false
      }).catch(_ => {
        this.disabled = false
      })
    },
  }
}
</script>

<style scoped>

</style>
<template>
  <DataTable :lazy="true"
             :value="vacancies"
             @page="onPage($event)"
             :totalRecords="count"
             :paginator="true"
             paginatorTemplate="FirstPageLink
                                  PrevPageLink
                                  PageLinks
                                  NextPageLink
                                  LastPageLink
                                  CurrentPageReport
                                  RowsPerPageDropdown"
             :rowsPerPageOptions="[10, 25, 50]"
             :currentPageReportTemplate="$t('common.showingRecordsCount',
                                                   { first: '{first}',
                                                     last: '{last}',
                                                     totalRecords: '{totalRecords}'
                                                   })"
             class="p-datatable-customers"
             :rows="10"
             dataKey="id"
             :rowHover="true"
             v-model:selection="vacancy"
             selection-mode="single"
             @row-select="select"
             :filters="filters"
             filterDisplay="menu"
             :showFilterMatchModes="false"
             :loading="visible.loading"
             responsiveLayout="scroll"
             @sort="onSort($event)">
    <!--  HEADER -->
    <template #header>
      <div class="table-header p-d-flex p-flex-column p-flex-md-row p-jc-md-between">
        <h4 class="p-mb-2 p-m-md-0 p-as-md-center">{{ $t("hr.vacancies") }}</h4>
        <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText type="search"
                       v-model="lazyParams.searchText"
                       :placeholder="$t('common.search')"
                       @keyup.enter="getVacancies"
                       @click="clearData"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getVacancies"/>
          </span>
      </div>
    </template>
    <!-- EMPTY -->
    <template #empty> {{ $t('common.noData') }}</template>
    <!-- ON LOADING -->
    <template #loading> {{ $t('common.loading') }}</template>
    <!-- NAME COLUMN -->
    <Column>
      <template #body="slotProps">
        <Button
            v-if="slotProps.data.candidateRelation[0].history.status.id === 10 && slotProps.data.organization.id === 1"
            icon="pi pi-upload"
            class="p-button-success"
            @click="openDialog(slotProps.data)"/>
      </template>
    </Column>
    <Column :field="'name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1)"
            v-bind:header="$t('common.nameIn')"
            :sortable="true">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.nameRu : slotProps.data.nameEn
            }}
          </span>
      </template>
    </Column>
    <Column field="org"
            v-bind:header="$t('common.organizationName')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.organization.name : $i18n.locale === "ru"
                  ? slotProps.data.organization.nameru : slotProps.data.organization.name
            }}
          </span>
      </template>
    </Column>
    <Column field="stp"
            v-bind:header="$t('common.departmentNameLabel')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.department.nameKz : $i18n.locale === "ru"
                  ? slotProps.data.department.name : slotProps.data.department.nameEn
            }}
          </span>
      </template>
    </Column>
    <Column field="status" v-bind:header="$t('common.status')" :sortable="false">
      <template #body="slotProps">
          <span :class="'customer-badge status-' + slotProps.data.candidateRelation[0].history.status.id">
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.candidateRelation[0].history.status.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.candidateRelation[0].history.status.nameRu
                      : slotProps.data.candidateRelation[0].history.status.nameEn
            }}
          </span>
      </template>
    </Column>
    <!-- DATE COLUMN -->
    <Column field="date"
            v-bind:header="$t('common.deadlineDate')"
            :sortable="false">
      <template #body="slotProps">
          <span>
            {{
              new Date(slotProps.data.deadline).toLocaleDateString()
            }}
          </span>
      </template>
    </Column>
    <Column>
      <template #body="slotProps">
        <Button
            v-if="slotProps.data.candidateRelation[0].history.status.id === 10 && slotProps.data.organization.id !== 1"
            icon="pi pi-file-pdf"
            class="p-button-secondary"
            @click="getPetition(slotProps.data)"/>
      </template>
    </Column>
  </DataTable>
  <!-- Просмотр резюме -->
  <Dialog v-model:visible="visible.view" :style="{ width: '800px' }" :modal="true">

    <template #header>
      <h5 style="padding-left: 15px">
        <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
      </h5>
    </template>
    <Card style="box-shadow: none">
      <template #header>
        <div style="padding-left: 15px">
          <Message severity="info" :closable="false"> {{ $t('common.status') }}: {{
              $i18n.locale === "kz"
                  ? vacancy.candidateRelation[0].history.status.nameKz
                  : $i18n.locale === "ru"
                      ? vacancy.candidateRelation[0].history.status.nameRu
                      : vacancy.candidateRelation[0].history.status.nameEn
            }}
          </Message>
        </div>
      </template>

      <template #subtitle>
        {{ $t('common.publishDate') }} {{
          new Date(vacancy.history.modifyDate).toLocaleDateString() + ' ' +
          new Date(vacancy.history.modifyDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        }}
      </template>

      <template #content>

        <p><b>{{ $t('common.organizationNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.organization.name :
                $i18n.locale === "ru" ? vacancy.organization.nameru : vacancy.organization.name
          }}</i>
        </p>

        <p><b>{{ $t('common.deadlineDate') }}</b></p>
        <p style="padding-left: 20px"><i>{{ new Date(vacancy.deadline).toLocaleDateString() }}</i>
        </p>

        <p><b>{{ $t('common.departmentNameLabel') }}</b></p>
        <p style="padding-left: 20px"><i>{{
            $i18n.locale === "kz" ? vacancy.department.nameKz :
                $i18n.locale === "ru" ? vacancy.department.name : vacancy.department.nameEn
          }}</i><br>
          <i><b style="font-weight: 600">{{ $t('common.headLabel') }}</b> {{ vacancy.departmentHead.fullName }}</i>
        </p>

        <p><b>{{ $t('hr.responsibilitiesLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='
              $i18n.locale === "kz" ? vacancy.responsibilitiesKz :
                  $i18n.locale === "ru" ? vacancy.responsibilitiesRu : vacancy.responsibilitiesEn'
        />

        <p><b>{{ $t('hr.educationLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.educationKz :
                  $i18n.locale === "ru" ? vacancy.educationRu : vacancy.educationEn'
        />

        <p><b>{{ $t('hr.qualificationLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.qualificationKz :
                  $i18n.locale === "ru" ? vacancy.qualificationRu : vacancy.qualificationEn'
        />

        <p><b>{{ $t('hr.experienceLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.experienceKz :
                  $i18n.locale === "ru" ? vacancy.experienceRu : vacancy.experienceEn'
        />

        <p><b>{{ $t('hr.languageLevelLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.languageLevelKz :
                  $i18n.locale === "ru" ? vacancy.languageLevelRu : vacancy.languageLevelEn'
        />

        <p><b>{{ $t('hr.certificateRequirementsLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.certificateRequirementsKz :
                  $i18n.locale === "ru" ? vacancy.certificateRequirementsRu : vacancy.certificateRequirementsEn'
        />

        <p><b>{{ $t('hr.personalQualitiesLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.personalQualitiesKz :
                  $i18n.locale === "ru" ? vacancy.personalQualitiesRu : vacancy.personalQualitiesEn'
        />
      </template>
    </Card>

    <template #footer>
      <Button
          v-bind:label="$t('common.close')"
          icon="pi pi-times"
          class="p-button p-component p-button-primary"
          @click="visible.view = false"
      />
    </template>

  </Dialog>
  <!-- Просмотр ходатайства -->
  <Dialog v-model:visible="visible.petition" :style="{ width: '1000px' }" :modal="true" :closable="false">
    <div class="card" v-if="signatures">
      <SignatureQrPdf ref="qrToPdf" :signatures="signatures" :title="docInfo.name"></SignatureQrPdf>
      <div class="p-grid p-formgrid">
        <div class="p-col-12 p-mb-2 p-pb-2 p-lg-3 p-mb-lg-0">
          <Button :label="$t('hr.petition.download')" icon="pi pi-download" :onclick="downloadPDF"/>
        </div>
        <div class="p-col-12 p-mb-2 p-pb-2 p-lg-3 p-mb-lg-0">
          <Button :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" :disabled="!pdfFile"
                  :onclick="downloadSignatures"/>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('common.close')"
          icon="pi pi-times"
          class="p-button p-component p-button-primary"
          @click="visible.petition = false"
      />
    </template>
  </Dialog>
  <!-- Загрузка документов -->
  <Dialog v-model:visible="visible.documents" :style="{ width: '800px' }" :modal="true" :closable="true">
    <template #header>
      <h5>{{ $t('hr.doc.up').toUpperCase() }}</h5>
    </template>
    <div class="card">
      <!--  Трудовая книжка  -->
      <div class="p-field">
        <Label>{{ $t('hr.doc.eh') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.employmentHistory}"
            @uploader="uploadEmploymentHistory($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.diploma') + " " + $t('hr.doc.upInOne')}}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.diploma}"
            @uploader="uploadDiploma($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.certs')  + " " + $t('hr.doc.upInOne')}}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            @uploader="uploadCerts($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
                       show v-if="documents.certs">
          {{ $t('ncasigner.chosenFile', {fn: documents.certs ? documents.certs.name : ""}) }}
        </InlineMessage>
      </div>
      <hr>
      <!--   пенсионный   -->
      <div class="p-field">
        <Label>{{ $t('hr.doc.pension') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.pension}"
            @uploader="uploadPension($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.medCert')  + " " + $t('hr.doc.upInOne')}}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.medCert}"
            @uploader="uploadMedCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.narcoCert') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.narcoCert}"
            @uploader="uploadNarcoCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.psychoCert') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.psychoCert}"
            @uploader="uploadPsychoCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.gcCert') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            :class="{'p-invalid': validation.gcCert}"
            @uploader="uploadGcCert($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
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
      <div class="p-field">
        <Label>{{ $t('hr.doc.mId') }}: </Label>
        <FileUpload
            class="p-mt-2"
            mode="basic"
            :customUpload="true"
            @uploader="uploadMilitaryId($event)"
            :auto="true"
            v-bind:chooseLabel="$t('hdfs.chooseFile')"
        ></FileUpload>
        <InlineMessage severity="info"
                       class="p-mt-2"
                       show v-if="documents.mId">
          {{ $t('ncasigner.chosenFile', {fn: documents.mId ? documents.mId.name : ""}) }}
        </InlineMessage>
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
//import WorkPlanQrPdf from "@/components/work_plan/WorkPlanQrPdf";
import {FilterMatchMode, FilterOperator} from "primevue/api";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import html2pdf from "html2pdf.js";
import CandidateDocument from "./CandidateDocument";
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";

export default {
  name: "CandidateVacancy",
  components: { SignatureQrPdf},
  data() {
    return {
      count: 200,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0,
      },
      visible: {
        loading: false,
        view: false,
        petition: false,
        documents: false
      },
      vacancies: null,
      vacancy: null,
      pdfFile: null,
      docInfo: null,
      signatures: null,
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
      },
    }
  },
  methods: {
    openDialog(data) {
      this.vacancy = data
      this.visible.documents = true
    },
    /**
     * *********************** ПОЛУЧЕНИЕ ВАКАНСИЙ ПОЛЬЗОВАТЕЛЯ
     */
    getVacancies() {
      this.loading = true
      this.lazyParams.countMode = null;
      axios.post(smartEnuApi + "/vacancy/user",
          this.lazyParams, {headers: getHeader()}).then((response) => {
        this.vacancies = response.data.vacancies;
        this.count = response.data.total;
        this.loading = false;
      }).catch((error) => {
        if (error.response.status == 401) {
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

    /**
     ******************** GET PETITION
     */
    getPetition(data) {
      this.pdfFile = null
      this.docInfo = null
      this.signatures = null
      axios.post(smartEnuApi + "/vacancy/petition",
          {
            candidateId: data.candidateRelation[0].candidate.id,
            vacancyId: data.id
          },
          {headers: getHeader()}
      ).then(response => {
        console.log(response.data)
        this.pdfFile = response.data.fileData
        this.docInfo = response.data.docInfo
        this.signatures = this.docInfo.signatures
        this.signatures.map(e => {
          e.sign = this.chunkString(e.signature, 1200)
        });
        this.visible.petition = true
      }).catch(error => {
        console.log(error)
      })
    },

    /**
     * download pdf
     */
    downloadPDF() {
      let pdf = this.pdfFile;
      var link = document.createElement('a');
      link.innerHTML = 'Download PDF file';
      link.download = this.docInfo.name;
      link.href = 'data:application/octet-stream;base64,' + pdf;
      link.click();
    },

    /**
     * download signature
     */
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

    /**
     * *********************** СОРТИРОВКА
     * @param event
     */
    onSort(event) {
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getVacancies();
    },

    /**
     * *********************** ПАГИНАЦИЯ
     * @param event
     */
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getVacancies();
    },

    /**
     * *********************** ВЫБОР ЭЛЕМЕНТА ТАБЛИЦЫ
     * @param event
     */
    select(event) {
      this.vacancy = event.data
      this.visible.view = true
    },

    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = "";
      this.getVacancies();
    },
    chunkString(str, length) {
      return str.match(new RegExp('.{1,' + length + '}', 'g'));
    },

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
      this.validation.pension = !this.documents.pension || this.documents.pension === ""
      this.validation.medCert = !this.documents.medCert || this.documents.medCert === ""
      this.validation.narcoCert = !this.documents.narcoCert || this.documents.narcoCert === ""
      this.validation.psychoCert = !this.documents.psychoCert || this.documents.psychoCert === ""
      this.validation.gcCert = !this.documents.gcCert || this.documents.gcCert === ""
      return (
          !this.validation.employmentHistory &&
          !this.validation.diploma &&
          !this.validation.pension &&
          !this.validation.medCert &&
          !this.validation.narcoCert &&
          !this.validation.psychoCert &&
          !this.validation.gcCert
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
        axios.post(smartEnuApi + '/candidate/documents/create', fd, {headers: getHeader()}).then(_ => {
          this.visible.documents = false
          this.vacancy = null
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }
    }
  },
  created() {
    this.getVacancies();
  },
}
</script>

<style lang="scss" scoped>
.def-padding {
  padding-left: 20px;
  text-align: justify;
}

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-8 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-9 {
    background: #eccfff;
    color: #694382;
  }

  &.status-10 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-11 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-12 {
    background: #ffd8b2;
    color: #805b36;
  }
}
</style>
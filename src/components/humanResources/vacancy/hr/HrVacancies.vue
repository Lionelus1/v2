<template>
  <!-- DataTable -->
  <div class="card">
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
               :loading="loading"
               responsiveLayout="scroll"
               @sort="onSort($event)">
      <!--  HEADER -->
      <template #header>
        <div class="table-header flex flex-column flex-md-row justify-content-md-between">
          <h4 class="p-mb-2 p-m-md-0 align-self-md-center">{{ $t("hr.vacancies") }}</h4>
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
      <!-- NAME COLUMN -->
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
      <!-- DATE COLUMN -->
      <Column field="date"
              v-bind:header="$t('common.pDate')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              new Date(slotProps.data.history.modifyDate).toLocaleDateString()
            }}
          </span>
        </template>
      </Column>
      <!-- APPLY BUTTON COLUMN -->
      <Column>
        <template #body="slotProps">
          <Button v-if="!slotProps.data.isApply" icon="pi pi-star" class="p-button-success"
                  :label="$t('hr.action.apply')"
                  @click="openApplyDialog(slotProps.data.id)"/>
          <Tag v-if="slotProps.data.isApply" class="mr-2" severity="info" :value="$t('hr.action.applied')"></Tag>
        </template>
      </Column>
    </DataTable>
  </div>
  <!-- Просмотр вакансии -->
  <Dialog v-model:visible="visible.view" :style="{ width: '800px' }" :modal="true">

    <template #header>
      <h5 style="padding-left: 15px">
        <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
      </h5>
    </template>

    <Card style="box-shadow: none">
      <template #header>
        <div style="padding-left: 15px">
          <Button v-if="!vacancy.isApply" icon="pi pi-star" class="p-button-success" :label="$t('hr.action.apply')"
                  @click="openApplyDialog(vacancy.id)"/>
          <Message v-if="vacancy.isApply" severity="info" :closable="false">{{ $t('hr.action.applied2') }}
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
        <p><b>{{ $t('hr.workConditionLabel') }}</b></p>
        <div class="p-field def-padding"
             v-html='$i18n.locale === "kz" ? vacancy.workConditionKz :
                  $i18n.locale === "ru" ? vacancy.workConditionRu : vacancy.workConditionEn'
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
  <!-- Подача заявки -->
  <Dialog v-model:visible="visible.apply" :style="{ width: '650px' }" :modal="true">

    <template #header>
      <h5>{{ $t('hr.action.apply').toUpperCase() }}</h5>
    </template>

    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="p-fluid grid p-formgrid">
          <div class="p-field col-12">
            <Label>{{ $t('hr.vacancySource') }}: </Label>
            <Dropdown class="p-mt-2" v-model="relation.vacancySource"
                      :options="vacancySources"
                      :class="{'p-invalid': validation.source}"
                      :optionLabel="('name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1))"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.source"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field col-12">
            <Label>{{ $t('hr.motivationLetter') }}: </Label>
            <FileUpload
                class="p-mt-2"
                mode="basic"
                :customUpload="true"
                :class="{'p-invalid': validation.ml}"
                @uploader="upload($event)"
                :auto="true"
                v-bind:chooseLabel="$t('hdfs.chooseFile')"
            ></FileUpload>
            <InlineMessage severity="info"
                           class="p-mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small
                class="p-error"
                v-if="validation.ml"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field col-12">
            <hr>
          </div>
          <div class="p-field col-12">
            <p><b><em>{{ $t('hr.sp.header') }}:</em></b></p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label1') }}
              </em>
            </p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label2') }}
              </em>
            </p>
            <p style="text-align: justify">
              <em>
                {{ $t('hr.sp.label3') }}
              </em>
            </p>
          </div>
          <div class="p-field col-12">
            <hr>
          </div>
          <div class="p-field col-12">
            <Label>{{ $t('hr.doc.chooseSignWay') }}</Label>
            <SelectButton v-model="signWay"
                          :options="signWayOption"
                          class="p-mt-2"
                          optionValue="value"
                          optionLabel="name"/>
          </div>
          <div class="p-field col-12">
            <hr>
          </div>
          <div class="p-field col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
            <Button class="p-mt-2"
                    :label="$t('hr.doc.resumeView')"
                    icon="pi pi-plus" :onclick="openResume"/>
          </div>
          <div class="p-field col-12 p-mb-2 p-pb-2 lg:col-6 p-mb-lg-0">
            <FileUpload
                class="p-mt-2"
                mode="basic"
                v-if="signWay === 1"
                :customUpload="true"
                @uploader="uploadResume($event)"
                :auto="true"
                v-bind:chooseLabel="$t('hr.doc.upSignedResume')"/>
          </div>
          <div class="p-field col-12">
            <InlineMessage severity="info"
                           class="p-mt-2"
                           show v-if="resumeFile">
              {{ $t('ncasigner.chosenFile', {fn: resumeFile ? resumeFile.name : ""}) }}
            </InlineMessage>
            <div class="p-field">
              <Message v-if="signature" :closable="false" severity="success">{{
                  $t('hr.doc.resumeSuccessSigned')
                }}
              </Message>
            </div>
            <small
                class="p-error"
                v-if="validation.resumeData"
            >{{ $t("common.requiredField") }}</small>
            <hr>
          </div>
          <div class="p-field col-12">
            <div class="p-field-checkbox">
              <Checkbox id="binary" v-model="agreement" :binary="true"/>
              <label for="binary" style="font-size: 15px; text-align: justify">
                <b>
                  {{ $t('hr.sp.agreement') }}
                </b>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('hr.sp.request')"
          icon="pi pi-check"
          class="p-button p-component p-button-primary"
          :disabled="!agreement"
          @click="apply"
      />
    </template>
  </Dialog>
  <!-- Если резюме не найдено -->
  <Dialog
      v-model:visible="visible.notFound"
      :style="{ width: '450px' }"
      :modal="true"
      :closable="false">

    <div class="confirmation-content">
      <i class="pi pi-exclamation-circle p-mr-3" style="font-size: 2rem"/>
      <span>
        <b>{{ $t('hr.resumeNorFound') }}</b>
        </span>
    </div>

    <template #footer>
      <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          @click="redirectToResume"/>
      <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button-secondary p-button-text"
          @click="visible.notFound = false"/>
    </template>
  </Dialog>
  <!-- RESUME -->
  <Dialog v-model:visible="visible.resume" :style="{ width: '650px' }" :modal="true">
    <template #header>
      <h5>{{ $t('hr.action.apply').toUpperCase() }}</h5>
    </template>
    <ResumeView ref="pdf" :value="candidate" :readonly="true"/>
    <template #footer>
      <Button
          v-bind:label="$t('hr.doc.resumeDownload')"
          icon="pi pi-check"
          v-if="signWay === 1"
          class="p-button p-component p-button-primary"
          @click="downloadResume"
      />
      <Button
          v-bind:label="$t('hr.doc.resumeSign')"
          icon="pi pi-check"
          v-if="signWay === 0 && !resumeFile"
          class="p-button p-component p-button-primary"
          @click="signDocument"
      />
    </template>
  </Dialog>
</template>

<script>
import {FilterMatchMode, FilterOperator} from "primevue/api";
import ResumeView from "../../candidate/ResumeView";
import axios from "axios";
import {b64toBlob, getHeader, smartEnuApi} from "@/config/config";
import Login from "../../../Login";
import router from '@/router';
import html2pdf from "html2pdf.js";
import {NCALayerClient} from "ncalayer-js-client";
import {docToByteArray} from "@/helpers/SignDocFunctions";
import {NCALayerClientExtension} from "@/helpers/ncalayer-client-ext";

export default {
  name: "HrVacancies",
  components: {ResumeView},
  data() {
    return {
      file: null,
      userId: null,
      count: 200,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      signWayOption: [
        {name: this.$t('hr.doc.digital'), value: 0},
        {name: this.$t('hr.doc.paper'), value: 1},
      ],
      signWay: 0,
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0,
        orgCode: 'enu'
      },
      visible: {
        loading: false,
        view: false,
        apply: false,
        login: false,
        notFound: false,
        resume: false,
      },
      validation: {
        source: false,
        ml: false,
        resumeData: false,
      },
      vacancies: [],
      vacancySources: [],
      relation: null,
      vacancy: null,
      agreement: false,
      candidate: null,
      signature: null,
      resumeBlob: null,
      document: null,
      resumeFile: null,
      fileBlob: null,
      loading: false,
    }
  },
  methods: {
    openResume() {
      this.visible.resume = true
    },
    downloadResume() {
      let pdfOptions = {
        margin: 0.5,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: {scale: 2.8,},
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'landscape',
        },
        pagebreak: {avoid: 'tr'},
        filename: "file.pdf",
      }
      const pdfContent = this.$refs.pdf.$refs.htmlToPdf
      const worker = html2pdf().set(pdfOptions).from(pdfContent);
      worker.toPdf().output("blob").then((pdf) => {
        var reader = new FileReader();
        reader.readAsDataURL(pdf);
        reader.onloadend = function () {
          var base64data = reader.result;
          var link = document.createElement('a');
          link.innerHTML = 'Download PDF file';
          link.download = 'Resume.pdf';
          link.href = base64data;
          console.log(link.href)
          link.click();
        }
      });
    },

   async signResume() {
      let pdfOptions = {
        margin: 0.5,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: {scale: 2.8,},
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'landscape',
        },
        pagebreak: {avoid: 'tr'},
        filename: "file.pdf",
      }
      const pdfContent = this.$refs.pdf.$refs.htmlToPdf
      const worker = html2pdf().set(pdfOptions).from(pdfContent);
      await worker.toPdf().output("arraybuffer").then((pdf) => {
        this.resumeBlob = pdf
      });
    },

    async signDocument() {
      let NCALaClient = new NCALayerClientExtension();
      try {
        await NCALaClient.connect();
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('ncasigner.failConnectToNcaLayer'),
          life: 3000
        });
        return;
      }
      try {
        await this.signResume()
        console.log("PDF IS ", this.resumeBlob)
        let dataBase64 = this.arrayBufferToBase64(this.resumeBlob)
        this.signature = await NCALaClient.sign('cms', {}, dataBase64, 'fl', this.$i18n.locale, true)
        // this.signature = await NCALaClient.createCAdESFromBase64('PKCS12', this.resumeBlob, 'SIGNATURE', false)
        this.visible.resume = false
      } catch (error) {
        console.log(error)
        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
      }
    },

    arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },

    b64toBlob(b64Data, sliceSize=512) {
      const byteCharacters = window.atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {type: "application/pdf"});
      return blob;
    },

    upload(event) {
      this.file = event.files[0];
    },

    uploadResume(event) {
      this.resumeFile = event.files[0]
    },
    /**
     * *********************** ПОЛУЧЕНИЕ ВСЕХ ОПУБЛИКОВАННЫХ ВАКАНСИЙ
     */
    getVacancies() {
      this.loading = true
      this.lazyParams.countMode = null;
      axios.post(smartEnuApi + "/vacancy/public",
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
        this.loading = false;
      });
    },

    /**
     * *********************** ПОЛУЧЕНИЕ СПРАВОЧНИК ИСТОЧНИКОВ ВАКАНСИИ
     */
    getCatalog() {
      axios.post(smartEnuApi + "/vacancy/sources",
          {}, {headers: getHeader()}).then((res) => {
        this.vacancySources = res.data
        this.getUserCandidate()
      }).catch((error) => {
        if (error.response.status == 401) {
          this.visible.login = true
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
     * *********************** ПРОВЕРКА НАЛИЧИЯ РЕЗЮМЕ
     */
    getUserCandidate() {
      axios.post(smartEnuApi + "/candidate/get",
          {}, {headers: getHeader()}).then(res => {
        this.visible.apply = true
        this.candidate = res.data
      }).catch(error => {
        if (error.response.status === 404) {
          this.candidate = null
          this.visible.notFound = true
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
     * *********************** ПОДАЧА ЗАЯВКИ НА УЧАСТИЕ В КОНКУРСЕ
     */
    apply() {
      this.relation.signWay = this.signWay
      const fd = new FormData();
      fd.append("rel", JSON.stringify(this.relation))
      fd.append("ml", this.file);
      if (this.signWay === 0) {
        const blob = new Blob([this.resumeBlob], {type: "application/pdf"});
        let pdfF = new File([blob], 'filename.pdf')
        console.log(pdfF)
        fd.append("resumeData", pdfF)
        fd.append("signature", this.signature)
      } else {
        fd.append("resumeData", this.resumeFile)
      }
      if (this.validateForm()) {
        axios.post(smartEnuApi + "/vacancy/apply",
            fd, {headers: getHeader()}).then((response) => {
          for (let key in this.vacancies) {
            if (this.vacancies[key].id === this.relation.vacancyId) {
              this.vacancies[key].isApply = true
            }
          }
          this.visible.apply = false;
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
      }
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

    /**
     * ***********************
     */

    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = "";
      this.getVacancies();
    },

    /**
     * *********************** ОТКРЫТИЕ ДИАЛОГОВОГО ОКНА ДЛЯ ПОДАЧИ ЗАЯВКИ
     * @param id ИДЕНТИФИКАТОР ВАКАНСИИ
     */
    openApplyDialog(id) {
      this.relation = {}
      this.relation.vacancyId = id
      this.relation.candidate = null
      this.getCatalog()
    },

    /**
     * *********************** ПЕРЕНАПРАВЛЕНИЕ НА РЕЗЮМЕ
     */
    redirectToResume() {
      router.push({"name": "Cabinet"})
    },
    validateForm() {
      this.validation.source = !this.relation.vacancySource || this.relation.vacancySource === ""
      this.validation.ml = !this.file || this.file === ""
      this.validation.resumeData = this.signWay === 0 ? (!this.signature || this.signature === "") : (!this.resumeFile || this.resumeFile === "")
      return (!this.validation.source && !this.validation.ml && !this.validation.resumeData)
    }
  },
  created() {
    this.getVacancies();
    this.userId = this.$store.state.loginedUser.userID;
  },
}
</script>

<style scoped>
.def-padding {
  padding-left: 20px;
  text-align: justify;
}
</style>

<template>
  <div class="card">
    <div v-if="vacancy">
      <h5 style="padding-left: 15px">
        <b>{{ $i18n.locale === "kz" ? vacancy.nameKz : $i18n.locale === "ru" ? vacancy.nameRu : vacancy.nameEn }}</b>
      </h5>
    </div>
    <div class="grid formgrid">
      <Card style="box-shadow: none" :v-if="vacancy">
        <template #header>
          <div style="padding-left: 15px" v-if="vacancy">
            <Button v-if="vacancy && !vacancy.isApply" icon="pi pi-star" class="p-button-success"
                    :label="$t('hr.action.apply')"
                    @click="openApplyDialog(vacancy.id)"/>
            <Message v-if=" vacancy && vacancy.isApply" severity="info" :closable="false">{{ $t('hr.action.applied2') }}
            </Message>
          </div>
        </template>

        <template #subtitle>
          <div v-if="vacancy">
            {{ $t('common.publishDate') }} {{
              new Date(vacancy.history.modifyDate).toLocaleDateString() + ' ' +
              new Date(vacancy.history.modifyDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }}
          </div>
        </template>

        <template #content>
          <div v-if="vacancy">
            <p><b>{{ $t('common.organizationNameLabel') }}</b></p>
            <p style="padding-left: 20px"><i>{{
                $i18n.locale === "kz" ? vacancy.organization.name :
                    $i18n.locale === "ru" ? vacancy.organization.nameru : vacancy.organization.name
              }}</i>
            </p>
            <br>
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
            <div class="field def-padding"
                 v-html='
              $i18n.locale === "kz" ? vacancy.responsibilitiesKz :
                  $i18n.locale === "ru" ? vacancy.responsibilitiesRu : vacancy.responsibilitiesEn'
            />

            <p><b>{{ $t('hr.educationLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.educationKz :
                  $i18n.locale === "ru" ? vacancy.educationRu : vacancy.educationEn'
            />

            <p><b>{{ $t('hr.qualificationLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.qualificationKz :
                  $i18n.locale === "ru" ? vacancy.qualificationRu : vacancy.qualificationEn'
            />

            <p><b>{{ $t('hr.experienceLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.experienceKz :
                  $i18n.locale === "ru" ? vacancy.experienceRu : vacancy.experienceEn'
            />

            <p><b>{{ $t('hr.languageLevelLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.languageLevelKz :
                  $i18n.locale === "ru" ? vacancy.languageLevelRu : vacancy.languageLevelEn'
            />

            <p><b>{{ $t('hr.certificateRequirementsLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.certificateRequirementsKz :
                  $i18n.locale === "ru" ? vacancy.certificateRequirementsRu : vacancy.certificateRequirementsEn'
            />

            <p><b>{{ $t('hr.personalQualitiesLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.personalQualitiesKz :
                  $i18n.locale === "ru" ? vacancy.personalQualitiesRu : vacancy.personalQualitiesEn'
            />
            <p><b>{{ $t('hr.workConditionLabel') }}</b></p>
            <div class="field def-padding"
                 v-html='$i18n.locale === "kz" ? vacancy.workConditionKz :
                  $i18n.locale === "ru" ? vacancy.workConditionRu : vacancy.workConditionEn'
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
  <Dialog v-model:visible="visible.apply" :style="{ width: '650px' }" :modal="true">

    <template #header>
      <h5>{{ $t('hr.action.apply').toUpperCase() }}</h5>
    </template>

    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="p-fluid grid formgrid">
          <div class="field col-12">
            <Label>{{ $t('hr.vacancySource') }}: </Label>
            <Dropdown class="mt-2" v-model="relation.vacancySource"
                      :options="vacancySources"
                      :class="{'p-invalid': validation.source}"
                      :optionLabel="('name' + ($i18n.locale).charAt(0).toUpperCase() + ($i18n.locale).slice(1))"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.source"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field col-12">
            <Label>{{ $t('hr.motivationLetter') }}: </Label>
            <FileUpload
                class="mt-2"
                mode="basic"
                :customUpload="true"
                :class="{'p-invalid': validation.ml}"
                @uploader="upload($event)"
                :auto="true"
                v-bind:chooseLabel="$t('hdfs.chooseFile')"
            ></FileUpload>
            <InlineMessage severity="info"
                           class="mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small
                class="p-error"
                v-if="validation.ml"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field col-12">
            <hr>
          </div>
          <div class="field col-12">
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
          <div class="field col-12">
            <hr>
          </div>
          <div class="field col-12">
            <Label>{{ $t('hr.doc.chooseSignWay') }}</Label>
            <SelectButton v-model="signWay"
                          :options="signWayOption"
                          class="mt-2"
                          optionValue="value"
                          optionLabel="name"/>
          </div>
          <div class="field col-12">
            <hr>
          </div>
          <div class="field col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <Button class="mt-2"
                    :label="$t('hr.doc.resumeView')"
                    icon="pi pi-plus" :onclick="openResume"/>
          </div>
          <div class="field col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <FileUpload
                class="mt-2"
                mode="basic"
                v-if="signWay === 1"
                :customUpload="true"
                @uploader="uploadResume($event)"
                :auto="true"
                v-bind:chooseLabel="$t('hr.doc.upSignedResume')"/>
          </div>
          <div class="field col-12">
            <InlineMessage severity="info"
                           class="mt-2"
                           show v-if="resumeFile">
              {{ $t('ncasigner.chosenFile', {fn: resumeFile ? resumeFile.name : ""}) }}
            </InlineMessage>
            <div class="field">
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
          <div class="field col-12">
            <div class="field-checkbox">
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
      <i class="pi pi-exclamation-circle mr-3" style="font-size: 2rem"/>
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
import api from "@/service/api";
import {b64toBlob, getHeader, smartEnuApi} from "@/config/config";
import ResumeView from "../../candidate/ResumeView.vue";
import html2pdf from "html2pdf.js";
import {NCALayerClientExtension} from "../../../../helpers/ncalayer-client-ext";
import store from "../../../../store/store";
import router from '@/router';

export default {
  components: {ResumeView},
  data() {
    return {
      vacancyId: null,
      vacancy: null,
      visible: {
        apply: false,
        notFound: false,
        resume: false,
      },
      validation: {
        source: false,
        ml: false,
        resumeData: false,
      },
      signWayOption: [
        {name: this.$t('hr.doc.digital'), value: 0},
        {name: this.$t('hr.doc.paper'), value: 1},
      ],
      vacancySources: [],
      relation: null,
      agreement: false,
      candidate: null,
      signature: null,
      resumeBlob: null,
      document: null,
      resumeFile: null,
      fileBlob: null,
      file: null,
      signWay: 0,
      loginedUser: JSON.parse(localStorage.getItem("loginedUser"))
    }
  },
  created() {
    this.vacancyId = this.$route.params.id
    this.changeRouteAndGetVacancy()
  },

  methods: {
    redirectToResume() {
      router.push({ "name": "Cabinet" })
    },
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

    b64toBlob(b64Data, sliceSize = 512) {
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
    changeRouteAndGetVacancy() {
      if (this.loginedUser && this.$route.path === '/human-resources/vacancy/' + this.vacancyId) {
        this.getVacancy(this.vacancyId)
      }
      if (!this.loginedUser && this.$route.path === '/human-resources/public/vacancy/' + this.vacancyId) {
        this.getVacancy(this.vacancyId)
      } else if (this.loginedUser && this.$route.path === '/human-resources/public/vacancy/' + this.vacancyId) {
        let path = '/human-resources/vacancy/' + this.vacancyId
        this.$router.push({path: path})
      }
    },
    getVacancy(vacancyId) {
      api.post("/vacancy/single",
          {
            vacancyId: parseInt(vacancyId)
          },
          {headers: getHeader()}).then((response) => {
        this.vacancy = response.data;
      }).catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    getCatalog() {
      api.post("/vacancy/sources",
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
      api.post("/candidate/get",
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
        api.post("/vacancy/apply",
            fd, {headers: getHeader()}).then((response) => {
          this.visible.apply = false;
          this.vacancy.isApply = true
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
    openApplyDialog(id) {
      if (this.loginedUser) {
        this.relation = {}
        this.relation.vacancyId = id
        this.relation.candidate = null
        this.getCatalog()
      } else {
        let data = {
          fullPath: '/human-resources/public/vacancy/' + this.vacancyId
        }
        this.$store.dispatch("solveAttemptedUrl", data)
        this.$router.push({path: "/login"})
      }

    },
    validateForm() {
      this.validation.source = !this.relation.vacancySource || this.relation.vacancySource === ""
      this.validation.ml = !this.file || this.file === ""
      this.validation.resumeData = this.signWay === 0 ? (!this.signature || this.signature === "") : (!this.resumeFile || this.resumeFile === "")
      return (!this.validation.source && !this.validation.ml && !this.validation.resumeData)
    }
  }
}

</script>

<style scoped>

</style>

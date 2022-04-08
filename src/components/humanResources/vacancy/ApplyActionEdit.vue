<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t('hr.sendMessage') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
        </Menubar>
      </div>
    </div>
    <div v-if="sending" class="p-col-12 p-md-12 p-fluid">
      <label>{{ $t('hr.sendingMessage') }}</label>
      <ProgressBar mode="indeterminate" class="p-mt-2" style="height: .5em"/>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div v-if="view.petition" class="p-field">
          <Message :closable="false" severity="warn">{{ $t('hr.petition.warn') }}</Message>
        </div>
        <div v-if="view.successSigning" class="p-field">
          <Message :closable="false" severity="success">{{ $t('hr.petition.success') }}</Message>
        </div>
        <div class="p-field">
          <label>{{ $t('hr.messageTitle') }}</label>
          <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('hr.messageTitle')"
              v-model="request.subject"
          ></InputText>
        </div>
        <div class="p-field">
          <label>{{ $t('hr.messageBody') }}</label>
          <Editor
              class="p-mt-2"
              v-model="request.message"
              editorStyle="height: 200px"/>
        </div>

        <!-- PETITION -->
        <hr v-if="view.petition">
        <div v-if="view.petition" class="p-field">
          <label>{{ $t('hr.petition.lang') }}</label>
          <SelectButton v-model="petition.lang"
                        :options="petitionLangOptions"
                        class="p-mt-2"
                        optionValue="value"
                        optionLabel="name"/>
        </div>
        <div v-if="view.petition" class="p-field">
          <label>{{ $t('hr.petition.number') }}</label>
          <InputText
              class="p-mt-2"
              type="text"
              :placeholder="$t('hr.petition.number')"
              :class="{'p-invalid': validation.petition.number}"
              v-model="petition.number"
          ></InputText>
          <small
              class="p-error"
              v-if="validation.petition.number"
          >{{ $t("common.requiredField") }}</small>
        </div>
        <div v-if="view.petition" class="p-field">
          <label>{{$t('common.date')}}</label>
          <PrimeCalendar class="p-mt-2"
                         :class="{'p-invalid': validation.petition.date}"
                         v-model="petition.date"
                         :placeholder="$t('common.date')"
                         :dateFormat="'dd.mm.yy'"/>
          <small
              class="p-error"
              v-if="validation.petition.date"
          >{{ $t("common.requiredField") }}</small>
        </div>
        <div v-if="view.petition" class="p-field">
          <label>{{ $t('common.headIin') }}</label>
          <InputText
              class="p-mt-2"
              :class="{'p-invalid': validation.petition.headIin}"
              type="text"
              :placeholder="$t('common.headIin')"
              v-model="signing.headIin"
          ></InputText>
          <small
              class="p-error"
              v-if="validation.petition.headIin"
          >{{ $t("common.requiredField") }}</small>
        </div>
        <div v-if="view.petition" class="p-field">
          <label>{{ $t('common.headFio') }}</label>
          <InputText
              class="p-mt-2"
              :class="{'p-invalid': validation.petition.headFio}"
              type="text"
              :placeholder="$t('common.headFio')"
              v-model="petition.headFio"
          ></InputText>
          <small
              class="p-error"
              v-if="validation.petition.headFio"
          >{{ $t("common.requiredField") }}</small>
        </div>
        <div v-if="view.petition && pdfFile" class="p-field">
          <Message :closable="false" severity="info">{{ $t('hr.petition.info') }}</Message>
        </div>
        <div v-if="view.petition && view.errorSigning" class="p-field">
          <Message :closable="false" severity="error">{{ $t('hr.petition.error') }}</Message>
        </div>
        <div v-if="view.petition" class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-4 p-mb-lg-0">
            <Button :label="$t('common.createDocument')" icon="pi pi-plus" :onclick="createDocument"/>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-4 p-mb-lg-0">
            <Button :label="$t('common.download')" icon="pi pi-arrow-down" :disabled="!pdfFile" :onclick="downloadDocument"/>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-4 p-mb-lg-0">
            <Button :label="$t('ncasigner.sign')" icon="pi pi-pencil" :disabled="!pdfFile" :onclick="signDocument"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VacancyService from "./VacancyService";
import {NCALayerClient} from "ncalayer-js-client";

export default {
  name: "ApplyActionEdit",
  props: {
    candidateRelation: null,
    readonly: Boolean,
    path: null,
    vacancy: null,
  },
  data() {
    return {
      petitionLangOptions: [
        {name: 'Қазақша', value: 0},
        {name: 'На русском', value: 1},
      ],
      pdfFile: null,
      active: null,
      sending: false,
      request: {},
      petition: {
        lang: 0,
      },
      signing: {},
      view: {
        petition: false,
        successSigning: false,
        errorSigning: false,
        errorMessage: null,
      },
      validation: {
        request: {
          subject: false,
          message: false
        },
        petition: {
          number: false,
          date: false,
          headIin: false,
          headFio: false
        }
      },
      menu: [
        {
          label: this.$t('common.action.submit'),
          icon: "pi pi-fw pi-caret-up",
          visible: true,
          disabled: true,
          command: () => {
            this.sendMessage()
          },
        },
      ],
    }
  },
  created() {
    this.vacancyService = new VacancyService()
  },
  mounted() {
    this.checkExternalHiring()
  },
  methods: {

    sendMessage() {
      if (this.validateRequest()) {
        this.sending = true
        this.request.relId = this.candidateRelation.id
        this.request.to = this.candidateRelation.candidate.user.email
        this.vacancyService.applyAction(this.request, this.path).then(response => {
          this.sending = false
          this.emitter.emit("updateForm", true);
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
          this.sending = false
        })
      }
    },

    createDocument() {
      if (this.validatePetition()) {
        this.pdfFile = null
        this.petition.vacancy = this.vacancy
        this.petition.candidateUserId = this.candidateRelation.candidate.user.userID
        this.vacancyService.generatePetitionPdf(this.petition).then(response => {
          this.pdfFile = response.data
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      }
    },

    downloadDocument() {
      let pdf = this.pdfFile;
      var link = document.createElement('a');
      link.innerHTML = 'Download PDF file';
      link.download = this.vacancy.id + '.pdf';
      link.href = 'data:application/octet-stream;base64,' + pdf;
      link.click();
    },

    async signDocument() {
      let NCALaClient = new NCALayerClient();
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
        this.signing.signature = await NCALaClient.createCAdESFromBase64('PKCS12', this.pdfFile, 'SIGNATURE', false)
        this.sendSignature();
      } catch (error) {
        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
      }
    },

    sendSignature() {
      this.view.errorSigning = false
      this.view.errorMessage = null
      this.signing.vacancyId = this.vacancy.id
      this.signing.candidateId = this.candidateRelation.candidate.id
      const fd = new FormData();
      fd.append("signing", JSON.stringify(this.signing))
      fd.append("petition", this.pdfFile);
      this.vacancyService.sendSign(fd).then(response => {
        this.view.petition = false
        this.view.successSigning = true
        this.menu[0].disabled = false
      }).catch(error => {
        this.view.errorSigning = true
        this.view.errorMessage = error.response
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      })
    },

    checkExternalHiring() {
      if (this.path === 'hire') {
        if (this.vacancy.organization.id !== 1) {
          this.view.petition = true
        } else {
          this.menu[0].disabled = false
        }
      } else {
        this.menu[0].disabled = false
      }
    },

    validateRequest() {
      this.validation.request.subject = !this.request.subject || this.request.subject == ""
      this.validation.request.message = !this.request.message || this.request.message == ""
      return (
          !this.validation.request.subject && !this.validation.request.message
      )
    },
    validatePetition() {
      this.validation.petition.number = !this.petition.number || this.petition.number == ""
      this.validation.petition.date = !this.petition.date || this.petition.date == ""
      this.validation.petition.headIin = !this.signing.headIin || this.signing.headIin == ""
      this.validation.petition.headFio = !this.petition.headFio || this.petition.headFio == ""
      return (
          !this.validation.petition.number &&
          !this.validation.petition.date &&
          !this.validation.petition.headIin &&
          !this.validation.petition.headFio
      )
    }
  }
}
</script>

<style scoped>

</style>
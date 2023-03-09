<template>
  <div :class="'p-grid content-disable ' + view.signing"  >
    <div class="p-col-12">
      <!--   ЗАГОЛОВОК   -->
      <h3>{{ $t('hr.sendMessage') }}</h3>
      <!--   СТРОКА МЕНЮ   -->
      <div>
        <Menubar :model="menu"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px">
        </Menubar>
      </div>
    </div>
    <!-- СТРОКА ПРОГРЕСС ПРИ ОТПРАВКИ СООБЩЕНЯ  -->
    <div v-if="view.sending" class="p-col-12 p-md-12 p-fluid">
      <label>{{ $t('hr.sendingMessage') }}</label>
      <ProgressBar mode="indeterminate" class="p-mt-2" style="height: .5em"/>
    </div>
    <!--  ОСНОВНОЙ РАЗДЕЛ ИНФОРМАЦИИ О ХОДАТАЙСТВЕ  -->
    <div class="p-col-12 p-md-12 p-fluid">
      <!--   ПРЕДУПРЕЖДЕНИЕ О ТОМ, ЧТО НУЖНО ПОДПИСАТЬ ХОДАТВАЙСТВО ЭЦП ПЕРВОГО РУКОВОДИТЕЛЯ   -->
      <div v-if="view.petition" class="p-field">
        <Message :closable="false" severity="warn">{{ $t('hr.petition.warn') }}</Message>
      </div>
      <!--   СООБЩЕНИЕ О ТОМ, ЧТО ХОДАТАЙСТВО УСПЕШНО ПОДПИСАНО   -->
      <div v-if="view.successSigning" class="p-field">
        <Message :closable="false" severity="success">{{ $t('hr.petition.success') }}</Message>
      </div>
      <!--   ЗАГОЛОВОК ПИСЬМА   -->
      <div class="p-field">
        <label>{{ $t('hr.messageTitle') }}</label>
        <InputText
            class="p-mt-2"
            type="text"
            :placeholder="$t('hr.messageTitle')"
            :class="{'p-invalid': validation.request.subject}"
            v-model="request.subject"
        ></InputText>
        <small
            class="p-error"
            v-if="validation.request.subject"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <!--   СОДЕРЖАНИЕ ПИСЬМА   -->
      <div class="p-field">
        <label>{{ $t('hr.messageBody') }}</label>
        <Editor
            class="p-mt-2"
            v-model="request.message"
            :class="{'p-invalid': validation.request.message}"
            editorStyle="height: 200px"/>
        <small
            class="p-error"
            v-if="validation.request.message"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <!-- ХОДАТАЙСТВО -->
      <hr v-if="view.petition">
      <!--   ЯЗЫК ХОДАТАЙСТВА   -->
      <div v-if="view.petition" class="p-field">
        <label>{{ $t('hr.petition.lang') }}</label>
        <SelectButton v-model="petition.lang"
                      :options="petitionLangOptions"
                      class="p-mt-2"
                      optionValue="value"
                      optionLabel="name"/>
      </div>
      <!--   НОМЕР ХОДАТАЙСТВА   -->
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
      <!--   ДАТА ХОДАТАЙСТВА   -->
      <div v-if="view.petition" class="p-field">
        <label>{{ $t('common.date') }}</label>
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
      <!--   ИИН ПЕРВОГО РУКОВОДИТЕЛЯ   -->
      <div v-if="view.petition" class="p-field">
        <label>{{ $t('common.headIin') }}</label>
        <InputText
            class="p-mt-2"
            :class="{'p-invalid': validation.petition.headIin}"
            type="text"
            :placeholder="$t('common.headIin')"
            v-model="petition.headIin"
        ></InputText>
        <small
            class="p-error"
            v-if="validation.petition.headIin"
        >{{ $t("common.requiredField") }}</small>
      </div>
      <!--   ФИО ПЕРВОГО РУКОВОДИТЕЛЯ   -->
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
      <!--   ПОДПИСАНИЕ ХОДАТАЙСТВА   -->
      <div v-if="view.petition" class="p-field">
        <ProgressBar mode="indeterminate" style="height: .5em" v-if="view.signing"/>
      </div>
      <div v-if="view.petition" class="p-field">
        <Button :label="$t('common.createDocument')" icon="pi pi-pencil" :onclick="signDocument"/>
      </div>
    </div>
    <!--  КОМПОНЕНТ ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ И ЭЦП  -->
    <Sidebar
        v-model:visible="view.signerInfo"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <DocSignaturesInfo :docIdParam="documentUuid"
                         :signerIinParam="petition.headIin"
                         :tspParam="true"></DocSignaturesInfo>
    </Sidebar>
  </div>
</template>

<script>
import VacancyService from "./VacancyService";
import DocSignaturesInfo from "@/components/DocSignaturesInfo"
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "ApplyActionEdit",
  components: {DocSignaturesInfo},
  props: {
    candidateRelation: null,
    path: null,
    vacancy: null,
  },
  data() {
    return {
      petitionLangOptions: [
        {name: 'Қазақша', value: 0},
        {name: 'На русском', value: 1},
      ],
      documentUuid: null,
      request: {},
      petition: {
        lang: 0,
      },
      view: {
        sending: false,
        petition: false,
        successSigning: false,
        signerInfo: false,
        signing: false
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
  methods: {
    sendMessage() {
      if (this.path === 'hire' && this.vacancy.organization.id !== 1) {
        if (this.documentUuid === null) {
          this.$toast.add({
            severity: "error",
            summary: this.$t('hr.petition.error'),
            life: 3000,
          });
        }
        axios.post(smartEnuApi + `/workPlan/getSignatures`, {doc_id: this.documentUuid},
            {headers: getHeader()}).then(res => {
          if (res.data) {
            if (res.data.length !== 0) {
              this.send()
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t('hr.petition.error'),
                life: 3000,
              });
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
      } else {
        this.send()
      }
    },
    send() {
      if (this.validateRequest()) {
        this.view.sending = true
        this.request.relId = this.candidateRelation.id
        this.request.to = this.candidateRelation.candidate.user.email
        this.vacancyService.applyAction(this.request, this.path).then(response => {
          this.view.sending = false
          this.emitter.emit("updateForm", true);
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
          this.view.sending = false
        })
      }
    },
    async signDocument() {
      this.view.signing = true
      if (this.validatePetition()) {
        this.petition.vacancy = this.vacancy
        this.petition.candidateUserId = this.candidateRelation.candidate.user.userID
        this.vacancyService.generatePetitionPdf(this.petition).then(response => {
          this.documentUuid = response.data
          this.menu[0].disabled = false
          this.view.signing = false
          this.view.signerInfo = true
        }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        })
      } else {
        this.view.signing = false
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
      this.validation.petition.headIin = !this.petition.headIin || this.petition.headIin == ""
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

<style lang="scss" scoped>
.content-disable {
  &.true {
    pointer-events: none;
  }
  &.false {
    pointer-events: visible;
  }
}
</style>
<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>Создание и редактирование образования</h3>
    </div>
    <div>
      <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.edu.institution') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.institution}"
                type="text"
                :placeholder="$t('hr.edu.institution')"
                v-model="value.institution"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.institution"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.edu.institutionAddress') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.institutionAddress}"
                type="text"
                :placeholder="$t('hr.edu.institutionAddress')"
                v-model="value.institutionAddress"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.institutionAddress"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.faculty') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.faculty}"
                type="text"
                :placeholder="$t('common.faculty')"
                v-model="value.faculty"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.faculty"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.speciality') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.speciality}"
                type="text"
                :placeholder="$t('common.speciality')"
                v-model="value.speciality"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.speciality"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.ad.diplomaNumber') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                type="text"
                :placeholder="$t('hr.ad.diplomaNumber')"
                v-model="value.diplomaNumber"
            ></InputText>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.edu.receiptDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                view="year"
                class="mt-2"
                :class="{'p-invalid': validation.receiptDate}"
                v-model="value.receiptDate"
                :placeholder="$t('hr.edu.receiptDate')"
                dateFormat="yy"/>
            <small
                class="p-error"
                v-if="validation.receiptDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{$t('hr.edu.expirationDate')}}</label>
            <PrimeCalendar
                :readonly="readonly"
                view="year"
                class="mt-2"
                :class="{'p-invalid': validation.expirationDate}"
                v-model="value.expirationDate"
                :placeholder="$t('hr.edu.expirationDate')"
                dateFormat="yy"/>
            <small
                class="p-error"
                v-if="validation.expirationDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {CandidateService} from "@/service/candidate.service"
export default {
  data() {
    return {
      value: this.modelValue,
      head: null,
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.action()
          },
        },
      ],
      validation: {
        institution: false,
        institutionAddress: false,
        faculty: false,
        speciality: false,
        receiptDate: false,
        expirationDate: false
      },
      candidateService: new CandidateService()
    };
  },
  methods: {
    validateForm() {
      this.validation.institution = !this.value.institution || this.value.institution == ""
      this.validation.institutionAddress = !this.value.institutionAddress || this.value.institutionAddress == ""
      this.validation.faculty = !this.value.faculty || this.value.faculty == ""
      this.validation.speciality = !this.value.speciality || this.value.speciality == ""
      this.validation.receiptDate = !this.value.receiptDate || this.value.receiptDate == ""
      this.validation.expirationDate = !this.value.expirationDate || this.value.expirationDate == ""
      return (
          !this.validation.institution &&
          !this.validation.institutionAddress &&
          !this.validation.faculty &&
          !this.validation.speciality &&
          !this.validation.receiptDate &&
          !this.validation.expirationDate
      )
    },
    action() {
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/education/create" : "/candidate/education/update"
        this.candidateService.educationCreateOrUpdate(path, this.value).then(res => {
              this.emitter.emit("education", true);
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      }
    }
  },
  props: {
    modelValue: null,
    candidateId: null,
    readonly: Boolean,
  },
  created() {
  }
};
</script>
<style>
#carddiv label {
  position: inherit;
}
</style>

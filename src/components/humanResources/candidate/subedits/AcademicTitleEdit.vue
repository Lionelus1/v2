<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t("common.academicTitle") }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t("common.academicTitle") }}</label>
            <Dropdown class="mt-2"
                      :class="{'p-invalid': validation.academicTitle}"
                      :disabled="readonly"
                      v-model="value.academicTitle"
                      :options="academicTitleDictionary"
                      :optionLabel="('name'+$i18n.locale)"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.speciality"
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
            <label>{{ $t('hr.ad.defensePlace') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.defensePlace}"
                type="text"
                :placeholder="$t('hr.ad.defensePlace')"
                v-model="value.defensePlace"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.speciality"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{$t('hr.ad.defenseDate')}}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.defenseDate}"
                v-model="value.defenseDate"
                :placeholder="$t('hr.ad.defenseDate')"
                dateFormat="dd.mm.yy"/>
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
                :class="{'p-invalid': validation.diplomaNumber}"
                type="text"
                :placeholder="$t('hr.ad.diplomaNumber')"
                v-model="value.diplomaNumber"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.speciality"
            >{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Institution from "../../../dictionary/Institution";
import DicSpeciality from "../../../dictionary/DicSpeciality";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "AcademicTitleEdit",
  data() {
    return {
      value: this.modelValue,
      academicTitleDictionary: [],
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
        academicTitle: false,
        speciality: false,
        defensePlace: false,
        defenseDate: false,
        diplomaNumber: false,
      }
    };
  },
  props: {
    modelValue: null,
    readonly: Boolean,
  },
  created() {
    this.getCatalog("academic_title")
  },
  methods: {
    getCatalog(name) {
      axios.post(
          smartEnuApi + "/auth/getDictionary",
          {name: name},
          {
            headers: getHeader(),
          }).then((res) => {
        if (name === "academic_title") {
          this.academicTitleDictionary = res.data
        }
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: "Dictionary load error:\n" + error,
            life: 3000,
          });
        }
      });
    },
    action() {
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/academic-title/create" : "/candidate/academic-title/update"
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("academicTitle", true);
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      }
    },
    validateForm() {
      this.validation.academicTitle = !this.value.academicTitle || this.value.academicTitle == ""
      this.validation.speciality = !this.value.speciality || this.value.speciality == ""
      this.validation.defensePlace = !this.value.defensePlace || this.value.defensePlace == ""
      this.validation.defenseDate = !this.value.defenseDate || this.value.defenseDate == ""
      this.validation.diplomaNumber = !this.value.diplomaNumber || this.value.diplomaNumber == ""
      return (
          !this.validation.academicTitle &&
          !this.validation.speciality &&
          !this.validation.defensePlace &&
          !this.validation.defenseDate &&
          !this.validation.diplomaNumber
      )
    }
  }
}
</script>

<style scoped>

</style>
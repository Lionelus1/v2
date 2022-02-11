<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{$t('common.academicDegree')}}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t("common.academicDegree") }}</label>
            <Dropdown class="p-mt-2"
                      v-model="value.academicDegree"
                      :options="academicDegreeDictionary"
                      :optionLabel="('name'+$i18n.locale)"
                      :class="{'p-invalid': validation.academicDegree}"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.academicDegree"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('common.speciality') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
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
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.ad.defensePlace') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.defensePlace}"
                type="text"
                :placeholder="$t('hr.ad.defensePlace')"
                v-model="value.defensePlace"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.defensePlace"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.ad.defenseDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.defenseDate}"
                v-model="value.defenseDate"
                :placeholder="$t('hr.ad.defenseDate')"
                :dateFormat="'mm.dd.yy'"/>
            <small
                class="p-error"
                v-if="validation.defenseDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.ad.diplomaNumber') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.diplomaNumber}"
                type="text"
                :placeholder="$t('hr.ad.diplomaNumber')"
                v-model="value.diplomaNumber"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.diplomaNumber"
            >{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "AcademicDegreeEdit",
  data() {
    return {
      value: this.modelValue,
      academicDegreeDictionary: [],
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
        academicDegree: false,
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
    this.getCatalog("academic_degree")
  },
  methods: {
    getCatalog(name) {
      axios.post(
          smartEnuApi + "/auth/getDictionary",
          {name: name},
          {
            headers: getHeader(),
          }).then((res) => {
        if (name === "academic_degree") {
          this.academicDegreeDictionary = res.data
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
        let path = !this.value.id ? "/candidate/academic-degree/create" : "/candidate/academic-degree/update"
        console.log("VALUE IS ", this.value)
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("academicDegree", true);
            }).catch(error => {
          console.log(error)
        });
      }
    },
    validateForm() {
      this.validation.academicDegree = !this.value.academicDegree || this.value.academicDegree == ""
      this.validation.speciality = !this.value.speciality || this.value.speciality == ""
      this.validation.defensePlace = !this.value.defensePlace || this.value.defensePlace == ""
      this.validation.defenseDate = !this.value.defenseDate || this.value.defenseDate == ""
      this.validation.diplomaNumber = !this.value.diplomaNumber || this.value.diplomaNumber == ""
      return (
          !this.validation.academicDegree &&
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
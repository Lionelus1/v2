<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{$t('common.academicDegree')}}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t("common.academicDegree") }}</label>
            <Dropdown class="mt-2"
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
                v-if="validation.defensePlace"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.ad.defenseDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.defenseDate}"
                v-model="value.defenseDate"
                :placeholder="$t('hr.ad.defenseDate')"
                :dateFormat="'mm.dd.yy'"/>
            <small
                class="p-error"
                v-if="validation.defenseDate"
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
                v-if="validation.diplomaNumber"
            >{{ $t("common.requiredField") }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import {UserService} from "@/service/user.service"
import {CandidateService} from "@/service/candidate.service"
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
      },
      userService: new UserService(),
      candidateService: new CandidateService()
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
      const req =  {name: name}
      this.userService.getDictionary(req).then((res) => {
        if (name === "academic_degree") {
          this.academicDegreeDictionary = res.data
        }
      }).catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "Dictionary load error:\n" + error,
            life: 3000,
          });
      });
    },
    action() {
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/academic-degree/create" : "/candidate/academic-degree/update"
        
        this.candidateService.academicTitleCreateOrUpdate(path, this.value).then(res => {
              this.emitter.emit("academicDegree", true);
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
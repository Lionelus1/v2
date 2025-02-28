<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3 v-if="customType == 'scientists'">{{ $t('science.laborActivity') }}</h3>
      <h3 v-else>{{ $t('hr.title.experience') }}</h3>
      <div>
        <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.startDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.startDate}"
                v-model="value.startDate"
                :placeholder="$t('common.startDate')"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.startDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.endDate') }}</label>
            <div class="p-inputgroup">
              <PrimeCalendar
                  :readonly="readonly"
                  class="mt-2"
                  :class="{'p-invalid': validation.endDate}"
                  v-model="value.endDate"
                  :disabled="value.isStillWorking"
                  :placeholder="$t('common.endDate')"
                  dateFormat="dd.mm.yy"/>
              <span class="p-inputgroup-addon mt-2">
                        <Checkbox id="binary" v-model="value.isStillWorking" :binary="true"/>
                        <label for="binary" style="padding-left: 5px">{{ $t('hr.we.untilNow') }}</label>
                    </span>
            </div>
            <small
                class="p-error"
                v-if="validation.endDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType !== 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.organizationName') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.organizationName}"
                type="text"
                :placeholder="$t('common.organizationName')"
                v-model="value.organizationName"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.organizationName"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.orgNameKz') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.organizationNameKz}"
                type="text"
                :placeholder="$t('common.organizationName')"
                v-model="value.organizationName_kz"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.organizationNameKz"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.posNameKz') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.positionKz}"
                type="text"
                :placeholder="$t('contact.position')"
                v-model="value.position_kz"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.positionKz"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.orgNameRu') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.organizationNameRu}"
                type="text"
                :placeholder="$t('common.organizationName')"
                v-model="value.organizationName_ru"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.organizationNameRu"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.posNameRu') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.positionRu}"
                type="text"
                :placeholder="$t('contact.position')"
                v-model="value.position_ru"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.positionRu"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.orgNameEn') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.organizationNameEn}"
                type="text"
                :placeholder="$t('common.organizationName')"
                v-model="value.organizationName_en"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.organizationNameEn"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType !== 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('contact.position') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.position}"
                type="text"
                :placeholder="$t('contact.position')"
                v-model="value.position"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.position"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.posNameEn') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.positionEn}"
                type="text"
                :placeholder="$t('contact.position')"
                v-model="value.position_en"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.positionEn"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType !== 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.we.responsibilities') }}</label>
            <Textarea v-model="value.responsibilities"
                      class="mt-2"
                      :class="{'p-invalid': validation.responsibilities}"
                      :readonly="readonly"
                      :autoResize="true"
                      type="text"
                      rows="3" cols="30"/>
            <small
                class="p-error"
                v-if="validation.responsibilities"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.responsibilitiesKz') }}</label>
            <Textarea v-model="value.responsibilities_kz"
                      class="mt-2"
                      :class="{'p-invalid': validation.responsibilities}"
                      :readonly="readonly"
                      :autoResize="true"
                      type="text"
                      rows="3" cols="30"/>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.responsibilitiesRu') }}</label>
            <Textarea v-model="value.responsibilities_ru"
                      class="mt-2"
                      :class="{'p-invalid': validation.responsibilities}"
                      :readonly="readonly"
                      :autoResize="true"
                      type="text"
                      rows="3" cols="30"/>
          </div>
          <div v-if="this.customType === 'scientists'" class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('science.responsibilitiesEn') }}</label>
            <Textarea v-model="value.responsibilities_en"
                      class="mt-2"
                      :class="{'p-invalid': validation.responsibilities}"
                      :readonly="readonly"
                      :autoResize="true"
                      type="text"
                      rows="3" cols="30"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "ExperienceEdit",
  data() {
    return {
      value: this.modelValue,
      active: null,
      customType: this.typeCustom,
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
        startDate: false,
        endDate: false,
        organizationName: false,
        organizationNameKz: false,
        organizationNameRu: false,
        organizationNameEn: false,
        position: false,
        positionKz: false,
        positionRu: false,
        positionEn: false,
        responsibilities: false,
        responsibilitiesKz: false,
        responsibilitiesRu: false,
        responsibilitiesEn: false,
      }
    };
  },
  created() {
    this.value.isStillWorking = false
  },
  methods: {
    validateForm() {
      this.validation.startDate = !this.value.startDate || this.value.startDate == ""
      this.validation.endDate = (!this.value.endDate || this.value.endDate == "") && !this.value.isStillWorking
      if (this.customType === 'scientists') {
        this.validation.organizationNameKz = !this.value.organizationName_kz || this.value.organizationName_kz == ""
        this.validation.organizationNameRu = !this.value.organizationName_ru || this.value.organizationName_ru == ""
        this.validation.organizationNameEn = !this.value.organizationName_en || this.value.organizationName_en == ""
        this.validation.positionKz = !this.value.position_kz || this.value.position_kz == ""
        this.validation.positionRu = !this.value.position_ru || this.value.position_ru == ""
        this.validation.positionEn = !this.value.position_en || this.value.position_en == ""
        return (
            !this.validation.startDate &&
            !this.validation.endDate &&
            !this.validation.organizationNameKz &&
            !this.validation.organizationNameRu &&
            !this.validation.organizationNameEn &&
            !this.validation.positionKz &&
            !this.validation.positionRu &&
            !this.validation.positionEn
        )
      } else {
        this.validation.organizationName = !this.value.organizationName || this.value.organizationName == ""
        this.validation.position = !this.value.position || this.value.position == ""
        this.validation.responsibilities = !this.value.responsibilities || this.value.responsibilities == ""
        return (
            !this.validation.startDate &&
            !this.validation.endDate &&
            !this.validation.organizationName &&
            !this.validation.position &&
            !this.validation.responsibilities
        )
      }

    },
    action() {
      if (this.value.isStillWorking === null) {
        this.value.isStillWorking = false
      }
      if (this.value.isStillWorking) {
        this.value.endDate = null
      } 

      if (this.validateForm()) {
        if (this.customType=='scientists') {
          this.savescientists()
        } else {
          this.saveCandidate()
        }
      }
    },
    saveCandidate() {
      let path = !this.value.id ? "/candidate/experience/create" : "/candidate/experience/update"
      api
          .post(path, this.value, {headers: getHeader(),})
          .then(res => {
            this.emitter.emit("experience", true);
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    savescientists() {
      api.post('/science/laborActivity/create', this.value, {headers: getHeader()})
      .then(res => {
        this.emitter.emit("experienceScientists", true);
      });
    }
  },
  props: {
    modelValue: null,
    readonly: Boolean,
    typeCustom: null
  },
}
</script>

<style scoped>

</style>

<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.refresherCourse') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
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
                :placeholder="$t('common.startDate')"
                v-model="value.startDate"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.startDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.endDate') }}</label>
              <PrimeCalendar
                  :readonly="readonly"
                  class="mt-2"
                  :class="{'p-invalid': validation.endDate}"
                  :placeholder="$t('common.endDate')"
                  v-model="value.endDate"
                  dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.endDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
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
            <label>{{ $t('hr.rc.title') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.title}"
                type="text"
                :placeholder="$t('hr.rc.title')"
                v-model="value.title"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.title"
            >{{ $t("common.requiredField") }}</small>
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
  name: "RefresherCourseEdit",
  data() {
    return {
      value: this.modelValue,
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
        startDate: false,
        endDate: false,
        institution: false,
        title: false,
      }
    };
  },
  methods: {
    validateForm() {
      this.validation.startDate = !this.value.startDate || this.value.startDate == ""
      this.validation.endDate = !this.value.endDate || this.value.endDate == ""
      this.validation.institution = !this.value.institution || this.value.institution == ""
      this.validation.title = !this.value.title || this.value.title == ""
      return (
          !this.validation.startDate &&
          !this.validation.endDate &&
          !this.validation.institution &&
          !this.validation.title
      )
    },
    action() {
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/refresher-course/create" : "/candidate/refresher-course/update"
        api
            .post(path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("refresherCourse", true);
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
    readonly: Boolean,
  },
}
</script>

<style scoped>

</style>
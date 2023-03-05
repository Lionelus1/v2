<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t('hr.title.experience') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('common.startDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.startDate}"
                v-model="value.startDate"
                :placeholder="$t('common.startDate')"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.startDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('common.endDate') }}</label>
            <div class="p-inputgroup">
              <PrimeCalendar
                  :readonly="readonly"
                  class="p-mt-2"
                  :class="{'p-invalid': validation.endDate}"
                  v-model="value.endDate"
                  :disabled="value.isStillWorking"
                  :placeholder="$t('common.endDate')"
                  dateFormat="dd.mm.yy"/>
              <span class="p-inputgroup-addon p-mt-2">
                        <Checkbox id="binary" v-model="value.isStillWorking" :binary="true"/>
                        <label for="binary" style="padding-left: 5px">{{ $t('hr.we.untilNow') }}</label>
                    </span>
            </div>
            <small
                class="p-error"
                v-if="validation.endDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('common.organizationName') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
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
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('contact.position') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
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
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.we.responsibilities') }}</label>
            <Textarea v-model="value.responsibilities"
                      class="p-mt-2"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "ExperienceEdit",
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
        organizationName: false,
        position: false,
        responsibilities: false,
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
    },
    action() {
      if (this.value.isStillWorking === null) {
        this.value.isStillWorking = false
      }
      if (this.value.isStillWorking) {
        this.value.endDate = null
      }
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/experience/create" : "/candidate/experience/update"
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("experience", true);
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
<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.referee') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.fullName') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.fullName}"
                type="text"
                :placeholder="$t('common.fullName')"
                v-model="value.fullName"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.fullName"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
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
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('contact.phone') }}</label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validation.phoneNumber}"
                type="text"
                :placeholder="$t('contact.phone')"
                v-model="value.phoneNumber"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.phoneNumber"
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
  name: "RefereeEdit",
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
        fullName: false,
        position: false,
        phoneNumber: false
      }
    };
  },
  methods: {
    validateForm() {
      this.validation.fullName = !this.value.fullName || this.value.fullName == ""
      this.validation.position = !this.value.position || this.value.position == ""
      this.validation.phoneNumber = !this.value.phoneNumber || this.value.phoneNumber == ""
      return (
          !this.validation.fullName &&
          !this.validation.position &&
          !this.validation.phoneNumber
      )
    },
    action() {
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/referee/create" : "/candidate/referee/update"
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("referee", true);
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
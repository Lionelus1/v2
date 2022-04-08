<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t('common.structuralUnit') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div>
          <div class="p-field">
            <label>{{ $t('common.nameInQazaq') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.nameKz}"
                type="text"
                :placeholder="$t('common.nameInQazaq')"
                v-model="value.nameKz"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.nameKz"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field">
            <label>{{ $t('common.nameInRussian') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.name}"
                type="text"
                :placeholder="$t('common.nameInRussian')"
                v-model="value.name"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.name"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-field">
            <label>{{ $t('common.nameInEnglish') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.nameEn}"
                type="text"
                :placeholder="$t('common.nameInEnglish')"
                v-model="value.nameEn"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.nameEn"
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
  name: "Department",
  props: {
    modelValue: null,
    readonly: Boolean,
    orgId: null
  },
  created() {
    console.log(this.modelValue)
  },
  data() {
    return {
      value: this.modelValue === null ? {} : this.modelValue,
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
        nameKz: false,
        name: false,
        nameEn: false,
      }
    };
  },
  methods: {
    validateForm() {
      this.validation.nameKz = !this.value.nameKz || this.value.nameKz == ""
      this.validation.name = !this.value.name || this.value.name == ""
      this.validation.nameEn = !this.value.nameEn || this.value.nameEn == ""
      return (
          !this.validation.nameKz &&
          !this.validation.name &&
          !this.validation.nameEn
      )
    },
    action() {
      if (this.validateForm()) {
        this.value.orgId = this.orgId
        let path = "/add-department"
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("department", true);
            }).catch(error => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        });
      }
    }

  }
}
</script>

<style scoped>

</style>
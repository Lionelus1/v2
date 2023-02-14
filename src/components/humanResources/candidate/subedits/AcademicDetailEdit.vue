<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.academicDetail') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="mb-2">
      <Textarea v-model="value.detailValue"
                class="mt-2"
                :class="{'p-invalid': validation}"
                :readonly="readonly"
                :autoResize="true"
                type="text"
                rows="10" cols="107"/>
      <small
          class="p-error"
          v-if="validation"
      >{{ $t("common.requiredField") }}</small>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "AcademicDetailEdit",
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
      validation: false,
    }
  },
  props: {
    modelValue: null,
    candidateId: null,
    readonly: Boolean,
  },
  methods: {
    validateForm() {
      this.validation = !this.value.detailValue || this.value.detailValue == ""
      return !this.validation
    },
    action() {

      if (this.validateForm()) {
        let path = !this.value.id? "/candidate/academic-detail/create" : "/candidate/academic-detail/update"
        axios
            .post(smartEnuApi + path, this.value, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("academicDetail", true);
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
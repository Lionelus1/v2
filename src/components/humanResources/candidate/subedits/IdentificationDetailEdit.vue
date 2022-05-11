<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t('hr.title.id') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('common.number') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.number}"
                type="text"
                :placeholder="$t('common.number')"
                v-model="value.number"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.number"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.id.startDate') }}</label>
            <PrimeCalendar
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.startDate}"
                :placeholder="$t('hr.id.startDate')"
                v-model="value.startDate"
                dateFormat="dd.mm.yy"/>
            <small
                class="p-error"
                v-if="validation.startDate"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.id.issuedBy') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.issuedBy}"
                type="text"
                :placeholder="$t('hr.id.issuedBy')"
                v-model="value.issuedBy"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.issuedBy"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('contact.iin') }}</label>
            <InputText
                :readonly="readonly"
                class="p-mt-2"
                :class="{'p-invalid': validation.iin}"
                type="text"
                :placeholder="$t('contact.iin')"
                v-model="value.iin"
            ></InputText>
            <small
                class="p-error"
                v-if="validation.iin"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ $t('hr.title.id') }}</label>
            <FileUpload ref="form" mode="basic"
                        class="p-mt-2"
                        :customUpload="true"
                        accept="image/*"
                        :class="{'p-invalid': validation.file}"
                        @uploader="upload($event)" :auto="true"
                        v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
            <InlineMessage severity="info"
                           class="p-mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
            <small
                class="p-error"
                v-if="validation.file"
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
  name: "IdentificationDetailEdit",
  data() {
    return {
      value: this.modelValue,
      file: null,
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
        number: false,
        startDate: false,
        issuedBy: false,
        iin: false,
        file: false
      }
    };
  },
  methods: {
    upload(event) {
      this.file = event.files[0];
    },

    validateForm() {
      this.validation.number = !this.value.number || this.value.number == ""
      this.validation.startDate = !this.value.startDate || this.value.startDate == ""
      this.validation.issuedBy = !this.value.issuedBy || this.value.issuedBy == ""
      this.validation.iin = !this.value.iin || this.value.iin == ""
      this.validation.file = !this.file || this.file == ""
      return (
          !this.validation.number &&
          !this.validation.startDate &&
          !this.validation.issuedBy &&
          !this.validation.iin &&
          !this.validation.file
      )
    },
    action() {
      const fd = new FormData();
      fd.append("id", JSON.stringify(this.value))
      fd.append("idImage", this.file);
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/id/create" : "/candidate/id/update"
        axios
            .post(smartEnuApi + path, fd, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("id", true);
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
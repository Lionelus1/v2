<template>
  <div id="carddiv" class="grid">
    <div class="col-12">
      <h3>{{ $t('hr.title.language') }}</h3>
      <div>
        <Menubar :model="menu" :key="active"
                 style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('common.lang') }}</label>
            <DicLanguage class="mt-2"
                         v-model="value.language"
                         :validation="validation.language"
                         :autoLoad="true"
                         :editMode="true"/>
            <small
                class="p-error"
                v-if="validation.language"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{$t('hr.lang.pl')}}</label>
            <SelectButton
                :disabled="readonly"
                class="mt-2"
                v-model="value.isNative"
                :options="states"
                optionValue="id"
                optionLabel="name"
            />
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.lang.rl') }}</label>
            <Dropdown class="mt-2"
                      :class="{'p-invalid': validation.readingLevel}"
                      v-model="value.readingLevel"
                      :options="knowledgeLevels"
                      :optionLabel="'value'"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.readingLevel"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.lang.sl') }}</label>
            <Dropdown class="mt-2"
                      :class="{'p-invalid': validation.speakingLevel}"
                      v-model="value.speakingLevel"
                      :options="knowledgeLevels"
                      :optionLabel="'value'"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.speakingLevel"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.lang.wl') }}</label>
            <Dropdown class="mt-2"
                      :class="{'p-invalid': validation.writingLevel}"
                      v-model="value.writingLevel"
                      :options="knowledgeLevels"
                      :optionLabel="'value'"
                      :placeholder="$t('common.select')"/>
            <small
                class="p-error"
                v-if="validation.writingLevel"
            >{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.lang.cs') }}</label>
            <Textarea v-model="value.certificate"
                      class="mt-2"
                      :readonly="readonly"
                      :autoResize="true"
                      type="text"
                      rows="3" cols="30"/>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label>{{ $t('hr.lang.c') }}</label>
            <FileUpload ref="form" mode="basic"
                        class="mt-2"
                        :customUpload="true"
                        accept="image/*"
                        @uploader="upload($event)" :auto="true"
                        v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
            <InlineMessage severity="info"
                           class="mt-2"
                           show v-if="file">
              {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
            </InlineMessage>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import DicLanguage from "../../../dictionary/DicLanguage";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "LanguageEdit",
  components: {DicLanguage},
  created() {
    this.value.isNative = false
    this.getCatalog()
  },
  data() {
    return {
      knowledgeLevels: [],
      file: null,
      states: [
        {id: true, name: 'Свободное'},
        {id: false, name: 'Ограниченное'},
      ],
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
        language: false,
        readingLevel: false,
        speakingLevel: false,
        writingLevel: false
      }
    };
  },
  methods: {
    upload(event) {
      this.file = event.files[0];
    },

    validateForm() {
      this.validation.language = !this.value.language || this.value.language == ""
      this.validation.readingLevel = !this.value.readingLevel || this.value.readingLevel == ""
      this.validation.speakingLevel = !this.value.speakingLevel || this.value.speakingLevel == ""
      this.validation.writingLevel = !this.value.writingLevel || this.value.writingLevel == ""
      return (
          !this.validation.language &&
          !this.validation.readingLevel &&
          !this.validation.speakingLevel &&
          !this.validation.writingLevel
      )
    },
    getCatalog() {
      axios.post(
          smartEnuApi + "/knowledge/levels", {}, {headers: getHeader()}).then((res) => {
        this.knowledgeLevels = res.data
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
      const fd = new FormData();
      fd.append("lang", JSON.stringify(this.value))
      fd.append("cert", this.file);
      if (this.validateForm()) {
        let path = !this.value.id ? "/candidate/language/create" : "/candidate/language/update"
        axios
            .post(smartEnuApi + path, fd, {headers: getHeader(),})
            .then(res => {
              this.emitter.emit("language", true);
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
<template>
  <div>
    <Dropdown
        @change="sayChange($event)" v-model="value" :class="{'p-invalid': validation}" :options="languages" :optionLabel="($i18n.locale == 'kz'? 'nameKz' : $i18n.locale == 'en' ? 'nameEn': 'nameRu')" :filter="true" :placeholder="(placeHolder != undefined ? placeHolder: $t('common.select'))">
      <template #value="slotProps">
        <span v-if="slotProps.value">
          {{$i18n.locale === 'kz'? slotProps.value.nameKz : $i18n.locale === 'ru' ? slotProps.value.nameRu : slotProps.value.nameEn }}
        </span>
        <span v-else>
          {{slotProps.placeholder}}
        </span>
      </template>
      <template #emptyfilter>
        <div class="fieldgrid">
          <label class="col-fixed mt-2">{{$primevue.config.locale.emptyFilterMessage}}</label>
          <div class="p-col">
            <Button :onClick="createLanguage" :label="$t('common.createNew')" class="p-button-link" />
          </div>
        </div>
      </template>
    </Dropdown>

    <Sidebar
        v-model:visible="editLanguage"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll">
      <h3>{{$t('')}}</h3>
      <Menubar :model="menu" :key="editMode"
               style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      <div class="col-12 md:col-12 p-fluid">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ $t('common.nameInQazaq') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validationLanguage.name_kz}"
                type="text"
                :placeholder="$t('common.nameInQazaq')"
                v-model="languageDate.nameKz"
            ></InputText>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ $t('common.nameInRussian') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validationLanguage.name_ru}"
                type="text"
                :placeholder="$t('common.nameInRussian')"
                v-model="languageDate.nameRu"
            ></InputText>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ $t('common.nameInEnglish') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText
                :readonly="readonly"
                class="mt-2"
                :class="{'p-invalid': validationLanguage.name_en}"
                type="text"
                :placeholder="$t('common.nameInEnglish')"
                v-model="languageDate.nameEn"
            ></InputText>
          </div>
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import api from "@/service/api";

export default {
  name: "DicLanguage",
  props: {
    modelValue: null,
     editMode: Boolean,
    placeHolder: String,
    autoLoad: Boolean,
    validation: Boolean,
  },
  data() {
    return {
      value: this.modelValue,
      languages:  null,
      editLanguage: false,
      languageDate: {},
      validationLanguage: {
        name_kz: false,
        name_ru: false,
        name_en: false
      },
      readonly: false,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: !(this.languageDate?.nameKz && this.languageDate?.nameRu && this.languageDate?.nameEn),
          command: () => {
            this.update()
          },
        },
      ],
    }
  },
  emits: ['changed'],
  setup(props, context) {
    function updateValue(e) {
      if (e.value) {
        context.emit("update:modelValue", e.value);
      }
    }
    return {
      updateValue,
    };
  },
  created() {
    if (this.autoLoad)
      this.getSpecialities();
  },
  watch: {
    'languageDate.nameKz': function() {
      this.updateMenu();
    },
    'languageDate.nameRu': function() {
      this.updateMenu();
    },
    'languageDate.nameEn': function() {
      this.updateMenu();
    }
  },
  methods: {
    sayChange(event) {
      this.$emit("changed",event)
      this.updateValue(event);
    },
    getSpecialities() {
      this.specialities = null
      this.value = null
      api.get('/languages')
          .then(response=>{
            this.languages = response.data;
            console.log(response.data)
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            }
            this.$toast.add({
              severity: "error",
              summary: "getInstitutions:\n" + error,
              life: 3000,
            });

            if (error.response.status === 404) {
              this.languages = null;
            }
          })
    },
    updateModel(event) {
      this.$emit('update:modelValue', this.value);
    },
    createLanguage() {
      this.editLanguage = true
    },
    update() {
      let path = "/languages/add"
      api
          .post(path, this.languageDate, {headers: getHeader(),})
          .then(res => {
            this.editLanguage = false
            this.languageDate = null;
            this.getSpecialities()
          }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });
    },
    updateMenu() {
      this.menu[0].disabled = !(this.languageDate?.nameKz && this.languageDate?.nameRu && this.languageDate?.nameEn);
    },
  }
}
</script>

<style scoped>

</style>
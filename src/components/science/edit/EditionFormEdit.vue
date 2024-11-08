<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <h3>{{ $t('science.publicationsRecommendedQACFSHE') }}</h3>
  <Menubar :model="menuItems" class="m-0 pt-0 pb-0"></Menubar>
  
  <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
          <label>{{ $t('science.recommendedByQACFSHEKazakh') }}<span class="p-error" v-if="!readonly">*</span></label>
          <InputText v-model="edition.name_kz" :label="$t('science.recommendedByQACFSHEKazakh')" :placeholder="$t('science.recommendedByQACFSHEKazakh')" class="mb-2" id="name_kz"></InputText>
          <small class="p-error" v-if="validation.name_kz">{{ $t("science.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
          <label>{{ $t('science.recommendedByQACFSHERussian') }}<span class="p-error" v-if="!readonly">*</span></label>
          <InputText v-model="edition.name_ru" :label="$t('science.recommendedByQACFSHERussian')" :placeholder="$t('science.recommendedByQACFSHERussian')" class="mb-2" id="name_ru"></InputText>
          <small class="p-error" v-if="validation.name_ru">{{ $t("science.requiredField") }}</small>
        </div>
        <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
          <label for="name_en">{{ $t('science.recommendedByQACFSHEEnglish') }}<span class="p-error" v-if="!readonly">*</span></label>
          <InputText v-model="edition.name_en" :label="$t('science.recommendedByQACFSHEEnglish')" :placeholder="$t('science.recommendedByQACFSHEEnglish')" class="mb-2" id="name_en"></InputText>
          <small class="p-error" v-if="validation.name_en">{{ $t("science.requiredField") }}</small> 
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ScienceService } from "@/service/science.service";

  export default {
    name: 'EditionFormEdit',
    props: {
      propsEdition: Object,
    },
    data() {
      return {
        menuItems: [
          {
            label: this.$t("common.save"),
            icon: "pi pi-fw pi-save",
            command: () => { this.saveEdition() },
            disabled: () => this.edition.name_kz == '' || this.edition.name_en == '' || this.edition.name_ru == '' ,
          }
        ],   
        validation: {
          name_kz: false,
          name_ru: false,
          name_en: false
        },
        scienceService: new ScienceService(),
        edition: {
          id: null,
          name_kz: '',
          name_ru: '',
          name_en: '',
          recommended_by_koksnvo: true,
          user: {
            userID: null,
          },
        },
        loading: false,
      };
    },
    watch: {
      propsEdition: {
        handler(newEdition) {
          this.edition = { ...this.edition, ...newEdition };
        },
        immediate: true,
      },
    },
    methods: {
      showMessage(msgtype, message, content) {
        this.$toast.add({
          severity: msgtype,
          summary: message,
          detail: content,
          life: 3000
        });
      },
      validateForm() {
        this.validation.name_kz = this.edition.name_kz.trim() === '';
        this.validation.name_ru = this.edition.name_ru.trim() === '';
        this.validation.name_en = this.edition.name_en.trim() === '';

        return (
          !this.validation.name_kz &&
          !this.validation.name_ru &&
          !this.validation.name_en 
        );
      },
      saveEdition() {
        if (!this.validateForm()) {
          this.showMessage("error", this.$t('common.message.fillError'));
          return
        }

        this.loading = true

        this.scienceService.addScienceEditions(this.edition).then(res => {
          this.showMessage('success', this.$t('common.success'));
          this.loading = false;
          this.$emit('editions', true)
        }).catch(_ => {
          this.loading = false;
          this.file = null
        })
      },
    },
  };
</script>

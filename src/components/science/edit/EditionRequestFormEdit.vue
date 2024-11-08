<template>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    <h3>{{ $t('science.sendRequestToAdd') }}</h3>
    <Menubar :model="menuItems" class="m-0 pt-0 pb-0"></Menubar>
    
    <div class="col-12 md:col-12 p-fluid">
      <div class="card">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ $t('common.nameInQazaq') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText v-model="edition.name_kz" :label="$t('common.nameInQazaq')" :placeholder="$t('common.nameInQazaq')" class="mb-2" id="name_kz"></InputText>
            <small class="p-error" v-if="validation.name_kz">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label>{{ $t('common.nameInRussian') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText v-model="edition.name_ru" :label="$t('common.nameInRussian')" :placeholder="$t('common.nameInRussian')" class="mb-2" id="name_ru"></InputText>
            <small class="p-error" v-if="validation.name_ru">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
            <label for="name_en">{{ $t('common.nameInEnglish') }}<span class="p-error" v-if="!readonly">*</span></label>
            <InputText v-model="edition.name_en" :label="$t('common.nameEnglish')" :placeholder="$t('common.nameInEnglish')" class="mb-2" id="name_en"></InputText>
            <small class="p-error" v-if="validation.name_en">{{ $t("common.requiredField") }}</small> 
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="rejectDialogVisible" header="Отклонение запроса">
      <div class="col-12 mb-2 pb-2 lg:col-4 mb-lg-0">
        <label for="rejectComment">Комментарий:<span class="p-error" v-if="!readonly">*</span></label>
        <InputText v-model="rejectComment" rows="3" id="rejectComment"></InputText>
      </div>
      <div>
        <Button label="Отправить" @click="sendRejection"></Button>
      </div>
    </Dialog> 



  </template>
  
  <script>
    import { ScienceService } from "@/service/science.service";
  
    export default {
      name: 'EditionFormEditRequest',
      props: {
        propsEdition: Object,
      },
      data() {
        return {
          menuItems: [
          ...(!this.propsEdition
          ? [
          {
            label: this.$t('requests.sendRequest'),
            icon: "pi pi-fw pi-save",
            command: () => { this.saveEdition() },
            disabled: () => this.edition.name_kz == '' || this.edition.name_en == '' || this.edition.name_ru == '' ,
          },]
          : []),
        ...(this.propsEdition
              ? [
                {
                  label: this.$t('requests.save'),
                  icon: "pi pi-fw pi-check",
                  command: () => { this.updateStateEditionRequest(2) },
                  disabled: () => this.edition.name_kz == '' || this.edition.name_en == '' || this.edition.name_ru == '' ,
                },
                {
                  label: this.$t('requests.reject'),
                  icon: "pi pi-fw pi-times",
                  command: () => { this.rejectRequest() },
                  disabled: () => this.edition.name_kz == '' || this.edition.name_en == '' || this.edition.name_ru == '' ,
                },
            ]
        : []),
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
            initiator: {
              userID: null,
            },
          },
          loading: false,
          rejectDialogVisible: false,
          rejectComment: '',
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
      emits: ['editions'],
      methods: {
        rejectRequest() {
          this.rejectDialogVisible = true;
        },
        sendRejection() {
          const comment = this.rejectComment.trim();

          if (!comment) {
            // Handle validation or show an error message
            // You can customize this based on your requirements
            this.showMessage("error", "Ошибка", "Пожалуйста, введите комментарий");
            return;
          }

          this.updateStateEditionRequest(3, comment);
          this.rejectDialogVisible = false;
        },

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
  
          this.scienceService.addScienceEditionsRequest(this.edition).then(res => {
            this.showMessage('success', this.$t('common.success'));
            this.loading = false;
            this.$emit('editions', true)
          }).catch(_ => {
            this.loading = false;
            this.file = null
          })
        },
        updateStateEditionRequest(state) {
          if (!this.validateForm()) {
            this.showMessage("error", this.$t('common.message.fillError'));
            return
          }

          this.loading = true

          this.edition.status.state = state
          const req = {
            edition: this.edition
          }

          if (this.rejectComment != '' && state == 3) {
            this.edition.comment = this.rejectComment
          }

          this.scienceService.updateScienceEditionsRequestStatus(req).then(res => {
            this.showMessage('success', this.$t('common.success'));
            this.loading = false;
            this.$emit('editions', true)
          }).catch(_ => {
            this.loading = false;
            this.file = null
          })

        }
      },
    };
  </script>
  
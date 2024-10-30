<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <div class="col-12">
    <TitleBlock :title="pageTitle" :show-back-button="true"/>

    <BlockUI v-if="haveAccess" :blocked="loading" class="card">
      <div class="card" v-if="formData">
        <div v-if="isWebAdmin || isFacultyWebAdmin" class="field-checkbox mt-3">
          <Checkbox id="landing" name="landing" v-model="formData.is_landing" :binary="true"/>
          <label for="landing">Landing page</label>
        </div>

        <div v-if="formData.is_landing" class="p-fluid">
          <div class="field">
            <label>{{ $t('common.nameInQazaq') }}</label>
            <InputText type="text" v-model="formData.title_kz"/>
            <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field">
            <label>{{ $t('common.nameInRussian') }}</label>
            <InputText type="text" v-model="formData.title_ru"/>
            <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="field">
            <label>{{ $t('common.nameInEnglish') }}</label>
            <InputText type="text" v-model="formData.title_en"/>
            <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
          </div>
        </div>

        <div v-if="!formData.is_landing">
          <TabView class="p-fluid">
            <TabPanel header="Қазақша">
              <div class="field mt-3">
                <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
                <InputText id="title_kz" v-model="formData.title_kz" rows="3"/>
                <small v-show="!formData.title_kz && submitted" class="p-error">{{
                    $t("smartenu.titleKzInvalid")
                  }}</small>
              </div>
              <div class="field">
                <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
                <!--          <RichEditor id="content_kz" v-model="formData.content_kz" editorStyle="height: 320px"/>-->
                <TinyEditor v-model="formData.content_kz" :height="400" :custom-file-upload="true" :accordion="true"
                            @onAfterUpload="onAfterUpload"/>
              </div>
            </TabPanel>
            <TabPanel header="Русский">
              <div class="field mt-3">
                <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
                <InputText id="title_ru" v-model="formData.title_ru" rows="3"/>
                <small v-show="!formData.title_ru && submitted" class="p-error">{{
                    $t("smartenu.titleRuInvalid")
                  }}</small>
              </div>
              <div class="field">
                <label for="kz-content">{{ $t("common.contentInRussian") }}</label>
                <!--          <RichEditor id="content_ru" v-model="formData.content_ru" editorStyle="height: 320px"/>-->
                <TinyEditor v-model="formData.content_ru" :height="400" :customFileUpload="true" :accordion="true"
                            @onAfterUpload="onAfterUpload"/>
              </div>
            </TabPanel>
            <TabPanel header="English">
              <div class="field mt-3">
                <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
                <InputText id="title_en" v-model="formData.title_en" rows="3"/>
                <small v-show="!formData.title_en && submitted" class="p-error">{{
                    $t("smartenu.titleEnInvalid")
                  }}</small>
              </div>
              <div class="field">
                <label for="kz-content">{{ $t("common.contentInEnglish") }}</label>
                <!--          <RichEditor id="content_en" v-model="formData.content_en" editorStyle="height: 320px"/>-->
                <TinyEditor v-model="formData.content_en" :height="400" :custom-file-upload="true" :accordion="true"
                            @onAfterUpload="onAfterUpload"/>
              </div>
            </TabPanel>
          </TabView>
          <div v-if="isWebAdmin" class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("cafedra.responsible") }}</label>
            <FindUser v-model="formData.responsible_users" :user-type="3" :editMode="false"/>
          </div>
          <Gallery @afterUpload="afterUpload" @on-remove="onGalleryRemove" :file-list="galleryFiles"/>

          <div class="field" v-if="formData.files">
            <label>{{ $t('workPlan.attachments') }}</label>
            <div ref="content" class="p-fileupload-content">
              <div class="p-fileupload-files">
                <div v-for="(item, index) of formData.files" :key="index">
                  <div class="p-fileupload-row" v-if="!item.is_gallery">
                                    <span class="mr-3" style="cursor: pointer;" @click="downloadFile(item)">
                                        <i class="fa-solid fa-file-arrow-down text-green-500"></i>
                                    </span>
                    <span @click="downloadFile(item)" style="cursor: pointer;">
                                        {{ item.file.filename ? item.file.filename : item.file.filepath }}</span>
                    <span class="ml-2">
                                        <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                                                v-clipboard:copy="copyToClipboard(item.file)" v-clipboard:success="onCopy"/>
                                    </span>
                    <span>
                                        <Button icon="pi pi-times" class="p-button-rounded p-button-text"
                                                @click="deleteFileConfirm($event, item, index)"/>
                                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <Button v-bind:label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2"
                  v-on:click="save"/>
        </div>
      </div>
    </BlockUI>
    <div v-else class="card">
      <Access textMode="short" :showLogo="false" returnMode="back"></Access>
    </div>
  </div>
</template>


<script setup>
import {useRoute, useRouter} from "vue-router";
import {computed, inject, ref} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {downloadRoute, getHeader, smartEnuApi, findRole} from "@/config/config";
import {useConfirm} from "primevue/useconfirm";
import {useStore} from "vuex";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import Gallery from "@/components/Gallery.vue";
import Access from "@/pages/Access.vue";

const router = useRouter()
const route = useRoute()
const toast = useToast()
const {t, locale} = useI18n()
const confirm = useConfirm()
const store = useStore()
const enuService = new EnuWebService()
const emitter = inject('emitter');
const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isFacultyWebAdmin = computed(() => findRole(authUser.value, "enu_web_fac_admin"))
const isWebAdmin = computed(() => findRole(authUser.value, "enu_web_admin"))
const pageId = computed(() => route.params.id)
const formData = ref()
const submitted = ref(false)
const fileList = ref([])
const loading = ref(false)
const galleryFiles = ref()
const uploadedGalleryFiles = ref()
const lazyParams = ref({
  page: 0,
  rows: 10,
  searchText: null,
  sortField: null,
  sortOrder: 0
})
const pageTitle = computed(() => {
  return formData.value ? t('web.editPage') + ': ' + formData.value['title_' + locale.value] : t('web.editPage')
})
const haveAccess = ref(true)

const getPage = () => {
  loading.value = true;
  enuService.getPageById(pageId.value).then(res => {
    formData.value = res.data
    loading.value = false;
  }).catch(error => {
    if (error?.response?.status === 403) {
      haveAccess.value = false
    } else {
      loading.value = false
      toast.add({severity: "error", summary: error, life: 3000});
    }
  });
}
getPage()

const save = () => {
  if (!validatePage()) return;

  if (uploadedGalleryFiles.value) {
    uploadedGalleryFiles.value.forEach(item => {
      formData.value.files = formData.value.files || [];
      formData.value.files.push({file_id: item.id, file: item, is_gallery: item.is_gallery});
    })
  }

  enuService.editPage(formData.value).then(res => {
    if (res.data !== null) {
      emitter.emit('pageCreateEditMsg', true)
    }
    navigateToPages()
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  });
}

const validatePage = () => {
  let errors = [];
  if (!formData.value.title_kz) {
    errors.push({title_kz: true});
  }
  if (!formData.value.title_ru) {
    errors.push({title_ru: true});
  }
  if (!formData.value.title_en) {
    errors.push({title_en: true});
  }
  return errors.length === 0;
}

const getPageFiles = () => {
  enuService.getPageFiles(formData.value.enu_page_id, false).then(res => {
    if (res.data)
      formData.value.files = res.data;
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })

}

const getPageGallery = () => {
  enuService.getPageFiles(parseInt(pageId.value), true).then(res => {
    if (res.data)
      galleryFiles.value = res.data;
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}
getPageGallery();


const downloadFile = (file) => {
  let url = `${smartEnuApi + downloadRoute + file.uuid}`
  fetch(url, {
    method: 'GET',
    headers: getHeader()
  }).then(response => response.blob()).then(blob => {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }).catch(error => {
    if (error.response && error.response.status === 401) {
      store.dispatch("logLout");
    } else {
      toast.add({
        severity: "error",
        summary: error,
        life: 3000,
      });
    }
  });
}

const deleteFileConfirm = (event, item, index) => {
  confirm.require({
    target: event.currentTarget,
    message: t('common.confirmation'),
    header: t('common.confirm'),
    group: 'deleteResult',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      if (item.id) {
        deleteFile(item.id);
      } else {
        formData.value.files.splice(index, 1);
      }
    }
  });
}

const deleteFile = (id) => {
  enuService.deletePageFile(id).then(res => {
    if (res.data.is_success) {
      getPageFiles();
      toast.add({severity: 'success', detail: t('common.done'), life: 3000});
    }
  }).catch((error) => {
    toast.add({severity: "error", summary: error, life: 3000});
  });
}

const onAfterUpload = (item) => {
  fileList.value.push(item);
  if (formData.value.files) {
    formData.value.files.push({file_id: item.id, file: item});
  } else {
    formData.value.files = [];
    formData.value.files.push({file_id: item.id, file: item});
  }
}

const afterUpload = (files) => {
  if (uploadedGalleryFiles.value) {
    uploadedGalleryFiles.value = uploadedGalleryFiles.value.concat(files)
  } else {
    uploadedGalleryFiles.value = files;
  }
}

const onGalleryRemove = (event) => {
  if (event && formData.value.files) {
    formData.value.files.forEach(e => {
      if (e.file_id === event.id) {
        e.is_deleted = true;
      }
    })
    /*let found = galleryFiles.value.find(x => x.file_id === event.id)
    found.is_deleted = true;*/
  }
}

const copyToClipboard = (file) => {
  return smartEnuApi + downloadRoute + file.uuid;
}

const onCopy = () => {
  toast.add({severity: 'success', summary: t('ncasigner.successCopy'), life: 3000});
}

const resetForm = () => {
  formData.value = {
    enu_page_id: null,
    title_kz: null,
    title_ru: null,
    title_en: null,
    content_kz: null,
    content_ru: null,
    content_en: null,
    files: null
  }
}

const navigateToPages = () => {
  router.push({name: 'EnuPagesList'})
}
</script>

<style scoped>

</style>

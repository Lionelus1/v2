<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <div class="card">
    <Button :label="$t('web.createElement')" @click="openDialog"/>
  </div>
  <div class="card">
    <DataTable :lazy="true" :value="blockElements" dataKey="id" :rowHover="true" :loading="loading"
               responsiveLayout="scroll">
      <template #empty>{{ $t("common.noData") }}</template>
      <template #loading>{{ $t("common.loading") }}</template>
      <Column field="title" :header="$t('common.nameIn')">
        <template #body="{ data }">
          <span>
            {{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}
          </span>
        </template>
      </Column>
      <Column class="text-right">
        <template #body="{ data }">
          <div class="grid">
            <Button icon="fa-solid fa-pen" class="p-button mr-2 " @click="openEdit(data)"/>
            <Button icon="fa-solid fa-trash" class="p-button p-button-danger sm:mt-2 md:mt-2 lg:mt-0 xl:mt-0" @click="confirmRemove(data)"/>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          :header="formData && formData.title_kz ? $t('web.editElement') : $t('web.createElement')" :modal="true"
          class="p-fluid" @hide="hideDialog">

    <TabView>
      <TabPanel header="Қазақша">
        <div class="field">
          <label>{{ $t('common.nameInQazaq') }}</label>
          <InputText type="text" v-model="formData.title_kz"/>
          <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t("common.contentInQazaq") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_kz" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
        </div>
      </TabPanel>
      <TabPanel header="Русский">
        <div class="field">
          <label>{{ $t('common.nameInRussian') }}</label>
          <InputText type="text" v-model="formData.title_ru"/>
          <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_ru" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>

        </div>
      </TabPanel>
      <TabPanel header="English">
        <div class="field">
          <label>{{ $t('common.nameInEnglish') }}</label>
          <InputText type="text" v-model="formData.title_en"/>
          <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t("common.contentInEnglish") }}</label>
          <OptionalMessage :message="$t('web.optionalField')"/>
          <TinyEditor v-model="formData.content_en" :custom-file-upload="true" @onAfterUpload="onAfterUpload"/>
        </div>
      </TabPanel>
    </TabView>

    <div class="field">
      <Fieldset :legend="$t('workPlan.attachments')" :toggleable="true" v-if="formData && formData.files" collapsed>
        <div ref="content" class="p-fileupload-content">
          <div class="p-fileupload-files">
            <div class="p-fileupload-row" v-for="(item, index) of formData.files" :key="index">
              <span class="mr-3" style="cursor: pointer;" @click="downloadFile(item)">
                <i class="fa-solid fa-file-arrow-down text-green-500"></i>
              </span>
              <span @click="downloadFile(item)" style="cursor: pointer;">
                {{ item.file.filename ? item.file.filename : item.file.filepath }}
              </span>
              <span class="ml-2">
                <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                        v-clipboard:copy="copyToClipboard(item.file)" v-clipboard:success="onCopy"/>
              </span>
              <span v-if="item.id">
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="deleteFileConfirm($event, item, index)"/>
              </span>
            </div>
          </div>
        </div>
      </Fieldset>
    </div>

    <div class="field">
      <label>{{ $t('common.link') }}</label>
      <OptionalMessage :message="$t('web.optionalField')"/>
      <InputText type="text" v-model="formData.block_list_link"/>
      <small class="p-error" v-if="!formData.block_list_link && submitted"></small>
    </div>
    <div class="field">
      <label>{{ $t('common.image') }}</label>
      <FileUpload mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true"
                  v-bind:chooseLabel="$t('faq.uploadImage')" accept="image/svg+xml"/>
      <div style="width: 100px;padding:10px;" v-html="formData.block_list_image"></div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
              @click="hideDialog"/>
      <Button v-if="!selectedData" :label="$t('common.add')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="add"/>
      <Button v-if="selectedData" :label="$t('common.save')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="edit"/>
    </template>
  </Dialog>
</template>

<script>
import {onMounted, ref} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import {useRoute} from "vue-router";
import {useConfirm} from "primevue/useconfirm";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import OptionalMessage from "@/components/enuwebsite/OptionalMessage";
import TinyEditor from "@/components/TinyEditor.vue";
import {downloadRoute, getHeader, smartEnuApi} from "@/config/config";
import {useStore} from "vuex";

export default {
  name: "BlockElementsList",
  components: {TinyEditor, OptionalMessage},
  setup() {
    const route = useRoute()
    const confirm = useConfirm()
    const i18n = useI18n()
    const toast = useToast()
    let loading = ref(false)
    let submitted = ref(false)
    let isCreateModal = ref(false)
    let blockElements = ref([])
    const enuService = new EnuWebService()
    const blockId = route.params.id
    let formData = ref({})
    let selectedData = ref(null)
    const fileList = ref([])
    const store = useStore()

    function getBlockElements() {
      loading.value = true
      enuService.getBlockListByBlockId(blockId).then(res => {
        blockElements.value = res.data
        loading.value = false;
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const hideDialog = () => {
      isCreateModal.value = false
      formData.value = {}
    }

    const openDialog = () => {
      formData.value = {}
      isCreateModal.value = true
    }

    const add = () => {
      submitted.value = true;

      if (!isValid()) return;
      formData.value.block_id = parseInt(blockId);
      enuService.addBlockContentListElement(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        isCreateModal.value = false;
        getBlockElements();
      }).catch(error => {
        submitted.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const openEdit = (data) => {
      formData.value = data;
      selectedData.value = data;
      selectedData.value.content_kz = data.content_kz
      isCreateModal.value = true;
    }

    const edit = () => {
      submitted.value = true;
      if (!isValid()) return;

      enuService.editBlockListElement(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "error", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        submitted.value = false;
        selectedData.value = null;
        isCreateModal.value = false;
        getBlockElements()
      }).catch(error => {
        submitted.value = false;
        selectedData.value = null;
        isCreateModal.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      })
    }

    const remove = (data) => {
      enuService.deleteBlockListElement(data.block_list_id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          getBlockElements()
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const confirmRemove = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data)
        },
      });
    }

    const getBlockListFiles = () => {
      enuService.getBlockListFiles(formData.value.block_list_id).then(res => {
        formData.value.files = res.data;
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const copyToClipboard = (file) => {
      return smartEnuApi + downloadRoute + file.uuid;
    }

    const onCopy = () => {
      toast.add({severity: 'success', summary: i18n.t('ncasigner.successCopy'), life: 3000});
    }

    const downloadFile = (item) => {
      let url = `${smartEnuApi + downloadRoute + item.file.uuid}`
      fetch(url, {
        method: 'GET',
        headers: getHeader()
      }).then(response => response.blob()).then(blob => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = item.file.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          store.dispatch("logLout");
        } else {
          toast.add({severity: "error", summary: error, life: 3000});
        }
      });
    }

    const deleteFileConfirm = (event, item, index) => {
      confirm.require({
        target: event.currentTarget,
        message: i18n.t('common.confirmation'),
        header: i18n.t('common.confirm'),
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
      enuService.deleteBlockListFile(id).then(res => {
        if (res.data.is_success) {
          getBlockListFiles();
          toast.add({severity: 'success', detail: i18n.t('common.done'), life: 3000});
        }
      }).catch((error) => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const uploadFile = (event) => {
      let file = event.files[0]
      fetch(file.objectURL)
          .then(response => response.text())
          .then(text => {
            formData.value.block_list_image = text;
          });
    }

    const onAfterUpload = (file) => {
      fileList.value.push(file);
      if (formData.value.files && formData.value.files.length !== 0) {
        formData.value.files.push({file_id: file.id, file: file})
      } else {
        formData.value.files = [];
        formData.value.files.push({file_id: file.id, file: file})
      }
    }

    const isValid = () => {
      let errors = [];
      if (!formData.value.title_kz)
        errors.push(1);
      if (!formData.value.title_ru)
        errors.push(1);
      if (!formData.value.title_en)
        errors.push(1);

      return errors.length === 0
    };

    onMounted(() => {
      getBlockElements()
    });

    return {
      loading, blockElements, isCreateModal, formData, selectedData, hideDialog, openDialog,
      submitted, add, edit, confirmRemove, uploadFile, openEdit, onAfterUpload,
      onCopy, copyToClipboard, deleteFileConfirm, downloadFile
    }
  }
}
</script>

<style scoped>
.p-fileupload-row {
  display: flex;
  align-items: center;
}
</style>

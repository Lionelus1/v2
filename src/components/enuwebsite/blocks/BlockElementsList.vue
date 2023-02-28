<template>
  <div class="card">
    <Button :label="$t('web.createElement')" @click="openDialog" />
  </div>
  <div class="card">
    <DataTable :lazy="true" :value="blockElements" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll">
      <template #empty>{{ $t("common.noData") }}</template>
      <template #loading>{{ $t("common.loading") }}</template>
      <Column field="title" :header="$t('common.nameIn')">
        <template #body="{data}">
          <span>
            {{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}
          </span>
        </template>
      </Column>
      <Column class="text-right">
        <template #body="{data}">
          <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(data)" />
          <Button icon="fa-solid fa-trash" class="p-button-danger" @click="confirmRemove(data)" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="formData ? $t('web.editElement') : $t('web.createElement') " :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="field">
      <label>{{ $t('common.nameInQazaq') }}</label>
      <InputText type="text" v-model="formData.title_kz"  />
      <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInRussian')}}</label>
      <InputText type="text" v-model="formData.title_ru"  />
      <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInEnglish') }}</label>
      <InputText type="text" v-model="formData.title_en"  />
      <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.image') }}</label>
      <FileUpload mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true"
                  v-bind:chooseLabel="$t('faq.uploadImage')" accept="image/svg+xml"/>
      <div style="width: 100px;padding:10px;" v-html="formData.block_list_image"></div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2" @click="hideDialog"/>
      <Button v-if="!selectedData" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success" @click="add" />
      <Button v-if="selectedData" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success" @click="edit" />
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
export default {
  name: "BlockElementsList",
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

    const uploadFile = (event) => {
      let file = event.files[0]
      fetch(file.objectURL)
          .then(response => response.text())
          .then(text => {
            formData.value.block_list_image = text;
          });
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
      submitted, add, edit, confirmRemove, uploadFile, openEdit
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <div class="col-12">
    <TitleBlock :show-back-button="true" :title="'Модуль Какие документы нужны для поступления? | Категории'" />
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="categories" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="title" :header="$t('common.nameIn')">
          <template #body="{data}">
            {{ showName(data) }}
          </template>
        </Column>
        <Column field="create_date" :header="$t('faq.createDate')">
          <template #body="{data}">
            {{ formatDateMoment(data.create_date) }}
          </template>
        </Column>
        <Column>
          <template #body="{data}">
            <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(data)" />
            <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="isDialogShow" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="selectedData ? $t('common.edit') : $t('common.add') " :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="field">
      <label>{{ $t('common.nameInQazaq') }}</label>
      <InputText type="text" v-model="formData.name_kz" :placeholder="$t('common.nameInQazaq')" :class="{ 'p-invalid': !formData.name_kz && submitted }" />
      <small class="p-error" v-if="!formData.name_kz && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInRussian')}}</label>
      <InputText type="text" v-model="formData.name_ru" :placeholder="$t('common.nameInRussian')" :class="{ 'p-invalid': !formData.name_ru && submitted }" />
      <small class="p-error" v-if="!formData.name_ru && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInEnglish') }}</label>
      <InputText type="text" v-model="formData.name_en" :placeholder="$t('common.nameInEnglish')" :class="{ 'p-invalid': !formData.name_en && submitted }" />
      <small class="p-error" v-if="!formData.name_en && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2" @click="hideDialog"/>
      <Button v-if="selectedData" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success" @click="edit" />
      <Button v-if="!selectedData" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success" @click="add" />
    </template>
  </Dialog>
</template>

<script>
import TitleBlock from "@/components/TitleBlock.vue";
import {ref} from "vue";
import {AdmissionInfoService} from "@/service/admission.info.service";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import moment from "moment/moment";
import {useConfirm} from "primevue/useconfirm";

export default {
  name: "AdmissionInfoCategory",
  components: {TitleBlock},
  setup() {
    const loading = ref(false)
    const admissionInfoService = new AdmissionInfoService()
    const toast = useToast()
    const confirm = useConfirm()
    const i18n = useI18n()
    const categories = ref()
    const isDialogShow = ref(false)
    const submitted = ref(false)
    const formData = ref({})
    const selectedData = ref(null)

    const getAdmissionCategories = () => {
      admissionInfoService.getAdmissionCategories().then(res => {
        if (res.data) {
          categories.value = res.data;
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    };

    getAdmissionCategories();

    const openDialog = () => {
      isDialogShow.value = true;
    };

    const hideDialog = () => {
      isDialogShow.value = false;
      selectedData.value = null;
      formData.value = {};
    };

    const add = () => {
      submitted.value = true;
      if (!isValid()) return

      admissionInfoService.addAdmissionCategory(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        getAdmissionCategories();
        submitted.value = false;
        selectedData.value = null;
        isDialogShow.value = false;
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      })
    };

    const edit = () => {
      submitted.value = true;
      if (!isValid()) return

      admissionInfoService.editAdmissionCategory(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        getAdmissionCategories();
        submitted.value = false;
        selectedData.value = null;
        isDialogShow.value = false;
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      })
    };

    const openEdit = (data) => {
      selectedData.value = data;
      formData.value = data;
      isDialogShow.value = true;
    }

    const deleteConfirm = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data.id)
        },
      });
    }

    const remove = (id) => {
      admissionInfoService.deleteAdmissionCategory(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        } else {
          toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
        }
        getAdmissionCategories()
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const isValid = () => {
      let errors = [];
      if (!formData.value.name_kz)
        errors.push(1);
      if (!formData.value.name_ru)
        errors.push(1);
      if (!formData.value.name_en)
        errors.push(1);
      return errors.length === 0
    };

    const showName = (item) => {
      return i18n.locale.value === "kz" ? item.name_kz : i18n.locale.value === "ru" ? item.name_ru : item.name_en
    };

    const formatDateMoment = (date) => {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    };

    return {
      loading, categories, isDialogShow, formData, submitted, selectedData,
      openDialog, showName, formatDateMoment, hideDialog, openEdit, deleteConfirm, add, edit
    }
  }
}
</script>

<style scoped>

</style>
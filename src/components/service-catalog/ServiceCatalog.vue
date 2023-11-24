<script setup>

import TitleBlock from "@/components/TitleBlock.vue";
import {FinanceService} from "@/service/finance.service";
import {computed, onMounted, ref} from "vue";
import ActionButton from "@/components/ActionButton.vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {findRole} from "@/config/config";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";

const apiService = new FinanceService()
const {t, locale} = useI18n()
const store = useStore()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const showDialog = ref(false)
const list = ref()
const formData = ref()
const selectedData = ref()
const isEdit = ref(false)

const initItems = computed(() => {
  return [
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pen',
      command: () => {
        openDialog(formData.value)
      }
    },
    {
      label: t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
        deleteConfirm(formData.value)
      }
    },

  ];
})

const getCatalog = () => {
  loading.value = true
  apiService.getServiceCatalog().then(res => {
    list.value = res.data
    loading.value = false
  }).catch(error => {
    loading.value = false
    console.log(error)
  })
}

const toggle = (data) => {
  formData.value = data
}

const openDialog = () => {
  if (formData.value) {
    isEdit.value = true
  } else {
    formData.value = {}
  }

  showDialog.value = true
}

const hideDialog = () => {
  showDialog.value = false
  isEdit.value = false
  formData.value = null
}

const save = () => {
  apiService.editServiceCatalog(formData.value).then(_ => {
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    hideDialog()
    getCatalog()
  }).catch(error => {
    console.log(error)
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const add = () => {
  formData.value.key = formData.value.title_ru
  apiService.addServiceCatalog(formData.value).then(_ => {
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    hideDialog()
    getCatalog()
  }).catch(error => {
    console.log(error)
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const deleteConfirm = (data) => {
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.delete'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      remove(data.id)
    },
    reject: () => {
      formData.value = null
    },
    onHide: () => {
      formData.value = null
    }
  });
}

const remove = (id) => {
  apiService.deleteServiceCatalog(id).then(_ => {
    toast.add({severity: "success", summary: t('common.success'), life: 3000});
    getCatalog()
  }).catch(error => {
    console.log(error)
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const isValid = () => {
  let errors = []

  if (formData.value.title_kz) {
    errors.push(1)
  }
  if (formData.value.title_ru) {
    errors.push(1)
  }
  if (formData.value.title_en) {
    errors.push(1)
  }

  return errors.length === 0
}

onMounted(() => {
  getCatalog()
})
</script>

<template>
  <div class="col-12">
    <TitleBlock title="Каталог услуг" />

    <div class="card" v-if="findRole(store.state.loginedUser, 'main_administrator') || findRole(store.state.loginedUser, 'finance_administrator')">
      <Button :label="t('common.add')" icon="pi pi-plus" @click="openDialog"/>
    </div>

    <div class="card">
      <DataTable :lazy="true" :value="list" dataKey="id" :loading="loading" responsiveLayout="scroll" :rowHover="true">
        <template #empty>{{ t("common.noData") }}</template>
        <template #loading>{{ t("common.loading") }}</template>
        <Column :field="'title_' + locale" :header="$t('common.nameIn')">
          <template #body="{ data }">
            {{ data['title_' + locale] }}
          </template>
        </Column>
        <Column field="price" :header="$t('web.price')">
          <template #body="{ data }">
            {{ data?.price || "" }}
          </template>
        </Column>
        <Column class="text-right">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="showDialog" :style="{ width: '450px' }" :header="isEdit ? t('common.edit') : t('common.add')"
          :modal="true" @hide="hideDialog">
    <div class="p-fluid">
      <div class="field">
        <label>{{ t('common.nameInQazaq') }}</label>
        <InputText v-model="formData.title_kz" />
      </div>
      <div class="field">
        <label>{{ t('common.nameInRussian') }}</label>
        <InputText v-model="formData.title_ru" />
      </div>
      <div class="field">
        <label>{{ t('common.nameInEnglish') }}</label>
        <InputText v-model="formData.title_en" />
      </div>
      <div class="field">
        <label>{{ t('web.price') }}</label>
        <InputNumber v-model="formData.price" />
      </div>
    </div>
    <template #footer>
      <Button v-if="!isEdit" :label="$t('common.add')" @click="add"
              class="p-button-success"/>
      <Button v-if="isEdit" :label="$t('common.save')" @click="save"
              class="p-button-success"/>
      <Button :label="$t('common.cancel')" @click="hideDialog"
              class="p-button-danger"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>
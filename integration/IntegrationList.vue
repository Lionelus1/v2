<script setup>

import ActionButton from "@/components/ActionButton.vue";
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {IntegrationService} from "@/service/integration.service";
import {useToast} from "primevue/usetoast";
import {useRouter} from "vue-router";
import {useConfirm} from "primevue/useconfirm";
import Access from "@/pages/Access.vue";

const {t, locale} = useI18n()
const toast = useToast()
const router = useRouter()
const confirm = useConfirm()

const service = new IntegrationService()
const loading = ref(false)
const list = ref()
const formData = ref()
const haveAccess = ref(true)

const showDialog = ref(false)
const isEdit = ref(false)

const lazyParams = ref({
  page: 0,
  rows: 10
})

const initItems = computed(() => {
  return [
    {
      label: t('integration.updateNow'),
      icon: 'fa-solid fa-play',
      command: () => {
        runConfirm(formData.value)
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

const getIntegrations = () => {
  loading.value = true;
  service.getIntegrations(lazyParams.value).then(res => {
    list.value = res.data
    loading.value = false
  }).catch(error => {
    if (error?.response?.status === 403) {
      haveAccess.value = false;
    } else {
      toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
    }
    loading.value = false;
  })
}

const openDialog = () => {
  formData.value = {}
  showDialog.value = true
}

const hideDialog = () => {
  showDialog.value = false
  formData.value = null
}

const runConfirm = (data) => {
  confirm.require({
    message: t('common.confirmation'),
    header: t('common.confirm'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      run(data.id)
    },
  });
}

const run = (id) => {
  service.runIntegrationSync(id).then(_ => {
    toast.add({severity: 'success', summary: t('common.success'), life: 3000})
  }).catch(error => {
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
  });
}

const remove = (id) => {
  service.deleteIntegration(id).then(_ => {
    toast.add({severity: 'success', summary: t('common.success'), life: 3000})
    getIntegrations()
  }).catch(error => {
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const toggle = (data) => {
  formData.value = data
}

const add = () => {
  service.addIntegration(formData.value).then(_ => {
    toast.add({severity: 'success', summary: t('common.success'), life: 3000})
    hideDialog()
    getIntegrations()
  }).catch(error => {
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const edit = () => {
  service.editIntegration(formData.value).then(_ => {
    toast.add({severity: 'success', summary: t('common.success'), life: 3000})
    hideDialog()
    getIntegrations()
  }).catch(error => {
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

const navigateToView = (id) => {
  router.push({name: "IntegrationView", params: {id: id}})
}

const toggleIntegration = (data) => {
  service.toggleIntegrationSync(data.id).then(_ => {
    toast.add({severity: 'success', summary: t('common.success'), life: 3000})
    getIntegrations()
  }).catch(error => {
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
  })
}

onMounted(() => {
  getIntegrations()
})
</script>

<template>
  <div class="col-12">
    <TitleBlock :title="t('integration.title')" />
<!--    <div class="card">
      <Button @click="openDialog(null)" icon="pi pi-plus"
              class="p-button p-button-success" :label="$t('common.add')" />
    </div>-->
    <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <div class="card">
      <DataTable :lazy="true" :value="list" dataKey="id" :loading="loading" responsiveLayout="scroll"
                 :rowHover="true">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column :field="'name_' + locale" :header="$t('common.nameIn')" sortable>
          <template #body="{ data }">
            {{ data['name_' + locale] }}
<!--            <a href="javascript:void(0)" @click="navigateToView(data)">
              {{ data['name_' + locale] }}
            </a>-->
          </template>
        </Column>
        <Column field="is_active" style="width: 200px" :header="t('common.state')">
          <template #body="{data}">
            <InputSwitch v-model="data.is_active" @change="toggleIntegration(data)" />
          </template>
        </Column>
        <Column class="text-right" style="width: 200px">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    </BlockUI>
    <div v-else class="card">
      <Access textMode="short" :showLogo="false" returnMode="back"></Access>
    </div>
  </div>

  <Dialog v-model:visible="showDialog" :style="{ width: '450px' }"
          :header="isEdit ? t('common.edit') : t('common.add')" :modal="true" class="p-fluid" @hide="hideDialog" :close-on-escape="true">
    <div class="p-fluid">
      <div class="field">
        <label>{{ t('common.nameInQazaq') }}</label>
        <InputText v-model="formData.name_kz" />
      </div>
      <div class="field">
        <label>{{ t('common.nameInRussian') }}</label>
        <InputText v-model="formData.name_ru" />
      </div>
      <div class="field">
        <label>{{ t('common.nameInEnglish') }}</label>
        <InputText v-model="formData.name_en" />
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
              @click="hideDialog" />
      <Button v-if="!isEdit" :label="$t('common.save')" icon="pi pi-check" class="p-button-text" @click="add" />
    </template>
  </Dialog>
</template>

<style scoped>

</style>

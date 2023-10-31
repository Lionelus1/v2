<script setup>

import ActionButton from "@/components/ActionButton.vue";
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {IntegrationService} from "@/service/integration.service";
import {useToast} from "primevue/usetoast";
import {useRouter} from "vue-router";

const {t, locale} = useI18n()
const toast = useToast()
const router = useRouter()

const service = new IntegrationService()
const loading = ref(false)
const list = ref()
const selectedItem = ref()
const formData = ref({})

const showDialog = ref(false)

const options = ref(['Off', 'On']);

const lazyParams = ref({
  page: 0,
  rows: 10
})

const initItems = computed(() => {
  return [
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pen',
      command: () => {
        openDialog(selectedItem.value)
      }
    },
    {
      label: t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
        deleteConfirm(selectedItem.value)
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
    toast.add({severity: 'error', summary: t('common.error'), detail: error, life: 3000})
    loading.value = false;
  })
}

const openDialog = (data) => {
  if (data) selectedItem.value = data
  showDialog.value = true
}

const hideDialog = () => {
  showDialog.value = false
}

const deleteConfirm = () => {

}

const toggle = (data) => {
  selectedItem.value = data
}

const save = () => {

}

const navigateToView = (id) => {
  router.push({name: "IntegrationView", params: {id: id}})
}

onMounted(() => {
  getIntegrations()
})
</script>

<template>
  <div class="col-12">
    <TitleBlock title="Интергациялар" />
    <div class="card">
      <Button @click="openDialog(null)" icon="pi pi-plus"
              class="p-button p-button-success" :label="$t('common.add')" />
    </div>

    <div class="card">
      <DataTable :lazy="true" :value="list" dataKey="id" :loading="loading" responsiveLayout="scroll"
                 :rowHover="true">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column :field="'name_' + locale" :header="$t('common.nameIn')" sortable>
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToView(data)">
              {{ data['name_' + locale] }}
            </a>
          </template>
        </Column>
        <Column field="is_active">
          <template #body="{data}">
            <SelectButton v-model="data.is_active" :options="options" :value="'Работает'" aria-labelledby="basic" />
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

  <Dialog v-model:visible="showDialog" :style="{ width: '450px' }"
          :header="$t('common.add')" :modal="true" class="p-fluid" @hide="hideDialog" :close-on-escape="true">
    <div class="p-fluid">
      <div class="field">
        <label>{{ t('common.nameIn') }}</label>
        <InputText v-model="formData.name" />
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
              @click="hideDialog" />
      <Button :label="$t('common.save')" icon="pi pi-check" class="p-button-text" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>

</style>
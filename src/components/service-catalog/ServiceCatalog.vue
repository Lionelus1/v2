<script setup>

import TitleBlock from "@/components/TitleBlock.vue";
import {FinanceService} from "@/service/finance.service";
import {onMounted, ref} from "vue";
import ActionButton from "@/components/ActionButton.vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {findRole} from "@/config/config";

const apiService = new FinanceService()
const {t, locale} = useI18n()
const store = useStore()

const loading = ref(false)
const showDialog = ref(false)
const list = ref()
const formData = ref()
const selectedData = ref()

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

const openDialog = (data) => {
  if (data) {
    formData.value = data
  } else {
    formData.value = {}
  }

  showDialog.value = true
}

const hideDialog = () => {
  showDialog.value = false
  formData.value = null
}

const save = () => {
  apiService.addServiceCatalog(formData.value).then(res => {

  }).catch(error => {
    console.log(error)
  })
}

const add = () => {
  apiService.editServiceCatalog(formData.value).then(res => {

  }).catch(error => {
    console.log(error)
  })
}

const isValid = () => {
  let errors = []

  if (formData.value.key) {
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
<!--        <Column class="text-right">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)" />
          </template>
        </Column>-->
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="showDialog" :style="{ width: '450px' }" :header="t('common.add')"
          :modal="true" @hide="hideDialog">
    <div class="p-fluid">
      <div class="field">
        <label></label>
        <InputText v-model="formData.title_kz" />
      </div>
      <div class="field">
        <label></label>
        <InputText v-model="formData.title_ru" />
      </div>
      <div class="field">
        <label></label>
        <InputText v-model="formData.title_en" />
      </div>
    </div>
    <template #footer>
      <div class="flex flex-wrap row-gap-1">
        <Button :label="$t('common.add')" @click="add"
                class="p-button-text"/>
        <Button :label="$t('common.save')" @click="save"
                class="p-button-text"/>
        <Button :label="$t('common.cancel')" @click="hideDialog"
                class="p-button-text"/>
      </div>

    </template>
  </Dialog>
</template>

<style scoped>

</style>
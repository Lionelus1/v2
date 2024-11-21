<template>
  <div class="col-12">
    <h3>{{ $t('common.finance') }}</h3>
    <div class="card">
      <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" :value="data" dataKey="id" :rowHover="true" :loading="loading">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="user" :header="$t('common.services')">
          <template #body="{ data }">
            {{data['title_' + locale]}}
          </template>
        </Column>
        <Column field="status" :header="$t('common.amount')">
          <template #body="{ data }">
            {{data.sum}}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {FinanceService} from "@/service/finance.service";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const data = ref(null)
const apiService = new FinanceService()
const loading = ref(true)

const getFinance = () => {
  loading.value = true
  apiService.getServiceFinance().then(res => {
    data.value = res.data.service
    console.log(data.value)
    loading.value = false
  }).catch(error => {
    loading.value = false
  })
}

onMounted(() => {
  getFinance()
})
</script>

<script setup>

import TitleBlock from "@/components/TitleBlock.vue";
import {FinanceService} from "@/service/finance.service";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import {onMounted, ref} from "vue";
import DepartmentList from "@/components/smartenu/DepartmentList.vue";
import {isMobile} from "@/helpers/helper";

const apiService = new FinanceService()
const {t, locale} = useI18n()
const toast = useToast()
const confirm = useConfirm()
const store = useStore()

const loading = ref(false)
const serviceList = ref()
const selectedService = ref()
const showPaymentList = ref(false)

const formData = ref({})

const purchaseType = ref(-1)
const submitted = ref(false)

const getCatalog = () => {
  loading.value = true
  apiService.getServiceCatalog().then(res => {
    serviceList.value = res.data
    loading.value = false
  }).catch(error => {
    loading.value = false
    console.log(error)
  })
}

const purchaseService = () => {
  submitted.value = true
  if (!isServiceValid()) {
    return
  }
  showPaymentList.value = true
}

const goBack = () => {
  showPaymentList.value = false
}

const goPay = () => {
  switch (purchaseType.value) {
    case 1:
      // eslint-disable-next-line no-case-declarations
      let url = "https://kaspi.kz/pay/EurasianUniversity?started_from=QR";
      url += `&6526=${formData.value.service_key}`;
      url += `&6527=${formData.value.department.nameRu}`
      url += `&6530=${store.state.loginedUser?.fullName || ""}`
      url += `&6529=${store.state.loginedUser?.IIN || ""}`
      window.open(url, "_blank")
      break;
    case 2:

      break;
  }
}

const isServiceValid = () => {
  let errors = []
  if (!formData.value.department) {
    errors.push(1)
  }

  if (!formData.value.service_key) {
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
    <TitleBlock :title="t('finance.getService')"/>

    <div v-if="!showPaymentList">
      <div class="p-fluid">
        <div class="field">
          <label>{{ t('finance.chooseService') }}</label>
          <Dropdown v-model="formData.service_key" :options="serviceList" :optionLabel="'title_' + locale" optionValue="key"
                    :placeholder="$t('common.select')" />
          <small class="p-error" v-if="!formData.service_key && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label for="name">{{ $t('common.faculty') }}</label>
          <DepartmentList :autoLoad="true" v-model="formData.department" :placeHolder="t('smartenu.selectFaculty')"/>
          <small class="p-error" v-if="!formData.department && submitted">{{ $t("common.requiredField") }}</small>
        </div>
      </div>

      <Button :label="t('ref.get')" icon="pi pi-plus" @click="purchaseService"/>
    </div>

    <div class="mt-3" v-if="showPaymentList">
      <h4>{{ t('finance.choosePayment') }}</h4>
      <div class="flex flex-column flex-wrap gap-3">
        <div class="flex align-items-center">
          <RadioButton v-model="purchaseType" name="dynamic" input-id="kaspi" :value="1"/>
          <label for="kaspi" class="ml-2">{{ t('finance.kaspiApp') }}</label>
        </div>
<!--        <div class="flex align-items-center">
          <RadioButton v-model="purchaseType" disabled name="dynamic" input-id="bank" :value="2"/>
          <label for="bank" class="ml-2">Банковской картой</label>
        </div>-->

        <div class="flex align-item-center">
          <Button :label="t('common.cancel')" icon="pi pi-arrow-left" @click="goBack" class="mr-3"/>
          <Button :label="t('ref.get')" icon="pi pi-plus" @click="goPay"/>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>

</style>
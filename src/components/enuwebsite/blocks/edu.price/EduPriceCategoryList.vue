<template>
  <div class="col-12">
    <TitleBlock :show-back-button="true" :title="'Модуль Какие профессии есть?'" />
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card" v-if="data">
      <DataTable :lazy="true" :value="data" dataKey="id" :loading="loading" responsiveLayout="scroll">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <template #header>
          <h4 class="mb-2 m-md-0 align-self-md-center">Категории</h4>
        </template>
        <Column :header="$t('common.nameIn')">
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToPrice(data.id)">{{ data['name_' + $i18n.locale] }}</a>
          </template>
        </Column>
        <Column :header="'Академиялық дәреже'">
          <template #body="{data}">
            <div v-if="data.degree">{{ data.degree['name_' + $i18n.locale] }}</div>
          </template>
        </Column>
        <Column :header="'Сипаттама'">
          <template #body="{data}">
            {{ data.desc ? data.desc : '' }}
          </template>
        </Column>
        <Column header="" class="text-right">
          <template #body="{data}">
            <Button icon="fa-solid fa-pen" class="p-button mr-2" @click="openEdit(data)" />
            <Button icon="fa-solid fa-trash" class="p-button-danger" @click="deleteConfirm(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import TitleBlock from "@/components/TitleBlock.vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";
import {inject, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {EduPriceService} from "@/service/edu.price.service";
import EduPriceAdd from "@/components/enuwebsite/blocks/edu.price/EduPriceAdd.vue";
import {EnuWebService} from "@/service/enu.web.service";

export default {
  name: "EduPriceCategoryList",
  components: {TitleBlock},
  setup() {
    const eduPriceService = new EduPriceService()
    const toast = useToast()
    const i18n = useI18n()
    const confirm = useConfirm()
    const loading = ref(false)
    const showModal = ref(false)
    const data = ref()
    const block = ref()
    const router = useRouter()
    const selectedData = ref()
    const emitter = inject('emitter');

    const getCategories = () => {
      loading.value = true;
      eduPriceService.getPriceCategories().then(res => {
        if (res.data) data.value = res.data;
        loading.value = false;
      }).catch(error => {
        loading.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getCategories();

    const openDialog = () => {
      showModal.value = true;
    }

    const hideDialog = () => {

    }

    const navigateToPrice = (id) => router.push({name: 'EduPriceList', params: {id: id}})

    return {
      data, loading, showModal, block,
      openDialog, hideDialog, navigateToPrice
    }

  }
}
</script>

<style scoped>

</style>
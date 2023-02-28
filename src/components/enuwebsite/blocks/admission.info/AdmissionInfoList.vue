<template>
  <div class="col-12">
    <h3>Модуль Какие документы нужны для поступления?</h3>
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card" v-if="data">
      <DataTable :lazy="true" :value="data" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="title" :header="$t('common.nameIn')">
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToAdmissionCategories">
              {{ $i18n.locale === "kz" ? data.admission_category.name_kz : $i18n.locale === "ru" ? data.admission_category.name_ru : data.admission_category.name_en }}
            </a>
          </template>
        </Column>
        <Column header="Академиялық дәреже">
          <template>
            -
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

  <AdmissionInfoAdd v-if="showAdmissionInfoAdd" :is-show="showAdmissionInfoAdd" :selected-data="selectedData" :block="block" />
</template>

<script>
import {AdmissionInfoService} from "@/service/admission.info.service";
import {inject, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import AdmissionInfoAdd from "@/components/enuwebsite/blocks/admission.info/AdmissionInfoAdd.vue";
import mitt from "mitt";
import {useToast} from "primevue/usetoast";

export default {
  name: "AdmissionInfoList",
  components: {AdmissionInfoAdd},
  setup() {
    const admissionInfoService = new AdmissionInfoService();
    const toast = useToast()
    const loading = ref(false)
    const showAdmissionInfoAdd = ref(false)
    const data = ref()
    const block = ref()
    const router = useRouter()
    const selectedData = ref()
    const emitter = inject('emitter');

    const getAdmissionInfoList = () => {
      admissionInfoService.getAdmissionInfoList().then(res => {
        console.log(res.data)
          data.value = res.data.items;
          block.value = res.data.block;

      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    };

    const openDialog = () => {
      showAdmissionInfoAdd.value = true;
    };

    const openEdit = (data) => {
      selectedData.value = data;
      showAdmissionInfoAdd.value = true;
    }

    const navigateToAdmissionCategories = () => {
      router.push({name: 'AdmissionInfoCategory'});
    };

    onMounted(() => {
      getAdmissionInfoList();
      emitter.on("showAdmissionAddDialog", (isShow) => {
        showAdmissionInfoAdd.value = isShow;
        getAdmissionInfoList();
      });
    });

    return {
      loading, data, showAdmissionInfoAdd, selectedData, block,
      navigateToAdmissionCategories, openDialog, openEdit
    }
  }
}
</script>

<style scoped>

</style>
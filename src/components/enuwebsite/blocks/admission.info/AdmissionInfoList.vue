<template>
  <div class="col-12">
    <h3>Модуль Какие документы нужны для поступления?</h3>
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card">
      <DataTable :lazy="true" :value="data" dataKey="id" :rowHover="true" :loading="loading" responsiveLayout="scroll">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="title" :header="$t('common.nameIn')">
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToView(data)">{{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}</a>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import {AdmissionInfoService} from "@/service/admission.info.service";
import {onMounted, ref} from "vue";

export default {
  name: "AdmissionInfoList",
  setup() {
    const admissionInfoService = new AdmissionInfoService();
    const loading = ref(false)
    const data = ref()

    const getAdmissionInfoList = () => {
      admissionInfoService.getAdmissionInfoList().then(res => {
        if (res.data) {
          data.value = res.data;
        }
      }).catch(error => {
        console.log(error)
      });
    };

    onMounted(() => {
      getAdmissionInfoList();
    });

    return {
      loading, data
    }
  }
}
</script>

<style scoped>

</style>
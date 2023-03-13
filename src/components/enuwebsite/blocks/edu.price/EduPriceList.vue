<template>
  <div class="col-12">
    <TitleBlock :show-back-button="true" :title="'Модуль Какие профессии есть?'" />
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card" v-if="data">
      <DataTable :lazy="true" :value="data" dataKey="id" :loading="loading" responsiveLayout="scroll"
                 rowGroupMode="rowspan" groupRowsBy="admission_level" sortField="admission_level" >
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column field="admission_level.name_ru" header="Академиялық дәреже">
          <template #body="{ data }">
            <div v-if="data.admission_level">{{ data.admission_level[0]['name_ru'] }}</div>
          </template>
        </Column>
        <Column field="title" :header="$t('common.nameIn')">
          <template #body="{data}">
            <a href="javascript:void(0)" @click="navigateToAdmissionCategories">
              {{ $i18n.locale === "kz" ? data.admission_category.name_kz : $i18n.locale === "ru" ? data.admission_category.name_ru : data.admission_category.name_en }}
            </a>
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
import {inject, ref} from "vue";
import {useRouter} from "vue-router";

export default {
  name: "EduPriceList",
  components: {TitleBlock},
  setup() {
    const toast = useToast()
    const i18n = useI18n()
    const confirm = useConfirm()
    const loading = ref(false)
    const showAdmissionInfoAdd = ref(false)
    const data = ref()
    const block = ref()
    const router = useRouter()
    const selectedData = ref()
    const emitter = inject('emitter');
  }
}
</script>

<style scoped>

</style>
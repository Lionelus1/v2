<template>
  <div class="col-12">
    <TitleBlock :show-back-button="true" :title="'Модуль Какие документы нужны для поступления?'" />
    <div class="card">
      <Button :label="$t('common.add')" @click="openDialog" />
    </div>
    <div class="card">
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

  <AdmissionInfoAdd v-if="showAdmissionInfoAdd" :is-show="showAdmissionInfoAdd" :selected-data="selectedData" :block="block" />
</template>

<script>
import {AdmissionInfoService} from "@/service/admission.info.service";
import {inject, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import AdmissionInfoAdd from "@/components/enuwebsite/blocks/admission.info/AdmissionInfoAdd.vue";
import mitt from "mitt";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";
import TitleBlock from "@/components/TitleBlock.vue";

export default {
  name: "AdmissionInfoList",
  components: {AdmissionInfoAdd, TitleBlock},
  setup() {
    const admissionInfoService = new AdmissionInfoService();
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

    const getAdmissionInfoList = () => {
      admissionInfoService.getAdmissionInfoList().then(res => {
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

    const deleteConfirm = (data) => {
      confirm.require({
        message: i18n.t('common.doYouWantDelete'),
        header: i18n.t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          remove(data.id)
        },
      });
    }

    const remove = (id) => {
      admissionInfoService.deleteAdmissionInfo(id).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        getAdmissionInfoList();
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
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
      navigateToAdmissionCategories, openDialog, openEdit, deleteConfirm
    }
  }
}
</script>

<style scoped>

</style>
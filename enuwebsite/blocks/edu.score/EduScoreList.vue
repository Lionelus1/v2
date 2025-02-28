<template>
    <div class="col-12">
      <TitleBlock :show-back-button="true" :title="'Проходные баллы ЕНТ | Бакалавр'" />
      <div class="card">
        <Button :label="$t('common.add')" @click="openDialog" />
      </div>
      <div class="card">
        <DataTable :lazy="true" :value="data" dataKey="id" :loading="loading" responsiveLayout="scroll">
          <template #empty>{{ $t("common.noData") }}</template>
          <template #loading>{{ $t("common.loading") }}</template>
          <Column :header="$t('web.programName')">
            <template #body="{ data }">
              <div>{{ $i18n.locale === "kz" ? data.code + ' ' + data.name_kz : $i18n.locale === "ru" ? data.code + ' ' + data.name_ru :  data.code + ' ' + data.name_en }}</div>
            </template>
          </Column>
      
          <Column :header="$t('web.qazaqGroups')">
            <template #body="{data}">
              {{ data.passing_score.kz_group_score }}
            </template>
          </Column>
          <Column :header="$t('web.russianGroups')">
            <template #body="{data}">
              {{ data.passing_score.ru_group_score }}
            </template>
          </Column>
          <Column :header="'Жыл'">
            <template #body="{data}">
              {{ data.passing_score.year }}
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
  
    <EduScoreAdd v-if="showModal" :selected-data="selectedData" :is-show="showModal" :block="block" />
  </template>
  
  <script>

  import TitleBlock from "@/components/TitleBlock.vue";
  import {useToast} from "primevue/usetoast";
  import {useI18n} from "vue-i18n";
  import {useConfirm} from "primevue/useconfirm";
  import {inject, onMounted, ref} from "vue";
  import {useRoute, useRouter} from "vue-router";
  import {EduScoreService} from "@/service/edu.score.service";
  import EduScoreAdd from "@/components/enuwebsite/blocks/edu.score/EduScoreAdd.vue";
  import {EnuWebService} from "@/service/enu.web.service";
  
  export default {
    name: "EduScoreList",
    components: {TitleBlock, EduScoreAdd},
    setup() {
      const eduScoreService = new EduScoreService()
      const enuService = new EnuWebService()
      const toast = useToast()
      const i18n = useI18n()
      const confirm = useConfirm()
      const loading = ref(false)
      const showModal = ref(false)
      const data = ref()
      const block = ref()
      const router = useRouter()
      const route = useRoute()
      const selectedData = ref()
      const emitter = inject('emitter');
      const categoryId = ref(route.params.id)
  
      const getScores = () => {
        loading.value = true;
        eduScoreService.getEduScoresByCategoryId(parseInt(categoryId.value)).then(res => {
          if (res.data) data.value = res.data
          loading.value = false;
        }).catch(error => {
          loading.value = false;
          toast.add({severity: "error", summary: error, life: 3000});
        });
      }
      getScores();
  
      const getBlock = () => {
        loading.value = true;
        enuService.getBlockById(72).then(res => {
          if (res.data) block.value = res.data;
          loading.value = false;
        }).catch(error => {
          loading.value = false;
          toast.add({severity: "error", summary: error, life: 3000});
        });
      }
      getBlock();
  
      const openDialog = () => {
        selectedData.value = null;
        showModal.value = true;
      }
  
      const openEdit = (data) => {
        selectedData.value = data;
        showModal.value = true;
      }
      
      const deleteConfirm = (data) => {
        confirm.require({
          message: i18n.t('common.doYouWantDelete'),
          header: i18n.t('common.delete'),
          icon: 'pi pi-info-circle',
          acceptClass: 'p-button-rounded p-button-success',
          rejectClass: 'p-button-rounded p-button-danger',
          accept: () => {
            remove(data.passing_score.id)
          },
        });
      }
      
      const remove = (id) => {
        
        eduScoreService.deleteScore(id).then(res => {
          if (res.data && res.data.is_success) {
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          } else {
            toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
          }
          getScores();
        }).catch(error => {
          toast.add({severity: "error", summary: error, life: 3000});
        });
      }
  
      onMounted(() => {
        emitter.on("showEduScoreAddDialog", isShow => {
          showModal.value = isShow;
          getScores();
        });
      })
  
      return {
        data, loading, showModal, block, selectedData,
        openDialog, openEdit, deleteConfirm
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>
  
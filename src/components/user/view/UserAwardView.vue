<template>
  
  <div v-if="isView.check">  
  
    <div class="col-12">
      <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
    </div>
     
      <DataTable selectionMode="single" 
      v-model="award" :lazy="true" :value="awards" 
      :loading="loading" v-model:selection="award"
      :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange"> 

        <Column field="award_type" :header="$t('science.typeOfAward')">
          <template #body="slotProps">
            {{ t(slotProps.data.award_type['name_'+locale]) }}  
          </template>
        </Column>

        <Column field="award_name" :header="$t('science.reward')">
          <template #body="slotProps">
            {{ t(slotProps.data['award_name_'+locale]) }}  
          </template>
        </Column>

        <Column field="start_time" :header="$t('hr.id.startDate')">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.start_time) }}
            </template>
        </Column>

        <Column  :header="t('documentScan')">
            <template #body="slotProps">
            <Button v-if="slotProps.data.upload_path !== null && slotProps.data.upload_path !== ''" icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.upload_path)"></Button>
            </template>
        </Column>
        
        <!-- Действия-->
        <Column v-if="!readonly" :header="t('dissertation.dissReportActions')">
            <template #body="slotProps">
                <Button icon="fa-solid fa-pencil fa-xl" class="p-button-text p-button-warning p-1 mr-2" @click="award=slotProps.data;update()"></Button>
                <Button v-if="!slotProps.data.platonus_award_id" icon="fa-solid fa-trash-can fa-xl" class="p-button-text p-button-danger p-1 mr-2" @click="award=slotProps.data;deleteValue()"></Button>
            </template>
        </Column>
      
      </DataTable>
    </div>



  <Sidebar v-model:visible="isView.award"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
      <UserAwardEdit :modelValue=award :userID="userID" :readonly="readonly"/>
  </Sidebar>
  
  <Dialog v-model:visible="fileView" :style="{ width: '650px' }" :modal="true">
    <div style="padding: 0 100px">
      <img :src="fileData" style="width: 100%; height: 100%"/>
    </div>

    <template #footer>
      <Button
          v-bind:label="t('common.close')"
          icon="pi pi-times"
          class="p-button p-component p-button-primary"
          @click="fileView = false" />
    </template>
  </Dialog>

</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {ScienceService} from "@/service/science.service";
  import {  findRole } from "@/config/config";
  import ResearchInterestsEdit from "../edit/ResearchInterestsEdit"
  import UserAwardEdit from "../edit/UserAwardEdit"
  const emitter = inject("emitter");
  const {t, locale} = useI18n()
  const toast = useToast()
  const loading = ref(false)
  const scienceService = new ScienceService()

  const props = defineProps({
    userID: {
      type: Number,
      default: null,
    },
    modelValue: {
      type: null,
      default: null
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    customType: {
      type: String,
      default: ''
    }
  });

  const isView = ref({
    check: false,
    award: false,
  })
  const lazyParams = ref({
    page: 0,  
    rows: 10, 
  });
  const totalRecords = ref(0)
  const awards = ref([])
  const award = ref(null)

  const fileData = ref(null)
  const fileView = ref(false)

  const deleteValue=() => {
    const req = {
        id: award.value.id || null,
        userID: props.userID || null,
    }
    loading.value = true

    scienceService.deleteAwards(req).then(_ => {
        loading.value = false
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        getScienceAward()
    }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
    })
  }
  const menu= ref([
        {
          label: t("common.add"),
          icon: "pi pi-fw pi-plus",
          disabled: () => props.readonly,
          command: () => {
            create()
          },
        },
    ])

  const update = () => {
    if (award.value != null) {
      isView.value.award = true
    }
  }
  const onPageChange = (event) => {
    lazyParams.value.page = event.page;
    getScienceAward();
  };


  const getScienceAward= () => {
    const req = {
      userID: props.userID,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
    }

    loading.value = true
    scienceService.getScienceAward(req).then(res => {
        awards.value = res.data.award
        totalRecords.value = res.data.total
        loading.value = false
        isView.value.check = true
    }).catch(err => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value=false
        isView.value.check = true
    })
  }

  const create=() => {
      award.value = {}
      award.value.userID = props.userID
      isView.value.award = true
  }

  const showFile = (data) => {
      if (!data) {
        return
      }
      fileData.value = data
      fileView.value = true
  }

  const formatDate = (dateString) => {
      if (!dateString) {
          return '';
      }

      const dateObject = new Date(dateString);
      return dateObject.toLocaleDateString(); 
  }

  onMounted(() => {
      getScienceAward()

    emitter.on('award', (data) => {
          if (data === true) {
              isView.value.award = false
              getScienceAward()
          }
    });
  })
</script>
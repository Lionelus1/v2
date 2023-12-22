<template>
    <div div v-if="isView.check" id="carddiv" class="grid">  
        
      <div>
        <Button v-if="!readonly" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="create"></Button>
      </div>

      <BlockUI :blocked="loading" :fullScreen="true">
          <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
      </BlockUI>

      <span   style="white-space: pre-line">
            <DataTable class="justify-content-between" tableStyle="min-width: 50rem" selectionMode="single" v-model="researchInterest" :lazy="true" :value="researchInterests" :loading="loading" v-model:selection="researchInterest"
            :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange"> 

              <Column :header="$t('science.areaScientificInterests')">
                <template #body="slotProps">
                  <p><b>{{ t(slotProps.data['name_'+locale]) }}</b></p>
                </template>
              </Column>
              
              <!-- Действия-->
              <Column v-if="!readonly" header="Действия">
                  <template #body="slotProps">
                      <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="researchInterest=slotProps.data;update()"></Button>
                      <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="researchInterest=slotProps.data;deleteValue()"></Button>
                  </template>
              </Column>
            
            </DataTable>
      </span>

    </div>

  <Sidebar v-model:visible="isView.researchInterest"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
      <ResearchInterestsEdit :modelValue=researchInterest :userID="userID" :readonly="readonly"/>
  </Sidebar>

</template>

<script setup>
  import {computed, onMounted, ref, defineProps, inject} from "vue";
  import {useI18n} from "vue-i18n";
  import {useToast} from "primevue/usetoast";
  import {ScienceService} from "@/service/science.service";
  import {  findRole } from "@/config/config";
  import ResearchInterestsEdit from "../edit/ResearchInterestsEdit"

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
    researchInterest: false,
    
  })
  const lazyParams = ref({
    page: 0,  
    rows: 10, 
  });
  const totalRecords = ref(0)
  const researchInterests = ref([])
  const researchInterest = ref(null)
  const deleteValue =()=> {
    const req = {
        id: researchInterest.value.id,
        userID: props.userID || null,
    }
    loading.value = true
    scienceService.deleteScienceInterests(req).then(_ => {
        loading.value = false
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        getScienceInterests()
    }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
    })
  }

  const update = () => {
    if (researchInterest.value != null) {
      isView.value.researchInterest = true
    }
  }

  const getScienceInterests = () => {
    const req = {
      userID: props.userID,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
    }

    loading.value = true;
    scienceService.getScienceInterests(req).then(res => {
      researchInterests.value = res.data.interests
      totalRecords.value = res.data.total
      loading.value = false
      isView.value.check = true
    }).catch(error => {
      toast.add({severity: 'error', summary: t('common.error'), life: 3000})
      loading.value = false;
      isView.value.check = true
    })
  }

  const onPageChange = (event) => {
    lazyParams.value.page = event.page;
    getScienceInterests();
  };

  const create=() => {
      researchInterest.value = {}
      researchInterest.value.userID = props.userID
      isView.value.researchInterest = true
  }

  onMounted(() => {
    getScienceInterests()

    emitter.on('researchInterest', (data) => {
          if (data === true) {
              isView.value.researchInterest = false
              getScienceInterests()
          }
      });
  })
</script>
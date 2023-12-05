<template>
  <div v-if="isView.check" class="card def-border"> 
    <div id="carddiv" class="grid">  
      
      <div>
        <Button v-if="!readonly" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="create"></Button>
      </div>

      <span   style="white-space: pre-line">
        <DataTable class="flex justify-content-between" tableStyle="min-width: 50rem" selectionMode="single" v-model="award" :lazy="true" :value="awards" :loading="loading" v-model:selection="award"> 

          <Column field="award_type" :header="$t('science.typeOfAward')">
          </Column>

          <Column field="award_name" :header="$t('science.reward')">
          </Column>

          <Column field="start_time" :header="$t('hr.id.startDate')">
          </Column>

          <Column  header="Скан документа">
              <template #body="slotProps">
              <Button v-if="slotProps.data.upload_path !== null" icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.upload_path)"></Button>
              </template>
          </Column>
          
          <!-- Действия-->
          <Column v-if="!readonly" header="Действия">
              <template #body="slotProps">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="award=slotProps.data;update()"></Button>
                  <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="award=slotProps.data;deleteValue()"></Button>
              </template>
          </Column>
        
        </DataTable>
      </span>

    </div>
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
        getScienceAward()
    }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
    })
  }

  const update = () => {
    if (award.value != null) {
      isView.value.award = true
    }
  }

  const getScienceAward= () => {
    const req = {
        userID: props.userID
    }

    loading.value = true
    scienceService.getScienceAward(req).then(res => {
        awards.value = res.data.award
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
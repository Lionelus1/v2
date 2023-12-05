<template>
  <div v-if="isView.check" class="card def-border"> 
    <div id="carddiv" class="grid">  
      
      <div>
        <Button v-if="!readonly" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="create"></Button>
      </div>

      <div class="card">
        <div class="grid formgrid">
          <span   style="white-space: pre-line">
            <DataTable class="flex justify-content-between" selectionMode="single" v-model="qualification"
                    :lazy="true" :value="qualifications" :loading="loading" v-model:selection="qualification">
            <Column field="training_form" :header="$t('science.qualification.trainingForm')"></Column>
            <Column field="country" :header="$t('science.qualification.country')"></Column>
            <Column field="city" :header="$t('science.qualification.city')"></Column>
            <Column field="hours" :header="$t('science.qualification.durationAndScope')"></Column>
            <Column  field="start_date" :header="$t('science.qualification.start')"></Column>
            <Column field="end_date" :header="$t('science.qualification.end')"></Column>
            <Column field="funding_source" :header="$t('science.qualification.fundingSource')"></Column>
            <Column field="proof_document_type" :header="$t('science.qualification.typeSupportingDoc')"></Column>

            <Column  header="Скан документа">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.file_path !== null" icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.upload_path)"></Button>
                    </template>
                </Column>

            <Column v-if="!readonly" header="Действия">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="qualification=slotProps.data;update()"></Button>
                    <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="qualification=slotProps.data;deleteValue()"></Button>
                </template>
            </Column>
            </DataTable>
          </span>
        </div>
      </div>

    </div>
  </div>


  <Sidebar v-model:visible="isView.qualification"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
      <UserQualificationsEdit :modelValue=qualification :userID="userID" :readonly="readonly"/>
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
  import UserQualificationsEdit from "../edit/UserQualificationsEdit.vue"

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
    qualification: false,
  })

  const qualifications = ref([])
  const qualification = ref(null)

  const fileData = ref(null)
  const fileView = ref(false)

  const deleteValue=() => {
      const data = {
          id: Number(qualification.value.id),
          userID: Number(props.userID)
      }

      scienceService.deleteQualificationsScience(data).then(res  => {
        getQualificationsScience()
      }).catch(err => {
          toast.add({
          severity: "error",
          summary: t('message.actionError'),
          life: 3000,
          })
      })
  }

  const update = () => {
    if (qualification.value != null) {
      isView.value.qualification = true
    }
  }

  const getQualificationsScience = () => {
      const req = {
          userID: props.userID
      }
      loading.value = true
      scienceService.getQualificationsScience(req).then(res => {
          qualifications.value = res.data.qualifications
          loading.value = false
          isView.value.check = true
      }).catch(err => {
          toast.add({severity: 'error', summary: t('common.error'), life: 3000})
          loading.value=false
          isView.value.check = true
      })
  }

  const create=() => {
      qualification.value = {}
      qualification.value.userID = props.userID
      isView.value.qualification = true
  }

  const showFile = (data) => {
      if (!data) {
        return
      }
      fileData.value = data
      fileView.value = true
  }

  onMounted(() => {
      getQualificationsScience()

    emitter.on('qualifications', (data) => {
          if (data === true) {
              isView.value.qualification = false
              getQualificationsScience()
          }
      });
  })
  
</script>
<template>
  <div v-if="isView.check">  
    <div class="col-12">
        <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
      
    <BlockUI :blocked="loading" :fullScreen="true">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    </BlockUI>
    <div>
      <div>
        <span>
          <DataTable class="justify-content-between" selectionMode="single" v-model="qualification"
                  :lazy="true" :value="qualifications" :loading="loading" v-model:selection="qualification"
                  :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange">
          <Column field="training_form" :header="$t('science.qualification.trainingForm')">
            <template #body="slotProps">
                {{ t(slotProps.data.training_form['name_'+locale]) }}
            </template>
          </Column>
          <Column field="country" :header="$t('science.qualification.country')"></Column>
          <Column field="city" :header="$t('science.qualification.city')"></Column>
          <Column field="hours" :header="$t('science.qualification.durationAndScope')"></Column>
          
          <Column field="start_date" :header="$t('science.qualification.start')">
              <template #body="slotProps">
                  {{ formatDate(slotProps.data.start_date) }}
              </template>
          </Column>

          <Column field="end_date" :header="$t('science.qualification.end')">
              <template #body="slotProps">
                  {{ formatDate(slotProps.data.end_date) }}
              </template>
          </Column>

          <Column field="funding_source" :header="$t('science.qualification.fundingSource')">
              <template #body="slotProps">
              {{ t(slotProps.data.funding_source['name_'+locale]) }}  
            </template>
          </Column>
          <Column field="proof_document_type" :header="$t('science.qualification.typeSupportingDoc')">
            <template #body="slotProps">
              {{ t(slotProps.data.proof_document_type['name_'+locale]) }}  
            </template>
          </Column>

          <Column  :header="t('documentScan')">
                  <template #body="slotProps">
                      <Button v-if="slotProps.data.upload_path !== null && slotProps.data.upload_path != ''" icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.upload_path)"></Button>
                  </template>
              </Column>

          <Column v-if="!readonly" :header="t('dissertation.dissReportActions')">
              <template #body="slotProps">
                  <Button icon="fa-solid fa-pencil fa-xl" class="p-button-text p-button-warning p-1 mr-2" @click="qualification=slotProps.data;update()"></Button>
                  <Button v-if="!slotProps.data.platonus_qualification_id" icon="fa-solid fa-trash-can fa-xl" class="p-button-text p-button-danger p-1 mr-2" @click="qualification=slotProps.data;deleteValue()"></Button>
              </template>
          </Column>
          </DataTable>
        </span>
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
  import {useConfirm} from "primevue/useconfirm";

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


  const isView = ref({
    check: false,
    qualification: false,
  })
  const lazyParams = ref({
    page: 0,  
    rows: 10, 
  });
  const totalRecords = ref(0)
  const qualifications = ref([])
  const qualification = ref(null)

  const fileData = ref(null)
  const fileView = ref(false)
  const confirm = useConfirm()

  const deleteValue=() => {

    confirm.require({
      message: t('common.doYouWantDelete'),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button p-button-success',
      rejectClass: 'p-button p-button-danger',
      accept: () => {
        const data = {
          id: Number(qualification.value.id),
          userID: Number(props.userID)
        }

        scienceService.deleteQualificationsScience(data).then(res  => {
          toast.add({severity: "success", summary: t('common.success'), life: 3000});
          getQualificationsScience()
        }).catch(err => {
          toast.add({
            severity: "error",
            summary: t('message.actionError'),
            life: 3000,
          })
        })
      },
    });
  }

  const update = () => {
    if (qualification.value != null) {
      isView.value.qualification = true
    }
  }

  const getQualificationsScience = () => {
      const req = {
          userID: props.userID,
          page: lazyParams.value.page,
          rows: lazyParams.value.rows,
      }
      loading.value = true
      scienceService.getQualificationsScience(req).then(res => {
          qualifications.value = res.data.qualifications
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
      qualification.value = {}
      qualification.value.userID = props.userID
      isView.value.qualification = true
  }

  const onPageChange = (event) => {
    lazyParams.value.page = event.page;
    getQualificationsScience();
  };
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
      getQualificationsScience()

    emitter.on('qualifications', (data) => {
          if (data === true) {
              isView.value.qualification = false
              getQualificationsScience()
          }
      });
  })
  
</script>
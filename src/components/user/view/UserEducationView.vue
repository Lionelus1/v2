<template>

  <div id="carddiv" class="grid">

    <div class="col-12">
        <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>

    <BlockUI :blocked="loading" :fullScreen="true">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    </BlockUI>

    <div class="card">
      <div class="grid formgrid">
          <DataTable class="justify-content-between"  selectionMode="single" v-model="academicDegree" :lazy="true" :value="academicDegrees" :loading="loading" v-model:selection="academicDegree"
          :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange"> 
            <!-- Учебное заведение -->
            <Column  field="institution_name" :header="$t('hr.edu.institution')"></Column>

            <!-- Факультет -->
            <!-- <Column field="faculty" :header="$t('common.faculty')"></Column> -->

            <!-- Адрес учебного заведения -->
            <Column field="location" :header="$t('hr.edu.institutionAddress')"></Column>

            <!-- Специальность -->
            <Column field="speciality" :header="$t('common.speciality')"></Column>
            
            <!-- Номер диплома -->
            <Column  field="diplom_number" :header="$t('common.diplomNumber')"></Column>

            <!-- Год поступления -->
            <Column field="start_date" :header="$t('common.startDate')">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.start_date) }}
                </template>
            </Column>

            
            <!-- Год окончания -->
            <Column field="final_date" :header="$t('common.endDate')">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.final_date) }}
                </template>
            </Column>

            <!-- Скан копия -->
            <Column  header="Скан копия">
              <template #body="slotProps">
                <Button v-if="slotProps.data.file_path !== null" icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.file_path)"></Button>
              </template>
            </Column>

            <!-- Действия-->
            <Column v-if="!readonly" :header="t('dissertation.dissReportActions')">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="academicDegree=slotProps.data;updateEducation()"></Button>
                    <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="academicDegree=slotProps.data;deleteEducation()"></Button>
                </template>
            </Column>

          </DataTable> 
      </div>
    </div>
  </div>


  <Sidebar v-model:visible="isView.academicDegree"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
      <UserEducationEdit :modelValue=academicDegree :readonly="readonly"/>
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

  <ConfirmDialog v-model:visible="confirmDelete" :baseZIndex="1000" @confirm="deleteEducationConfirm" @reject="confirmDelete = false">
  </ConfirmDialog>


</template>

<script setup>

  import { useI18n } from "vue-i18n";
  import { useToast } from "primevue/usetoast";
  import { inject, ref, onMounted } from "vue";
  import {findRole} from "@/config/config";
  import {UserService} from "@/service/user.service"
  import { format } from 'date-fns';
  import  UserEducationEdit from "../edit/UserEducationEdit"

  const { t } = useI18n()
  const toast = useToast()
  const user = ref({})
  const emitter = inject("emitter");
  const userService = new UserService
  const confirmDelete = ref(false);
  const loading = ref(false);

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

  const academicDegrees = ref([])
  const academicDegree = ref(null)
  const userID = ref(props.userID)
  const fileData = ref(null)
  const fileView = ref(false)
  const lazyParams = ref({
    page: 0,  
    rows: 10, 
  });
  const totalRecords = ref(0)
  const isView = ref({
    academicDegree: false
  })

  const getUserAcademicDegree = () => {
    loading.value = true
    const req = {
      userID: userID.value,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
    }
  
    userService.getUserAcademicDegree(req).then(response=>{

      academicDegrees.value = response.data.academic_degree
      totalRecords.value = response.data.total
      
      loading.value = false
    }).catch(error => {
      loading.value = false
      toast.add({
        severity: "error",
        summary: t('message.actionError'),
        life: 3000,
      })
    })

    confirmDelete.value = false;
  }

  const deleteEducationConfirm = () => {
      const data = {
        id: Number(academicDegree.value.id),
        userId: Number(academicDegree.value.userID)
      }

      userService.deleteEducation(data).then(res  => {
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        getUserAcademicDegree()
      }).catch(err => {
          toast.add({
          severity: "error",
          summary: t('message.actionError'),
          life: 3000,
          })
      })
  }

  const onPageChange = (event) => {
    lazyParams.value.page = event.page;
    getUserAcademicDegree();
  };

  const deleteEducation = () => {
      confirmDelete.value = true;

  }

  const createEducation=() => {
      academicDegree.value = {}
      academicDegree.value.userID = props.userID
      isView.value.academicDegree = true
  }

  const updateEducation = () => {
    if (academicDegree.value != null) {
      isView.value.academicDegree = true
    }
  }


  const menu= ref([
        {
          label: t("common.add"),
          icon: "pi pi-fw pi-plus",
          disabled: () => props.readonly,
          command: () => {
            createEducation()
          },
        },
    ])

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
      getUserAcademicDegree()

      emitter.on('academicDegree', (data) => {
          if (data === true) {
              isView.value.academicDegree = false
              getUserAcademicDegree()
          }
      });
  })
  
</script>
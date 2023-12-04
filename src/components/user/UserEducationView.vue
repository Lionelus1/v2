<template>
     <div id="carddiv" class="grid">
      <div>
      <Button v-if="!readonly" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="createEducation"></Button>
      </div>
        <div class="card">
            <div class="grid formgrid">
                <span  style="white-space: pre-line">
                  <DataTable class="flex justify-content-between" tableStyle="min-width: 50rem" selectionMode="single" v-model="academicDegree" :lazy="true" :value="academicDegrees" :loading="loading" v-model:selection="academicDegree"> 
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
                        <Column field="start_date" :header="$t('hr.edu.receiptDate')"></Column>
                        
                        <!-- Год окончания -->
                        <Column field="final_date" :header="$t('hr.edu.expirationDate')"></Column>

                        <!-- Скан копия -->
                        <Column  header="Скан копия">
                          <template #body="slotProps">
                            <Button icon="pi pi-download" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="showFile(slotProps.data.file_path)"></Button>
                          </template>
                        </Column>

                        <!-- Действия-->
                        <Column v-if="!readonly" header="Действия">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="academicDegree=slotProps.data;updateEducation()"></Button>
                                <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="academicDegree=slotProps.data;deleteEducation()"></Button>
                            </template>
                        </Column>

                    </DataTable>
                </span>     
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

</template>

<script setup>

    import { useI18n } from "vue-i18n";
    import { useToast } from "primevue/usetoast";
    import { inject, ref, onMounted } from "vue";
    import {findRole} from "@/config/config";
    import {UserService} from "@/service/user.service"
    import { format } from 'date-fns';
    import  UserEducationEdit from "./UserEducationEdit"

    const { t } = useI18n()
    const toast = useToast()
    const user = ref({})
    const emitter = inject("emitter");
    const userService = new UserService

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

    const isView = ref({
      academicDegree: false
    })

    const getUserAcademicDegree = () => {
      const req = {userID: userID.value}
    
      userService.getUserAcademicDegree(req).then(response=>{

        academicDegrees.value = response.data.academic_degree

      }).catch(error => {
        toast.add({
          severity: "error",
          summary: t('message.actionError'),
          life: 3000,
        })
      })

    }

    const deleteEducation = () => {
        const data = {
        id: Number(academicDegree.value.id),
        userId: Number(academicDegree.value.userID)
        }

        userService.deleteEducation(data).then(res  => {
          getUserAcademicDegree()
        }).catch(err => {
            toast.add({
            severity: "error",
            summary: t('message.actionError'),
            life: 3000,
            })
        })
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

    const showFile = (data) => {
       if (!data) {
          return
       }
       fileData.value = data
       fileView.value = true
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
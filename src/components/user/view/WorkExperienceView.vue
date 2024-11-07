
<template>
    
    <div v-if="isView.check">  
        <div class="col-12">
            <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
         </div>

        <span >
            <DataTable selectionMode="single" v-model="laborActivity" :lazy="true" :value="laborActivities" :loading="loading" v-model:selection="laborActivity"
            :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange"> 
            
                <Column :field="'organizationName_'+$i18n.locale" :header="$t('common.organizationName')">
                </Column>

                <Column  :field="'position_'+$i18n.locale" :header="$t('contact.position')">
                </Column>

                <Column  :field="'responsibilities_'+$i18n.locale" :header="$t('hr.we.responsibilities')">
                </Column>

                <Column  :header="$t('yearPeriod')">
                    <template #body="slotProps">
                        <div class="secondary">
                            <em>{{ new Date(slotProps.data.startDate).toLocaleDateString() }} -
                            {{ !slotProps.data.isStillWorking ? new Date(slotProps.data.endDate).toLocaleDateString() : $t('hr.we.untilNow') }}</em>
                        </div>
                    </template>
                </Column>

                <!-- Действия-->
                <Column v-if="!readonly" :header="t('dissertation.dissReportActions')">
                    <template #body="slotProps">
                        <Button icon="fa-solid fa-pencil fa-xl" class="p-button-text p-button-warning p-1 mr-2" @click="laborActivity=slotProps.data;update()"></Button>
                        <Button icon="fa-solid fa-trash-can fa-xl" class="p-button-text p-button-danger p-1 mr-2" @click="laborActivity=slotProps.data;deleteValue()"></Button>
                    </template>
                </Column>

            </DataTable>
        </span>
    
    </div>

    <Sidebar v-model:visible="isView.laborActivity"  position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
        <ExperienceEdit :modelValue=laborActivity :userID="userID" :readonly="readonly" typeCustom="scientists"/>
    </Sidebar>

</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { inject, ref, onMounted } from "vue";
import {findRole} from "@/config/config";
import {ScienceService} from "@/service/science.service";
import ExperienceEdit from "@/components/humanResources/candidate/subedits/ExperienceEdit"
import {useConfirm} from "primevue/useconfirm";

const { t, locale } = useI18n()
const toast = useToast()

    const laborActivities = ref([])
    const laborActivity = ref()
    const loading = ref(false)
    const scienceService = new ScienceService()
    const emitter = inject("emitter");
    const isView = ref({
        check: false,
        laborActivity: false,  
    })
    const lazyParams = ref({
        page: 0,  
        rows: 10, 
    });
    const totalRecords = ref(0)

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
    const confirm = useConfirm()

    const getLaborActivity=() => {
        const req = {
            userID: props.userID || props.modelValue.userID,
            page: lazyParams.value.page,
            rows: lazyParams.value.rows,
        }

        loading.value = true
        scienceService.getLaborActivity(req).then(res => {
            laborActivities.value = res.data.laborActivities
            totalRecords.value = res.data.total
            loading.value = false
            isView.value.check = true
        }).catch(_ => {
        loading.value=false
        isView.value.check = true
        })
    }

    const update = () => {
        if (laborActivity.value != null) {
            isView.value.laborActivity = true
        }
    }

    const onPageChange = (event) => {
        lazyParams.value.page = event.page;
        getLaborActivity();
    };


    const deleteValue =()=> {

      confirm.require({
        message: t('common.doYouWantDelete'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          const req = {
            id: laborActivity.value.id,
            userID: props.userID || null,
          }

          loading.value = true
          scienceService.deleteLaborActivity(req).then(_ => {
            loading.value = false
            toast.add({severity: "success", summary: t('common.success'), life: 3000});
            getLaborActivity()
          }).catch(_ => {
            loading.value = false;
          })
        },
      });
    }

    const create=() => {
        laborActivity.value = {}
        laborActivity.value.user = {}
        laborActivity.value.user.userID = props.userID
        isView.value.laborActivity = true
    }

    onMounted(() => {
        getLaborActivity()

        emitter.on('experienceScientists', (data) => {
            if (data === true) {
                isView.value.laborActivity = false
                getLaborActivity()
            }
        });
    })

</script>
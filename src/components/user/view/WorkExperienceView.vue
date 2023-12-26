<template>
    
    <div v-if="isView.check" id="carddiv" class="grid">  
    
        <div>
            <Button v-if="!readonly" icon="pi pi-plus" class="p-button-link" :label="t('common.add')" :onclick="create"></Button>
        </div>

        <span   style="white-space: pre-line">
            <DataTable class="justify-content-between" tableStyle="min-width: 50rem" selectionMode="single" v-model="laborActivity" :lazy="true" :value="laborActivities" :loading="loading" v-model:selection="laborActivity"
            :paginator="true" :rows="10" :totalRecords="totalRecords" @page="onPageChange"> 
            
                <Column field="organizationName" :header="$t('common.organizationName')">
                </Column>

                <Column  field="position" :header="$t('contact.position')">
                </Column>

                <Column  field="responsibilities" :header="$t('hr.we.responsibilities')">
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
                <Column v-if="!readonly" header="Действия">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-outlined mb-2 mr-2" @click="laborActivity=slotProps.data;update()"></Button>
                        <Button icon="fa-solid fa-trash" class="p-button-danger mb-2 mr-2" @click="laborActivity=slotProps.data;deleteValue()"></Button>
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

    const { t } = useI18n()
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
        }).catch(err => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
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
        const req = {
            id: laborActivity.value.id,
            userID: props.userID || null,
        }

        loading.value = true
        scienceService.deleteLaborActivity(req).then(_ => {
            loading.value = false
            toast.add({severity: "success", summary: t('common.success'), life: 3000});
            getLaborActivity()
        }).catch(error => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
            loading.value = false;
        })
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
<template>
    <div class="col-12">
      <TitleBlock :title="$t('workPlan.analyzer.analysisResult')" :show-back-button="true"/>
      <ProgressBar v-if="loading" class="mb-3" mode="indeterminate" style="height: .5em"/>
      <TabView>
        <TabPanel :header="$t('workPlan.analyzer.strategicDirectionTab')">
          <DataTable :value="computedStrategicAnalysisData"
                    tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;">
            <Column field="eventSummaryDepartment" :header="$t('workPlan.analyzer.strategicDirectionTab')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;max-width: 400px;">
              <template #body="{data}">
                {{ data?.direction?.event_name }}
              </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.totalLevelNumber')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.done')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalCompletedItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.notDone')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalNotCompletedItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.executionLevel')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ Number(data.executionLevel).toFixed(2) }}%
                    </template>
            </Column>
            

          </DataTable>
          <br/>
          <br/>
        </TabPanel>
        <TabPanel :header="$t('workPlan.analyzer.structuralDivisionTab')">
          <div class="card">
            <Toolbar>
              <template #start>
                <div class="flex-start">
                  <Dropdown
                      class="flex-item mr-2"
                      v-model="selectedDepartment"
                      :options="departments"
                      optionLabel="department_name"
                      optionValue="department_id"
                      :filter="true"
                      :show-clear="true"
                      :placeholder="`${$t('hikvision.department')} ${$t('common.select').toLowerCase()}`"
                  />
                </div>

              </template>
              <template #end>
                <Button :label="$t('workPlan.analyzer.filterTitle')" class="mr-2" @click="getEventsTree()"></Button>
                <!-- <Button icon="pi pi-trash"  severity="secondary" @click="getEventsTree(null)"/> -->
              </template>

            </Toolbar>
          </div>
          <DataTable :value="computedAnalysisData"
                    tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;">
            <Column sortable field="eventSummaryDepartment" :header="$t('workPlan.summary')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
              <template #body="{data}">
                {{ data?.department?.name }}
              </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.totalLevelNumber')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.done')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalCompletedItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.notDone')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ data.totalNotCompletedItems }}
                    </template>
            </Column>
            <Column field="eventUnit" :header="$t('workPlan.analyzer.executionLevel')"
                    headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
                    <template #body="{ data }">
                      {{ Number(data.executionLevel).toFixed(2) }}%
                    </template>
            </Column>

          </DataTable>
          <br/>
          <br/>
        </TabPanel>
      </TabView>
   
    </div>

</template>

<script setup>
import {ref, computed, onMounted, watch, reactive} from 'vue';
import {useI18n} from "vue-i18n";
import {useStore} from 'vuex';
import {useToast} from 'primevue/usetoast';
import {useRoute} from "vue-router";
import {WorkPlanService} from "@/service/work.plan.service";
import {FilterMatchMode} from 'primevue/api';

const workPlanService = new WorkPlanService();
const {t} = useI18n();
const store = useStore();
const toast = useToast();
const route = useRoute();

const workPlanID = route.params.id;
const quarter = ref(null);

const data = ref([]);
const tableAnalysisData = ref([
  {
    department:{
      id:null,
      name:null,
      name_kz:null,
      name_ru:null,
      name_en:null
    },
    result_status:{
      completed:[],
      notcompleted:[],
      partially_completed:[]
    }
  }
])
const strategicDirectionData = ref([
  {
    direction:{
      id:null,
      event_name:null
    },
    result_status:{
      completed:[],
      notcompleted:[],
      partially_completed:[]
    }
  }
])
const departments = ref([]);

const total = ref(0);
const loading = ref(false);
const isCreator = ref(false);

const lazyParams = reactive({
  page: 0,
  rows: 10,
  work_plan_id: null,
  quarter: null,
  parent_id: null,
  department_id:null,
  filters:null,
  is_oper_plan_analysis:false
});

const filters = ref({
  name: {value: null, matchMode: FilterMatchMode.CONTAINS},
  status: {value: null, matchMode: FilterMatchMode.EQUALS},
  author: {value: null, matchMode: FilterMatchMode.EQUALS},
  department_id: null,
});


const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isAdmin = computed(() => findRole(authUser.value, "administrator"))
// authUser?.value?.mainPosition?.department?.id
const selectedDepartment = ref(null);

onMounted(() => {
  getEventsTree()
  getDepartments()
})

const getEventDescendants = async (parentId) =>{
  loading.value = true;
  lazyParams.work_plan_id = Number(workPlanID);
  lazyParams.parent_id = parentId
  const resp = await workPlanService.getEventsTree(lazyParams);
  if(resp){
    return resp.data
  }else{
    return null
  }
}

async function getEventsTree(parent) {
  try {
    loading.value = true;
    lazyParams.work_plan_id = Number(workPlanID);
    lazyParams.quarter = quarter.value;
    lazyParams.parent_id = parent == null ? null : parent.id; //8558
    lazyParams.department_id = selectedDepartment.value || null;

    const filter = JSON.parse(JSON.stringify(filters.value));
    lazyParams.filters = filter;
    if (selectedDepartment.value !== null) {
      if (!lazyParams.filters.department_id) {
        lazyParams.filters.department_id = selectedDepartment.value;
      }
    }
    if (selectedDepartment.value == null) {
      if (!lazyParams.is_oper_plan_analysis) {
        lazyParams.is_oper_plan_analysis = true;
      }
    }

    const res = await workPlanService.getEventsTree(lazyParams);

    if (parent == null) {
      data.value = res.data.items;
      total.value = res.data.total;

      if (data.value) {
        for (const e of data.value) {
          if (!e.leaf) {
            strategicDirectionData.value = []
            // strategicDirectionData
            const descendants = await getEventDescendants(e.work_plan_event_id);

            let newstrategicDirectionData = {
              direction: {
                id: e.work_plan_event_id,
                event_name: e.event_name
              },
              result_status: {
                completed: [],
                notcompleted: [],
                partially_completed: [],
              },
            };
            if (descendants && descendants.items) {
              descendants.items.forEach((item) => {
                console.log("item", item);
                if(item.status.work_plan_event_status_id === 2){
                  newstrategicDirectionData.result_status.completed.push(item.status.work_plan_event_status_id)
                }
                if(item.status.work_plan_event_status_id === 3){
                  newstrategicDirectionData.result_status.notcompleted.push(item.status.work_plan_event_status_id)
                }
                if(item.status.work_plan_event_status_id === 4){
                  newstrategicDirectionData.result_status.partially_completed.push(item.status.work_plan_event_status_id)
                }
              });
            }
            console.log("new event : ", newstrategicDirectionData);
            console.log("event name: ", descendants);
            strategicDirectionData.value.push(newstrategicDirectionData);
            console.log("strategic direction data:", strategicDirectionData.value);
            

          }

          if (e.creator_id === authUser.value.loginedUserId && e.parent_id == null) {
            isCreator.value = true;
          }
          if (e.result && e.result.length > 100) {
            e.result_short = `${e.result.substring(0, 100)}...`;
          }
        }
      }
    } else {
      parent.children = res.data.items;

      if (parent.children) {
        parent.children.forEach((e) => {
          if (e.creator_id === authUser.value.loginedUserId) {
            isCreator.value = true;
          }
          if (e.result && e.result.length > 100) {
            e.result_short = `${e.result.substring(0, 100)}...`;
          }
        });
      }
      total.value = 0;
    }
    loading.value = false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      store.dispatch("logOut");
    } else {
      toast.add({
        severity: "error",
        summary: String(error),
        life: 3000,
      });
    }
    loading.value = false;
  }
}

const getDepartments = async () => {
  departments.value = [];
  try {
    const res = await workPlanService.getDepartments(Number(workPlanID));
    if (res.data) {
      departments.value = res.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      store.dispatch("logOut");
    } else {
      toast.add({
        severity: "error",
        summary: error.message || error,
        life: 3000,
      });
    }
  }
};


watch(data, (newValue) => {
  tableAnalysisData.value = [];
  if (data.value !== null && data.value.length >0){
    data.value.forEach((event) => {
    console.log("event", event.status.work_plan_event_status_id);

    event.user.forEach((item) => {
      if (item.is_summary_department) {
          let departmentId = item.user.mainPosition.department.id;
          let existingDepartment = tableAnalysisData.value.find(
            (entry) => entry.department.id === departmentId
          );

          let statusCategory = null;
          if (event.status.work_plan_event_status_id === 2) {
            statusCategory = "completed";
          } else if (event.status.work_plan_event_status_id === 3) {
            statusCategory = "notcompleted";
          } else if (event.status.work_plan_event_status_id === 4) {
            statusCategory = "partially_completed";
          }

          if (statusCategory) {
            if (existingDepartment) {
              existingDepartment.result_status[statusCategory].push(
                event.status.work_plan_event_status_id
              );
            } else {
              let newDepartment = {
                department: {
                  id: departmentId,
                  name: item.user.mainPosition.department.name,
                  name_kz: item.user.mainPosition.department.nameKz,
                  name_ru: item.user.mainPosition.department.nameRu,
                  name_en: item.user.mainPosition.department.nameEn,
                },
                result_status: {
                  completed: [],
                  notcompleted: [],
                  partially_completed: [],
                },
              };
              newDepartment.result_status[statusCategory].push(
                event.status.work_plan_event_status_id
              );
              tableAnalysisData.value.push(newDepartment);
            }
          }
        }
      });
    });
  } 
  console.log("table analysis data: ", tableAnalysisData.value);
});

const computedStrategicAnalysisData = computed(() =>
  strategicDirectionData.value.map((entry) => {
    const totalStatuses =
      entry.result_status.completed.length +
      entry.result_status.notcompleted.length +
      entry.result_status.partially_completed.length;
    const totalCompletedStatuses = entry.result_status.completed.length;
    const totalNotCompletedStatuses = entry.result_status.notcompleted.length;

    return {
      ...entry,
      totalItems:totalStatuses,
      totalCompletedItems:totalCompletedStatuses,
      totalNotCompletedItems:totalNotCompletedStatuses,
      executionLevel: totalStatuses
        ? (entry.result_status.completed.length / totalStatuses)*100
        : 0,
    };
  })
);

const computedAnalysisData = computed(() =>
  tableAnalysisData.value.map((entry) => {
    const totalStatuses =
      entry.result_status.completed.length +
      entry.result_status.notcompleted.length +
      entry.result_status.partially_completed.length;
    const totalCompletedStatuses = entry.result_status.completed.length;
    const totalNotCompletedStatuses = entry.result_status.notcompleted.length;

    return {
      ...entry,
      totalItems:totalStatuses,
      totalCompletedItems:totalCompletedStatuses,
      totalNotCompletedItems:totalNotCompletedStatuses,
      executionLevel: totalStatuses
        ? (entry.result_status.completed.length / totalStatuses)*100
        : 0,
    };
  })
);

</script>


<style scoped>
.flex-start {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.flex-item {
  flex: 1 1 100%;
  max-width: 300px;
}

@media (min-width: 768px) {
  .flex-start {
    flex-wrap: nowrap;
  }

  .flex-item {
    flex: 1 1 auto;
  }
}
</style>
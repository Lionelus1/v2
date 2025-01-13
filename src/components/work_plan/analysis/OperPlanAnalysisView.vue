<template>
  <div class="col-12">
    <TitleBlock :title="$t('workPlan.analyzer.analysisResult')" :show-back-button="true"/>
    <ProgressBar v-if="loading" class="mb-3" mode="indeterminate" style="height: .5em"/>
    <TabView @tab-change="onTabChange">
      <TabPanel :header="$t('workPlan.analyzer.strategicDirectionTab')">
        <DataTable :value="computedStrategicAnalysisData"
                   tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;">
          <template #empty> {{ $t('common.noData') }}</template>
          <Column field="eventSummaryDepartment" :header="$t('workPlan.analyzer.strategicDirectionTab')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;max-width: 400px;">
            <template #body="{data}">
              {{ data?.direction?.event_name }}
            </template>
          </Column>
          <Column field="eventUnit" :header="$t('workPlan.analyzer.totalLevelNumber')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalItems }}
            </template>
          </Column>
          <Column field="eventUnit" :header="$t('workPlan.analyzer.done')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalCompletedItems }}
            </template>
          </Column>
          <Column field="eventUnit" :header="$t('workPlan.analyzer.notDone')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalNotCompletedItems }}
            </template>
          </Column>
          <Column field="eventUnit" :header="$t('workPlan.analyzer.executionLevel')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ Number(data.executionLevel).toFixed(2) }}%
            </template>
          </Column>
        </DataTable>
        <br/>
        <br/>
        <div class="card" v-if="strategicDirectionData?.length > 0">
          <Chart type="line" :data="chartData" :options="chartOptions" class="h-30rem" />
        </div>
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
                <!-- <Dropdown v-model="selectedQuarter" :options="quarters" :optionLabel="('quarter_'+$i18n.locale)" :placeholder="$t('workPlan.analyzer.selectQuarter')" class="w-full" optionValue="value"/> -->
              </div>

            </template>
            <template #end>
              <Button :label="$t('workPlan.analyzer.filterTitle')" class="mr-2"  @click="getDepartmentById(selectedDepartment)"></Button>
              <Button icon="pi pi-trash"  severity="secondary" @click="clearFilter()"/>
            </template>

          </Toolbar>
        </div>
        <DataTable :value="isFiltered ? computedSingleDepartmentAnalysisData : computedAnalysisData" removableSort
                   tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;">
          <template #empty> {{ $t('common.noData') }}</template>
          <Column sortable field="eventSummaryDepartment" :header="$t('workPlan.summary')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{data}">
              {{ data?.department?.name }}
            </template>
          </Column>
          <Column field="totalLevelNumber" :header="$t('workPlan.analyzer.totalLevelNumber')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalItems }}
            </template>
          </Column>
          <Column field="done" :header="$t('workPlan.analyzer.done')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalCompletedItems }}
            </template>
          </Column>
          <Column field="notDone" :header="$t('workPlan.analyzer.notDone')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ data.totalNotCompletedItems }}
            </template>
          </Column>
          <Column sortable field="execution" :header="$t('workPlan.analyzer.executionLevel')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ Number(data.executionLevel).toFixed(2) }}%
            </template>
          </Column>

        </DataTable>
        <br/>
        <br/>
        <div class="card" v-if="isGeneralStructuralDivisionChart && tableAnalysisData?.length > 0 && selectedQuarter === null">
          <Chart type="bar" :data="chartDataDepartment" :options="chartOptionsDepartment" class="h-30rem"  />
        </div>
        <div class="card flex justify-content-center" v-if="isFiltered">
          <Chart type="doughnut" :data="chartDataFilteredDepartment" :options="chartOptionsFilteredDepartment" class="w-full md:w-30rem" />
        </div>
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
    department: {
      id: null,
      name: null,
      name_kz: null,
      name_ru: null,
      name_en: null
    },
    result_status: {
      completed: [],
      notcompleted: [],
      partially_completed: [],
      created: []
    }
  }
])
const analysisDataOfSingeDepartment = ref([
  {
    department: {
      id: null,
      name: null,
      name_kz: null,
      name_ru: null,
      name_en: null
    },
    result_status: {
      completed: [],
      notcompleted: [],
      partially_completed: [],
      created: []
    }
  }
])
const strategicDirectionData = ref([
  {
    direction: {
      id: null,
      event_name: null
    },
    result_status: {
      completed: [],
      notcompleted: [],
      partially_completed: [],
      created: []
    }
  }
])
const departments = ref([]);
const resultData = ref(null)
const total = ref(0);
const loading = ref(false);
const isCreator = ref(false);
const isGeneralStructuralDivisionChart = ref(true)
const isFilteredStructuralDivisionChart = ref(false)
const isFiltered = ref(false)

const lazyParams = reactive({
  page: 0,
  rows: 10,
  work_plan_id: null,
  quarter: null,
  parent_id: null,
  department_id: null,
  filters: null,
  is_oper_plan_analysis: false
});

const filters = ref({
  name: {value: null, matchMode: FilterMatchMode.CONTAINS},
  status: {value: null, matchMode: FilterMatchMode.EQUALS},
  author: {value: null, matchMode: FilterMatchMode.EQUALS},
  department_id: null,
});

const quarters = ref( [
  { quarter_kz: 'I тоқсан', quarter_ru: 'I квартал', quarter_en: 'I quarter', value: 1 },
  { quarter_kz: 'II тоқсан', quarter_ru: 'II квартал', quarter_en: 'II quarter', value: 2 },
  { quarter_kz: 'III тоқсан', quarter_ru: 'III квартал', quarter_en: 'III quarter', value: 3 },
  { quarter_kz: 'IV тоқсан', quarter_ru: 'IV квартал', quarter_en: 'IV quarter', value: 4 },
  { quarter_kz: 'Жыл бойы', quarter_ru: 'Весь год', quarter_en: 'For a Year', value: 5 }
])

const selectedQuarter = ref(null)

const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isAdmin = computed(() => findRole(authUser.value, "administrator"))
const selectedDepartment = ref(null);

onMounted(async () => {
  await getEventsTree();

  chartData.value = setChartData();
  chartOptions.value = setChartOptions();

  chartDataDepartment.value = setChartDataDepartments();
  chartOptionsDepartment.value = setChartOptions();

})

const chartData = ref();
const chartOptions = ref();

const chartDataDepartment = ref();
const chartOptionsDepartment = ref();

const chartDataFilteredDepartment = ref();
const chartOptionsFilteredDepartment = ref(null);

const chartDataDepartmentQuarter = ref();
const chartOptionsDepartmentQuarter = ref();

const setChartDataFilteredDepartment = () => {
    const documentStyle = getComputedStyle(document.body);
    if (!computedSingleDepartmentAnalysisData.value.length) {
        return {
            labels: [],
            datasets: []
        };
    }

    const labels = computedSingleDepartmentAnalysisData.value.map(
        (entry) => entry.department.name || 'No Name'
    );
    const chartData = []
    const chartLabels = []

    const completed = computedSingleDepartmentAnalysisData.value.map(
        (entry) => Number(entry.executionLevel.toFixed(2))
    );
    chartData.push(completed)
    chartLabels.push('Орындалған жұмыстар: '+completed+'%')
    const notCompleted = computedSingleDepartmentAnalysisData.value.map(
        (entry) => 100 - Number(entry.executionLevel.toFixed(2))
    );

    chartData.push(notCompleted)
    chartLabels.push('Орындалмаған жұмыстар: '+notCompleted+'%')
    return {
        labels: chartLabels,
        datasets: [
            {
                data: chartData,
                backgroundColor: ['#0275d8', '#C7C7C7', documentStyle.getPropertyValue('--gray-500')],
                hoverBackgroundColor: ['#4394E5', '#E0E0E0', documentStyle.getPropertyValue('--gray-400')]
            }
        ]
    };
};

const setChartOptionsFilteredDepartment = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};

const setChartDataDepartments = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    if (!computedAnalysisData.value.length) {
        return {
            labels: [],
            datasets: []
        };
    }

    const labels = computedAnalysisData.value.map(
        (entry) => entry.department.name || 'No Name'
    );

    const data = computedAnalysisData.value.map(
        (entry) => Number(entry.executionLevel.toFixed(2))
    );


    return {
        labels: labels,
        datasets: [
            {
                label: t('workPlan.analyzer.structuralDivisionExecutionLevel'),
                backgroundColor: '#0275d8',
                borderColor: documentStyle.getPropertyValue('--cyan-500'),
                data: data
            }
        ]
    };
};

const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    if (!computedStrategicAnalysisData.value.length) {
        return {
            labels: [],
            datasets: []
        };
    }

    const labels = computedStrategicAnalysisData.value.map(
        (entry) => entry.direction.event_name || 'No Name'
    );

    const data = computedStrategicAnalysisData.value.map(
        (entry) => Number(entry.executionLevel.toFixed(2))
    );


    return {
        labels: labels,
        datasets: [
            {
                label: t('workPlan.analyzer.strategicDirectionExecutionLevel'),
                data: data,
                fill: false,
                borderColor: '#0275d8',
                tension: 0.1
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
const clearFilter = () =>{
  selectedDepartment.value = null;
  selectedQuarter.value = null;
  isGeneralStructuralDivisionChart.value = true;
  isFilteredStructuralDivisionChart.value = false;
  isFiltered.value = false;
  getEventsTree();
}

const onTabChange = (event) => {
  if (event.index === 0) {
    //clearFilter()
  }
}

const getEventDescendants = async (parentId) => {
  loading.value = true;
  lazyParams.work_plan_id = Number(workPlanID);
  lazyParams.parent_id = parentId
  const resp = await workPlanService.getEventsTree(lazyParams);
  if (resp) {
    return resp.data
  } else {
    return null
  }
}

const getDepartmentById = async (departmentID) => {
  loading.value = true;
  try {
    if (departmentID !== null && typeof departmentID !== "undefined") {
      const department = tableAnalysisData.value.find(
        (entry) => entry.department.id === departmentID
      );

      if (department) {
        isFiltered.value = true;
        isGeneralStructuralDivisionChart.value = false;
        isFilteredStructuralDivisionChart.value = true;
        analysisDataOfSingeDepartment.value = [department];
        chartDataFilteredDepartment.value = setChartDataFilteredDepartment();
        chartOptionsFilteredDepartment.value = setChartOptionsFilteredDepartment();

      } else {
        toast.add({
        severity: 'warn',
        summary: t('workPlan.analyzer.departmentNotFound'),
        life: 3000,
      });
      loading.value = false;
      }
    } else {
      toast.add({
        severity: 'warn',
        summary: t('workPlan.analyzer.departmentNotFound'),
        life: 3000,
      });
      loading.value = false;
    }
  } catch (error) {
    toast.add({
        severity: 'warn',
        summary: t('workPlan.analyzer.departmentNotFound'),
        life: 3000,
      });
      loading.value = false;
  } finally {
    loading.value = false;
  }
}

async function getEventsTree(parent, isClickEvent) {
  try {
    loading.value = true;
    if(isClickEvent){
      const hasSelectedDepartment = selectedDepartment.value !== null;
      isGeneralStructuralDivisionChart.value = !hasSelectedDepartment;
      isFilteredStructuralDivisionChart.value = hasSelectedDepartment;
    }
    lazyParams.work_plan_id = Number(workPlanID);
    lazyParams.quarter = selectedQuarter.value;
    lazyParams.parent_id = parent == null ? null : parent.id;
    
    if (selectedDepartment.value !== null) {
        const filter = JSON.parse(JSON.stringify(filters.value));
        filter.department_id = selectedDepartment.value;
        lazyParams.filters = filter;
      
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
        strategicDirectionData.value = []
        for (const e of data.value) {
          if (e.parent_id === null) {
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
                created:[]
              },
            };
            if (descendants && descendants.items) {
              descendants.items.forEach((item) => {
                if (item.status.work_plan_event_status_id === 2) {
                  newstrategicDirectionData.result_status.completed.push(item.status.work_plan_event_status_id)
                }
                if (item.status.work_plan_event_status_id === 3) {
                  newstrategicDirectionData.result_status.notcompleted.push(item.status.work_plan_event_status_id)
                }
                if (item.status.work_plan_event_status_id === 4) {
                  newstrategicDirectionData.result_status.partially_completed.push(item.status.work_plan_event_status_id)
                }
                if (item.status.work_plan_event_status_id === 1) {
                  newstrategicDirectionData.result_status.created.push(item.status.work_plan_event_status_id)
                }
              });
            }
            strategicDirectionData.value.push(newstrategicDirectionData);
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

watch(data, (newValue) => {
  departments.value = [];
  tableAnalysisData.value = [];
  if (data.value !== null && data.value.length > 0) {
    data.value.forEach((event) => {
      const processEvents = async () => {
      const descendants = await getEventDescendants(event.work_plan_event_id);
      if (descendants?.items && Array.isArray(descendants.items)) {
        descendants?.items?.forEach((items) => {
          items?.user?.forEach((item) => {
            if (item.is_summary_department) {
            let departmentId = item?.user?.mainPosition?.department?.id;
            let existingDepartment = tableAnalysisData.value.find(
                (entry) => entry.department.id === departmentId
            );

            let statusCategory = null;
            if (event?.status?.work_plan_event_status_id === 2) {
              statusCategory = "completed";
            } else if (event?.status.work_plan_event_status_id === 3) {
              statusCategory = "notcompleted";
            } else if (event?.status.work_plan_event_status_id === 4) {
              statusCategory = "partially_completed";
            } else if (event?.status.work_plan_event_status_id === 1) {
              statusCategory = "created";
            }

            if (statusCategory) {
              if (existingDepartment) {
                existingDepartment.result_status[statusCategory].push(
                    event?.status.work_plan_event_status_id
                );
              } else {
                let newDepartment = {
                  department: {
                    id: departmentId,
                    name: item?.user?.mainPosition?.department?.name,
                    name_kz: item?.user?.mainPosition?.department?.nameKz,
                    name_ru: item?.user?.mainPosition?.department?.nameRu,
                    name_en: item?.user?.mainPosition?.department?.nameEn,
                  },
                  result_status: {
                    completed: [],
                    notcompleted: [],
                    partially_completed: [],
                    created:[]
                  },
                };
                let departmentFilter = {
                  department_id: departmentId,
                  department_name: item?.user?.mainPosition?.department?.name
                }
                newDepartment.result_status[statusCategory].push(
                    event.status.work_plan_event_status_id
                );
                if (newDepartment.department.id || newDepartment.department.name) {
                    tableAnalysisData.value.push(newDepartment);
                    departments.value.push(departmentFilter)
                }
                
              }
            }
          }
          })

        });
      }
      };
      processEvents();

    });
    chartDataFilteredDepartment.value = setChartDataFilteredDepartment();
    chartOptionsFilteredDepartment.value = setChartOptionsFilteredDepartment();

    chartDataDepartmentQuarter.value = setChartOptions();
    chartOptionsDepartmentQuarter.value = setChartOptions();
  }
 
});

const computedStrategicAnalysisData = computed(() =>
    strategicDirectionData.value.map((entry) => {
      const totalStatuses =
          entry.result_status.completed.length +
          entry.result_status.notcompleted.length +
          entry.result_status.partially_completed.length +
          entry.result_status.created.length;
      const totalCompletedStatuses = entry.result_status.completed.length;
      const totalNotCompletedStatuses = entry.result_status.notcompleted.length;

      return {
        ...entry,
        totalItems: totalStatuses,
        totalCompletedItems: totalCompletedStatuses,
        totalNotCompletedItems: totalNotCompletedStatuses,
        executionLevel: totalStatuses
            ? (entry.result_status.completed.length / totalStatuses) * 100
            : 0,
      };
    })
);

const computedAnalysisData = computed(() =>
    tableAnalysisData.value.map((entry) => {
      const totalStatuses =
          entry.result_status.completed.length +
          entry.result_status.notcompleted.length +
          entry.result_status.partially_completed.length +
          entry.result_status.created.length;
      const totalCompletedStatuses = entry.result_status.completed.length;
      const totalNotCompletedStatuses = entry.result_status.notcompleted.length;

      return {
        ...entry,
        totalItems: totalStatuses,
        totalCompletedItems: totalCompletedStatuses,
        totalNotCompletedItems: totalNotCompletedStatuses,
        executionLevel: totalStatuses
            ? (entry.result_status.completed.length / totalStatuses) * 100
            : 0,
      };
    })
);

const computedSingleDepartmentAnalysisData = computed(() =>
    analysisDataOfSingeDepartment.value.map((entry) => {
      const totalStatuses =
          entry.result_status.completed.length +
          entry.result_status.notcompleted.length +
          entry.result_status.partially_completed.length +
          entry.result_status.created.length;
      const totalCompletedStatuses = entry.result_status.completed.length;
      const totalNotCompletedStatuses = entry.result_status.notcompleted.length;

      return {
        ...entry,
        totalItems: totalStatuses,
        totalCompletedItems: totalCompletedStatuses,
        totalNotCompletedItems: totalNotCompletedStatuses,
        executionLevel: totalStatuses
            ? (entry.result_status.completed.length / totalStatuses) * 100
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
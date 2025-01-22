<template>
  <div class="col-12">
    <TitleBlock :title="$t('workPlan.analyzer.analysisResult')" :show-back-button="true"/>
    <ProgressBar v-if="loading" class="mb-3" mode="indeterminate" style="height: .5em"/>
    <TabView>
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
                  sortable style="border:1px solid #ddd;">
            <template #body="{ data }">
              {{ Number(data.executionLevel).toFixed(2) }}%
            </template>
          </Column>
        </DataTable>
        <br/>
        <br/>
        <div class="card" v-if="strategicDirectionData?.length > 0">
          <Chart ref="chartRef" type="line" :data="chartData" :options="chartOptions" class="h-30rem" />
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
              <Button icon="pi pi-file-pdf" class="ml-2" :disabled="!isPdfDownloadButtonActive" severity="success" @click="downloadOperPlanAnalysisFile()"/>
            </template>

          </Toolbar>
        </div>
        <DataTable :value="isFiltered ? computedSingleDepartmentAnalysisData : computedAnalysisData"
                   tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;" @sort="onSort">
          <template #empty> {{ $t('common.noData') }}</template>
          <Column sortable field="eventSummaryDepartment" :header="$t('workPlan.summary')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;">
            <template #body="{data}">
              <span v-if="$i18n.locale === 'kz' && data?.department?.name_kz">{{ data.department.name_kz }}</span>
              <span v-else-if="$i18n.locale === 'ru' && data?.department?.name_ru">{{ data.department.name_ru }}</span>
              <span v-else-if="$i18n.locale === 'en' && data?.department?.name_en">{{ data.department.name_en }}</span>
              <span v-else-if="data?.department?.name">{{ data.department.name }}</span>
              <span v-else>{{"-"}}</span>
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
          <Column field="executionLevel" :header="$t('workPlan.analyzer.executionLevel')"
                  headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;"
                  style="border:1px solid #ddd;" sortable>
            <template #body="{ data }">
              {{ Number(data.executionLevel).toFixed(2) }}%
            </template>
          </Column>

        </DataTable>
        <br/>
        <br/>
        <div class="card" v-if="isGeneralStructuralDivisionChart && tableAnalysisData?.length > 0 && selectedQuarter === null">
          <Chart ref="chartDepartmentRef" type="bar" :data="chartDataDepartment" :options="chartOptionsDepartment" class="h-30rem"  />
        </div>
        <div class="card flex justify-content-center" v-if="isFiltered">
          <Chart ref="chartSingleDepartmentRef" type="doughnut" :data="chartDataFilteredDepartment" :options="chartOptionsFilteredDepartment" class="w-full md:w-30rem" />
        </div>
      </TabPanel>
    </TabView>

  </div>

</template>

<script setup>
import {ref, computed, onMounted, watch, reactive, nextTick} from 'vue';
import {useI18n} from "vue-i18n";
import {useStore} from 'vuex';
import {useToast} from 'primevue/usetoast';
import {useRoute} from "vue-router";
import {WorkPlanService} from "@/service/work.plan.service";
import {FilterMatchMode} from 'primevue/api';
import { Chart as ChartJS, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as jsPDF from "jspdf";
import {segoe} from '@/assets/layout/fonts/SegoeUI-Light-normal'

ChartJS.register(...registerables, ChartDataLabels);

const workPlanService = new WorkPlanService();
const {t, locale} = useI18n();
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
const total = ref(0);
const loading = ref(false);
const isCreator = ref(false);
const isGeneralStructuralDivisionChart = ref(true)
const isFilteredStructuralDivisionChart = ref(false)
const isFiltered = ref(false)
const isPdfDownloadButtonActive = ref(false)

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
    const achievedLabels = {
      kz: 'Орындалған көрсеткіштер',
      en: 'Achieved indicators',
      ru: 'Выполненные показатели',
      default: '',
    };
    const achievedLabel = achievedLabels[locale.value] || achievedLabels.default;
    chartLabels.push(`${achievedLabel}: ${completed}%`);
    const notCompleted = computedSingleDepartmentAnalysisData.value.map(
        (entry) => 100 - Number(entry.executionLevel.toFixed(2))
    );

    chartData.push(notCompleted)
    const unachievedLabels = {
      kz: 'Орындалмаған көрсеткіштер',
      en: 'Unachieved indicators',
      ru: 'Невыполненные показатели',
      default: '',
    };
    const unachievedLabel = unachievedLabels[locale.value] || unachievedLabels.default;
    chartLabels.push(`${unachievedLabel}: ${notCompleted}%`);

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
            },
            datalabels: {
                color: textColor,
                anchor: 'end',
                align: 'top',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value) => `${value}%`
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
            },
            datalabels: {
                color: textColor,
                anchor: 'end',
                align: 'top',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value) => `${value}%`
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

// const onTabChange = (event) => {
//   if (event.index === 0) {
//     //clearFilter()
//   }
// }

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
      isPdfDownloadButtonActive.value = true
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
                  if(item && !item.is_deleted){
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
    isPdfDownloadButtonActive.value = true
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
            if (item && item.is_summary_department && !item.is_deleted) {
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

const sortField = ref('executionLevel');
const isAscending = ref(true);

const computedAnalysisData = computed(() => {
  const sortedData = [...tableAnalysisData.value].map((entry) => {
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
  });

  return sortedData.sort((a, b) => {
    if (sortField.value === 'eventSummaryDepartment') {
      const deptA = a.department[`name_${locale.value}`] || '';
      const deptB = b.department[`name_${locale.value}`] || '';
      return isAscending.value
        ? deptA.localeCompare(deptB)
        : deptB.localeCompare(deptA);
    } else {
      return isAscending.value
        ? a[sortField.value] - b[sortField.value]
        : b[sortField.value] - a[sortField.value];
    }
  });
});

const onSort = (field) => {
  if (field.sortField  === sortField.value) {
    isAscending.value = !isAscending.value;
  }else if (field.sortField  === "eventSummaryDepartment") {
    sortField.value = "eventSummaryDepartment"
  } else {
    sortField.value = field;
    isAscending.value = true;
  }
};

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

//PDF Generator
const chartRef = ref(null);
const chartDepartmentRef = ref(null);
const chartSingleDepartmentRef = ref(null);

const getLocalizedTitle = (titles, defvalue) => {
  return titles[locale.value] || defvalue;
};

const getReportTitle = () =>
  getLocalizedTitle(
    {
      kz: "Стратегиялық бағыттар бойынша операциялық жоспардың орындалу нәтижелері",
      ru: "Результаты выполнения операционного плана по стратегическим направлениям",
      en: "Results of the operational plan implementation by strategic directions",
    },
    "Стратегиялық бағыттар бойынша операциялық жоспардың орындалу нәтижелері"
  );

const getReportDepartmentTitle = () =>
  getLocalizedTitle(
    {
      kz: "Департаменттер мен басқа құрылымдық бөлімшелердің операциялық жоспарды орындау нәтижелері",
      ru: "Результаты выполнения операционного плана департаментами и другими структурными подразделениями",
      en: "Results of the operational plan implementation by departments and other structural units",
    },
    "Департаменттер мен басқа құрылымдық бөлімшелердің операциялық жоспарды орындау нәтижелері"
  );

const downloadOperPlanAnalysisFile = () => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
  chartDataDepartment.value = setChartDataDepartments();
  chartOptionsDepartment.value = setChartOptions();
  try {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    pdf.addFileToVFS("SegoeUI-Light.ttf", segoe);
    pdf.addFont("SegoeUI-Light.ttf", "Segoe UI Light", "normal");
    pdf.setFont("Segoe UI Light");
   
    let reportTitle = "";

    switch (locale.value) {
      case 'kz':
        reportTitle = "Стратегиялық бағыттар бойынша операциялық жоспардың орындалу нәтижелері";
        break;
      case 'ru':
        reportTitle = "Результаты выполнения операционного плана по стратегическим направлениям";
        break;
      case 'en':
        reportTitle = "Results of the operational plan implementation by strategic directions";
        break;
      default:
        reportTitle = "Стратегиялық бағыттар бойынша операциялық жоспардың орындалу нәтижелері";
    }

    pdf.setFontSize(18);
    pdf.text(getReportTitle(), 40, 10);
    pdf.setFontSize(12);
    const headers = [
      { title: t("workPlan.analyzer.strategicDirectionTab"), width: 75 },
      { title: t('workPlan.analyzer.totalLevelNumber'), width: 60 },
      { title: t('workPlan.analyzer.done'), width: 30 },
      { title: t('workPlan.analyzer.notDone'), width: 35 },
      { title: t('workPlan.analyzer.executionLevel'), width: 55 },
    ];
    const tableData = strategicDirectionData.value.map((item) => {
    const formattedStrategicDirectionName = item.direction.event_name
    .split(" ")
    .reduce((acc, word, index) => {
      if (index % 2 === 0 && index > 0) acc.push("\n");
      acc.push(word);
      return acc;
    }, [])
    .join(" ");
    const strategicDirectionName =  formattedStrategicDirectionName || "-";
    const totalLabel =
      item.result_status.created.length +
      item.result_status.completed.length +
      item.result_status.notcompleted.length;
    const completedLabel = item.result_status.completed.length;
    const notCompletedLabel = item.result_status.notcompleted.length;
    let completedPercentage = "0.00";
    if (totalLabel > 0) {
      const diff = (completedLabel * 100) / totalLabel;
      if (!Number.isNaN(diff)) {
        completedPercentage = diff.toFixed(2);
      }
    }
    return [
        strategicDirectionName,
        totalLabel.toString(),
        completedLabel.toString(),
        notCompletedLabel.toString(),
        `${completedPercentage}%`,
      ];
    });

    const startX = 20;
    const startY = 20;
    const rowHeight = 10;

    addTableToPdf(pdf, headers, tableData, startX, startY, rowHeight);

    const strategicImage = convertStrategicDirectionChartToImage();
    const departmentImage = convertDepartmentChartToImage();

    if (strategicImage) {
      pdf.addPage("a4", "landscape");
      addImageToPdf(pdf, strategicImage, 10, 10, 270, 130);
    }
    pdf.addPage("a4", "p");
    pdf.setFontSize(14);
    const formattedReportDepartmentTitle = getReportDepartmentTitle()
    .split(" ")
    .reduce((acc, word, index) => {
      if ((locale.value === "kz" || locale.value === "ru") && index % 5 === 0 && index > 0) acc.push("\n");
      if (locale.value === "en" && index % 7 === 0 && index > 0) acc.push("\n");
      acc.push(word);
      return acc;
    }, [])
    .join(" ");
    pdf.text(formattedReportDepartmentTitle, 50, 15)
    pdf.setFontSize(12);

    const departmentNameColumn = t('workPlan.summary')
    .split(" ")
    .reduce((acc, word, index) => {
      if (index % 2 === 0 && index > 0) acc.push("\n");
      acc.push(word);
      return acc;
    }, [])
    .join(" ");

    const departmentIndicator = t('workPlan.analyzer.totalLevelNumber')
    .split(" ")
    .reduce((acc, word, index) => {
      if ((locale.value === "kz" || locale.value === "ru") && index % 1 === 0 && index > 0) acc.push("\n");
      if (locale.value === "en" && index % 2 === 0 && index > 0) acc.push("\n");
      acc.push(word);
      return acc;
    }, [])
    .join(" ");

    const departmentExecutionLevel = t('workPlan.analyzer.executionLevel')
    .split(" ")
    .reduce((acc, word, index) => {
      if ((locale.value === "kz" || locale.value === "ru") && index % 1 === 0 && index > 0) acc.push("\n");
      if (locale.value === "en" && index % 2 === 0 && index > 0) acc.push("\n");
      acc.push(word);
      return acc;
    }, [])
    .join(" ");

    const departmentHeaders = [
      { title: departmentNameColumn, width: 62 },
      { title: departmentIndicator, width: 30 },
      { title: t('workPlan.analyzer.done'), width: 28 },
      { title: t('workPlan.analyzer.notDone'), width: 33 },
      { title: departmentExecutionLevel, width: 33 },
    ];
    const tableDataDepartment = tableAnalysisData.value.map((item) => {
      const localeMap = {
        kz: 'name_kz',
        ru: 'name_ru',
        en: 'name_en'
      };

      const departmentNameByLocale = item.department[localeMap[locale.value]] || item.department.name;
      const formattedDepartmentName = departmentNameByLocale
      .split(" ")
      .reduce((acc, word, index) => {
        if (index % 2 === 0 && index > 0) acc.push("\n");
        acc.push(word);
        return acc;
      }, [])
      .join(" ");
      const departmentName =  formattedDepartmentName || "-";
      const totalLabel =
        item.result_status.created.length +
        item.result_status.completed.length +
        item.result_status.notcompleted.length;
      const completedLabel = item.result_status.completed.length;
      const notCompletedLabel = item.result_status.notcompleted.length;
      let completedPercentage = "0.00";
      if (totalLabel > 0) {
        const diff = (completedLabel * 100) / totalLabel;
        if (!Number.isNaN(diff)) {
          completedPercentage = diff.toFixed(2);
        }
      }

      return [
          departmentName,
          totalLabel.toString(),
          completedLabel.toString(),
          notCompletedLabel.toString(),
          `${completedPercentage}%`,
        ];
    });

    const startDX = 10;
    const startDY = 30;
    const rowDHeight = 10;

    addTableToPdf(pdf, departmentHeaders, tableDataDepartment, startDX, startDY, rowDHeight);


    if (departmentImage) {
      pdf.addPage("a4", "landscape");
      addImageToPdf(pdf, departmentImage, 10, 20, 270, 120);
    }
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const fileName = `operational-plan-analysis-${year}-${month}-${day}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    toast.add({
        severity: 'warn',
        summary: t('workPlan.analyzer.departmentNotFound'),
        life: 3000,
      });
  }
};

const addTableToPdf = (pdf, headers, data, startX, startY, baseRowHeight) => {
  const totalWidth = headers.reduce((sum, header) => sum + header.width, 0);
  let currentX = startX;
  let currentY = startY;
  const pageHeight = 297;
  const marginBottom = 0;
  const rowSpacing = 0;
  const isOverflowing = (yPosition, heightRequired) => yPosition + heightRequired > pageHeight - marginBottom;
  let skippedRows = [];
  const drawHeaders = () => {
    currentX = startX;
    pdf.setFont("Segoe UI Light");
    pdf.setFontSize(12);
    headers.forEach((header) => {
      pdf.rect(currentX, currentY-5, header.width, baseRowHeight);
      const lines = pdf.splitTextToSize(header.title, header.width - 4); 
      const textHeight = lines.length * pdf.getTextDimensions(lines[0]).h;
      
      lines.forEach((line, index) => {
        pdf.text(line, currentX + 2, currentY + index * pdf.getTextDimensions(line).h);
      });

      currentX += header.width;
    });
  };

  drawHeaders();

  currentY += baseRowHeight-5;
  data.forEach((row, rowIndex) => {
    currentX = startX;
    let maxRowHeight = baseRowHeight;

    const cellHeights = row.map((cell, colIndex) => {
      const columnWidth = headers[colIndex].width;
      const lines = pdf.splitTextToSize(cell.toString(), columnWidth - 4);
      return lines.length * 5 + 4;
    });
    maxRowHeight = Math.max(...cellHeights);
    if (isOverflowing(currentY, maxRowHeight)) {
      skippedRows.push(row);

      pdf.addPage("a4", "p");
      currentY = 20;
      drawHeaders();
      currentY += baseRowHeight - 5;
    }

    if (skippedRows.includes(row)) {
      return;
    }
    row.forEach((cell, colIndex) => {
      const columnWidth = headers[colIndex].width;
      const lines = pdf.splitTextToSize(cell.toString(), columnWidth - 4);

      pdf.rect(currentX, currentY, columnWidth, maxRowHeight);
      pdf.setFont("Segoe UI Light");

      pdf.text(lines, currentX + 2, currentY + 5);

      currentX += columnWidth;
    });
    currentY += maxRowHeight + rowSpacing;
  });
  skippedRows.forEach((row) => {
    currentX = startX;
    let maxRowHeight = baseRowHeight;
    const cellHeights = row.map((cell, colIndex) => {
      const columnWidth = headers[colIndex].width;
      const lines = pdf.splitTextToSize(cell.toString(), columnWidth - 4);
      return lines.length * 5 + 4;
    });

    maxRowHeight = Math.max(...cellHeights);
    row.forEach((cell, colIndex) => {
      const columnWidth = headers[colIndex].width;
      const lines = pdf.splitTextToSize(cell.toString(), columnWidth - 4);
      pdf.rect(currentX, currentY, columnWidth, maxRowHeight);
      pdf.setFont("Segoe UI Light");
      pdf.text(lines, currentX + 2, currentY + 5);
      currentX += columnWidth;
    });
    currentY += maxRowHeight + rowSpacing; 
  });
  pdf.line(startX, currentY, startX + totalWidth, currentY);
};

const convertStrategicDirectionChartToImage = () => {
  const chartCanvas = chartRef.value?.$el.querySelector("canvas");
  if (!chartCanvas) {
    return null; 
  }
  const imgData = chartCanvas.toDataURL("image/png", 3.0);
  if (imgData.startsWith("data:image/png;base64,")) {
    return imgData;
  } else {
    return null; 
  }
};

const convertDepartmentChartToImage = () => {
  const chartCanvas = chartDepartmentRef.value?.$el.querySelector("canvas");
  if (!chartCanvas) {
    return null; 
  }
  const imgData = chartCanvas.toDataURL("image/png", 3.0);
  if (imgData.startsWith("data:image/png;base64,")) {
    return imgData;
  } else {
    return null; 
  }
};

const addImageToPdf = (pdf, imageData, x, y, width, height) => {
  if (imageData !== null && imageData) {
    pdf.addImage(imageData, "PNG", x, y, width, height);
  }
};

//PDF Generator end


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
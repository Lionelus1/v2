<template>
  <div class="col-12">
    <!-- {{ authUser }} -->
      {{selectedDepartment}}
    <TitleBlock :title="$t('workPlan.analyzer.analysisResult')" :show-back-button="true"/>
    <ProgressBar v-if="loading" class="mb-3" mode="indeterminate" style="height: .5em"/>
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
            <Dropdown
                class="flex-item"
                v-model="selectedDepartment"
                :options="departments"
                optionLabel="department_name"
                optionValue="department_id"
                :filter="true"
                :show-clear="true"
                :placeholder="$t('hikvision.department')"
            />
          </div>

        </template>
        <template #end>
          <Button :label="$t('workPlan.analyzer.filterTitle')" class="mr-2" @click="getEventsTree()"></Button>
          <!-- <Button icon="pi pi-trash"  severity="secondary" @click="getEventsTree(null)"/> -->
        </template>

      </Toolbar>
    </div>
    <DataTable :value="data"
               tableStyle="min-width: 50rem; border:1px solid #ddd;border-radius:5px; border-collapse: collapse;">
      <Column sortable field="eventSummaryDepartment" :header="$t('workPlan.summary')"
              headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
        <template #body="{data}">
          <div v-if="data.user && data.user.length > 0">
            <div v-for="item in data.user" :key="item.id">
              <p v-if="item.is_summary_department">
                {{ item?.user?.mainPosition?.department?.name }}

              </p>

            </div>
          </div>
        </template>
      </Column>
      <Column sortable field="eventUnit" :header="$t('workPlan.analyzer.executionLevel')"
              headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
        <template #body="{}">
          {{ "100%" }}
        </template>
      </Column>
      <Column sortable field="eventUnit" :header="$t('workPlan.analyzer.executionStatus')"
              headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
        <template #body="{}">
          {{ "" }}
        </template>
      </Column>
      <Column sortable field="eventUnit" :header="$t('workPlan.analyzer.nonExecutionRisk')"
              headerStyle="background-color: #f4f4f4; color: black; font-weight: bold;" style="border:1px solid #ddd;">
        <template #body="{}">
          <span style="font-size: 60px !important;color: orange;">{{ "•" }}</span>

        </template>
      </Column>
    </DataTable>
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
  filters:null
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



function getEventsTree(parent) {
  loading.value = true;
  lazyParams.work_plan_id = Number(workPlanID);
  lazyParams.quarter = quarter.value;
  lazyParams.parent_id = parent == null ? null : parent.id;
  lazyParams.department_id = selectedDepartment.value || null;

  const filter = JSON.parse(JSON.stringify(filters.value));
  lazyParams.filters = filter;
  if (selectedDepartment.value !== null) {
    if (!lazyParams.filters.department_id) {
      lazyParams.filters.department_id = selectedDepartment.value;
    }
  }

  workPlanService.getEventsTree(lazyParams)
      .then((res) => {
        if (parent == null) {
          data.value = res.data.items;
          total.value = res.data.total;

          if (data.value) {
            data.value.forEach((e) => {
              if (e.creator_id === authUser.value.loginedUserId && e.parent_id == null) {
                isCreator.value = true;
              }
              if (e.result && e.result.length > 100) {
                e.result_short = `${e.result.substring(0, 100)}...`;
              }
            });
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
      })
      .catch((error) => {
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
      });
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
<template>
<div class="col-12">
    <TitleBlock :title="$t('workPlan.analyzer.analysisResult')" :show-back-button="true" />
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
                <Button :label="$t('workPlan.analyzer.filterTitle')" class="mr-2"></Button>
                <Button icon="pi pi-trash"  severity="secondary" @click="getEventsTree(null)"/>
            </template>

        </Toolbar>
    </div>
    
</div>

</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useI18n } from "vue-i18n";
import { useStore } from 'vuex';
import { useToast } from 'primevue/usetoast';
import { useRoute } from "vue-router";
import { WorkPlanService } from "@/service/work.plan.service";

const workPlanService = new WorkPlanService();
const { t } = useI18n();
const store = useStore();
const toast = useToast();
const route = useRoute();

const workPlanID = route.params.id;
const quarter = ref(null);

const data = ref([]);
const total = ref(0);
const loading = ref(false);
const isCreator = ref(false);

const lazyParams = reactive({
  work_plan_id: null,
  quarter: null,
  parent_id: null,
});

const authUser = computed(() => JSON.parse(localStorage.getItem("loginedUser")))
const isAdmin = computed(() => findRole(authUser.value, "administrator"))

function getEventsTree(parent) {
  loading.value = true;
  lazyParams.work_plan_id = Number(workPlanID);
  lazyParams.quarter = quarter.value;
  lazyParams.parent_id = parent == null ? null : parent.id;

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
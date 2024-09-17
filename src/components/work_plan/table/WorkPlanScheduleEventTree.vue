<template>
    <TabView v-model:activeIndex="active" @tab-change="tabChanged">
      <TabPanel :header="$t('common.tasks')">
        <div class="card">
          <TreeTable ref="workplantreetable" class="p-treetable-sm" :value="data" :lazy="true" :loading="loading"
                     @nodeExpand="emits('expand', $event)" scrollHeight="flex"
                     responsiveLayout="scroll" :resizableColumns="true" columnResizeMode="fit" showGridlines
                     :paginator="true" :rows="10" :total-records="total"
                     @page="emits('onPage', $event)">
            <template #empty> {{ $t('common.noData') }}</template>
            <template #loading> {{ $t('common.loading') }}</template>
            <Column field="event_name" :header="$t('workPlan.worksByWeek')" :expander="true"
                    style="min-width:300px;width: 30%;text-align: center;">
              <template #body="{ node }">
                <span style="display: block;text-align: left;">{{ node.event_name }}</span>
              </template>
            </Column>
            <Column field="start_date" :header="$t('common.startDate') + '(' + $t('workPlan.week') + ')'"
                    style="max-width: 150px;text-align: center;">
              <template #body="{ node }">
                {{ formatDateMoment(node.start_date) }}
              </template>
            </Column>
            <Column field="end_date" :header="$t('common.endDate') + '(' + $t('workPlan.week') + ')'"
                    style="max-width: 150px;text-align: center;">
              <template #body="{ node }">
                {{ formatDateMoment(node.end_date) }}
              </template>
            </Column>
            <Column field="plan_number" :header="$t('web.note')"
                    style="max-width:100px;text-align: center;">
              <template #body="{ node }">
                {{ node.comment }}
              </template>
            </Column>
            <Column field="status" :header="$t('common.status')" style="text-align: center;">
              <template #body="{ node }">
              <span :class="'customer-badge status-' + node.status?.work_plan_event_status_id">{{
                  $i18n.locale === "kz" ? node.status.name_kz : $i18n.locale === "ru" ? node.status.name_ru :
                      node.status.name_en
                }}</span>
              </template>
            </Column>
            <Column field="actions" header="" style="text-align: center;">
              <template #body="{ node }">
                <ActionButton :items="menus" :show-label="true" @toggle="emits('onToggle', node)"/>
              </template>
            </Column>
          </TreeTable>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.members')" v-if="isPlanCreator">
        <div class="card" v-if="members">
          <div class="flex justify-end">
            <div style="margin-bottom: 10px; width: 100%;"/>
            <IconField>
              <InputIcon class="pi pi-search"/>
              <InputText v-model="searchQuery" @input="filterData" :placeholder="$t('common.search')"/>
            </IconField>
          </div>
          <TreeTable :value="filteredMembers"
                     scrollHeight="flex"
                     responsiveLayout="scroll"
                     :resizableColumns="true"
                     columnResizeMode="fit"
                     showGridlines
                     :paginator="true"
                     :rows="10"
                     :rowsPerPageOptions="[5, 10, 25]">
            <template #empty> {{ $t('common.noData') }}</template>
            <template #loading> {{ $t('common.loading') }}</template>

            <Column field="fullName" :header="$t('common.fullName')" style="text-align: center; width: 40%;" sortable>
              <template #body="{ node }">
                <div style="text-align: left;">
                  <p>{{ node.user.fullName }}</p>
                </div>
              </template>
            </Column>
            <Column field="id" header="" style="text-align: center;">
              <template #body="{ node }">
                <div style="text-align: left;">
                  <button @click="navigateToJournalReports(node.id)" style="background: none; border: none; cursor: pointer;">
                    <i class="fas fa-eye"></i> <!-- Иконка глаза -->
                  </button>
                </div>
              </template>
            </Column>
          </TreeTable>
        </div>
      </TabPanel>
    </TabView>


</template>

<script setup>
import moment from "moment";
import ActionButton from "@/components/ActionButton.vue";
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const route = useRoute()
const props = defineProps(['data', 'loading', 'total', 'menus', 'isPlanCreator', 'members'])
const emits = defineEmits(['expand', 'onPage', 'onToggle', 'updateActive']);

const searchQuery = ref("")
const filteredMembers = ref(props.members)
const workPlanId = computed(() => parseInt(route.params.id)).value
const loginedUserId = computed(() => JSON.parse(localStorage.getItem("loginedUser")).userID).value
const active = ref(0)

const tabChanged = () => {
  emits('updateActive', active.value)
}

const filterData = () => {
  const query = searchQuery.value.toLowerCase();
  filteredMembers.value = props.members.filter(member => {
    return member.user.fullName.toLowerCase().includes(query);
  });
}

const navigateToJournalReports = studentId => {
  router.push({name: 'WorkPlanJournalReport', params: {id: workPlanId, userId: studentId}});
}

const formatDateMoment = (date) => {
  return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

</script>
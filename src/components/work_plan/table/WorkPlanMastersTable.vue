<template>
  <div class="card">
    <TreeTable ref="workplantreetable" class="p-treetable-sm" :value="data" :lazy="true" :loading="loading" @nodeExpand="emit('onExpand')" scrollHeight="flex"
                 responsiveLayout="scroll" :resizableColumns="true" columnResizeMode="fit" showGridlines :paginator="true" :rows="10" :total-records="total"
                 @page="emit('onPage')">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" :header="$t('workPlan.semester')">
          <template #body="{ node }">
            {{ node.semester }}
          </template>
        </Column>
        <Column field="content" :header="$t('workPlan.content')">
          <template #body="{ node }">
            {{ node.event_name }}
          </template>
        </Column>
      
        <Column field="expecting_results" :header="$t('workPlan.expectingResults')">
          <template #body="{ node }">
            {{ node.result }}
          </template>
        </Column>
        <Column field="start_date" :header="$t('common.startDate')" style="max-width: 100px" >
          <template #body="{ node }">
            {{ formatDateMoment(node.start_date) }}
          </template>
        </Column>
        <Column field="end_date" :header="$t('common.endDate')" style="max-width: 100px">
          <template #body="{ node }">
            {{ formatDateMoment(node.end_date) }}
          </template>
        </Column>
        <Column field="status" :header="$t('common.status')">
          <template #body="{ node }">
            <span :class="'customer-badge status-' + node.status.work_plan_event_status_id">{{
                $i18n.locale === "kz" ? node.status.name_kz : $i18n.locale === "ru" ? node.status.name_ru :
                    node.status.name_en
              }}</span>

          </template>
        </Column>
        <Column field="actions" header="">
          <template #body="{ node }">
            <ActionButton :items="items" :show-label="true" @toggle="emit('onToggle', node)"/>
          </template>
        </Column>
      </TreeTable>
  </div>

</template>

<script setup>
import ActionButton from "@/components/ActionButton.vue";
import moment from "moment";

const props = defineProps(['data', 'items', 'total', 'loading'])
const emit = defineEmits('onToggle', 'onPage', 'onExpand')

function formatDateMoment(date, showHour) {
     if (showHour) return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
     return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

</script>
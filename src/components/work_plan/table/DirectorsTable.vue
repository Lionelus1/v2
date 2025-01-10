<template>
  <div class="card">
    <TreeTable ref="workplantreetable" class="p-treetable-sm" :value="data" :lazy="true" :loading="loading"
               @nodeExpand="emit('onExpand', $event)" scrollHeight="flex" responsiveLayout="scroll" :resizableColumns="true"
               columnResizeMode="fit" showGridlines :paginator="true" :rows="10" :total-records="total"
               @page="emit('onPage')">
      <template #empty>{{ $t('common.noData') }}</template>
      <template #loading>{{ $t('common.loading') }}</template>
      <Column field="content" v-if="planStatus === DocState.APPROVED.Value && checkBoxVisiblity">
        <!-- <template #header>
            <Checkbox v-model="selectAll" :checked="selectAll" @click="toggleSelectAll" @change="onCheckedChange" label="Select All" />
        </template>
        {{ selectAll }} -->
        <template #body="{ node }">
          <Checkbox
              :id="node.work_plan_event_id"
              v-model="SelectedEventParams"
              :value="{ event_id: node.work_plan_event_id, event_name: node.event_name, protocol_agenda: agendaData}"
              :checked="isChecked(node.work_plan_event_id)"
              @change="handleCheckboxChange($event, node)"

          />
        </template>
      </Column>

      <Column field="content" :expander="true" class="max-w-20rem" :header="$t('workPlan.issueTitle')">
        <template #body="{ node }">
          {{ node.event_name }}
        </template>
      </Column>

      <Column field="start_date" :header="$t('workPlan.implementationDate')" style="max-width: 100px">
        <template #body="{ node }">
          <div v-if="node.start_date && $i18n.locale">
            {{ DateTimeHelper.getMonthNames(node.start_date, $i18n.locale) }}
          </div>
        </template>
      </Column>

      <Column field="responsible_executor" :header="$t('workPlan.respExecutor')" style="max-width: 100px">
        <template #body="{ node }">
          <div v-if="node.user && node.user.length > 2">
            <Button type="button" @click="toggleRespPanel($event, node)" class="p-button-text"
                    icon="fa-solid fa-people-group fa-xl" label=""/>
          </div>
          <div v-else>
            <p v-for="item in node.user" :key="item.id">{{ item.user.fullName }}</p>
          </div>
        </template>
      </Column>

      <Column field="status" :header="$t('common.status')">
        <template #body="{ node }">
                    <span :class="'customer-badge status-' + node.status.work_plan_event_status_id">
                        {{
                        $i18n.locale === "kz" ? node.status.name_kz : $i18n.locale === "ru" ? node.status.name_ru :
                            node.status.name_en
                      }}
                    </span>
        </template>
      </Column>

      <Column field="content" :expander="true" class="max-w-9rem" :header="$t('workPlan.protocol.questionStatus')">
        <template #body="{ node }">
          <span v-if="node.fact" :class="'customer-badge status-protocolQuestion'">{{node.fact}}</span>
        </template>
      </Column>

      <Column field="actions" header="">
        <template #body="{ node }">
          <ActionButton :items="items" :show-label="true" @toggle="emit('onToggle', node)"/>
        </template>
      </Column>
    </TreeTable>

    <OverlayPanel ref="op" @hide="closeOverlay">
      <p v-for="item in selectedEvent?.user" :key="item.id">{{ item.user.fullName }}</p>
    </OverlayPanel>
  </div>
  <Dialog :header="$t('workPlan.protocol.createProtocols')" v-model:visible="childProtocolModalVisible"
          :style="{ width: '600px' }"
          :close-on-escape="true" @hide="handleHide">
    <!-- <div class="flex justify-center">
        <ProgressSpinner style="width: 50px; height: 50px" class="progress-spinner" strokeWidth="5" />
    </div> -->
    <div class="p-fluid">
      <!-- <label>{{ $t('common.select') }}</label> -->
      <Dropdown v-model="formData.plan_protocol_type" :options="protocolTypes" :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
            'name_en'" :placeholder="$t('common.select')"/>
    </div>
    <template #footer>
      <div>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="emitHide"/>
        <Button :label="$t('common.createNew')" icon="pi pi-check" class="ml-2 p-button-rounded p-button-success mr-2"
                @click="createProtocol"/>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import {reactive, ref, watch, onMounted} from 'vue';
import ActionButton from "@/components/ActionButton.vue";
import DateTimeHelper from "@/helpers/DateTimeHelper.js"
import DocState from "@/enum/docstates/index";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {WorkPlanService} from "@/service/work.plan.service";
import {DocService} from "@/service/doc.service";

const {t, locale} = useI18n()
const workPlanService = new WorkPlanService();
const docService = new DocService()
const loading = ref(false);
const props = defineProps(['data', 'items', 'total', 'loading', 'planStatus', 'checkBoxVisiblity', 'protocolModalVisible', 'planData']);
const emit = defineEmits(['onToggle', 'onPage', 'onExpand', 'SelectedEventParamsLength', 'hide']);

const selectedEvent = ref(null);
const protocolTypes = ref([])
const op = ref(null);
const toast = useToast()

const SelectedEventParams = ref([]);
const selectAll = ref(true);
const childProtocolModalVisible = ref(props.protocolModalVisible);

const router = useRouter();

const formData = reactive({
  plan_protocol_type: null
})

watch(() => props.protocolModalVisible, (newValue) => {
  childProtocolModalVisible.value = newValue;
});

watch(SelectedEventParams, (newValue) => {
  emit('SelectedEventParamsLength', newValue.length);
  selectAll.value = Array.isArray(props.data) && newValue.length === props.data.length;
});


function handleCheckboxChange(event, node) {
  const {checked} = event.target;
  if (checked) {
    const exists = SelectedEventParams.value.some(item => item.event_id === node.work_plan_event_id);
    if (!exists) {
      SelectedEventParams.value.push({
        event_id: node.work_plan_event_id,
        event_name: node.event_name,
        protocol_agenda: {},
      });
    }
  } else {
    SelectedEventParams.value = SelectedEventParams.value.filter(item => item.event_id !== node.work_plan_event_id);
  }
}

function isChecked(eventId) {
  return !!SelectedEventParams.value.find(item => item.event_id === eventId);
}

function isAllSelected() {
  if (props.data.length === SelectedEventParams.value.length) {
    return props.data.every(node => SelectedEventParams.value.includes(node.work_plan_event_id));
  }
}

watch(SelectedEventParams, () => {
  selectAll.value = isAllSelected();
});


function toggleRespPanel(event, node) {
  if (node) {
    selectedEvent.value = node;
  }
  if (op.value) {
    op.value.toggle(event);
  }
}

function closeOverlay() {
  selectedEvent.value = null;
}

function handleHide() {
  SelectedEventParams.value = []
  emit('hide');
}

function emitHide() {
  emit('hide');
}


function sumWorkPlanEventIds() {
  return SelectedEventParams.value.reduce((sum, item) => sum + item.event_id, 0);
}

const eventIdsSum = ref(0);

watch(SelectedEventParams, () => {
  eventIdsSum.value = sumWorkPlanEventIds();
}, {deep: true});

watch(eventIdsSum, (newSum) => {
  paramData.value.protocol_number = String(newSum);
});

const votingResults = ref({
  vote_aye: null,
  vote_con: null,
  vote_abstained: null,
  vote_total_decisions: null,
});

const agendaData = ref({
  agenda: '',
  speaker: [],
  voting_result: votingResults.value,
  reporter: [],
  inner_rule: '',
  board_decisions: [
    {
      board_decision: '',
      responsive_person: [],
      deadline: null

    }
  ]
});

const paramData = ref({
  protocol_id: eventIdsSum.value,
  protocol_number: null,
  created_date: null,
  extract_created_date: null,
  meeting_date: null,
  meeting_place: '',
  participated_board_members: [],
  protocol_secretary_member: [],
  absent_members: [],
  quorum_info: '',
  invited_persons: [],
  protocol_issues: [],
  voting_results: votingResults.value,
  session_closed_time: null,
  lang: parseInt(props.planData.lang),
  board_members: []
});

watch(SelectedEventParams, (newVal) => {
  const existingIds = new Set(paramData.value.protocol_issues.map(item => item.event_id));
  const uniqueItems = newVal.filter(item => !existingIds.has(item.event_id));
  paramData.value.protocol_issues.push(...uniqueItems);
});

const createProtocol = () => {
  const totalEventIdSum = sumWorkPlanEventIds();
  const totalEventIdSumString = String(totalEventIdSum);
  let data = {
    work_plan_id: props.planData.work_plan_id,
    work_plan_name: totalEventIdSumString,
    protocol_id: eventIdsSum.value,
    lang: props.planData.lang,
    doc_id: "protocol",
    params: [
      {
        docID: props.planData.work_plan_id,
        name: totalEventIdSumString,
        value: paramData.value,
        description: protocolTypes.value[0].code,

      }
    ]

  };

  loading.value = true;
  const formData = new FormData();

  formData.append('protocol', JSON.stringify(data));
  workPlanService.createProtocol(formData).then(result => {
    loading.value = false;
    emit('hide')
    router.push({
      name: "addWorkPlanProtocol",
      params: {workPlanId: props.planData.work_plan_id, protocolId: totalEventIdSum},
    });
  }).catch(error => {
    loading.value = false
    if (error.response && error.response.data && error.response.data.error === 'protocolalreadyexists') {
      toast.add({severity: "warn", summary: t('workPlan.protocol.alreadyCreated'), life: 3000});
    } else {
      toast.add({severity: "error", summary: error, life: 3000});
    }

  })

}

const getWorkPlanProtocolTypes = () => {
  workPlanService.getWorkPlanProtocolTypes().then(res => {
    protocolTypes.value = res.data
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

onMounted(() => {
  getWorkPlanProtocolTypes();
})

</script>


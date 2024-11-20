<template>
    <Sidebar
        v-model:visible="visibleRight"
        :header=studentFullName
        position="right"
        class="w-6"
        style="overflow-y: scroll"
    >
      <DocSignaturesInfo
          :docIdParam=studentDocUUID
          :docIdInt=studentDocID
          :isInsideSidebar="true"
          :showStudents="true"
      />
    </Sidebar>

    <TabView v-model:activeIndex="active" @tab-change="tabChanged">
      <TabPanel :header="$t('common.tasks')">
        <div>
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
      <TabPanel :header="$t('common.members')" v-if="isPlanCreator && isPracticeManager && !findRole(null, 'student')">
        <div v-if="members && filterData">

          <div class="flex justify-end">
            <!--Поле поиска студента   -->
            <div style="margin-bottom: 10px; width: 100%;"/>
            <IconField>
              <InputIcon class="pi pi-search"/>
              <InputText v-model="searchQuery" @input="filterData" :placeholder="$t('common.search')"/>
            </IconField>
          </div>

          <DataTable v-model:selection="selectedMembers"
                     :value="filteredMembers"
                     dataKey="id"
                     tableStyle="min-width: 50rem"
                    :lazy="true"
                     paginator
                     :loading="loadMem"
                     :rows="10"
                     :total-records="totalMembers"
                     :rowsPerPageOptions="[10, 20, 50]"
                     @page="onPage($event)"
                     :first="first"
          >

            <Column header=" " style="width: 15%;">
              <template #header>
                <Checkbox
                    v-model="allChecked"
                    @change="selectAllCheckBox"
                    :binary="true"
                />
                <span class="ml-2">{{this.$t("common.selectAll")}}</span>
              </template>
              <template #body="slotProps">
                <Checkbox
                    v-model="slotProps.data.checked"
                    @change="checkBoxSelect(slotProps)"
                    :binary="true"
                />
              </template>
            </Column>

            <Column field="fullName" :header="$t('common.fullName')" style="text-align: center; width: 30%;">
              <template #body="slotProps">
                <div style="text-align: left;">
                  <p>{{ slotProps.data.user.fullName }}</p>
                </div>
              </template>
            </Column>
            <Column field="content" :header="$t('contracts.contract')">
              <template #body="slotProps">
                <a href="#" @click.prevent="viewContract(slotProps.data.doc_uuid, slotProps.data.doc_id, slotProps.data.user.fullName)">
                  {{ slotProps.data[$i18n.locale === 'kz' ? 'contract_name_kz' : 'contract_name_ru']}}
                </a>
              </template>
            </Column>
            <Column field="id" :header="$t('workPlan.journalReports')" style="text-align: center;">
              <template #body="slotProps">
                <div style="text-align: left;">
                  <button :disabled="!slotProps.data.contract_name_kz" @click="navigateToJournalReports(slotProps.data)" style="background: none; border: none; cursor: pointer;">
                    <i class="fas fa-eye"></i> <!-- Иконка глаза -->
                  </button>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-else>
          {{ $t('common.noData') }}
        </div>
      </TabPanel>
    </TabView>
</template>

<script setup>
import moment from "moment";
import ActionButton from "@/components/ActionButton.vue";
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {findRole} from "../../../config/config";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import DocSignaturesInfo from "../../DocSignaturesInfo.vue";
import {WorkPlanService} from "@/service/work.plan.service";

const {t, locale} = useI18n()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const props = defineProps(['data', 'loading', 'loadingMembers', 'total', 'totalMembers', 'menus', 'isPlanCreator', 'members'])
const emits = defineEmits(['expand', 'onPage', 'onPageMembers', 'onToggle', 'updateActive', 'updateSelect']);
const visibleRight = ref(false);
const searchQuery = ref("")
const filteredMembers = computed(() => props.members)
const loadMem = computed(() => props.loadingMembers)

// Следим за изменениями filteredMembers и обнуляем selectedMembers
watch(filteredMembers, () => {
  getPracticeManager();
  selectedMembers.value = [];
  allChecked.value = false;
  loadMem.value = !loadMem.value;
});
const workPlanId = computed(() => parseInt(route.params.id)).value
const loginedUserId = computed(() => JSON.parse(localStorage.getItem("loginedUser")).userID).value
const active = ref(0)
const first = ref(0)

const totalMembers = computed(() => props.totalMembers)

const tabChanged = () => {
  emits('updateActive', active.value)
}
const studentDocUUID = ref("")
const studentDocID = ref(0)
const studentFullName = ref("")
const viewContract = (docUUID, docId, fullName) => {
  studentDocUUID.value = docUUID
  studentDocID.value = docId
  studentFullName.value = fullName
  visibleRight.value = true
}

const selectedMembers = ref([]);
const metaKey = ref(true);
const allChecked = ref(false);
// Логика для определения, доступна ли строка для выбора
const isSelectable = (student) => {
  return !student.contract_name_kz;
};

const checkBoxSelect = (slotProps) => {
  if(!isSelectable(slotProps.data)) {
    // Если поле недоступно, показываем сообщение
    slotProps.data.checked = !slotProps.data.checked;
    toast.add({ severity: 'warn', summary: t('common.existingPracticeAgreementsMessage'), life: 3000 });
    return
  }
  if (slotProps.data.checked) {
    selectedMembers.value.push(slotProps.data)
  } else {
    selectedMembers.value = selectedMembers.value.filter(item => item !== slotProps.data);
  }
  emits('updateSelect', selectedMembers.value)
}

const selectAllCheckBox = () => {
  selectedMembers.value = []
  allChecked.value = !allChecked.value;
  if (allChecked.value) {
    filteredMembers.value.forEach(member => {
      member.checked = false;
    });
    selectedMembers.value = []
  } else {
    filteredMembers.value.forEach(member => {
      let isChecked = false;

      if(isSelectable(member)){
        isChecked = true
        selectedMembers.value.push(member)
      }

      if (isChecked) {
        member.checked = true;
      }
    });
  }
  allChecked.value = !allChecked.value;
  emits('updateSelect', selectedMembers.value)
}

const filterData = () => {
  const query = searchQuery.value.toLowerCase();
  filteredMembers.value = props.members.filter(member => {
    return member.user.fullName.toLowerCase().includes(query);
  });
}

const navigateToJournalReports = student => {
  router.push({name: 'WorkPlanJournalReport', params: {id: workPlanId, userId: student.id, uuId: student.doc_uuid, doc: student.contract_name_ru}
  });
}

const formatDateMoment = (date) => {
  return moment(new Date(date)).utc().format("DD.MM.YYYY")
}

const onPage = (event) => {
  first.value = event.first;
  emits('onPageMembers', event)
}

//  тексеру, логин жасаған адам практика жетекшісі ме?
//  true/false
const planService = new WorkPlanService()
const isPracticeManager = ref(false);

const getPracticeManager = () => {
  planService.practicemanager().then(res => {
    isPracticeManager.value = res.data;
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

</script>

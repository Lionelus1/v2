<template>
  <div class="col-12">
    <DataTable :lazy="true" :value="tableLogs" dataKey="id" :loading="loading" responsiveLayout="scroll" :rows="10"
               :rowHover="true" :paginator="true" :totalRecords="total" @page="onPage" @sort="onSort">
      <template #empty>{{ $t("common.noData") }}</template>
      <template #loading>{{ $t("common.loading") }}</template>


      <Column :header="$t('web.recordId')">
        <template #body="{ data }">
          {{ data.record_id }}
        </template>
      </Column>

      <Column :header="$t('web.actionID')">
        <template #body="{ data }">
          <Badge :severity="getActionColor(data.action.code)">{{ data.action['name_' + $i18n.locale] }}</Badge>
        </template>
      </Column>

      <Column :header="$t('web.ipAddress')">
        <template #body="{ data }">
          {{ data.ip }}
        </template>
      </Column>


      <Column :header="$t('faq.createDate')" sortable>
        <template #body="{ data }">
          {{ formatDate(data.created_date) }}
        </template>
      </Column>
      <Column :header="$t('web.logUser')">
        <template #body="{ data }">
          {{ data.user }}
        </template>
      </Column>

    </DataTable>
  </div>

  <Dialog v-model:visible="logView" :style="{ width: '1000px' }" @hide="closeModal" :modal="true" class="p-fluid"
          :closable="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }">
    <Card style="box-shadow: none">
      <template #title>
        <div class="card_title">
          {{ selectedTableLog.table_name }}
        </div>
      </template>
      <template #content>
        <pre>{{ formatJson(selectedTableLog.value) }}</pre>
      </template>
    </Card>
    <template #footer><br/>
      <Button v-bind:label="$t('common.close')" icon="pi pi-times" class="p-button p-component p-button-primary"
              @click="closeModal"/>

    </template>
  </Dialog>
</template>

<script>
import {onMounted, ref, reactive, toRefs} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import {formatDate} from "@/helpers/HelperUtil";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";

export default {
  name: "WebLogs",

  props: ["TN"],
  setup(props) {
    const {TN} = toRefs(props);
    const i18n = useI18n()
    const toast = useToast()
    const confirm = useConfirm()
    const loading = ref(false)
    let selectedTableLog = ref()
    let selectedDateTime = ref()
    const logView = ref(false);
    let isCreateModal = ref(false)
    let submitted = ref(false)
    const tableLogs = ref([])
    const enuService = new EnuWebService()
    const router = useRouter()
    let formData = ref({})
    const options = ref([true, false]);
    const total = ref(0)

    const lazyParams = ref({
      tn_reg: TN.value,
      page: 0,
      rows: 10,
      filter: {
        year: null,
        month: null,
        day: null,
        hour: null,
        minute: null
      },
    })

    const getTableLogs = () => {

      loading.value = true;
      enuService.getWebSiteLogs(lazyParams.value).then(res => {
        if (res.data) {
          tableLogs.value = res.data.table_logs
          total.value = res.data.total;
        }
        loading.value = false
      }).catch(error => {
        if (error?.response.status !== 403) {
          loading.value = false
          toast.add({severity: "error", summary: error, life: 3000});
        }
      });
    }


    const onPage = (event) => {
      lazyParams.value.page = event.page
      lazyParams.value.rows = event.rows
      getTableLogs();
    }

    const onSort = (event) => {
      lazyParams.value.sortField = event.sortField;
      lazyParams.value.sortOrder = event.sortOrder;
      getTableLogs();
    }
    const onView = (data) => {
      selectedTableLog.value = data;
      logView.value = true;
    };

    const closeModal = () => {
      logView.value = false;
    };

    const getActionColor = (action) => {
      if (action === 'insert') {
        return 'info';
      } else if (action === 'update') {
        return 'warning';
      } else {
        return 'danger';
      }
    }

    const formatJson = (jsonString) => {
      try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return jsonString;
      }
    }

    onMounted(() => {
      getTableLogs();

    });

    return {
      tableLogs, isCreateModal, formData, lazyParams,
      loading, selectedTableLog, submitted, options, total,
      formatDate, getActionColor, formatJson,
      onPage, onSort, getTableLogs, logView, onView, closeModal
    }
  },
}
</script>

<style lang="scss" scoped>
.field-radiobutton {
  align-items: center;
  display: flex;
  margin-bottom: 1rem;

  label {
    line-height: 1;
    margin-left: 0.5rem;
  }
}
</style>

<template>
  <div>
    <DataTable
        :value="attempts"
        :paginator="true"
        :rows="rows"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[5, 10, 20]"
        :first="first"
        @page="onPageChange"
    >
      <Column field="ip" :header="t('web.ipAddress')" />
      <Column :header="t('common.status')">
        <template  #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">{{ formatStatus(slotProps.data) }}</span>
        </template>
      </Column>

      <Column :header="t('mailing.time')">
        <template #body="slotProps">
          <span>{{ formatDate(slotProps.data) }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { AccountService } from "@/service/account.service";

const attempts = ref([]);
const totalRecords = ref(0);
const rows = ref(10);
const first = ref(0);
const toast = useToast();
const { t } = useI18n();
const accountService = new AccountService();

const fetchAttempts = async (page = 0, rows = 10) => {
  try {
    const req = {
      page: page,
      rows: rows
    };

    const response = await accountService.getAttempt(req);


    attempts.value = response.data.attempts;
    total.value = response.data.total;

    totalRecords.value = response.data.total;
  } catch (error) {
    // toast.add({severity: "error", summary: t("error"), detail: error.message});
  }
};

const formatDate = (rowData) => {
  const date = new Date(rowData.last_attempt_time);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};


const formatStatus = (rowData) => {
  console.log(rowData);
  switch (rowData.status) {
    case 2:
      return t("common.authorized");
    case 1:
      return t("common.unauthorized");
    default:
      return t("common.null");
  }
};

const getStatusClass = (status) => {
  if (status === 2) {
    return 'status-authorized';
  } else if (status === 1) {
    return 'status-unauthorized';
  }
  return '';
};


const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
  fetchAttempts(event.first / event.rows, event.rows);
};

onMounted(() => fetchAttempts(first.value / rows.value, rows.value));
</script>

<style scoped>
.status-authorized {
  color: green;
  font-weight: bold;
}

.status-unauthorized {
  color: red;
  font-weight: bold;
}

</style>

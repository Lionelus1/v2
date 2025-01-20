<template>
  <div class="col-12">
    <div class="flex flex-row mb-3">
      <div class="arrow-icon" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h4 class="m-0">{{$t('registry.registry')}}</h4>
    </div>
    <ToolbarMenu :data="menu" @filter="toggleFilter($event)" :filter="true" :filtered="filtered"/>
    <div class="card">
      <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" :value="reservation" dataKey="id" :rowHover="true"
                 :loading="loading" :paginatorTemplate="paginatorTemplate"
                 :currentPageReportTemplate="currentPageReportTemplate" responsiveLayout="scroll" :paginator="true"
                 :first="lazyParams.first || 0" :rows="lazyParams.rows" :totalRecords="total" stripedRows
                 class="flex-grow-1" @page="onPage" v-model:selection="selectedApplication" selectionMode="single" @sort="onSort($event)">
        <template #empty> {{ t('common.noData') }}</template>
        <template #loading> {{ t('common.loading') }}</template>
        <Column field="applicant" :header="$t('helpDesk.applicant')">
          <template #body="{ data }">
            {{ data.user_name }}
          </template>
        </Column>
        <Column field="reservationTicketData" sortable :header="$t('registry.reservationTicketData')">
          <template #body="{ data }">
            {{ data.reserved_data }}
          </template>
        </Column>
        <Column field="bookingStartTime" sortable :header="$t('registry.bookingStartTime')">
          <template #body="{ data }">
            {{ data.reserved_from }}
          </template>
        </Column>
        <Column field="bookingEndTime" :header="$t('registry.bookingEndTime')">
          <template #body="{ data }">
            {{ data.reserved_until }}
          </template>
        </Column>
        <Column field="status" :header="$t('mailing.status')">
          <template #body="{ data }">
            {{ statusList[data.status] }}
          </template>
        </Column>
        <Column field="dataSource" >
          <template #body="slotProps">
              <Button
                  icon="pi pi-arrow-up-right"
                  class="p-button"
                  @click="openReservationTicket(slotProps)"/>
          </template>
        </Column>
      </DataTable>
    </div>
    <OverlayPanel ref="filter">
      <div class="p-fluid">
        <div class="field" style="width: 320px">
          <label>{{ $t('helpDesk.applicant') }}</label>
          <FindUser v-model="filterUser" :editMode="true" :user-type="3"></FindUser>
          <label style="margin-top: 10px">{{ $t('registry.responsible') }}</label>
          <PrimeCalendar
              style="width: 340px"
              dateFormat="dd.mm.yy"
              selectionMode="single"
              v-model="filterReservation.date"
              :placeholder="$t('common.date')"
              :showIcon="true"
          />
          <label style="margin-top: 10px">{{ $t('contracts.filter.status') }}</label>
          <Dropdown class="lang p-link mb-2" v-model="filterReservation.status" :options="statusListDropdown"
                    :optionLabel="['name_' + $i18n.locale]" optionValue="id" :placeholder="$t('workPlan.planType')"
          />
          <Button icon="pi pi-search" :label="$t('common.search')" class="button-blue p-button-sm" @click="initFilter"/>
          <Button icon="pi pi-trash" class="p-button-outlined p-button-sm mt-1" @click="clearFilter"
                  :label="$t('common.clear')"/>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import RegistryService from "../../service/registry_service";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {UserService} from "../../service/user.service";
import FindUser from "../../helpers/FindUser.vue";
import moment from "moment";
import router from "../../router";

const route = useRoute();
const toast = useToast()
const {t, locale} = useI18n()
const total = ref(null)
const userService = new UserService()

const reservation = ref(null)
// const paginatorTemplate = ref("FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown")
const currentPageReportTemplate = ref(('common.showingRecordsCount', {
  first: '{first}',
  last: '{last}',
  totalRecords: '{totalRecords}',
}))

const lazyParams = ref( {
  page: 0,
  rows: 10,
  first: 0
})
const loading = ref(false);
const registryService = new RegistryService()
const selectedApplication = ref(null)
// const router = useRouter();
const filtered = ref(null)
const filterUser = ref(null)
const filter = ref(null)
const filterReservation = ref({
  user_id: null,
  date: null,
  status: null,
  sort: null,
})
const statusList = ref({
  1: t('common.states.pending'),
  2: t('common.states.reserved'),
})
const statusListDropdown = [
  { id: 1, name_ru: t('common.states.pending'), name_en: t('common.states.pending'), name_kz: t('common.states.pending') },
  { id: 2, name_ru: t('common.states.reserved'), name_en: t('common.states.reserved'), name_kz: t('common.states.reserved') },
];
const onPage = (event) => {
  lazyParams.value.first = event?.first
  lazyParams.value.page = event?.page
  lazyParams.value.rows = event?.rows
}
const onSort = (event) => {
  filterReservation.value.sortField = event.sortField
  filterReservation.value.sortOrder = event.sortOrder

  getReservation()
}

const menu = computed(() => [
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    // disabled: !isUserDataVaild() || (request.value.doc?.docHistory?.stateId != DocEnum.CREATED.ID &&
    //     request.value.doc?.docHistory?.stateId != DocEnum.REVISION.ID && request.value.doc?.docHistory?.stateId != null),
    // command: save
  },
]);

const toggleFilter = (event) => {
  filter.value.toggle(event)
}
const initFilter = () => {
  filterReservation.value.user_id = filterUser.value ? filterUser.value[0].userID : null ;
  getReservation()
}
const clearFilter = () => {
  filterReservation.value.user_id = null
  filterReservation.value.date = null
  filterReservation.value.status = null
  getReservation()
}

const getReservation = () => {
  const req = {
    registry_id: parseInt(route.params.id1),
    application_id: 5,
    page: 0,
    rows: 10,
    status: filterReservation.value.status,
    user_id: filterReservation.value.user_id,
    date: filterReservation.value.date,
    sort_field: filterReservation.value.sortField,
    sort_order: filterReservation.value.sortOrder,
  }
  loading.value = true;
  registryService.getReservation(req).then(res => {
    if (res.data.reservation){
      reservation.value = res.data.reservation.map(item => ({
        ...item,
        reserved_from: item.reserved_from.slice(11, 16),
        reserved_until: item.reserved_until.slice(11, 16),
        reserved_data: item.reserved_from.slice(0, 10),
      }));

      const userIds = reservation.value.map(item => item.created_by);

      const req = {
        page: 0,
        rows: 1,
        filter: {
          userIDs: userIds,
        }
      }

      userService.getUsers(req).then((res) => {
        if (res.data) {
          const foundUsers = res.data.foundUsers;

          reservation.value = reservation.value.map(item => {
            const matchedUser = foundUsers.find(user => user.userID === item.created_by);
            return {
              ...item,
              user_name: matchedUser ? matchedUser.fullName : null,
            };
          });
        }
      })
      loading.value = false
    } else {
      reservation.value = null;
      loading.value = false
    }
  }).catch((err) => {
    console.log(err);
    loading.value = false
  })
}


const openReservationTicket = (slotProps) => {
  const baseUrl = "http://10.123.255.246:8080/#/request/v2/";
  const uuid = slotProps.data.uuid; // Получаем uuid из данных
  const fullUrl = `${baseUrl}${uuid}`; // Формируем полный URL

  window.location.href = fullUrl; // Переходим на новый URL
};

onMounted(() => {
  getReservation()
})
</script>


<style scoped>

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}


:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field input {
  width: 350px;
}

.field label {
  margin-bottom: 5px;
}

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}
</style>
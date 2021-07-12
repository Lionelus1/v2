<template>
  <div >
    <div class="p-col-12">
      <div class="card">
        <h4>{{ $t("vaccination.title") }}</h4>
         <DataTable :value="vaccinated" :paginator="true" class="p-datatable-vaccinated" :rows="10"
            dataKey="id" :rowHover="true" v-model:selection="selectedCustomers" v-model:filters="filters" filterDisplay="menu" :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50]"
            :currentPageReportTemplate="$t('common.showingRecordsCount', {first: '{first}', last: '{last}', totalRecords: '{totalRecords}' })"
            :globalFilterFields="['type','name','plannedDate','status']" responsiveLayout="scroll">
            <template #header>
              <div class="p-d-flex p-jc-between p-ai-center">
                <h5 class="p-m-0">{{$t('vaccination.list')}}</h5>
                <span class="p-input-icon-left ">
                  <i class="pi pi-search" />
                  <InputText v-model="filters['global'].value" :placeholder="$t('common.search')" />
                </span>
              </div>
            </template>
          <template #empty> {{$t('common.recordsNotFound')}} </template>
          <template #loading> Loading vaccinated data. Please wait. </template>
          <Column field="type" :header="$t('common.type')" sortable>
            <template #body="{data}">
              {{$t('common.' + usertype[data.usertype])}}
            </template>
            <template #filter="{filterModel}">
              <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/>
            </template>
          </Column>
          <Column :header="$t('common.fullName')" field="name" sortable>
            <template #body="{data}">
              <span class="p-column-title">{{$t('common.fullName')}}</span>
              {{data.name}}
            </template>
            <template #filter={filterModel}>
              <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/></template>
          </Column>
          <Column :header="$t('vaccination.plannedDate')" field="plannedDate" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.plannedDate)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.date1')" field="date1" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.date1)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.date2')" field="date2" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.date2)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.vaccine')" field="vacName" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{data.vacName}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column field="status" :header="$t('common.status')" sortable :filterMenuStyle="{'width':'14rem'}" style="min-width: 10rem">
            <template #body="{data}">
              <span :class="'customer-badge status-' + data.status">{{$t('vaccination.status.' + data.status)}}</span>
            </template>
            <template #filter="{filterModel}">
              <Dropdown v-model="filterModel.value"  :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                <template #value="slotProps">
                  <span v-if="slotProps.value"  :class="'customer-badge status-' + slotProps.value">{{$t('vaccination.status.' + slotProps.value)}}</span>
                  <span v-else :class="'customer-badge status-' + slotProps.value">{{slotProps.value}}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'customer-badge status-' + slotProps.option">{{$t('vaccination.status.' + slotProps.option)}}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import {FilterMatchMode,FilterOperator} from 'primevue/api';

export default {
  data() {
    return {
      vaccinated: [
        {name: "Timur Berikbol", type: "қызметкер", usertype: 0, plannedDate : "07.05.2021", date1 : "07.06.2021", date2: "08.07.2021", vacType:0, vacName: "QazVac", status: "vaccinated"},
        {name: "Sultan Beibarys", type: "студент", usertype: 1, plannedDate : "07.05.2021", date1 : "07.06.2021", date2: "", vacType: 0, vacName: "Спутник 5", status: "firstcomponent"}
      ],
      filters: {
          'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
          'type': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
          'name': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
          'plannedDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'date1': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'date2': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'status': {value: null, matchMode: FilterMatchMode.EQUALS},
      },
      loading: true,
      statuses: ["firstcomponent", "vaccinated", "planned", "rejected"],
      usertype: ["personal", "student", "teacher"],
      vaccine: ["QazVac", "Спутник V", "Hayat-Vax", "CoronaVac", "Other"],
      template : this.$t('common.showingRecordsCount'),
    };
  },
  created() {
    //this.vaccinatedervice = new vaccinatedervice();
  },
  mounted() {
    this.loading = false;
    this.vaccinated.forEach(vaccinate => (vaccinate.plannedDate = new Date(vaccinate.plannedDate), vaccinate.date1 = new Date(vaccinate.date1)));
  },
  methods: {
    formatDate(value) {
            var result = "";
            var date = new Date(value)
            result = date.toLocaleDateString('kk-KZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }) ;
            return result == 'Invalid Date' ? '' : result


        },
  },
};
</script>

<style lang="scss" scoped>
::v-deep(.p-paginator) {
    .p-paginator-current {
        margin-left: auto;
    }
}

::v-deep(.p-progressbar) {
    height: .5rem;
    background-color: #D8DADC;

    .p-progressbar-value {
        background-color: #607D8B;
    }
}

::v-deep(.p-datepicker) {
    min-width: 25rem;

    td {
        font-weight: 400;
    }
}

::v-deep(.p-datatable.p-datatable-vaccinated) {
    .p-datatable-header {
        padding: 1rem;
        text-align: left;
        font-size: 1.5rem;
    }

    .p-paginator {
        padding: 1rem;
    }

    .p-datatable-thead > tr > th {
        text-align: left;
    }

    .p-datatable-tbody > tr > td {
        cursor: auto;
    }

    .p-dropdown-label:not(.p-placeholder) {
        text-transform: uppercase;
    }
}
</style>

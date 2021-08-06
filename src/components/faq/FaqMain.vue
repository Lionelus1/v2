<template>
  <div class="p-grid">
      <div class="p-col-12">
          <h4>Сұрақ-жауап</h4>
      </div>
    <div class="p-col-12">
      <div class="card">
          <Button label="Қосу" />
          <DataTable :value="customers" :paginator="true" class="p-datatable-customers" :rows="10"
            dataKey="id" :rowHover="true" v-model:selection="selectedCustomers" v-model:filters="filters" filterDisplay="menu" :loading="loading"
            :globalFilterFields="['name','country.name','representative.name','status']" responsiveLayout="scroll">
            <template #header>
                 <div class="p-d-flex p-jc-between p-ai-center">
                    <h5 class="p-m-0">Customers</h5>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </span>
                 </div>
            </template>
            <template #empty>
                No customers found.
            </template>
            <template #loading>
                Loading customers data. Please wait.
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="name" header="Name" sortable style="min-width: 14rem">
                <template #body="{data}">
                    {{data.name}}
                </template>
                <template #filter="{filterModel}">
                    <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/>
                </template>
            </Column>
            <Column field="country.name" header="Country" sortable filterMatchMode="contains" style="min-width: 14rem">
                <template #body="{data}">
                    <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" :class="'flag flag-' + data.country.code" width="30" />
                    <span class="image-text">{{data.country.name}}</span>
                </template>
                <template #filter="{filterModel}">
                    <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by country"/>
                </template>
            </Column>
            <Column header="Agent" sortable filterField="representative" sortField="representative.name" :showFilterMatchModes="false" :filterMenuStyle="{'width':'14rem'}" style="min-width: 14rem">
                 <template #body="{data}">
                    <img :alt="data.representative.name" src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" width="32" style="vertical-align: middle" />
                    <span class="image-text">{{data.representative.name}}</span>
                </template>
                <template #filter="{filterModel}">
                    <div class="p-mb-3 p-text-bold">Agent Picker</div>
                    <MultiSelect v-model="filterModel.value" :options="representatives" optionLabel="name" placeholder="Any" class="p-column-filter">
                        <template #option="slotProps">
                            <div class="p-multiselect-representative-option">
                                <img :alt="slotProps.option.name" :src="'demo/images/avatar/' + slotProps.option.image" width="32" style="vertical-align: middle" />
                                <span class="image-text">{{slotProps.option.name}}</span>
                            </div>
                        </template>
                    </MultiSelect>
                </template>
            </Column>
            <Column field="date" header="Date" sortable dataType="date" style="min-width: 8rem">
                <template #body="{data}">
                    {{formatDate(data.date)}}
                </template>
                <template #filter="{filterModel}">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />
                </template>
            </Column>
            <Column field="balance" header="Balance" sortable dataType="numeric" style="min-width: 8rem">
                <template #body="{data}">
                    {{formatCurrency(data.balance)}}
                </template>
                <template #filter="{filterModel}">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="USD" locale="en-US" />
                </template>
            </Column>
            <Column field="status" header="Status" sortable :filterMenuStyle="{'width':'14rem'}" style="min-width: 10rem">
                <template #body="{data}">
                    <span :class="'customer-badge status-' + data.status">{{data.status}}</span>
                </template>
                <template #filter="{filterModel}">
                    <Dropdown v-model="filterModel.value" :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                        <template #value="slotProps">
                            <span :class="'customer-badge status-' + slotProps.value">{{slotProps.value}}</span>
                        </template>
                        <template #option="slotProps">
                            <span :class="'customer-badge status-' + slotProps.option">{{slotProps.option}}</span>
                        </template>
                    </Dropdown>
                </template>
            </Column>
            <Column field="activity" header="Activity" sortable :showFilterMatchModes="false" style="min-width: 10rem">
                <template #body="{data}">
                    <ProgressBar :value="data.activity" :showValue="false" />
                </template>
                <template #filter="{filterModel}">
                    <Slider v-model="filterModel.value" range class="p-m-3"></Slider>
                    <div class="p-d-flex p-ai-center p-jc-between p-px-2">
                        <span>{{filterModel.value ? filterModel.value[0] : 0}}</span>
                        <span>{{filterModel.value ? filterModel.value[1] : 100}}</span>
                    </div>
                </template>
            </Column>
            <Column headerStyle="width: 4rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
                <template #body>
                    <Button type="button" icon="pi pi-cog"></Button>
                </template>
            </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import { getHeader, header, smartEnuApi } from "@/config/config";

export default {
    data() {
        return {
            data: [],
            selectedData: null,
            filters: {
                'global': {value: null, matchMode: FilterMatchMode.CONTAINS}
            },
            loading: true,
        }
    },
    methods: {
        getData() {
            axios.get()
        }
    }
};
</script>
<template>
  <div class="col-12">
  <h3>{{$t('registry.menuTitle')}}</h3>
  <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)" @search="search" :filter="true" :filtered="filtered" :search="true"/>
  <div class="card">
    <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" :value="data" dataKey="id" :rowHover="true"
               :loading="loading" :paginatorTemplate="paginatorTemplate"
               :currentPageReportTemplate="currentPageReportTemplate" responsiveLayout="scroll" :paginator="true"
               :first="lazyParams.first || 0" :rows="lazyParams.rows" :totalRecords="total" stripedRows
               class="flex-grow-1" @page="onPage">
      <template #empty> {{ $t('common.noData') }}</template>
      <template #loading> {{ $t('common.loading') }}</template>
      <Column field="name" :header="$t('mailing.title')">
        <template #body="{ data }">
          <router-link
                       :to="{name: 'Registry', params: {id: data.id}}"
                       tag="a">
          {{
            $i18n.locale === "kz" ? data.name_kz : $i18n.locale === "ru" ? data.name_ru :
                data.name_en
          }}
          </router-link>
        </template>
      </Column>
      <Column field="dataSource" :header="$t('registry.dataSource')">
        <template #body="{ data }">
          {{ dataSourceId[data.data_source_id] }}
        </template>
      </Column>
      <Column field="status" :header="$t('common.status')">
        <template #body="{ data }">
          {{ statusList[data.status] }}
        </template>
      </Column>
      <Column field="description" :header="$t('registry.description')">
        <template #body="{ data }">
          {{ data.description_ru }}
        </template>
      </Column>
      <Column field="numberOfEntries" :header="$t('registry.numberOfEntries')">
        <template #body="{ data }">
          {{ data.count_applications }}
        </template>
      </Column>
<!--      <Column field="numberOfEntries" :header="$t('registry.numberOfEntries')">-->
<!--        <template #body="{ data }">-->
<!--          {{ data.numberOfEntries }}-->
<!--        </template>-->
<!--      </Column>-->
<!--      <Column field="numberOfEntries" :header="$t('registry.accessControl')">-->
<!--        <template #body="{ data }">-->
<!--          {{ data.accessControl }}-->
<!--        </template>-->
<!--      </Column>-->
      <Column field="numberOfEntries" :header="$t('registry.createDate')">
        <template #body="{ data }">
          {{formatDate(data.created_at) }}
        </template>
      </Column>
<!--      <Column field="numberOfEntries" :header="$t('registry.historyOfChanges')">-->
<!--        <template #body="{ data }">-->
<!--          {{ data.modified_at }}-->
<!--        </template>-->
<!--      </Column>-->
    </DataTable>
  </div>

      <Dialog :header="$t('registry.addNewRegistry')" v-model:visible="showAddPlanDialog" :style="{width: '450px'}" class="p-fluid"
              @hide="closeBasic">
        <div class="field">
          <label>{{ $t('common.nameInRussian') }}</label>
          <InputText v-model="formData.name_ru" />
        </div>
        <div class="field">
          <label>{{ $t('common.nameInQazaq') }}</label>
          <InputText v-model="formData.name_kz" />
        </div>
        <div class="field">
          <label>{{ $t('common.nameInEnglish') }}</label>
          <InputText v-model="formData.name_en"/>
        </div>
        <div class="field">
          <label>{{ $t('ref.referenceStatus') }}</label>
          <Dropdown v-model="formData.status" :options="fieldStatus"  optionLabel="label"
                    optionValue="value" placeholder="Тип статуса" />
        </div>
<!--        <div class="field">-->
<!--          <label>{{$t('workPlan.approvalUsers')}}</label>-->
<!--          <FindUser v-model="formData.users" :editMode="true" :user-type="3"></FindUser>-->
<!--          <small class="p-error">{{ $t('workPlan.errors.approvalUserError') }}</small>-->
<!--        </div>-->
        <div class="field">
          <label>{{ $t('registry.description') }}</label>
          <Textarea v-model="formData.description_ru" autoResize rows="5" cols="30"/>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"
                  @click="close('newPublicationDialog')"/>
          <Button :label="$t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2"
                  :disabled="!formData"
                  @click="createRegistry"/>
        </template>
      </Dialog>
    <OverlayPanel ref="global-filter">
      <div class="p-fluid">
        <div class="field">
          <label>{{ $t('common.user') }}</label>
          <FindUser v-model="userNameSearch" :max="1" :user-type="3" :editMode="false" class="mb-2"
                    :placeholder="$t('common.searchByUsername')"/>
        </div>
        <div class="field">
          <label>{{ $t('ref.referenceStatus') }}</label>
          <Dropdown v-model="filter.status" :options="fieldStatus"  optionLabel="label"
                    optionValue="value" placeholder="Тип статуса" />
        </div>
        <div class="field">
          <label>{{ $t('contracts.filter.createdFrom') }}</label>
          <PrimeCalendar v-model="filter.createdAt" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
        </div>
        <div class="field">
          <Button icon="pi pi-search" :label="$t('common.search')" class="button-blue p-button-sm" @click="initFilter"/>
          <Button icon="pi pi-trash" class="p-button-outlined p-button-sm mt-1" @click="clearFilter"
                  :label="$t('common.clear')"/>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>


<script>
// import RegistryAdd from "./RegistryAdd.vue";

import RegistryService from "../../service/registry_service";
import ToolbarMenu from "../../components/ToolbarMenu";
import {registry} from "chart.js";
import FindUser from "../../helpers/FindUser.vue";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  name: 'RegistryManagement',
  components: {ToolbarMenu, FindUser},
  data() {
    return {
      registryService: new RegistryService(),
      filtered: false,
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
        first: 0
      },
      total: null,
      filter: {
        createdAt: null,
        search: null,
        user_id: null,
      },
      userNameSearch: null,
      data: null,
      dataSourceId: null,
      showAddPlanDialog: false,
      formData: {
        name_ru: null,
        name_kz: null,
        name_en: null,
        description_ru: null,
        statusList: {},
        users: []
      },
      fieldStatus: [
        { label: this.$t('registry.active'), value: 0 },
        { label: this.$t('registry.inactive'), value: 1 },
      ],
      selectedUsers: [],
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),
      types: null
    }
  },
  methods: {
    formatDate: formatDate,
    open(){
      this.showAddPlanDialog = true;
    },
    close(){
      this.showAddPlanDialog = false;
      this.formData.registry_name = null;
      this.formData.description = null;
      this.formData.status = null;
    },
    onPage(event) {
      this.lazyParams.first = event?.first
      this.lazyParams.page = event?.page
      this.lazyParams.rows = event?.rows
      this.getRegistries();
    },
    closeBasic() {
      this.showAddPlanDialog = false
    },
    toggle(ref, event, node) {
      if (node) {
        this.selectedEvent = node;
      }
      this.$refs[ref].toggle(event);
    },
    initFilter() {
      this.filter.filtered = true;
      if (this.userNameSearch?.length > 0) {
        this.filter.user_id = this.userNameSearch[0].userID
      }else{
        this.filter.user_id = null
      }
      this.getRegistries()
      localStorage.setItem("registryFilter", JSON.stringify(this.filter));
    },
    search(data) {
     this.filter.search = data;
     this.getRegistries()
    },
    clearFilter() {
      localStorage.removeItem("registryFilter");
      this.filter.user_id = null
      this.filter.status = null
      this.filter.createdAt = null
      this.getRegistries();
    },
    createRegistry() {
      if (!this.isFormValid()) {
        this.$toast.add({
          severity: "error",
          summary: this.$t('common.message.fillError'),
          life: 3000
        });
        return;
      }

      this.registryService.createRegistry(this.formData).then(res => {
        this.closeBasic();
        this.$router.push({ name: 'Registry', params: { id: res.data } });
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error.message || error,
          life: 3000
        });
      });
    },

    isFormValid() {
      return this.formData.name_ru &&
          this.formData.name_kz &&
          this.formData.name_en &&
          (this.formData.status === 0 || this.formData.status === 1) &&
          this.formData.description_ru;
    },
    getRegistries(){
      this.loading = true;
      let req = {
        id: null,
        page: this.lazyParams.page,
        rows: this.lazyParams.rows,
        search_text: this.filter.search,
        status: this.filter.status,
        created_at: this.filter.createdAt,
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
        this.total = res.data.total;
        this.data = res.data.registries;
      })
    },
  },

  computed: {
    toolbarMenus() {
      return [
        {
          label: this.$t('scienceWorks.menu.newArticle'),
          icon: "pi pi-plus",
          command: () => {
            this.open('newPublicationDialog')
          },
        },
        {
          label: this.$t('registry.actionsReferenceBooks'),
          icon: "pi pi-asterisk",
          disabled: true,
          // command: () => {
          //   this.openBasic()
          // },
        },
      ]
    },
  },
  created() {
    this.statusList = {
      0: this.$t('registry.active'),
      1: this.$t('registry.inactive'),
    };
    this.dataSourceId = {
      0: this.$t('registry.manually'),
    }
    this.getRegistries();
  }
}
</script>
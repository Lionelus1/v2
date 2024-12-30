<template>
  <div class="col-12">
  <h3>{{$t('registry.menuTitle')}}</h3>
  <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)" :filter="true" :filtered="filtered"/>
  <div class="card">

    <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" dataKey="id" :rowHover="true"
               :loading="loading" responsiveLayout="scroll" :paginator="true" :value="data"
               selectionMode="single" stripedRows scrollable
               scrollHeight="flex" @lazy="true"
               class="p-datatable-sm" :rows="10">
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
        <div class="field">
          <label>{{$t('workPlan.approvalUsers')}}</label>
          <FindUser v-model="formData.users" :editMode="true" :user-type="3"></FindUser>
          <small class="p-error">{{ $t('workPlan.errors.approvalUserError') }}</small>
        </div>
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
        <div class="field" style="width: 320px">
          <label>{{ $t('contracts.filter.status') }}</label>
          <Dropdown class="lang p-link mb-2" v-model="filter.plan_type" :options="types"
                    :optionLabel="['name_' + $i18n.locale]" optionValue="id" :placeholder="$t('workPlan.planType')"
          />
          <label>{{ $t('registry.responsible') }}</label>
          <Dropdown class="lang p-link mb-2" v-model="filter.plan_type" :options="types"
                    :optionLabel="['name_' + $i18n.locale]" optionValue="id" :placeholder="$t('contracts.filter.status')"
          />
          <label>{{ $t('contracts.filter.status') }}</label>
          <Dropdown class="lang p-link mb-2" v-model="filter.plan_type" :options="types"
                    :optionLabel="['name_' + $i18n.locale]" optionValue="id" :placeholder="$t('workPlan.planType')"
          />
          <Button icon="pi pi-search" :label="$t('common.search')" class="button-blue p-button-sm" @click="initFilter"/>
          <Button icon="pi pi-trash" class="p-button-outlined p-button-sm mt-1" @click="clearFilter()"
                  :label="$t('common.clear')"/>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>


<script>
// import RegistryAdd from "./RegistryAdd.vue";

import RegistryService from "../../service/registry_service";

import {registry} from "chart.js";
import FindUser from "../../helpers/FindUser.vue";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  name: 'RegistryManagement',
  components: {FindUser},
  data() {
    return {
      registryService: new RegistryService(),
      filtered: false,
      loading: false,
      lazyParams: null,
      filter: {
        plan_type: null,
        filtered: false
      },
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
      selectedUsers: []
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
    closeBasic() {
      this.showAddPlanDialog = false
      // this.getPlans()
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
      localStorage.setItem("registryFilter", JSON.stringify(this.filter));
      this.lazyParams.first = 0
      this.lazyParams.page = 0
    },
    clearFilter() {
      localStorage.removeItem("registryFilter");
      this.filter.doc_status = null
      this.filter.plan_type = null
      this.filter.user_id = null
      this.selectedPlanType = null;
      this.filter.filtered = false;
      this.filter.searchText = null
      this.userNameSearch = null
      this.getPlans();
    },
    createRegistry(){
      this.registryService.createRegistry(this.formData).then(res => {
        // if (res.data) {
        //   this.$toast.add({
        //     severity: 'success',
        //     summary: t('common.success'),
        //     detail: t('workPlan.message.planCreated'),
        //     life: 3000
        //   });
        // } else {
        //   this.$toast.add({severity: "error", summary: "Create plan error", life: 3000});
        // }
        this.closeBasic()
        this.$router.push({name: 'Registry', params: {id: res.data}});
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
      // this.closeBasic()
      // this.$router.push({name: 'Registry', params: {id: 4}});
    },
    getRegistries(){
      this.loading = true;
      let req = {
        id: null
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
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
          label: this.$t('registry.import'),
          icon: "pi pi-file-import",
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
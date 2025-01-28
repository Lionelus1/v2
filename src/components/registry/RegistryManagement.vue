<template>
  <div class="col-12">
  <h3>{{$t('registry.menuTitle')}}</h3>
  <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)" @search="search" :filter="true" :filtered="filtered" :search="true"/>
  <div class="card">
    <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" :value="data" dataKey="id" :rowHover="true"
               :loading="loading" :paginatorTemplate="paginatorTemplate" v-model:selection="selectedRegistry"
               :currentPageReportTemplate="currentPageReportTemplate" responsiveLayout="scroll" :paginator="true"
               :first="lazyParams.first || 0" :rows="lazyParams.rows" :totalRecords="total" stripedRows
               class="flex-grow-1" @page="onPage" selectionMode="single">
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
      <Column field="accessControl" :header="$t('registry.accessControl')">
        <template #body="{ data }">
          <Button v-if="data.data_source_id === this.user.userID"
              type="button" icon="pi pi-eye" class="p-button-outlined"
              @click="openAccessControl(data)"/>
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
  <div class="card">
    <Sidebar v-model:visible="accessControlOpen"
             position="right"
             class="p-sidebar-lg">
      <ToolbarMenu :data="accessControlMenus"/>
      <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" dataKey="id" :value="accessControlUser" :rowHover="true"
                 :loading="loading" v-model:selection="selectedUserRole"
                 responsiveLayout="scroll"
                 :totalRecords="total" stripedRows
                 class="flex-grow-1" selectionMode="single">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="name" :header="$t('common.user')">
          <template #body="{ data }">
            {{ data.fullName}}
          </template>
        </Column>
        <Column field="roleLabel" :header="$t('roleControl.roleLabel')">
          <template #body="{ data }">
            {{ roleList[data.role_id] }}
          </template>
        </Column>
        <Column field="deleteRole">
          <template #body="{ data }">
            <Button class="p-button-text p-button-danger " style="width: 50px; margin-left: 15px;" @click="deleteRole(data)">
              <i class="fa-solid fa-trash-can fa-xl"></i>
            </Button>
          </template>
        </Column>
      </DataTable>
    </Sidebar>
  </div>
  </div>

      <Dialog :header="$t('registry.addNewRegistry')" v-model:visible="showAddRegistryDialog" :style="{width: '450px'}" class="p-fluid"
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
    <Dialog :header="$t('registry.addNewRole')" v-model:visible="showGiveRoleDialog" :style="{width: '450px'}" class="p-fluid"
            @hide="closeAddNewRoleBasic">
      <div class="field">
        <label>{{$t('workPlan.approvalUsers')}}</label>
        <FindUser v-model="accessControl.user" :editMode="true" :user-type="3"></FindUser>
        <small class="p-error">{{ $t('workPlan.errors.approvalUserError') }}</small>
      </div>
      <div class="field">
        <label>{{ $t('roleControl.giveRole') }}</label>
        <Dropdown v-model="accessControl.role" :options="fieldRole"  optionLabel="label"
                  optionValue="value" placeholder="Тип статуса" />
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"
                @click="closeRole"/>
        <Button :label="$t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2"
                :disabled="accessControl.user == null && accessControl.role == null"
                @click="addNewRole"/>
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
import {UserService} from "../../service/user.service";

export default {
  name: 'RegistryManagement',
  components: {ToolbarMenu, FindUser},
  data() {
    return {
      registryService: new RegistryService(),
      userService: new UserService(),
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
        created_by: null,
      },
      user: JSON.parse(window.localStorage.getItem('loginedUser')),
      accessControlUser: null,
      accessControlOpen: false,
      selectedRegistry: null,
      selectedUserRole: null,
      userNameSearch: null,
      data: null,
      dataSourceId: null,
      roleList: null,
      showAddRegistryDialog: false,
      showGiveRoleDialog: false,
      formData: {
        name_ru: null,
        name_kz: null,
        name_en: null,
        description_ru: null,
        statusList: {},
        users: [],
        data_source_id: null
      },
      fieldStatus: [
        { label: this.$t('registry.active'), value: 0 },
        { label: this.$t('registry.inactive'), value: 1 },
      ],
      fieldRole: [
        { label: this.$t('registry.superAdministrator'), value: 1 },
        { label: this.$t('registry.administrator'), value: 2 },
        { label: this.$t('registry.editor'), value: 3 },
        { label: this.$t('registry.reader'), value: 4 },
      ],
      accessControl: {
        user: null,
        role: null,
      },
      userRole: null,
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
      this.showAddRegistryDialog = true;
    },
    close(){
      this.showAddRegistryDialog = false;
      this.formData.registry_name = null;
      this.formData.description = null;
      this.formData.status = null;
    },
    closeRole(){
      this.showGiveRoleDialog = false;
      this.accessControl.user = null;
      this.accessControl.role = null;
    },
    onPage(event) {
      this.lazyParams.first = event?.first
      this.lazyParams.page = event?.page
      this.lazyParams.rows = event?.rows
      this.getRegistries();
    },
    closeBasic() {
      this.showAddRegistryDialog = false
    },
    closeAddNewRoleBasic(){
      this.showGiveRoleDialog = false
    },
    toggle(ref, event, node) {
      if (node) {
        this.selectedEvent = node;
      }
      this.$refs[ref].toggle(event);
    },
    openAccessControl(slotProps) {
      this.accessControlUser = null;
      this.selectedRegistryId = slotProps.id;
      this.accessControlOpen = true;
      this.selectedRegistry = null;

      this.registryService.getUsers(slotProps.access_users).then((res) => {
        this.accessControlUser = res.data.map(user => {
          const matchingAccessUser = slotProps.access_users.find(accessUser => accessUser.user_id === user.userID);
          return {
            ...user,
            role_id: matchingAccessUser ? matchingAccessUser.role_id : null,
            id: matchingAccessUser ? matchingAccessUser.id : null,
          };
        });
      }).catch((err) => {
        console.log(err);
      });
    },
    deleteRole(slotProps) {
      const req = {
        id: slotProps.id,
      }
      this.registryService.deleteRole(req).then(res => {
        this.getRegistries();
        this.accessControlOpen = false;
      }).catch((err) => {
        this.$toast.add({
          severity: "error",
          summary: err.message || err,
          life: 3000
        });
      })
    },
    initFilter() {
      this.filter.filtered = true;
      if (this.userNameSearch?.length > 0) {
        this.filter.created_by = this.userNameSearch[0].userID
      }else{
        this.filter.created_by = null
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
      this.filter.created_by = null
      this.filter.status = null
      this.filter.createdAt = null
      this.userNameSearch = null
      this.getRegistries();
    },
    getRoleUser(data){
      const req = {
        page: 0,
        rows: 1,
        filter: {
          userIDs: [data],
        }
      }
      let foundUsers = ''
      this.userService.getUsers(req).then((res) => {
        if (res.data) {
          foundUsers = res.data.foundUsers[0].fullName;
          return foundUsers;
        }
      })
      return foundUsers
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
      this.formData.data_source_id = this.formData.users[0].userID
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
    addNewRole() {
      if (this.selectedRegistry.access_users) {
        const isUserAlreadyAdded = this.selectedRegistry.access_users.some(
            (user) => user.user_id === this.accessControl.user[0].userID
        );

        if (isUserAlreadyAdded) {
          this.$toast.add({
            severity: "error",
            summary: this.$t('registry.userAlreadyExists'),
            life: 3000
          });
          return;
        }
      }
      const req = {
        user_id: this.accessControl.user[0].userID,
        registry_id: this.selectedRegistry ? this.selectedRegistry.id : this.selectedRegistryId,
        role_id: this.accessControl.role,
      };

      this.registryService.addNewRole(req).then(res => {
        this.$toast.add({
          severity: "success",
          summary: this.$t('registry.roleAdded'),
          life: 3000
        });
        this.getRegistries()
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error.message || error,
          life: 3000
        });
      });

      this.showGiveRoleDialog = false;
      this.accessControlOpen = false;
      this.getRegistries();
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
        created_by: this.filter.created_by
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
        this.total = res.data.total;
        this.data = res.data.registries;
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error.message || error,
          life: 3000
        })
        this.loading = false;
      })
    },
    giveRoles(){
      this.showGiveRoleDialog = true;
    }
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
          disabled: this.selectedRegistry === null,
          // command: () => {
          //   this.openBasic()
          // },
          items: [
            {
              label: this.$t('roleControl.giveRole'),
              command: () => { this.giveRoles() }
            },
          ]
        },
      ]
    },
    accessControlMenus() {
      return [
        {
          label: this.$t('scienceWorks.menu.newArticle'),
          icon: "pi pi-plus",
          command: () => { this.giveRoles() }
        },
        {
          label: this.$t('registry.actionsReferenceBooks'),
          icon: "pi pi-asterisk",
          disabled: this.selectedRegistry === null,
          // command: () => {
          //   this.openBasic()
          // },
          items: [
            {
              label: this.$t('roleControl.giveRole'),
            },
          ]
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
    this.roleList = {
      1: this.$t('registry.superAdministrator'),
      2: this.$t('registry.administrator'),
      3: this.$t('registry.editor'),
      4: this.$t('registry.reader'),
    };
    this.getRegistries();
  }
}
</script>
<template>
  <div class="card">
    <!-- TOOLBAR -->
    <Toolbar>
      <template #start>
        <Dropdown class="dropdown" v-model="selectedOrganization" :options="userOrganizations" 
          :optionLabel="itemLabel" :placeholder="$t('roleControl.selectOrg')" 
          :filter="true" :showClear="true" @change="handleSelectionChange"
          dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"
          @filter="handleFilter"/>
          <Button
            :label="$t('roleControl.giveRole')"
            icon="pi pi-plus"
            class="p-button-success p-mr-2"
            :disabled="isDisabled"
            v-on:click="giveNewRole"
            />
      </template>
    </Toolbar>
    <!-- ОСНОВНАЯ ТАБЛИЦА ДАННЫХ -->
    <DataTable :lazy="true"
              :value="roles"
              @page="onPage($event)"
              :totalRecords="count"
              :paginator="true"
              paginatorTemplate="FirstPageLink
                                PrevPageLink
                                PageLinks
                                NextPageLink
                                LastPageLink
                                CurrentPageReport
                                RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="$t('common.showingRecordsCount',
                                                { first: '{first}',
                                                last: '{last}',
                                                totalRecords: '{totalRecords}'
                                              })"
              class="p-datatable-customers"
              :rows="10"
              :rowHover="true"
              v-model:selection="role"
              selection-mode="single"
              @row-select="select($event)"
              :loading="loading"
              responsiveLayout="scroll"
              @sort="onSort($event)">
      <!--  HEADER -->
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <h5 class="m-0" v-if="selectedOrganization">{{ selectedOrganization['name'+$i18n.locale] }}</h5>
          <span class="p-input-icon-left" v-if="selectedOrganization">
            <i class="pi pi-search"/>
            <InputText type="search"
                       v-model="lazyParams.searchText"
                       :placeholder="$t('common.search')"
                       @keyup.enter="getRoleRelations"
                       @click="clearData"/>
            <Button icon="pi pi-search" class="p-ml-1" @click="getRoleRelations"/>
          </span>
        </div>
      </template>
      <!-- EMPTY -->
      <template #empty> {{ $t('common.noData') }}</template>
      <!-- ON LOADING -->
      <template #loading> {{ $t('common.loading') }}</template>
      <!-- COLUMNS -->
      <Column field="employeeIIN"
              :header="$t('roleControl.employeeIIN')"
              :sortable="true">
        <template #body="slotProps">
          <span v-if="slotProps.data.employee">
            {{ slotProps.data.employee.IIN }}
          </span>
        </template>
      </Column>
      <Column field="employeeName"
              :header="$t('roleControl.employeeName')"
              :sortable="false">
        <template #body="slotProps">
          <span v-if="slotProps.data.employee">
            {{ slotProps.data.employee.name }}
          </span>
        </template>
      </Column>
      <Column field="roleName"
              v-bind:header="$t('roleControl.roleName')"
              :sortable="false">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.namekz : $i18n.locale === "ru"
                  ? slotProps.data.nameru : slotProps.data.nameen
            }}
          </span>
        </template>
      </Column>
      <Column field="buttons">
        <template #body="slotProps">
          <Button 
                  style="margin-right: 0.5rem;"
                  icon="pi pi-exclamation-triangle"
                  class="p-button-warning"
                  v-if="!slotProps.data.canDelete"
                  v-tooltip="slotProps.data.canDelete ? '' : slotProps.data.cantDeleteReason[$i18n.locale]"/>
          <Button 
                  icon="pi pi-times"
                  class="p-button-danger"
                  :disabled="!slotProps.data.canDelete"
                  v-tooltip="slotProps.data.canDelete ? '' : slotProps.data.cantDeleteReason[$i18n.locale]"
                  @click="openDelete(slotProps.data)"/>
        </template>
      </Column>
    </DataTable>
    <!--  БОКОВАЯ ПАНЕЛЬ ДОБАВЛЕНИЯ ДАННЫХ  -->
    <Sidebar v-model:visible="isView"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <AddRole :selectedOrganization="selectedOrganization" />
    </Sidebar>
    <!--  ДИАЛОГОВОЕ ОКНО ДЛЯ УДАЛЕНИЯ ЗАПИСИ В ТАБЛИЦЕ  -->
    <Dialog v-model:visible="isDeleting"
            :style="{ width: '450px' }"
            :modal="true"
            :closable="false">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
        <span v-if="role">
          {{ $t("common.doYouWantDelete") }}?
        </span>
      </div>
      <template #footer>
        <Button :label="$t('common.yes')"
                icon="pi pi-check"
                class="p-button p-component p-button-success p-mr-2"
                @click="deleteRoleRelation"/>
        <Button :label="$t('common.no')"
                icon="pi pi-times"
                class="p-button p-component p-button-danger p-mr-2"
                @click="closeDelete"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import AddRole from "./AddRole";
import RoleControlService from "./RoleControlService";

export default {
  name: "RoleControl",
  components: {AddRole},
  data() {
    return {
      currentUser: null,
      userOrganizations: [],
      selectedOrganization: null,
      orgParams: {
        searchText: null,
      },
      roles: [],
      role: null,
      count: 0,
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: null,
        sortOrder: 0,
        orgId: 0,
      },
      loading: false,
      isView: false,
      isDeleting: false,
      isDisabled: true,
    }
  },
  roleControlService: null,
  created() {
    this.roleControlService = new RoleControlService();
  },
  mounted() {
    this.getOrganizations()
    this.currentUser = JSON.parse(localStorage.getItem("loginedUser"))
    this.emitter.on('roleRelationAdded', (data) => {
      if (data === true) {
        this.isView = false
        this.getRoleRelations()
      }
    })
  },
  methods: {
    giveNewRole() {
      this.isView = true
    },
    deleteRoleRelation() {
      if (this.role && this.role.canDelete && this.role.id) {
        this.roleControlService.deleteRoleRelation(this.role.id).then(response => {
          this.role = null
          this.isDeleting = false
          this.getRoleRelations()
        }).catch(error => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout")
          }
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          })
        })
      } else {
        this.$toast.add({
          severity: "error",
          summary: this.role ? this.role.cantDeleteReason : this.$t("roleControl.cantDelete"),
          life: 3000,
        })
      }
    },
    getOrganizations() {
      this.roleControlService.getOrganizations(this.orgParams).then(response => {
        this.userOrganizations = response.data
        if (this.userOrganizations.length === 1) {
          this.selectedOrganization = this.userOrganizations[0]
          this.handleSelectionChange()
        } else if (this.userOrganizations.length > 1) {
          let result = this.userOrganizations.find(element => element.id === this.currentUser.organization.id);
          if (result) {
            this.selectedOrganization = result
            this.handleSelectionChange()
          }
        }
      }).catch(error => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout")
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        })
      })
    },
    getRoleRelations() {
      this.loading = true
      this.roleControlService.getRoleRelations(this.lazyParams).then((response) => {
        this.roles = response.data.roles
        this.count = response.data.total
        this.loading = false;
      }).catch((error) => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        })
      })
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getRoleRelations()
    },
    onSort(event) {
      this.lazyParams.sortField = event.sortField
      this.lazyParams.sortOrder = event.sortOrder
      this.getRoleRelations()
    },
    select(event) {
      this.role = event.data
    },
    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = null;
      this.getRoleRelations();
    },
    openDelete(data) {
      this.role = data
      this.isDeleting= true
    },
    closeDelete() {
      this.role = null
      this.isDeleting = false
    },
    handleSelectionChange() {
      if (this.selectedOrganization) {
        this.isDisabled = false
        this.lazyParams.orgId = this.selectedOrganization.id
        this.getRoleRelations()
      } else {
        this.isDisabled = true
        this.lazyParams.orgId = 0
        this.roles = null
        this.count = 0
        this.loading = false;
      }
    },
    itemLabel(item) {
      if (item.bin) {
        return item.bin + ' - ' + item['name' + this.$i18n.locale]
      } else {
        return item['name' + this.$i18n.locale]
      }
    },
    handleFilter(event) {
      if (event.value && event.value.length > 3) {
        this.orgParams.searchText = event.value
        this.getOrganizations()
      } else if (this.orgParams.searchText.length > 3) {
        this.orgParams.searchText = null
        this.getOrganizations()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  margin-right: 0.5rem;
}
</style>
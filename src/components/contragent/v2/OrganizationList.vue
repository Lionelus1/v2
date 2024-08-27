<template>
  <h3>{{ $t("contragent.organization") }}</h3>
  <div class="card">
    <TabMenu :model="tabs" v-model:activeIndex="activeTabIndex" @update:activeIndex="onTabClick" />

    <ToolbarMenu :data="menu" @filter="toggle('filterOverlayPanel', $event)" :filter="true" :filtered="filtered"/>


    <DataTable :value="organizations" dataKey="id" :rows="rows" :totalRecords="total"
               :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
               scrollable scrollHeight="flex" v-model:selection="currentOrganization" selectionMode="single"
               :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column v-if="sidebar" selectionMode="single" style="min-width: 20px; max-width: 40px;"></Column>
      <Column :header="$t('contragent.columns.name')" style="min-width: 200px;">
        <template #body="slotProps">
          <Button class="p-button-link text-left p-0" @click="currentOrganization=slotProps.data; organizationSelected()">
            {{ getOrganizationName(slotProps.data) }}
          </Button>
        </template>
      </Column>
      <Column v-if="activeTabIndex === 0" :header="$t('contragent.columns.bin')" style="min-width: 50px;">
        <template #body="slotProps">
          {{ slotProps.data ? slotProps.data.iin : '' }}
        </template>
      </Column>
      <Column v-if="activeTabIndex === 1" :header="$t('science.qualification.country')" style="min-width: 50px;">
        <template #body="slotProps">
          {{ this.countryLabel(slotProps.data?.locality) }}
        </template>
      </Column>
    </DataTable>
  </div>
  <!-- organizationPage -->
  <Sidebar v-model:visible="visibility.organizationPage" position="right" class="p-sidebar-lg">
    <OrganizationPage :showBackButton="false" :id="currentOrganization?.id" :organization="currentOrganization" @organizationUpdated="organizationUpdated"></OrganizationPage>
  </Sidebar>

  <OverlayPanel ref="filterOverlayPanel">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field">
        <label>{{ $t('common.organizationName') }}</label>
        <InputText type="text" :placeholder="$t('common.search')" v-model="tempFilter.name"/>
      </div>
      <div v-if="activeTabIndex === 1" class="field">
        <label>{{ $t('science.qualification.country') }}</label>
        <Dropdown filter v-model="tempFilter.country_id" option-value="id" :placeholder="$t('common.select')" :options="countries" class="w-full"
                  :option-label="countryLabel">
        </Dropdown>
      </div>

      <div class="field">
        <Button :label="$t('common.clear')" @click="clearFilter();toggle('filterOverlayPanel', $event);getOrganizations()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('common.search')" @click="saveFilter();toggle('filterOverlayPanel', $event);getOrganizations()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>

</template>
<script>
import { ContragentService } from "@/service/contragent.service";
import OrganizationPage from "@/components/contragent/v2/OrganizationPage";
import { findRole } from "@/config/config";


export default {
  name: 'OrganizationList',
  components: { OrganizationPage },
  props: {
    sidebar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['organizationSelected'],
  data() {
    return {
      service: new ContragentService(),
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),

      visibility: {
        organizationPage: false,
      },

      tableLoading: false,

      organizations: [],
      filteredOrganizations: [],
      currentOrganization: null,
      total: 0,
      page: 0,
      rows: 10,

      filter: {
        name: '',
        resident: 1,
        country_id:null,
      },
      tempFilter: {
        name: null,
        country_id:null,
        localeSearchText: null,
      },

      activeTabIndex: 0,
      tabs: [
        {index: 0, label: this.$t("contragent.domesticPartners")},
        {index: 1, label: this.$t("contragent.foreignPartners")}
      ],
      filtered: false,
      countries: [],
      countryTotal: 0,
    }
  },
  computed: {
    menu() {
      return [
        {
          icon: "pi pi-fw pi-refresh",
          command: () => {
            this.getOrganizations();
          }
        },
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          disabled: !this.currentOrganization,
          command: () => {
            this.open('organizationPage');
          }
        },
        {
          label: this.$t("contragent.menu.select"),
          icon: "fa-regular fa-square-check",
          disabled: !this.currentOrganization,
          visible:  this.sidebar,
          command: () => {
            this.$emit('organizationSelected', this.currentOrganization);
          }
        },
        {
          label: this.$t("common.createNew"),  // New item for creating an organization
          icon: "pi pi-fw pi-plus",
          disabled: !this.findRole(null, 'main_administrator'),
          visible: this.findRole(null, 'main_administrator'),
          command: () => {
            this.createOrganization();  // Method to handle organization creation
          }
        }
      ]
    }
  },
  mounted() {
    if (!this.sidebar) {
      this.$emit('apply-flex', true);
    }

    this.getOrganizations();
  },
  beforeUnmount() {
    if (!this.sidebar) {
      this.$emit('apply-flex', false);
    }
  },
  methods: {
    findRole: findRole,
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false;
    },
    getOrganizationName(org) {
      let name = '';

      if (this.$i18n.locale === 'kz' && org.name && org.name.length > 0) {
        if (org.form) {
          name = '"' + org.name + '" ' + org.form.shortname;
        } else {
          name = org.name;
        }
      } else if (this.$i18n.locale === 'ru' && org.nameru && org.nameru.length > 0) {
        if (org.form) {
          name = org.form.shortnameru + ' "' + org.nameru + '"';
        } else {
          name = org.nameru;
        }
      } else if (this.$i18n.locale === 'en' && org.nameen && org.nameen.length > 0) {
        if (org.form && org.form.shortnameen) {
          name = org.form.shortnameen + ' "' + org.nameen + '"';
        } else {
          name = org.nameen;
        }
      } else if (org.name) {
        name = org.name;
      }

      return name;
    },
    getOrganizations() {
      this.tableLoading = true;
      const resident = this.activeTabIndex === 0 ? 1 : -1

      this.service.getOrganizations({
        page: this.page,
        rows: this.rows,
        filter: {
          name: this.filter.name,
          resident: resident,
          country_id: this.activeTabIndex === 1 ? this.filter.country_id : null,
        }
      }).then(res => {
        this.organizations = res.data.organizations;
        this.total = res.data.total;
        this.currentOrganization = null;
        this.tableLoading = false;
      }).catch(err => {
        this.organizations = [];
        this.total = 0;
        this.currentOrganization = null;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }

        this.tableLoading = false;
      });
    },
    onTabClick(event) {
      this.getOrganizations();
    },
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getOrganizations();
    },
    organizationUpdated(event) {
      this.getOrganizations();
    },
    organizationSelected() {
      if (!this.sidebar) {
        this.$router.push({ name: 'OrganizationPage', params: { id: this.currentOrganization.id }, query: {
            showBackButton: true
          }  });
      } else {
        this.open('organizationPage');
      }
    },
    validString(str) {
      return str && str.length > 0;
    },
    toggle(ref, event) {
      if (this.activeTabIndex === 1) {
        this.getCountries()
      }
      if (ref === 'filterOverlayPanel') {
        this.tempFilter = JSON.parse(JSON.stringify(this.filter));
      }

      this.$refs[ref].toggle(event);
    },
    clearFilter() {
      this.filter = {
      };
      this.filtered = false;
    },
    saveFilter() {
      this.filter = JSON.parse(JSON.stringify(this.tempFilter));
      this.filtered = true;
    },
    countryLabel(data) {
      if (data === undefined || data === null) {
        return ''
      }
      return data['name_'+this.$i18n.locale]
    },
    getCountries() {
      const req = {
        searchText: this.tempFilter.localeSearchText,
      }
      this.service.getLocality(req).then(res => {
        this.countries = res.data.locality;
        this.countryTotal = res.data.total;
      }).catch(err => {
        this.countries = [];
        this.countryTotal = 0;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          console.log(err);
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      });
    },
    createOrganization() {
      if (!this.sidebar) {
        this.$router.push({
          name: 'OrganizationPage',
          params: {
            id: null
          },
          query: {
            showBackButton: true
          }

        })
      } else {
        this.open('organizationPage');
      }
    }
  }
}
</script>
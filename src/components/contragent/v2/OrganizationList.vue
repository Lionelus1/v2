<template>
  <h3>{{ $t("contragent.organization") }}</h3>
  <div class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0">
      <template #end>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText @keyup.enter="getOrganizations" v-model="filter.name" :placeholder="$t('common.search')"></InputText>
        </span>
      </template>
    </Menubar>
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
      <Column :header="$t('contragent.columns.bin')" style="min-width: 50px;">
        <template #body="slotProps">
          {{ slotProps.data ? slotProps.data.iin : '' }}
        </template>
      </Column>
    </DataTable>
  </div>
  <!-- organizationPage -->
  <Sidebar v-model:visible="visibility.organizationPage" position="right" class="p-sidebar-lg">
    <OrganizationPage :organization="currentOrganization" @organizationUpdated="organizationUpdated"></OrganizationPage>
  </Sidebar>
</template>
<script>
import { ContragentService } from "@/service/contragent.service";
import OrganizationPage from "@/components/contragent/v2/OrganizationPage";

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
      currentOrganization: null,
      total: 0,
      page: 0,
      rows: 10,

      filter: {
        name: '',
      },

      menu: [
        {
          icon: "pi pi-fw pi-refresh",
          command: () => { this.getOrganizations(); }
        }, 
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          disabled: () => !this.currentOrganization,
          command: () => { this.open('organizationPage'); }
        },
        {
          label: this.$t("contragent.menu.select"),
          icon: "fa-regular fa-square-check",
          disabled: () => !this.currentOrganization,
          visible: () => this.sidebar,
          command: () => { this.$emit('organizationSelected', this.currentOrganization); }
        }
      ],
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
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
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

      this.service.getOrganizations({
        page: this.page,
        rows: this.rows,
        filter: {
          name: this.filter.name,
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
      })
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
        this.open('organizationPage');
        return;
      }

      if (this.currentOrganization.iin && this.currentOrganization.iin.length === 12 && 
        this.validString(this.currentOrganization.name) && this.validString(this.currentOrganization.nameru) &&
        this.currentOrganization.form && this.currentOrganization.form.id > 0) {
          this.$emit('organizationSelected', this.currentOrganization);
      } else {
        this.open('organizationPage');
      }
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    }
  }
}
</script>
<style scoped>
.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}
:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>
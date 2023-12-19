<template>
  <h3 v-if="!organization">{{ $t("common.individualEntrepreneur") }}</h3>
  <h3 v-else>{{ $t("contragent.orgEmployees", {"org": getOrganizationName(organization)}) }}</h3>
  <div class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0">
      <template #end>
        <span class="p-input-icon-left">
          <i class="pi pi-search"/>
          <InputText @keyup.enter="getPersons" v-model="filter.name" :placeholder="$t('common.search')"></InputText>
        </span>
      </template>
    </Menubar>
    <DataTable :value="persons" dataKey="userID" :rows="rows" :totalRecords="total"
      :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
      :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
      scrollable scrollHeight="flex" v-model:selection="currentPerson" selectionMode="single"
      :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column v-if="sidebar" selectionMode="single" style="min-width: 20px; max-width: 40px;"></Column>
      <Column :header="$t('contragent.columns.name')" style="min-width: 150px;">
        <template #body="slotProps">
          <Button class="p-button-link text-left" @click="currentPerson=slotProps.data; personSelected()">
            {{ getPersonName(slotProps.data) }}
          </Button>
        </template>
      </Column>
      <Column v-if="!organization" :header="$t('common.organization')" style="min-width: 250px;">
        <template #body="slotProps">
          {{ slotProps.data.mainPosition && slotProps.data.mainPosition.organization.id > 0 ?
            getOrganizationName(slotProps.data.mainPosition.organization) : '' }}
        </template>
      </Column>
      <Column v-if="!organization" :header="$t('contact.position')" style="min-width: 150px;">
        <template #body="slotProps">
          {{ slotProps.data.mainPosition ? getPositionName(slotProps.data.mainPosition) : '' }}
        </template>
      </Column>
      <Column field="IIN" :header="$t('contact.iin')" style="min-width: 100px;"></Column>
      <Column field="email" :header="$t('contact.email')" style="min-width: 50px;"></Column>
    </DataTable>
  </div>
  <!-- personPage -->
  <Sidebar v-model:visible="visibility.personPage" position="right" class="p-sidebar-lg">
    <PersonPage :person="currentPerson" @personUpdated="personUpdated"></PersonPage>
  </Sidebar>
</template>
<script>
import { ContragentService } from "@/service/contragent.service";
import PersonPage from "@/components/contragent/v2/PersonPage";

export default {
  name: 'PersonsList',
  components: { PersonPage },
  props: {
    organization: null,
    signers: {
      type: Boolean,
      default: false
    },
    sidebar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['personSelected'],
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
        personPage: false,
      },

      tableLoading: false,

      persons: [],
      currentPerson: null,
      total: 0,
      page: 0,
      rows: 10,

      filter: {
        name: '',
      },

      menu: [
        {
          icon: "pi pi-fw pi-refresh",
          command: () => { this.getPersons(); }
        }, 
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          disabled: () => !this.currentPerson,
          command: () => { this.open('personPage'); }
        },
        {
          label: this.$t("contragent.menu.select"),
          icon: "fa-regular fa-square-check",
          disabled: () => !this.currentPerson,
          visible: () => this.sidebar,
          command: () => { this.$emit('personSelected', this.currentPerson); }
        }
      ],
    }
  },
  mounted() {
    if (!this.sidebar) {
      this.$emit('apply-flex', true);
    }

    this.getPersons();
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
    getPersonName(person) {
      let name = '';

      if (this.$i18n.locale === 'en' && this.validString(person.thirdnameEn) && this.validString(person.firstnameEn)) {
        name = person.thirdnameEn + ' ' + person.firstnameEn

        if (this.validString(person.lastnameEn)) {
          name += ' ' + person.lastnameEn
        }

        return name
      }

      name = person.thirdName + ' ' + person.firstName 
      
      if (this.validString(person.lastName)) {
        name += ' ' + person.lastName
      }

      return name
    },
    getPositionName(position) {
      if (this.$i18n.locale === 'kz' && this.validString(position.namekz)) {
        return position.namekz;
      } else if (this.$i18n.locale === 'ru' && this.validString(position.nameru)) {
        return position.nameru;
      } else if (this.$i18n.locale === 'en' && this.validString(position.nameen)) {
        return position.nameen;
      }

      return position.name;
    },
    getOrganizationName(org) {
      let name = '';

      if (this.$i18n.locale === 'kz' && this.validString(org.name)) {
        if (org.form) {
          name = '"' + org.name + '" ' + org.form.shortname;
        } else {
          name = org.name;
        }
      } else if (this.$i18n.locale === 'ru' && this.validString(org.nameru)) {
        if (org.form) {
          name = org.form.shortnameru + ' "' + org.nameru + '"';
        } else {
          name = org.nameru;
        }
      } else if (this.$i18n.locale === 'en' && this.validString(org.nameen)) {
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
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getPersons();
    },
    getPersons() {
      this.tableLoading = true;

      this.service.getPersons({
        page: this.page,
        rows: this.rows,
        filter: {
          orgId: this.organization ? this.organization.id : null,
          name: this.filter.name,
          signers: this.signers,
        }
      }).then(res => {
        this.persons = res.data.foundUsers;
        this.total = res.data.total;
        this.currentPerson = null;

        this.tableLoading = false;
      }).catch(err => {
        this.persons = [];
        this.total = 0;
        this.currentPerson = null;

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
    personSelected() {
      if (!this.sidebar) {
        this.open('personPage');
        return;
      }

      if (this.validString(this.currentPerson.firstName) && this.validString(this.currentPerson.thirdName) && 
        this.validString(this.currentPerson.email)) {
          this.$emit('personSelected', this.currentPerson);
      } else {
        this.open('personPage');
      }
    },
    personUpdated(event) {
      this.getPersons();
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
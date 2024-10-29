<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h3 class="m-0">{{ $t("scienceWorks.titleList") }}</h3>
  </div>
  <BlockUI :blocked="loading" class="card">
    <Menubar class="p-1" :model="mainMenu" style="z-index: 2">
      <template #end>
        <Button class="align-items-center" :class="{'p-button-success p-button-outlined': filter.applied,
          'p-button-secondary p-button-text': !filter.applied}" @click="toggle('filterOverlayPanel', $event)">
          <i class="fa-solid fa-filter" /> &nbsp;{{ $t("scienceWorks.buttons.filter") }}</Button>
      </template>
    </Menubar>
    <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total" :first="first"
               :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
               scrollable scrollHeight="flex" v-model:selection="currentDocument" selectionMode="single"
               :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column :header="$t('scienceWorks.columns.author')" style="min-width: 150px;">
        <template #body="{data}">
          {{ data.owner.fullName ? data.owner.fullName : getFullname(data.owner) }}
        </template>
      </Column>
      <Column :header="$t('scienceWorks.columns.year')" style="min-width: 50px;">
        <template #body="{data}">
          {{ getShortDateString(data.createDate) }}
        </template>
      </Column>
      <Column style="min-width: 35px;">
        <template #body="{data}">
          <div v-if="showMySign(data.approvalStages)">
            <i v-if="greenMySign(data.approvalStages)" class="fa-solid fa-square-pen fa-xl signed"></i>
            <i v-else class="fa-solid fa-square-pen fa-xl not-signed"></i>
          </div>
        </template>
      </Column>
      <Column :header="$t('scienceWorks.columns.status')" style="min-width: 150px;">
        <template #body="{data}">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <span :class="'customer-badge status-' + data.docHistory.code">
              {{ data.docHistory[$i18n.locale === 'en' ? 'stateEn' : $i18n.locale === 'ru' ? 'stateRus' : 'stateKaz'] }}
            </span>
          </div>
        </template>
      </Column>
      <Column style="min-width: 50px;">
        <template #body="{data}">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <Button @click="currentDocument=data;openDocument()" class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-pen fa-xl"></i>
            </Button>
            <Button @click="currentDocument=data;open('documentInfoSidebar')"
                    v-if="data.docHistory.stateId >= Enum.INAPPROVAL.ID" class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-eye fa-xl"></i>
            </Button>
            <Button v-if="(data.docHistory.stateId === Enum.CREATED.ID || data.docHistory.stateId === Enum.REVISION.ID)
                    && loginedUser.userID === data.creatorID" @click="currentDocument=data;deleteFile()"
                    class="p-button-text p-button-danger p-1">
              <i class="fa-solid fa-trash fa-xl"></i>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </BlockUI>
  <!-- filterOverlayPanel -->
  <OverlayPanel ref="filterOverlayPanel">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field">
        <label>{{ $t('scienceWorks.filter.author') }}</label>
        <FindUser v-model="tempFilter.author" :max="1" searchMode="local" :user-type="3"></FindUser>
      </div>
      <div class="field">
        <label>{{ $t('scienceWorks.filter.status') }}</label>
        <Dropdown v-model="tempFilter.status" :options="statuses" optionValue="id"
                  class="p-column-filter" :showClear="true">
          <template #value="slotProps">
            <span v-if="slotProps.value" :class="'customer-badge status-' + statuses.find((e) => e.id === slotProps.value).value">
              {{ $i18n.locale === 'kz' ? statuses.find((e) => e.id === slotProps.value).nameKz : $i18n.locale === 'ru'
                ? statuses.find((e) => e.id === slotProps.value).nameRu : statuses.find((e) => e.id === slotProps.value).nameEn }}
            </span>
          </template>
          <template #option="slotProps">
            <span :class="'customer-badge status-' + slotProps.option.value">
              {{ $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru'
                ? slotProps.option.nameRu : slotProps.option.nameEn }}
            </span>
          </template>
        </Dropdown>
      </div>
      <div class="field">
        <label>{{ $t('scienceWorks.filter.years') }}</label>
        <PrimeCalendar v-model="tempFilter.years" dateFormat="yy" selectionMode="multiple" view="year"
                       :minDate="new Date(1998, 0)"
                       :maxDate="new Date(new Date().getFullYear() + 5, 0)"/>
      </div>
      <div class="field">
        <Button :label="$t('scienceWorks.buttons.clear')"
                @click="clearFilter();toggle('filterOverlayPanel', $event);
                getScienceWorksList()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('scienceWorks.buttons.search')"
                @click="saveFilter();toggle('filterOverlayPanel', $event);
                getScienceWorksList()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll" @hide="getScienceWorksList">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>
<script>
import Enum from "@/enum/docstates/index";
import { DocService } from "@/service/doc.service";
import FindUser from "@/helpers/FindUser.vue";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import { getLongDateString, getShortDateString } from "@/helpers/helper";

export default {
  name: "ScienceWorksList",
  components: {DocSignaturesInfo, FindUser},
  data() {
    return {
      service: new DocService(),
      Enum: Enum,
      loginedUser: null,
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),

      visibility: {
        documentInfoSidebar: false,
      },

      loading: false,
      tableLoading: false,

      documents: [],
      currentDocument: null,
      total: 0,
      first: 0,
      page: 0,
      rows: 10,

      filter: {
        applied: false,
        author: [],
        status: null,
        years: [],
      },

      tempFilter: {
        applied: false,
        author: [],
        status: null,
        years: [],
      },

      statuses: [Enum.StatusesArray.StatusCreated, Enum.StatusesArray.StatusInapproval, Enum.StatusesArray.StatusApproved,
        Enum.StatusesArray.StatusRevision, Enum.StatusesArray.StatusSigning, Enum.StatusesArray.StatusSigned],

      mainMenu: [
        {
          label: this.$t("scienceWorks.buttons.card"),
          icon: "fa-regular fa-address-card",
          command: () => { this.openDocument() },
          disabled: () => !this.currentDocument,
        },
        {
          label: this.$t("scienceWorks.buttons.newList"),
          icon: "fa-solid fa-plus",
          command: () => { this.newDocument() },
        },
      ],
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    let oldPath = this.$router.options.history.state.forward;
    if (oldPath && oldPath.indexOf('/documents/scienceWorksList/') === 0) {
      let filter = localStorage.getItem('scienceWorksListFilter');
      if (filter) {
        this.filter = JSON.parse(filter);

        if (this.filter.years) {
          this.filter.years.forEach((value, index, array) => {
            array[index] = new Date(value);
          });
        }
      }

      let currentPage = localStorage.getItem('scienceWorksListCurrentPage');
      if (currentPage) {
        currentPage = JSON.parse(currentPage);
        this.first = currentPage.first;
        this.page = currentPage.page;
        this.rows = currentPage.rows;
      }
    }

    this.getScienceWorksList();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);

    localStorage.setItem('scienceWorksListFilter', JSON.stringify(this.filter))
    localStorage.setItem('scienceWorksListCurrentPage', JSON.stringify({first: this.first, page: this.page, rows: this.rows}))
  },
  methods: {
    getShortDateString: getShortDateString,
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
    toggle(ref, event) {
      if (ref === 'filterOverlayPanel') {
        this.tempFilter = JSON.parse(JSON.stringify(this.filter));
        if (this.tempFilter.years) {
          this.tempFilter.years.forEach((value, index, array) => {
            array[index] = new Date(value);
          });
        }
      }

      this.$refs[ref].toggle(event);
    },
    onPage(event) {
      this.first = event.first;
      this.page = event.page;
      this.rows = event.rows;
      this.getScienceWorksList();
    },
    openDocument() {
      if (this.currentDocument) {
        this.$router.push('/documents/scienceWorksList/' + this.currentDocument.uuid);
      }
    },
    getScienceWorksList() {
      this.tableLoading = true;

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        docType: this.Enum.DocType.ScienceWorksList,
        filter: {
          status: this.filter.status && this.filter.status.length > 0 ? this.filter.status : null,
          author: this.filter.author.length > 0 && this.filter.author[0] ? this.filter.author[0].userID : null,
          years: this.filter.years && this.filter.years.length > 0 ? this.filter.years : null,
        },
      }).then(res => {
        this.documents = res.data.documents
        this.total = res.data.total
        this.currentDocument = null

        this.tableLoading = false
      }).catch(err => {
        this.documents = []
        this.total = 0
        this.currentDocument = null

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      });
    },
    deleteFile() {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          this.loading = true;

          this.service.documentDeleteV2({
            uuid: this.currentDocument.uuid,
          }).then(res => {
            this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
            this.getScienceWorksList();

            this.loading = false;
          }).catch(err => {
            if (err.response && err.response.status == 401) {
              this.$store.dispatch("logLout")
            } else if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          })
        },
      });
    },
    getFullname(user) {
      let name = '';

      if (!user) {
        return name;
      }

      if (this.$i18n.locale === 'en' && this.validString(user.thirdnameEn) && this.validString(user.firstnameEn)) {
        name = user.thirdnameEn + ' ' + user.firstnameEn;

        if (this.validString(user.lastnameEn)) {
          name += ' ' + user.lastnameEn;
        }

        return name;
      }

      name = user.thirdName + ' ' + user.firstName;

      if (this.validString(user.lastName)) {
        name += ' ' + user.lastName;
      }

      return name;
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    showMySign(stages) {
      if (!stages || stages.length < 1) {
        return false;
      }

      for (let i = 0; i < stages.length; i++) {
        let nextStage = true;

        for (let j = 0; j < stages[i].users.length; j++) {
          if (stages[i].users[j].userID === this.loginedUser.userID) {
            return true;
          }

          if (stages[i].usersApproved[j] === 0) {
            nextStage = false;
          }
        }

        if (!nextStage) {
          break;
        }
      }

      return false;
    },
    greenMySign(stages) {
      if (!stages || stages.length < 1) {
        return false;
      }

      let green = true;

      for (let i = 0; i < stages.length; i++) {
        let nextStage = true;

        for (let j = 0; j < stages[i].users.length; j++) {
          if (stages[i].users[j].userID === this.loginedUser.userID) {
            if (stages[i].usersApproved[j] === 0) {
              green = false;
            }
          }

          if (stages[i].usersApproved[j] === 0) {
            nextStage = false;
          }
        }

        if (!nextStage) {
          break;
        }
      }

      return green;
    },
    saveFilter() {
      this.filter = JSON.parse(JSON.stringify(this.tempFilter));
      this.filter.applied = true;
    },
    clearFilter() {
      this.filter = {
        applied: false,
        author: [],
        status: null,
        years: [],
      };
    },
    newDocument() {
      this.loading = true;

      this.service.createDocumentV2({
        docType: this.Enum.DocType.ScienceWorksList,
      }).then(res => {
        this.loading = false;

        this.$router.push('/documents/scienceWorksList/' + res.data.uuid)
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false;
      });
    },
  }
}
</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
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
.status-status_created {
  background: #6c757d;
  color: #fff;
}
.status-status_signing {
  background: #17a2b8;
  color: #fff;
}
.status-status_signed {
  background: #28a745;
  color: #fff;
}
.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}
.status-status_approved {
  background: #007bff;
  color: #ffffff;
}
.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}
.signed {
  color: #42855B;
}
.not-signed {
  color: #a6a6a6;
}
:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>

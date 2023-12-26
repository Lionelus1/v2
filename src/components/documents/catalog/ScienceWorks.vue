<template>
  <ProgressBar v-if="loading" mode="indeterminate" class="progress-bar"/>
  <h3>{{ $t("scienceWorks.title") }}</h3>
  <BlockUI :blocked="loading" class="card">
    <Toolbar class="p-1">
      <template #start>
        <div class="flex flex-wrap gap-2">
          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                  @click="openDocument" :disabled="!currentDocument">
            <i class="fa-regular fa-address-card" /> &nbsp;{{ $t("scienceWorks.buttons.card") }}</Button>
          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                  @click="(event) => this.$refs.newPublicationMenu.toggle(event)">
            <i class="fa-solid fa-plus" /> &nbsp;{{ $t("scienceWorks.buttons.newPublication") }}</Button>
<!--          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"-->
<!--                  @click="open('generateListDialog')">-->
<!--            <i class="fa-solid fa-print" /> &nbsp;{{ $t("scienceWorks.buttons.generateListDialog") }}</Button>-->
        </div>
      </template>
      <template #end>
        <div class="flex flex-wrap gap-2">
          <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
                  @click="(event) => this.$refs.koksnvoMenu.toggle(event)">
            <i class="fa-solid fa-book" /> &nbsp;{{ $t("scienceWorks.buttons.koksnvo") }}</Button>
          <Button class="align-items-center" :class="{'p-button-success': filter.applied, 'p-button-info': !filter.applied}"
                  style="padding: 0.25rem 1rem;" @click="toggle('filterOverlayPanel', $event)">
            <i class="fa-solid fa-filter" /> &nbsp;{{ $t("scienceWorks.buttons.filter") }}</Button>
        </div>
      </template>
    </Toolbar>
    <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total" :first="first"
               :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
               scrollable scrollHeight="flex" v-model:selection="currentDocument" selectionMode="single"
               :rowHover="true" stripedRows class="flex-grow-1" @page="onPage">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column :header="$t('scienceWorks.columns.name')" style="min-width: 250px;">
        <template #body="{data}">
          {{ getScienceWorkName(data) }}
        </template>
      </Column>
      <Column :header="$t('scienceWorks.columns.type')" style="min-width: 150px;">
        <template #body="{data}">
          {{ getScienceWorkType(data) }}
        </template>
      </Column>
      <Column :header="$t('scienceWorks.columns.author')" style="min-width: 150px;">
        <template #body="{data}">
          {{ getFullname(data.owner) }}
        </template>
      </Column>
      <Column :header="$t('scienceWorks.columns.year')" style="min-width: 50px;">
        <template #body="{data}">
          {{ getYear(data) }}
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
            <Button v-if="(data.docHistory.stateId === Enum.CREATED.ID || data.docHistory.stateId === Enum.REVISION.ID)
                    && loginedUser.userID === data.creatorID" @click="currentDocument=data;openDocument()"
                    class="p-button-text p-button-info p-1">
              <i class="fa-solid fa-pen fa-xl"></i>
            </Button>
            <Button @click="currentDocument=data;open('documentInfoSidebar')"
                    class="p-button-text p-button-info p-1">
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
        <label>{{ $t('scienceWorks.filter.documentName') }}</label>
        <InputText type="text" v-model="tempFilter.name"/>
      </div>
      <div class="field">
        <label>{{ $t('scienceWorks.filter.author') }}</label>
        <FindUser v-model="tempFilter.author" :max="1" searchMode="local" ></FindUser>
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
                getScienceWorks()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('scienceWorks.buttons.search')"
                @click="saveFilter();toggle('filterOverlayPanel', $event);
                getScienceWorks()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
  <!-- documentInfoSidebar -->
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll" @hide="getScienceWorks">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!-- newPublicationDialog -->
  <Dialog :header="$t('scienceWorks.buttons.newPublication')" :modal="true"
    v-model:visible="visibility.newPublicationDialog" style="width: 30vw">
    <div class="field grid">
      <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("scienceWorks.publicationType") }}</label>
      <div class="col-12 md:col-10">
        <Dropdown v-model="newPublicationType" :options="pubTypes" class="w-full">
          <template #value="slotProps">
            <template v-if="slotProps.value">
              {{ $t('scienceWorks.types.' + slotProps.value) }}
            </template>
          </template>
          <template #option="slotProps">
            {{ $t('scienceWorks.types.' + slotProps.option) }}
          </template>
        </Dropdown>
      </div>
    </div>
    <template #footer>
      <Button :disabled="!newPublicationType" :label="$t('common.add')" @click="newDocument()" />
      <Button class="p-button-secondary" :label="$t('common.cancel')" @click="close('newPublicationDialog')" />
    </template>
  </Dialog>
  <!-- generateListDialog -->

  <!-- newPublicationMenu -->
  <Menu ref="newPublicationMenu" :model="newPublicationMenu" :popup="true" />
  <!-- newPublicationMenu -->
  <Menu ref="koksnvoMenu" :model="koksnvoMenu" :popup="true" />
  <!-- koksnvoEditionsSidebar -->
  <Sidebar v-model:visible="visibility.koksnvoEditionsSidebar" :title="$t('science.publicationsRecommendedQACFSHE')" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <TabView>
      <TabPanel :header="$t('science.publicationsRecommendedQACFSHE')">
        <Button @click="koksnvo.edition=null;open('newKoksnvoEdition')"><i class="fa-solid fa-plus mr-1"></i>{{ $t('common.add') }}</Button>
        <DataTable :loading="koksnvo.loading" @page="koksnvoEditionsOnPage($event)" :value="koksnvo.editions"
                   :paginator="true" :rows="10" :totalRecords="koksnvo.editionsTotal" :lazy="true">
          <Column field="name_kz" :header="$t('common.nameInQazaq')"></Column>
          <Column field="name_ru" :header="$t('common.nameInRussian')"></Column>
          <Column field="name_en" :header="$t('common.nameInEnglish')"></Column>
          <Column>
            <template #body="slotProps">
              <Button class="mr-2" @click="koksnvo.edition=slotProps.data;open('newKoksnvoEdition')">
                <i class="fas fa-edit"></i>
              </Button>
              <Button @click="koksnvo.edition=slotProps.data;deleteKoksnvoEdition()">
                <i class="fas fa-trash-alt"></i>
              </Button>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
      <TabPanel :header="$t('science.requestsToAdd')">
        <DataTable :value="koksnvo.requests" :paginator="true" @page="koksnvoRequestsOnPage($event)"
                   :rows="10" :totalRecords="koksnvo.requestsTotal" :lazy="true">
          <Column :field="'name_'+($i18n.locale)" :header="$t('science.edition')"></Column>
          <Column :header="$t('science.requester')">
            <template #body="slotProps">
              {{ getFullname(slotProps.data.initiator) }}
            </template>
          </Column>
          <Column field="create_date" :header="$t('common.date')"></Column>
          <Column :field="'status.name_'+($i18n.locale)" :header="$t('contracts.columns.status')"></Column>
          <Column>
            <template #body="slotProps">
              <Button v-if="slotProps.data.status.code == 'submitted'" class="pi pi-arrow-right" @click="koksnvo.request=slotProps.data;open('koksnvoRequest')"></Button>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </Sidebar>
  <!-- newKoksnvoEdition -->
  <Sidebar v-model:visible="visibility.newKoksnvoEdition" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <EditionFormEdit :propsEdition="koksnvo.edition" @editions="handleNewKoksnvoEdition; close('newKoksnvoEdition')"/>
  </Sidebar>
  <!-- koksnvoRequest -->
  <Sidebar v-model:visible="visibility.koksnvoRequest" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <EditionRequestFormEdit :propsEdition="koksnvo.request" @editions="handleKoksnvoRequest; close('koksnvoRequest')"/>
  </Sidebar>
  <!-- myKoksnvoRequests -->
  <Sidebar v-model:visible="visibility.myKoksnvoRequests" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <MyEditionRequestView />
  </Sidebar>
</template>
<script>
import Enum from "@/enum/docstates/index";

import { DocService } from "@/service/doc.service";
import { ScienceService } from "@/service/science.service";
import DocSignaturesInfo from "@/components/DocSignaturesInfo";
import FindUser from "@/helpers/FindUser";
import EditionFormEdit from "@/components/science/edit/EditionFormEdit.vue";
import EditionRequestFormEdit from "@/components/science/edit/EditionRequestFormEdit.vue";
import MyEditionRequestView from "@/components/science/view/MyEditionRequestView.vue";

export default {
  name: 'ScienceWorks',
  components: {MyEditionRequestView, EditionRequestFormEdit, EditionFormEdit, DocSignaturesInfo, FindUser },
  props: { },
  data() {
    return {
      service: new DocService(),
      scienceService: new ScienceService(),
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
        newPublicationDialog: false,
        generateListDialog: false,
        koksnvoEditionsSidebar: false,
        newKoksnvoEdition: false,
        koksnvoRequest: false,
        myKoksnvoRequests: false,
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
        name: null,
        author: [],
        status: null,
        years: [],
      },

      tempFilter: {
        applied: false,
        name: null,
        author: [],
        status: null,
        years: [],
      },

      statuses: [
        {
          id: 'status_created',
          nameRu: "Создан",
          nameKz: "Құрылды",
          nameEn: "Created",
          value: "created"
        },
        {
          id: 'status_inapproval',
          nameRu: "На согласовании",
          nameKz: "Келісуде",
          nameEn: "In approval",
          value: "inapproval"
        },
        {
          id: 'status_approved',
          nameRu: "Согласован",
          nameKz: "Келісілді",
          nameEn: "Approved",
          value: "approved"
        },
        {
          id: 'status_revision',
          nameRu: "На доработке",
          nameKz: "Түзетуде",
          nameEn: "Revision",
          value: "revision"
        },
        {
          id: 'status_signing',
          nameKz: "Қол қоюда",
          nameRu: "На подписи",
          nameEn: "Signing",
          value: "signing"
        },
        {
          id: 'status_signed',
          nameRu: "Подписан",
          nameKz: "Қол қойылды",
          nameEn: "Signed",
          value: "signed"
        },
      ],

      newPublicationType: null,
      pubTypes: [Enum.ScienceWorkType.Article, Enum.ScienceWorkType.Monograph, Enum.ScienceWorkType.PublicationKOKSNVO],
      newPublicationMenu: [
        {
          label: this.$t('scienceWorks.menu.newArticle'),
          command: () => { this.open('newPublicationDialog') },
        },
        {
          label: this.$t('scienceWorks.menu.importFromPlatonus'),
          command: () => { this.importFromPlatonus(); },
        },
        {
          label: this.$t('scienceWorks.menu.importFromScopus'),
          command: () => { this.importFromScopus(); },
        }
      ],
      koksnvoMenu: [
        {
          label: this.$t('scienceWorks.menu.newPublicationsKoksnvo'),
          command: () => { this.open('koksnvoRequest'); },
        },
        {
          label: this.$t('scienceWorks.menu.publicationsKoksnvo'),
          command: () => { this.open('koksnvoEditionsSidebar'); this.getKoksnvoEditions(); this.getKoksnvoRequests() },
        },
        {
          label: this.$t('scienceWorks.menu.myRequests'),
          command: () => { this.open('myKoksnvoRequests'); },
        },
      ],

      koksnvo: {
        loading: false,

        editions: [],
        edition: null,
        editionsTotal: 0,
        editionsPage: 0,
        editionsRows: 10,

        requests: [],
        request: null,
        requestsTotal: 0,
        requestsPage: 0,
        requestsRows: 10,
      }
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    this.$emit('apply-flex', true);

    let oldPath = this.$router.options.history.state.forward;
    if (oldPath && oldPath.indexOf('/documents/scienceWorks/') === 0) {
      let filter = localStorage.getItem('scienceWorksFilter');
      if (filter) {
        this.filter = JSON.parse(filter);

        if (this.filter.years) {
          this.filter.years.forEach((value, index, array) => {
            array[index] = new Date(value);
          });
        }
      }

      let currentPage = localStorage.getItem('scienceWorksCurrentPage');
      if (currentPage) {
        currentPage = JSON.parse(currentPage);
        this.first = currentPage.first;
        this.page = currentPage.page;
        this.rows = currentPage.rows;
      }
    }

    this.getScienceWorks();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);

    localStorage.setItem('scienceWorksFilter', JSON.stringify(this.filter))
    localStorage.setItem('scienceWorksCurrentPage', JSON.stringify({first: this.first, page: this.page, rows: this.rows}))
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
      this.getScienceWorks();
    },
    openDocument() {
      if (this.currentDocument) {
        this.$router.push('/documents/scienceWorks/' + this.currentDocument.uuid)
      }
    },
    getScienceWorks() {
      this.tableLoading = true;

      this.service.getDocumentsV2({
        page: this.page,
        rows: this.rows,
        docType: this.Enum.DocType.ScienceWorks,
        filter: {
          name: this.filter.name && this.filter.name.length > 0 ? this.filter.name : null,
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
            this.getScienceWorks();

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
    getScienceWorkName(doc) {
      if (!doc.newParams || !doc.newParams.publicationName ||
          !this.validString(doc.newParams.publicationName.value)) {
        return '';
      }

      return doc.newParams.publicationName.value;
    },
    getScienceWorkType(doc) {
      if (!doc.newParams || !doc.newParams.scienceWorkType ||
          !this.validString(doc.newParams.scienceWorkType.value)) {
        return '';
      }

      if (![this.Enum.ScienceWorkType.Article, this.Enum.ScienceWorkType.Monograph, this.Enum.ScienceWorkType.ScopusArticle,
        this.Enum.ScienceWorkType.PublicationKOKSNVO].includes(doc.newParams.scienceWorkType.value)) {
        return '';
      }

      return this.$t('scienceWorks.types.' + doc.newParams.scienceWorkType.value);
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
    getYear(doc) {
      if (!doc.newParams || !doc.newParams.publicationDate ||
          !doc.newParams.publicationDate.value) {
        return '';
      }

      return new Date(doc.newParams.publicationDate.value).getFullYear();
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
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    saveFilter() {
      this.filter = JSON.parse(JSON.stringify(this.tempFilter));
      this.filter.applied = true;
    },
    clearFilter() {
      this.filter = {
        applied: false,
        name: null,
        author: [],
        status: null,
        years: [],
      };
    },
    importFromPlatonus() {
      this.loading = true;

      this.service.importScienceWorksFromPlatonus().then(res => {
        this.loading = false;

        this.showMessage("success", this.$t('common.success'), this.$t('scienceWorks.messages.successPlatonus'))
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
    importFromScopus() {
      this.loading = true;

      this.service.importScienceWorksFromScopus().then(res => {
        this.loading = false;

        this.showMessage("success", this.$t('common.success'), this.$t('scienceWorks.messages.successScopus'))
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
    newDocument() {
      this.loading = true;

      this.service.createDocumentV2({
        docType: this.Enum.DocType.ScienceWorks,
        scienceWorkType: this.newPublicationType,
      }).then(res => {
        this.close('newPublicationDialog');
        this.loading = false;

        this.$router.push('/documents/scienceWorks/' + res.data.uuid)
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
    koksnvoEditionsOnPage(event) {
      this.koksnvo.editionsPage = event.page;
      this.koksnvo.editionsRows = event.rows;

      this.getKoksnvoEditions();
    },
    getKoksnvoEditions() {
      this.koksnvo.loading = true;

      this.scienceService.getScienceEditions({
        id: null,
        page: this.koksnvo.editionsPage,
        rows: this.koksnvo.editionsRows,
      }).then(res => {
        this.koksnvo.editions = res.data.editions;
        this.koksnvo.editionsTotal = res.data.total;

        this.koksnvo.loading = false;
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.koksnvo.loading = false;
      });
    },
    deleteKoksnvoEdition() {
      this.koksnvo.loading = true;

      this.scienceService.deleteScienceEdition({
        id: this.koksnvo.edition.id,
      }).then(res => {
        this.showMessage('success', this.$t('common.success'));

        this.koksnvo.loading = false;
        this.getKoksnvoEditions();
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.koksnvo.loading = false;
      });
    },
    handleNewKoksnvoEdition(data) {
      if (data) {
        this.getKoksnvoEditions();
      }
    },
    koksnvoRequestsOnPage(event) {
      this.koksnvo.requestsPage = event.page;
      this.koksnvo.requestsRows = event.rows;

      this.getKoksnvoRequests();
    },
    getKoksnvoRequests() {
      this.koksnvo.loading = true;

      this.scienceService.getScienceEditionsRequest({
        page: this.koksnvo.requestsPage,
        rows: this.koksnvo.requestsRows,
      }).then(res => {
        this.koksnvo.requests = res.data.editions;
        this.koksnvo.requestsTotal = res.data.total;

        this.koksnvo.loading = false;
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.koksnvo.loading = false;
      });
    },
    handleKoksnvoRequest(data) {
      if (data) {
        this.getKoksnvoRequests();
        this.getKoksnvoEditions();
      }
    },
  }
}
</script>
<style scoped>
.progress-bar {
  position: absolute;
  height: 0.5rem;
  width: 100%;
  z-index: 1102;
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
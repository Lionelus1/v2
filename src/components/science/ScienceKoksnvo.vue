<template>
<div id="carddiv" class="grid">
  <div class="col-12">
    <TitleBlock :title="$t('dissertation.swList')" :show-back-button="true"/>
  </div>

  <div class="flex items-center justify-end">
      <Button class="mr-1"><i class="fa-solid fa-plus mr-1"></i> Добавить публикацию</Button>

      <Button class="align-items-center mr-1 ml-auto" :class="{'p-button-success': filter.applied, 'p-button-info': !filter.applied} " style="padding: 0.25rem 1rem;">
        <i class="fa-solid fa-filter" /> &nbsp;{{ $t("contracts.filter.button") }}
      </Button>
    
      <Button class="mr-1" @click="openKoksnvo">{{$t('science.publicationsRecommendedQACFSHE')}}</Button>

      <Button class="mr-1" @click="openMyRequests">{{$t('science.myRequests')}}</Button>
  </div>

</div>

  <!-- Мой Запросы-->
  <Sidebar v-model:visible="myRequestsDialogVisible" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <MyEditionRequestView />
  </Sidebar>

  <!-- Издания рекомендуемые КОКСНВО -->
  <Sidebar v-model:visible="addEditionDialogVisible" :title="$t('science.publicationsRecommendedQACFSHE')" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <TabView>
      <TabPanel :header="$t('science.publicationsRecommendedQACFSHE')">
        <Button @click="openAddEdition"><i class="fa-solid fa-plus mr-1"></i>{{ $t('common.add') }}</Button>

        <DataTable :loading="loading" @page="editionTableOnPage($event)" :value="editions" 
        :paginator="true" :rows="10" :totalRecords="total" :lazy="true">
          <Column field="name_kz" :header="$t('common.nameInQazaq')"></Column>
          <Column field="name_ru" :header="$t('common.nameInRussian')"></Column>
          <Column field="name_en" :header="$t('common.nameInEnglish')"></Column>
          <Column>
            <template  #body="slotProps">
              <Button class="mr-2" @click="edition=slotProps.data;editEdition()">
                <i class="fas fa-edit"></i>
              </Button>
              <Button @click="edition=slotProps.datadeleteEdition">
                <i class="fas fa-trash-alt"></i> 
              </Button>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel :header="$t('science.requestsToAdd')">
        <DataTable :value="editionsRequest" :paginator="true" @page="editionTableOnPageEditionRequest($event)" 
        :rows="10" :totalRecords="totalRequest" :lazy="true">
          <Column :field="'name_'+($i18n.locale)" :header="$t('science.edition')"></Column>
          <Column :header="$t('science.requester')">
            <template #body="slotProps">
              {{ getFullName(slotProps.data.initiator) }}
          </template>
          </Column>
          <Column field="create_date" :header="$t('common.date')"></Column>
          <Column :field="'status.name_'+($i18n.locale)" :header="$t('contracts.columns.status')">
          </Column>
          <Column>
            <template #body="slotProps">
              <Button v-if="slotProps.data.status.code == 'submitted'" class="pi pi-arrow-right" @click="editionRequest=slotProps.data;viewRequest()"></Button>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </Sidebar>

  <Sidebar v-model:visible="addEditionRequestPopupVisible" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <EditionRequestFormEdit :propsEdition="editionRequest" @editions="handleEditionsRequestEvent"/>
  </Sidebar>

  <Sidebar v-model:visible="addEditionPopupVisible" position="right" class="p-sidebar-lg"  style="overflow-y: scroll">
    <EditionFormEdit :propsEdition="edition" @editions="handleEditionsEvent"/>
  </Sidebar>

  <div v-if="!myRequests">
    <EditionRequestFormEdit :propsEdition="edition" @editions="handleEditionsRequestEvent"/>
  </div>
    
</template>

<script>
  import EditionFormEdit from "./edit/EditionFormEdit"
  import EditionRequestFormEdit from "./edit/EditionRequestFormEdit.vue";
  import MyEditionRequestView from "./view/MyEditionRequestView.vue";
  import {ScienceService} from "@/service/science.service"
  import {findRole} from "@/config/config";
  export default {
    components: {EditionFormEdit, EditionRequestFormEdit, MyEditionRequestView},
    emits: ['editions'],
    data() {
      return {
        myRequestsDialogVisible: false,
        addEditionDialogVisible: false,
        addEditionPopupVisible: false,
        addEditionRequestPopupVisible: false,
        myRequests: [], 
        recommendedEditions: [],
        addRequests: [], 
        newEdition: {
          nameKazakh: '',
          nameRussian: '',
          nameEnglish: '',
        },
        editions: [],
        edition: null,
        editionsRequest: [],
        editionRequest: {},
        total: null,
        totalRequest: null,
        filter: {
          visible: false,
          applied: false,
          fullName: null,
          areaOfInterest: null,
        },
        scienceService: new ScienceService(),
        lazyParamsEdition: {
          page: 0,
          rows: 10,
        },
        lazyParamsEditionRequest: {
          page: 0,
          rows: 10,
        },
        loading: false,

      };
    },
    mounted() {
      this.getScienceEditions()
      this.getScienceEditionsRequest()

      this.emitter.on('editions', (data) => {
        if (data == true) {
          this.getScienceEditionsRequest();
          this.addEditionPopupVisible = false
        } 
    });
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
      openMyRequests() {
        this.myRequestsDialogVisible = true;
      },
      openKoksnvo() {
        this.editionRequest = null
        this.addEditionDialogVisible = true;
      },
      openAddEdition() {
        this.edition = null
        this.addEditionPopupVisible = true;
      },
      editEdition() {
        this.addEditionPopupVisible = true;
      },
      deleteEdition() {
        const req = {
          id: this.edition.id || null
        }

        this.scienceService.deleteScienceEdition(req).then(res  => {
          this.showMessage('success', this.$t('common.success'));
           this.getScienceEditions()
      }).catch(err => {
        this.loading = false;
        this.file = null
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
        })
      },
      viewRequest() {
        if (this.editionRequest != null) {
          this.addEditionRequestPopupVisible = true 
        }
      },
      saveEdition() {
      },
      getScienceEditions() {
        const req = {
          id: null,
          page: this.lazyParamsEdition.page,
          rows: this.lazyParamsEdition.rows,
        }

        this.scienceService.getScienceEditions(req).then(res => {
          this.editions = res.data.editions
          this.total = res.data.total
        }).catch(err => {
          if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          } else {
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
          }
        })
      },
      editionTableOnPage(event) {
        this.lazyParamsEdition = event;
        this.getScienceEditions();
      },
      editionTableOnPageEditionRequest(event) {
        this.lazyParamsEditionRequest = event;
        this.getScienceEditionsRequest();
      },
      handleEditionsRequestEvent(data) {
        if (data === true) {
          this.getScienceEditionsRequest()
          this.addEditionRequestPopupVisible = false
          this.addEditionPopupVisible = false
        }
      },
      handleEditionsEvent(data) {
        if (data === true) {
          this.getScienceEditions()
          this.addEditionPopupVisible = false
        }
      },
      getScienceEditionsRequest() {
        const req = {
          page: this.lazyParamsEditionRequest.page,
          rows: this.lazyParamsEditionRequest.rows,
        }

        this.scienceService.getScienceEditionsRequest(req).then(res => {
          this.editionsRequest = res.data.editions
          this.totalRequest = res.data.total
        }).catch(err => {
          if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          } else {
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
          }
        })
      },
      getFullName(data) {
        let fullName = "";

        if (data.firstName) {
          fullName += data.firstName + " ";
        }

        if (data.lastName) {
          fullName += data.lastName + " ";
        }

        if (data.thirdName) {
          fullName += data.thirdName;
        }

        return fullName.trim();
      },
    },
  };

</script>

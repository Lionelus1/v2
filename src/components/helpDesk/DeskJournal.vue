<template>
  <div class="col-12">
    <h3>{{ $t('helpDesk.title') }}</h3>
    <ToolbarMenu :data="mainMenu" @search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filtered">
      <template #end>
        <Button class="align-items-center" :class="{
          'p-button-success p-button-outlined': filter.applied,
          'p-button-secondary p-button-text': !filter.applied
        }">
        </Button>
      </template>
    </ToolbarMenu>
    <BlockUI :blocked="loading" class="card">
      <!-- <Button :label="$t('common.createNew')" icon="pi pi-plus" @click="openBasic" class="ml-2"/> -->
      <Dialog :header="$t('helpDesk.application.applicationName')" v-model:visible="visibility.newPublicationDialog" :style="{ width: '450px' }"
        class="p-fluid">
        <div class="field">
          <label>{{ $t('helpDesk.application.requestReason') }}</label>
          <Dropdown v-model="selectedDirection" :options="directions" optionLabel="name" :placeholder="$t('common.select')" />
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"
            @click="close('newPublicationDialog')" />
          <Button :label="$t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2" :disabled="!selectedDirection"
            @click="createHelpDesk" />

        </template>
      </Dialog>
      <div>
        <DataTable :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true" v-model:filters="filters"
          filterDisplay="menu" :loading="loading" responsiveLayout="scroll" :paginator="true" selectionMode="single" stripedRows class="p-datatable-sm"
          :rows="10" :totalRecords="total" @page="onPage" v-model:selection="currentDocument" :first="first" scrollable scrollHeight="flex" @lazy="true"
          :globalFilterFields="['creationTime', 'priority', 'status', 'requestReason', 'categoryApplication', 'responsible']">


          <template #empty> {{ $t('common.noData') }}</template>
          <template #loading> {{ $t('common.loading') }}</template>
          <Column field="content" :header="$t('contracts.columns.number')" sortable>
          </Column>

          <Column field="create_date" :header="$t('helpDesk.creationTime')">
            <template>

            </template>
          </Column>

          <Column field="priority" :header="$t('helpDesk.priority')">

          </Column>
          <Column field="status" :header="$t('common.status')">
            <!-- <template #body="{ data }">
            <span :class="'customer-badge status-' + data.doc_info">
              {{ getDocStatus(data.doc_info.docHistory.stateEn) }}
          </span>
          </template> -->
          </Column>

          <Column field="requestReason" :header="$t('helpDesk.application.requestReason')">
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.category.name_kz : $i18n.locale === "ru" ? data.category.name_ru :
                data.category.name_en }}</a>
            </template>
          </Column>

          <Column field="category" :header="$t('helpDesk.application.categoryApplication')">
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.category.name_kz : $i18n.locale === "ru" ? data.category.name_ru :
                data.category.name_en }}</a>
            </template>
          </Column>

          <Column field="responsible" :header="$t('helpDesk.responsible')">
            <template>
              <span></span>
            </template>
          </Column>
          <Column style="min-width: 50px;">
            <template #body="{ data }">
              <div class="flex flex-wrap column-gap-1 row-gap-1">
                <Button class="p-button-text p-button-warning p-1 mr-2" @click="currentDocument = data; openDocument()">
                  <i class="fa-solid fa-pencil fa-xl"></i>
                </Button>
                <Button class="p-button-text p-button-danger p-1 mr-2" @click="currentDocument = data; deleteFile()">
                  <i class="fa-solid fa-trash-can fa-xl"></i>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </BlockUI>
  </div>
</template>
  
<script>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import { getHeader, smartEnuApi } from "@/config/config";
import axios from 'axios';


export default {
  components: {
    ToolbarMenu
  },
  data() {
    return {
      request: {
        id: null,
        sender_id: null,
        name_kz: "",
        name_ru: "",
        name_en: "",
        description_kz: "",
        description_ru: "",
        description_en: "",
        category: this.selectedDirection,
        uuid: null,
        is_saved: 0,
        local: null
      },
      docStatus: [
        { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
        { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
        { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
        { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
        { name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
        { name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing" },
        { name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed" },
        { name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval" },
        { name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated" },
        { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
      ],
      visibility: {
        Request: false,
        newPublicationDialog: false,
      },
      uuid: null,
      data: [],
      selectedDirection: null,
      currentDocument: null,
      loading: false,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,

      filter: {
        applied: false,
        name: null,
        author: [],
        status: null,
        years: [],
      },
      directions: null,
      showModal: false,
      total: 0,
      selectedPlanType: null,
      lazyParams: {
        page: 0,
        rows: 10,
      },
      filtered: false,
      sort: null
    }
  },
  computed: {
    mainMenu() {
      return [
        {
          label: this.$t("scienceWorks.buttons.card"),
          icon: "pi pi-fw pi-save",
          command: () => { this.openDocument() },
          disabled: !this.currentDocument,
        },
        {
          label: this.$t('scienceWorks.menu.newArticle'),
          icon: "fa-solid fa-plus",
          command: () => { this.open('newPublicationDialog') },

        }
      ]
    }
  },
  created() {
    this.getTicket()
    this.requstLocal()
    this.getCategory()
  },
  methods: {
    open(name) {
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
    },
    openBasic() {
      this.showModal = true;
    },
    closeBasic() {
      this.selectedDirection = null
      this.showModal = false;
    },
    getDocStatus(code) {
      const foundStatus = this.docStatus.find(status => status.code === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    requstLocal() {
      switch (this.$i18n.locale) {
        case "kz":
          this.request.local = 1;
          break;
        case "ru":
          this.request.local = 2;
          break;
        case "en":
          this.request.local = 3;
          break;
        default:
          this.request.local = 1;
          break;
      }
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getTicket()
    },
    openDocument() {
      if (this.currentDocument) {
        if (this.currentDocument.category.code != 'course_application') {
          this.$router.push({ name: 'Request', params: { uuid: this.currentDocument.uuid, id: this.currentDocument.id } })
        } else {
          this.$router.push({ name: 'CourseRegistration', params: { uuid: this.currentDocument.uuid, id: this.currentDocument.id } })
        }
      }
    },
    getCategory() {
      this.selectedDirection = null
      axios.post(smartEnuApi + "/helpdesk/category/get",
        {
          ID: null,
          SearchText: null,
          Page: 0,
          Rows: 10,
        }, { headers: getHeader(), })
        .then((res) => {
          this.currentDocument = null
          this.directions = res.data.category.map(item => {
            return {
              id: item.id,
              name: item.name_kz,
              code: item.code
            };
          });

          this.request.category = res.data.category.id
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("common.message.saveError"),
            life: 3000,
          });
        });
    },
    createHelpDesk() {
      this.request.category = this.selectedDirection



      axios.post(smartEnuApi + "/helpdesk/ticket/create", this.request, { headers: getHeader() })
        .then(res => {
          this.uuid = res.data

          this.close('newPublicationDialog')
          this.loading = false;
          if (this.selectedDirection.code != 'course_application') {
            this.$router.push({ name: 'Request', params: { uuid: this.uuid }, state: { isCreated: 1 } })
          } else {
            this.$router.push({ name: 'CourseRegistration', params: { uuid: this.uuid, isCreated: 1 }, state: { isCreated: 1 } })
          }
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
    getTicket() {
      axios.post(smartEnuApi + "/helpdesk/ticket/get",
        {
          ID: null,
          search_text: null,
          page: this.lazyParams.page,
          rows: this.lazyParams.rows,
          uuid: null,
          is_saved: null
        }, { headers: getHeader(), })
        .then((res) => {
          this.data = res.data.ticket
          this.total = res.data.total
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("common.message.saveError"),
            life: 3000,
          });
        });
    },
    search(data) {
      alert(data)
    },
    toggleFilter(event) {
      this.sort = event
    }

  }
}
</script>
  
<style scoped lang="scss">
.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-5 {
    background: #B48B7D;
    color: #fff;
  }

  &.status-4 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.operational-plan {
    background-color: #3B82F6;
    color: #ffffff;
    font-weight: 500;
    border-radius: 3px;
  }

  &.simple-plan {
    background-color: #10b981;
    color: #ffffff;
    font-weight: 500;
    border-radius: 3px;
  }
}
</style>
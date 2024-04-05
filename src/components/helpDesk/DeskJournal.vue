<template>
  <div class="col-12">
    <h3>{{ t('helpDesk.title') }}</h3>
    <ToolbarMenu :data="mainMenu" @search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filter">//@search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filtered"
      <template #end>
        <Button class="align-items-center" :class="{'p-button-success p-button-outlined': filter.applied,
          'p-button-secondary p-button-text': !filter.applied}" @click="toggle('filterOverlayPanel', $event)">
          <i class="fa-solid fa-filter" /> &nbsp;{{ $t("scienceWorks.buttons.filter") }}</Button>
      </template>
    </ToolbarMenu>
    <BlockUI class="card">
      <Dialog :header="t('helpDesk.application.applicationName')" v-model:visible="visibility.newPublicationDialog" :style="{ width: '450px' }"
        class="p-fluid">
        <div class="field">
          <label>{{ t('helpDesk.application.categoryApplication') }}</label>
          <Dropdown v-model="selectedDirection"
                    :options="directions"
                    :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
          'name_en'" :placeholder="t('common.select')" />
          <div style="margin-top: 15px" v-if="selectedDirection?.code === 'course_application'">
            <label>{{ t('helpDesk.application.requestReason') }}</label>
            <Dropdown style="margin-top: 5px" v-model="selectedPosition"
                      :options="position"
                      :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
          'name_en'" :placeholder="t('common.select')"  />
          </div>
        </div>
        <template #footer>
          <Button :label="t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"
            @click="close('newPublicationDialog')" />
          <Button :label="t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2" :disabled="!selectedDirection || !selectedPosition"
            @click="createHelpDesk" />
        </template>
      </Dialog>
      <div>
        <DataTable :lazy="true" :loading="loading" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true"
          filterDisplay="menu" responsiveLayout="scroll" :paginator="true" selectionMode="single" stripedRows
          class="p-datatable-sm" :rows="10" :totalRecords="total" @page="onPage" v-model:selection="currentDocument" scrollable
          scrollHeight="flex" @lazy="true">
          <!-- :globalFilterFields="['columns.number','creationTime', 'status', 'requestReason', 'categoryApplication', 'responsible']" -->
          <template #empty> {{ t('common.noData') }}</template>
          <!-- <Column field="content" :header="t('contracts.columns.number')" sortable>
          </Column> -->

          <Column @click="openDocument" field="create_date" :header="t('helpDesk.creationTime')">
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ (formatDate(data.doc?.docHistory?.setDate) ? formatDate(data.doc?.docHistory?.setDate) : '') }}</a>
            </template>
          </Column>

          <Column field="status" :header="t('common.status')">
            <template #body="{ data }">
              <span :class="'customer-badge status-' + data.doc?.docHistory?.stateEn">
                {{ getDocStatus(data.doc?.docHistory?.stateEn) }}
              </span>
            </template>
          </Column>

          <Column field="requestReason" :header="t('helpDesk.application.requestReason')">
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.doc.newParams.selectedPosition.value.name_kz : $i18n.locale === "ru" ? data.doc.newParams.selectedPosition.value.name_ru :
                  data.doc.newParams.selectedPosition.value.name_en  }}</a>
            </template>
          </Column>

          <Column field="category" :header="t('helpDesk.application.categoryApplication')">
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.category.name_kz : $i18n.locale === "ru" ? data.category.name_ru :
      data.category.name_en }}</a>
            </template>
          </Column>

          <Column field="fullName" :header="t('web.logUser')" >
            <template #body="{ data }">
              <a href="javascript:void(0)">{{ data.doc.newParams.not_formal_student_info.value.fullName }}</a>
            </template>
          </Column>

          <Column style="min-width: 50px;">
            <template #body="{data}">
              <div v-if="data.doc?.uuid" class="flex flex-wrap column-gap-1 row-gap-1" style="margin-left: 30px">
                <Button @click="currentDocument=data.doc ;openSignInfo()"
                        v-if="data.doc.docHistory.stateId >= Enum.INAPPROVAL.ID" class="p-button-text p-button-info p-1">
                  <i class="fa-solid fa-eye fa-xl"></i>
                </Button>
              </div>
            </template>
          </Column>

<!--          <Column style="min-width: 50px;" v-if="!findRole(null, 'main_administrator')">-->
<!--            <template #body="{ data }">-->
<!--              <div class="flex flex-wrap column-gap-1 row-gap-1">-->
<!--                <Button class="p-button-text p-button-warning p-1 mr-2" @click="currentDocument = data; openDocument()">-->
<!--                  <i class="fa-solid fa-pencil fa-xl"></i>-->
<!--                </Button>-->
<!--                &lt;!&ndash; <Button class="p-button-text p-button-danger p-1 mr-2" @click="currentDocument = data; deleteFile()">-->
<!--                  <i class="fa-solid fa-trash-can fa-xl"></i>-->
<!--                </Button> &ndash;&gt;-->
<!--              </div>-->
<!--            </template>-->
<!--          </Column>-->
        </DataTable>
      </div>
    </BlockUI>
  </div>
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll" @hide="getHelpdeskDeskJournal">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import { HelpDeskService } from "../../service/helpdesk.service";
import { ref, computed, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { findRole } from "@/config/config";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Enum from "@/enum/docstates";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import {DocService} from "@/service/doc.service";


const { t, locale } = useI18n()
const store = useStore()
const toast = useToast()
const router = useRouter();
const docService = new DocService()
const service = new HelpDeskService()
const request = ref({
  id: null,
  sender_id: null,
  name_kz: "",
  name_ru: "",
  name_en: "",
  description_kz: "",
  description_ru: "",
  description_en: "",
  category: null,
  uuid: null,
  is_saved: 1,
  local: null

});
const showMessage = (severity, detail, life) => {
  toast.add({
    severity: severity,
    detail: detail,
    life: life || 3000,
  });
};

const position = ref([
  {name_kz: "Қосымша білім беру бағдарламасы", name_en: "Additional educational program", name_ru: "Дополнительная образовательная программа", code: "additional"},
  {name_kz: "Пререквизиттерді меңгеру", name_en: "Mastering prerequisites", name_ru: "Освоение пререквизитов", code: "mastering"},
  {name_kz: "Академиялық берешекті жою", name_en: "Liquidation of academic debt", name_ru: "Ликвидация академической задолженности", code: "liquidation"},
  {name_kz: "Ауысу ұпайларын көтеру (GPA)", name_en: "Increase in transferable points (GPA)", name_ru: "Повышение переводных баллов (GPA)", code: "increase"},
]);

const docStatus = ref([
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
]);
const visibility = ref({
  Request: false,
  newPublicationDialog: false,
  documentInfoSidebar: false
});
const selectedPosition = computed({
  get(){
    return store.state.selectedPosition
  },
  set(value){
    store.commit('SET_SELECTED_POSITION_DESK', value)
  }
})
const uuid = ref(null);
const isAdmin = findRole(null, 'main_administrator')
const data = ref([]);
const selectedDirection = ref(null);

const currentDocument = ref(null);

const loading = ref(false);
const filter = ref({
  applied: false,
  name: null,
  author: [],
  status: null,
  years: [],
});
const directions = ref(null);
const showModal = ref(false);
const total = ref(0);
const selectedPlanType = ref(null);
const lazyParams = ref({
  page: 0,
  rows: 10,
});

const filtered = ref(false);
const sort = ref(null);
const mainMenu = computed(() => [
  {
    label: t("scienceWorks.buttons.card"),
    icon: "pi pi-fw pi-save",
    command: openDocument,
    disabled: !currentDocument.value,
  },
  {
    label: t('scienceWorks.menu.newArticle'),
    icon: "fa-solid fa-plus",
    command: () => open('newPublicationDialog'),
  }
]);

onMounted(() => {

  getTicket();
  requstLocal();
  getCategory();
});

const courseApplicationCreate = () => {
  if (selectedDirection.value === "course_application") {
    return !selectedDirection.value && !selectedPosition.value
  }
}
const open = (name) => {
  visibility.value[name] = true;
};
const close = (name) => {
  visibility.value[name] = false;
};
const openBasic = () => {
  showModal.value = true;
};
const closeBasic = () => {
  selectedPosition.value = null
  selectedDirection.value = null;
  showModal.value = false;
};

const getHelpdeskDeskJournal = () => {

  docService.getDocumentsV2({
    page: lazyParams.value.page,
    rows: lazyParams.value.rows,
    docType: Enum.DocType.RequestList,
    filter: {
      name: null,
      status: null,
      author: null,
      years: null,
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
}
const getDocStatus = (code) => {
  const foundStatus = docStatus.value.find(status => status.code === code);
  if (foundStatus) {
    switch (locale.value) {
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

};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

const requstLocal = () => {
  switch (locale) {
    case "kz":
      request.value.local = 1;
      break;
    case "ru":
      request.value.local = 2;
      break;
    case "en":
      request.value.local = 3;
      break;
    default:
      request.value.local = 1;
      break;
  }
};

const openSignInfo = () => {
    open('documentInfoSidebar');
}
const onPage = (event) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  getTicket();
};
const openDocument = () => {
  if (currentDocument.value) {
    router.push({ name: 'Request', params: { uuid: currentDocument.value.uuid, id: currentDocument.value.id } });
  }
};
const getCategory = () => {
  selectedPosition.value = null;
  selectedDirection.value = null;
  service.helpDeskCategoryGet(
    {
      ID: null,
      SearchText: null,
      Page: 0,
      Rows: 10,
    })
    .then((res) => {
      currentDocument.value = null;
      directions.value = res.data.category
      request.value.category = res.data.category.id;
    })
    .catch((err) => {

      toast.add({
        severity: "error",
        detail: t("common.message.saveError"),
        life: 3000,
      });
    });
};
const createHelpDesk = () => {
  request.value.category = selectedDirection.value;
  service.helpDeskTicketCreate(request.value)
    .then(res => {
      uuid.value = res.data.uuid;
      close('newPublicationDialog');
      loading.value = false;
      router.push({ name: 'Request', params: { uuid: uuid.value }});
      // router.push({ name: 'Request', params: { uuid: uuid.value, isCreated: 1}, query: {selectedPosition: JSON.stringify(selectedPosition.value.code)}});
    }).catch(err => {
      if (err.response && err.response.status == 401) {
        store.dispatch("logLout");
      } else if (err.response && err.response.data && err.response.data.localized) {
        showMessage('error', t(err.response.data.localizedPath), null);
      } else {
        showMessage('error', t('common.message.actionError'), t('common.message.actionErrorContactAdmin'));
      }

      loading.value = false;
    });

};
const getTicket = () => {
  loading.value = true
  service.helpDeskTicketGet(
    {
      ID: null,
      search_text: null,
      page: lazyParams.value.page,
      rows: lazyParams.value.rows,
      uuid: null,
      is_saved: 1
    })
    .then((res) => {
      loading.value = false
      data.value = res.data.ticket;
      total.value = res.data.total;
    }) .catch((err) => {
      loading.value = false
      if (err.response.status == 401) {
        store.dispatch('logLout');
      }
    });
}
const search = (data) => {
  alert(data);
};
const toggleFilter = (event) => {
  sort.value = event;
};

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

  &.status-rejected {
    background: red;
    color: #fff;
  }

  &.sent for re-approval {
    background: rgb(134, 42, 119);
    color: #bfc9d1;
  }

  &.updated for re-approval {
    background: rgb(134, 42, 54);
    color: #bfc9d1;
  }

  &.issued for re-approval {
    background: rgb(42, 134, 88);
    color: #bfc9d1;
  }

}
</style>
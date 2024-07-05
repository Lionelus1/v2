<template>
  <div class="col-12">
    <h3>{{ t('helpDesk.title') }}</h3>
    <ToolbarMenu :data="mainMenu" @filter="toggle('filterOverlayPanel', $event)" :filter="true" :filtered="filtered"/>
    <BlockUI class="card">
      <Dialog :header="t('helpDesk.application.applicationName')" v-model:visible="visibility.newPublicationDialog"
              :style="{ width: '450px' }"
              class="p-fluid">
        <div class="field">
          <label>{{ t('helpDesk.application.categoryApplication') }}</label>
          <Dropdown v-model="selectedDirection"
                    :options="directions"
                    :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
          'name_en'" :placeholder="t('common.select')"/>
          <div style="margin-top: 15px" v-if="selectedDirection?.code === 'course_application'">
            <label>{{ t('helpDesk.application.requestReason') }}</label>
            <Dropdown style="margin-top: 5px" v-model="selectedPosition"
                      :options="position"
                      :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
          'name_en'" :placeholder="t('common.select')"/>
          </div>
        </div>
        <template #footer>
          <Button :label="t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"
                  @click="close('newPublicationDialog')"/>
          <Button :label="t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2"
                  :disabled="!selectedDirection || !selectedPosition"
                  @click="createHelpDesk"/>
        </template>
      </Dialog>
      <div>
        <DataTable :lazy="true" :loading="loading" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id"
                   :rowHover="true"
                   filterDisplay="menu" :first="first" responsiveLayout="scroll" :paginator="true" selectionMode="single" stripedRows
                   class="p-datatable-sm" :rows="10" :totalRecords="total" @page="onPage"
                   v-model:selection="currentDocument" scrollable
                   scrollHeight="flex" @lazy="true">
          <!-- :globalFilterFields="['columns.number','creationTime', 'status', 'requestReason', 'categoryApplication', 'responsible']" -->
          <template #empty> {{ t('common.noData') }}</template>
          <!-- <Column field="content" :header="t('contracts.columns.number')" sortable>
          </Column> -->

          <Column field="create_date" :header="t('helpDesk.creationTime')">
            <template #body="{ data }">
              <router-link
                  :to="{name: 'Request', params: {uuid: data?.uuid, id: data?.id}}"
                  tag="a">
                {{ (formatDate(data.doc?.docHistory?.setDate) || '') }}
              </router-link>
            </template>
          </Column>

          <Column field="status" :header="t('common.status')">
            <template #body="{ data }">
              <router-link :class="'customer-badge status-' + data.doc?.docHistory?.stateEn"
                           :to="{name: 'Request', params: {uuid: data?.uuid, id: data?.id}}"
                           tag="a">
                {{ getDocStatus(data.doc?.docHistory?.stateEn) }}
              </router-link>
            </template>
          </Column>

          <Column field="requestReason" :header="t('helpDesk.application.requestReason')">
            <template #body="{ data }">
              <span>{{
                  $i18n.locale === "kz" ? data.doc?.newParams?.selectedPosition?.value.name_kz : $i18n.locale === "ru" ? data.doc?.newParams?.selectedPosition?.value.name_ru :
                      data.doc?.newParams?.selectedPosition?.value.name_en
                }}</span>
            </template>
          </Column>

          <Column field="category" :header="t('helpDesk.application.categoryApplication')">
            <template #body="{ data }">
              <span>{{
                  $i18n.locale === "kz" ? data.category.name_kz : $i18n.locale === "ru" ? data.category.name_ru :
                      data.category.name_en
                }}</span>
            </template>
          </Column>

          <Column field="fullName" :header="t('web.logUser')">
            <template #body="{ data }">
              <span>{{ data.doc?.newParams?.not_formal_student_info?.value.fullName }}</span>
            </template>
          </Column>

          <Column style="min-width: 50px;">
            <template #body="{data}">
              <div v-if="data.doc?.uuid" class="flex flex-wrap column-gap-1 row-gap-1" style="margin-left: 30px">
                <Button @click="currentDocument=data.doc ;openSignInfo()"
                        v-if="data.doc.docHistory.stateId >= Enum.INAPPROVAL.ID"
                        class="p-button-text p-button-info p-1">
                  <i class="fa-solid fa-eye fa-xl"></i>
                </Button>
                <Button class="p-button-text p-button-danger p-1 mr-2"
                        @click="currentDocument=data.doc; openDelete(data)"
                        v-if="(data.doc.docHistory.stateId === Enum.CREATED.ID) && (currentUser.userID === data.sender_id)">
                  <i class="fa-solid fa-trash-can fa-xl"></i>
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
  <OverlayPanel ref="filterv2">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field">
        <label>{{ t('helpDesk.application.categoryApplication') }}</label>
        <Dropdown v-model="tempFilter.category"
                  :options="filterDirections"
                  :optionLabel="locale === 'kz' ? 'name_kz' : locale === 'ru' ? 'name_ru' :
          'name_en'"/>

        <!--        <InputText type="text" v-model="tempFilter.category"/>-->
      </div>
      <div class="field">
        <label>{{ t('helpDesk.applicant') }}</label>
        <FindUser v-model="tempFilter.applicant" :max="1" searchMode="local" :userType="3"></FindUser>
      </div>
      <div class="field">
        <label>{{ t('scienceWorks.filter.status') }}</label>
        <Dropdown v-model="tempFilter.status" :options="statuses" optionValue="id"
                  class="p-column-filter" :showClear="true">
          <template #value="slotProps">
            <span v-if="slotProps.value"
                  :class="'customer-badge status-' + statuses.find((e) => e.id === slotProps.value).value">
              {{
                $i18n.locale === 'kz' ? statuses.find((e) => e.id === slotProps.value).nameKz : $i18n.locale === 'ru'
                    ? statuses.find((e) => e.id === slotProps.value).nameRu : statuses.find((e) => e.id === slotProps.value).nameEn
              }}
            </span>
          </template>
          <template #option="slotProps">
            <span :class="'customer-badge status-' + slotProps.option.value">
              {{
                $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru'
                    ? slotProps.option.nameRu : slotProps.option.nameEn
              }}
            </span>
          </template>
        </Dropdown>
      </div>
      <div class="field">
        <Button :label="$t('common.clear')"
                @click="clearFilter();toggle('filterOverlayPanel', $event);
                getTicket()" icon="pi pi-trash" class="mb-2 p-button-outlined"/>
        <Button icon="pi pi-search" :label="$t('common.search')" class="mt-2"
                @click="saveFilter();toggle('filterOverlayPanel', $event);
                getTicket()"/>
      </div>
    </div>
  </OverlayPanel>
  <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg"
           style="overflow-y: scroll">
    <DocSignaturesInfo :docIdParam="currentDocument.uuid"></DocSignaturesInfo>
  </Sidebar>
  <!--  ДИАЛОГОВОЕ ОКНО ДЛЯ УДАЛЕНИЯ ЗАПИСИ В ТАБЛИЦЕ  -->
  <Dialog v-model:visible="isDeleting"
          :style="{ width: '450px' }"
          :modal="true"
          :closable="false">
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
      <span>
          {{ $t("common.doYouWantDelete") }}?
        </span>
    </div>
    <template #footer>
      <Button :label="$t('common.yes')"
              icon="pi pi-check"
              class="p-button p-component p-button-success p-mr-2"
              @click="deleteTicket"/>
      <Button :label="$t('common.no')"
              icon="pi pi-times"
              class="p-button p-component p-button-danger p-mr-2"
              @click="closeDelete"/>
    </template>
  </Dialog>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {HelpDeskService} from "../../service/helpdesk.service";
import {ref, computed, onMounted} from 'vue';
import {useI18n} from "vue-i18n";
import {findRole} from "@/config/config";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import Enum from "@/enum/docstates";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import {DocService} from "@/service/doc.service";

// Переменные для работы с i18n, хранилищем, уведомлениями и маршрутизацией ↓
const {t, locale} = useI18n()
const store = useStore()
const toast = useToast()
const router = useRouter();
// Сервисы для API
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
const isDeleteData = ref(null)
const isDeleting = ref(false)
const first = ref(0)
const currentUser = ref(JSON.parse(localStorage.getItem("loginedUser")));
const uuid = ref(null);
const isAdmin = findRole(null, 'main_administrator')
const data = ref([]);
const selectedDirection = ref(null);
const currentDocument = ref(null);
const loading = ref(false);
const directions = ref(null);
const filterDirections = ref(null)
const showModal = ref(false);
const total = ref(0);
const selectedPlanType = ref(null);
const lazyParams = ref({
  page: 0,
  rows: 10,
});
const filtered = ref(false);
const sort = ref(null);
const showMessage = (severity, detail, life) => {
  toast.add({
    severity: severity,
    detail: detail,
    life: life || 3000,
  });
};
const statuses = ref([Enum.StatusesArray.StatusCreated, Enum.StatusesArray.StatusInapproval, Enum.StatusesArray.StatusApproved,
  Enum.StatusesArray.StatusRevision, Enum.StatusesArray.StatusSigning, Enum.StatusesArray.StatusSigned])
const filter = ref({
  applied: false,
  category: null,
  applicant: [],
  status: null,
  years: [],
})
const filterv2 = ref(null)
const tempFilter = ref({
  applied: false,
  category: null,
  applicant: [],
  status: null,
  years: [],
})
// Список позиций с переводами
const position = ref([
  {
    name_kz: "Қосымша білім беру бағдарламасы",
    name_en: "Additional educational program",
    name_ru: "Дополнительная образовательная программа",
    code: "additional"
  },
  {
    name_kz: "Пререквизиттерді меңгеру",
    name_en: "Mastering prerequisites",
    name_ru: "Освоение пререквизитов",
    code: "mastering"
  },
  {
    name_kz: "Академиялық берешекті жою",
    name_en: "Liquidation of academic debt",
    name_ru: "Ликвидация академической задолженности",
    code: "liquidation"
  },
  {
    name_kz: "Ауысу ұпайларын көтеру (GPA)",
    name_en: "Increase in transferable points (GPA)",
    name_ru: "Повышение переводных баллов (GPA)",
    code: "increase"
  },
]);
// Список статусов документа с переводами
const docStatus = ref([
  {name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created"},
  {name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval"},
  {name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved"},
  {name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision"},
  {name_kz: "қабылданбады", name_en: "rejected", name_ru: "отклонен", code: "rejected"},
  {name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing"},
  {name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed"},
  {
    name_kz: "қайта бекітуге жіберілді",
    name_en: "sent for re-approval",
    name_ru: "отправлен на переутверждение",
    code: "sent for re-approval"
  },
  {name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated"},
  {name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued"},
]);

const visibility = ref({
  Request: false,
  newPublicationDialog: false,
  documentInfoSidebar: false
});
// Меню для кнопок
const mainMenu = computed(() => [
  {
    label: t("scienceWorks.buttons.card"),
    icon: "fa-regular fa-address-card",
    command: openDocument,
    disabled: !currentDocument.value,
  },
  {
    label: t('scienceWorks.menu.newArticle'),
    icon: "fa-solid fa-plus",
    command: () => open('newPublicationDialog'),
  }
]);
const toggle = (ref, event) => {
  if (ref === 'filterOverlayPanel') {
    tempFilter.value = JSON.parse(JSON.stringify(filter.value));
    if (tempFilter.value.years) {
      tempFilter.value.years.forEach((value, index, array) => {
        array[index] = new Date(value);
      });
    }
  }

  filterv2.value.toggle(event);
}
const clearFilter = () => {
  filter.value = {
    applied: false,
    category: null,
    applicant: [],
    status: null,
    years: [],
  };
}
const saveFilter = () => {
  filter.value = JSON.parse(JSON.stringify(tempFilter.value));
  filter.value.applied = true;
}
const filterClick = (event) => {
  filtered.value = event
}
//Поиск и Фильтрация
const toggleFilter = (event) => {
  filter.value.toggle(event)
}
// Выбор направление заявки
const selectedPosition = computed({
  get() {
    return store.state.selectedPosition
  },
  set(value) {
    store.commit('SET_SELECTED_POSITION_DESK', value)
  }
})

//Open and Close
const open = (name) => {
  visibility.value[name] = true;
};

const openSignInfo = () => {
  open('documentInfoSidebar');
}

const close = (name) => {
  visibility.value[name] = false;
};

//Статус Документ
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

// Функция для форматирования строки даты в формат "день.месяц.год"
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


const onPage = (event) => {
  first.value = event.first
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  localStorage.setItem('DeskJournalCurrentPage', JSON.stringify({first: first.value, page: lazyParams.value.page, rows:lazyParams.value.rows}))
  getTicket();
};

const openDocument = () => {
  if (currentDocument.value) {
    router.push({name: 'Request', params: {uuid: currentDocument.value.uuid, id: currentDocument.value.id}});
  }
};

// Запросы на бэкенд
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
        directions.value = res.data.category.filter(category => category.is_active)
        filterDirections.value = res.data.category
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
        router.push({name: 'Request', params: {uuid: uuid.value}});
        // router.push({ name: 'Request', params: { uuid: uuid.value, isCreated: 1}, query: {selectedPosition: JSON.stringify(selectedPosition.value.code)}});
      }).catch(err => {
    if (err.response && err.response.status == 401) {r
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
        search_text: filter.value.category?.name_ru && filter.value.category?.name_ru.length > 0 ? filter.value.category?.name_ru : null,
        page: lazyParams.value.page,
        rows: lazyParams.value.rows,
        uuid: null,
        is_saved: 1,
        filter: {
          status: filter.value.status && filter.value.status.length > 0 ? filter.value.status : null,
          author: filter.value.applicant.length > 0 && filter.value.applicant[0] ? filter.value.applicant[0].userID : null,
          years: filter.value.years && filter.value.years.length > 0 ? filter.value.years : null,
        }
      })
      .then((res) => {
        loading.value = false
        data.value = res.data.ticket;
        total.value = res.data.total;
      }).catch((err) => {
    loading.value = false
      data.value = null;
      total.value = null;
  });
}

const openDelete = (data) => {
  isDeleteData.value = data
  isDeleting.value = true
}
const closeDelete = () => {
  isDeleteData.value = null
  isDeleting.value = false
}

const deleteTicket = () => {
  loading.value = true
  const req = {
    id: isDeleteData.value.id,
    user_id: isDeleteData.value.sender_id,
    doc_id: isDeleteData.value.doc_id
  }
  isDeleting.value = false
  service.helpDeskDeleteTicket(req).then((res) => {
    getTicket()
  }).catch((err) => {
        loading.value = false
        if (err.response.status == 401) {
          store.dispatch('logLout');
        }
      }
  )
}
const search = (data) => {
  alert(data);
};
// Вызов функций при монтировании компонента
onMounted(() => {
  getTicket();
  requstLocal();
  getCategory();
  let currentPage = localStorage.getItem('DeskJournalCurrentPage');
  if (currentPage) {
    currentPage = JSON.parse(currentPage);
    first.value = currentPage.first;
    lazyParams.value.page = currentPage.page;
    lazyParams.value.rows = currentPage.rows;
  }
});
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
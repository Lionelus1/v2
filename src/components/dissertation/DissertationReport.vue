<template>
  <div>
    <div class="col-12">
      <Toolbar class="mb-4">
        <template #start>
          <TitleBlock :title="$t('dissertation.dissertationList')" :show-back-button="true" />
        </template>
        <template #end>
          <div>
            <Button icon="pi pi-plus" class="p-button-success mr-2" @click="toggle"
              v-tooltip.top="$t('dissertation.addDissertationReport')" />
            <Button icon="pi pi-filter" class="p-button-secondary mr-2" @click="toggleFilter"
              v-tooltip.top="$t('dissertation.addDissertationReport')" />
            <OverlayPanel ref="op">
              <div class="p-fluid">
                <div class="field">
                  <label for="languageSelect">{{ $t('dissertation.selectLanguage') }}</label>
                  <Dropdown v-model="lazyParams.filter.language" :options="languages" optionLabel="name"
                    optionValue="code" />
                </div>

                <div class="field" v-if="yearVisible">
                  <label for="name">{{ $t('dissertation.selectYear') }}</label>
                  <PrimeCalendar :placeholder="$t('common.select')" id="graduationyear" v-model="lazyParams.filter.year"
                    view="year" dateFormat="yy" />

                </div>
                <div class="field">
                  <label for="quarterSelect">{{ $t('dissertation.selectQuarter') }}</label>
                  <Dropdown v-model="lazyParams.filter.quarter" :options="quarters" optionValue="code"
                    optionLabel="latin" />
                </div>
                <div class="field" v-if="dateRangeVisible">
                  <label for="name">{{ $t('dissertation.selectDateRanges') }}</label>
                  <PrimeCalendar v-model="lazyParams.filter.date_ranges" selectionMode="range" :manualInput="false" />
                </div>
                <div class="field">

                  <Button v-if="lazyParams.filter.quarter != 5" :label="$t('dissertation.generateReport')"
                    @click="getDissertations()" class="mt-2 p-button-secondary" />
                  <Button v-if="lazyParams.filter.quarter == 5" :label="$t('dissertation.generateReport')"
                    @click="getDissertationHtml()" class="mt-2 p-button-secondary" />
                  <Button :label="$t('common.clear')" @click="clearDissertationFilter()" class="mt-2 p-button-outlined" />
                </div>
              </div>
            </OverlayPanel>
            <OverlayPanel ref="opFilter">
              <div class="p-fluid">
                <div class="field">
                  <label for="languageSelect">{{ $t('dissertation.selectLanguage') }}</label>
                  <Dropdown v-model="lazyParamsReport.filter.language" :options="languages" optionLabel="name"
                    optionValue="code" />
                </div>

                <div class="field" v-if="yearVisible">
                  <label for="name">{{ $t('dissertation.selectYear') }}</label>
                  <PrimeCalendar :placeholder="$t('common.select')" id="graduationyear"
                    v-model="lazyParamsReport.filter.year" view="year" dateFormat="yy" />

                </div>
                <div class="field">
                  <label for="quarterSelect">{{ $t('dissertation.selectQuarter') }}</label>
                  <Dropdown v-model="lazyParamsReport.filter.quarter" :options="quarters" optionValue="code"
                    optionLabel="latin" />
                </div>
                <div class="field" v-if="dateRangeVisible">
                  <label for="name">{{ $t('dissertation.selectDateRanges') }}</label>
                  <PrimeCalendar v-model="lazyParamsReport.filter.date_ranges" selectionMode="range"
                    :manualInput="false" />
                </div>
                <div class="field">
                  <Button :label="$t('common.search')" @click="getDissReport()" class="mt-2" />
                  <Button :label="$t('common.clear')" @click="clearFilter()" class="mt-2 p-button-outlined" />
                </div>
              </div>
            </OverlayPanel>
          </div>
          <Button icon="pi pi-print" class="p-button-info mr-2" />
          <div class="mr-5"></div>
        </template>

      </Toolbar>

      <DataTable :lazy="true" v-model:selection="selectedNode" :value="dissertationReports" dataKey="id"
        :loading="loading" responsiveLayout="scroll" :rows="lazyParams.rows" :paginator="true" :totalRecords="total"
        :rowHover="true" @page="onPage($event)">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>
        <Column :field="'department_kz'" :header="$t('common.faculty')">
          <template #body="{ data }">
            {{ data['department_' + $i18n.locale] || data['department_kz'] }}
          </template>
        </Column>
        <Column :field="'report_year'" :header="$t('dissertation.dissYear')">
          <template #body="{ data }">
            {{ data['report_year'] }}
          </template>
        </Column>
        <Column :field="'report_quarter'" :header="$t('dissertation.dissQuarter')">
          <template #body="{ data }">
            {{ getQuarterLabel(data['report_quarter']) }}
          </template>
        </Column>
        <Column :field="'created_date'" :header="$t('faq.createDate')">
          <template #body="{ data }">
            {{ formatDate(data['created_date']) }}
          </template>
        </Column>
        <Column :field="'report_language'" :header="$t('dissertation.dissReportLanguage')">
          <template #body="{ data }">
            {{ formatLanuage(data['report_language']) }}
          </template>
        </Column>

        <Column :field="'report_path'" :header="$t('dissertation.dissReportActions')">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="actionToggle(data)" />
            <!-- <Button v-if="data.report_quarter == 5" type="button" icon="fa-solid fa-paper-plane" class="mr-2"
              @click="signView(data)" v-tooltip.top="$t('dissertation.dissReportView')"></Button>
            <Button type="button" icon="pi pi-user-edit" class="mr-2" @click="onUserEditView(data)"
              v-tooltip.top="$t('dissertation.dissReportView')"></Button>
            <Button type="button" icon="fa-solid fa-eye" class="mr-2" @click="onView(data)"
              v-tooltip.top="$t('dissertation.dissReportView')"></Button>
            <Button type="button" icon="fa-solid fa-trash" class="p-button-danger sm:mt-2 md:mt-2 lg:mt-0 xl:mt-0"
              @click="deleteReport(data)" v-tooltip.top="$t('dissertation.dissReportDelete')"></Button> -->
          </template>
        </Column>
      </DataTable>

    </div>
    <Dialog v-model:visible="showSignPanel" :style="{ width: '1000' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :header="$t('dissertation.sendReportForSign')" :modal="true" class="p-fluid" closable="false">

      <div class="card flex justify-content-center">
        <ProgressSpinner aria-label="Loading" />
      </div>

    </Dialog>
    <Dialog v-model:visible="showReport" :style="{ width: '1350px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :header="currentData ? $t('dissertation.addReport') : $t('dissertation.editReport')" :modal="true" class="p-fluid"
      @hide="hideDialog">
      <TinyEditor v-model="generatedHtml" :height="700" :custom-file-upload="true" @onAfterUpload="onAfterUpload" />

      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
          @click="hideDialog" />

        <Button :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success"
          @click="addReportByYear" />
      </template>
    </Dialog>

  </div>

  <Sidebar v-model:visible="showReportDoc" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
    <DocSignaturesInfo :docIdParam="selectedNode.doc_id" :isInsideSidebar="true"></DocSignaturesInfo>
  </Sidebar>
</template>

<script setup>
import DocSignaturesInfo from "@/components/DocSignaturesInfo"
import { DissertationService } from "@/service/dissertation.service";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n"
import { getHeader, smartEnuApi } from "@/config/config";
import { formatDate } from "@/helpers/HelperUtil";
import { useConfirm } from "primevue/useconfirm";
import ActionButton from "@/components/ActionButton.vue";

const route = useRoute();
const councilID = ref(parseInt(route.params.id))
const confirm = useConfirm()
const showReport = ref(false)
const showSignPanel = ref(false)
const yearVisible = ref(true)
const dateRangeVisible = ref(false)
const i18n = useI18n()
const showReportDoc = ref(false)
const languages = ref([
  { name: "Қазақша", code: "kz" },
  { name: "Русский", code: "ru" },
  { name: "English", code: "en" }
])
const quarterText = ref({ kz: "тоқсан", ru: "квартал", en: "quarter" })
const dataRangesText = ref({ kz: "Кезең бойынша", ru: "Диапазон дат", en: "Datetime Ranges" })
const databyYearText = ref({ kz: "Жыл бойынша", ru: "По году", en: "By Year" })
const quarters = computed(() => [
  { latin: `I ${quarterText.value[i18n.locale.value]}`, code: 1 },
  { latin: `II ${quarterText.value[i18n.locale.value]}`, code: 2 },
  { latin: `III ${quarterText.value[i18n.locale.value]}`, code: 3 },
  { latin: `IV ${quarterText.value[i18n.locale.value]}`, code: 4 },
  { latin: `${dataRangesText.value[i18n.locale.value]}`, code: 0 },
  { latin: `${databyYearText.value[i18n.locale.value]}`, code: 5 }
]);
const dissertationService = new DissertationService()
const loading = ref(false)
const toast = useToast()
const dissertations = ref([])
const dissertationReports = ref([])
const generatedHtml = ref('')
const total = ref()
const op = ref();
const opFilter = ref();
const selectedNode = ref()
const lazyParams = ref({
  council_id: councilID.value,
  page: 0,
  rows: 10,
  filter: {
    year: null,
    quarter: null,
    language: null,
    date_ranges: null
  },
  html_content: null
})
const lazyParamsReport = ref({
  council_id: councilID.value,
  page: 0,
  rows: 10,
  filter: {
    year: null,
    quarter: null,
    language: null,
    date_ranges: null
  },
})
const actionsNode = ref(null)
const sendSignParams = ref({
  council_id: null,
  doc_uuid: null
})

watch(() => lazyParams.value.filter.quarter, (newValue) => {
  if (newValue == 0) {
    yearVisible.value = false;
    lazyParams.value.filter.year = null;
    dateRangeVisible.value = true;
  } else {
    yearVisible.value = true;
    lazyParams.value.filter.date_ranges = null;
    dateRangeVisible.value = false;
  }
});

const onPage = (event) => {
  lazyParamsReport.value.page = event.page
  lazyParamsReport.value.rows = event.rows
  getDissReport();
}

const clearFilter = () => {
  lazyParamsReport.value.filter.year = null
  lazyParamsReport.value.filter.language = null
  lazyParamsReport.value.filter.quarter = null
  lazyParamsReport.value.filter.date_ranges = null
  getDissReport();

}
const clearDissertationFilter = () => {
  lazyParams.value.filter.year = null
  lazyParams.value.filter.language = null
  lazyParams.value.filter.quarter = null
  lazyParams.value.filter.date_ranges = null
  getDissReport();

}

const onView = (node) => {
  selectedNode.value = node.value;
  let url = `${smartEnuApi}/document?qrcode=${node.value.doc_id}`
  window.open(url, '_blank');

}

const onUserEditView = (node) => {
  selectedNode.value = node.value;
  if (node.value.report_quarter == 5) {
    showReportDoc.value = true;
  }

}

const signView = (node) => {
  confirm.require({
    message: i18n.t('dissertation.doYouWantSendReport'),
    header: i18n.t('common.send'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      selectedNode.value = node.value;

      sendSignParams.value.council_id = node.value.council_id
      sendSignParams.value.doc_uuid = node.value.doc_id
      showSignPanel.value = true
      dissertationService.dissertationReportSendToSign(sendSignParams.value).then(res => {
        if (res.data) {
          if (res.data.is_success) {
            toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
          }
        }
        showSignPanel.value = false
        getDissReport()
      }).catch(error => {
        loading.value = false
        toast.add({ severity: 'error', summary: error, life: 3000 })
      })
    },
  });



}

const hideDialog = (() => {
  showReport.value = false;
})

const getDissReport = () => {
  loading.value = true;
  dissertationService.dissertationReport(lazyParamsReport.value).then(res => {
    if (res.data) {
      dissertationReports.value = res.data.reports
      total.value = res.data.total
    }

    loading.value = false
  }).catch(error => {
    loading.value = false
    toast.add({ severity: 'error', summary: error, life: 3000 })
   
  })

}

getDissReport()

const getDissertations = () => {
  loading.value = true;

  dissertationService.getDissertationList(lazyParams.value).then(res => {
    if (res.data) {
      dissertations.value = res.data.dissertations
      generatedHtml.value = res.data.generated_html
      lazyParams.value.filter.date_ranges = null
      lazyParams.value.filter.quarter = null
      lazyParams.value.filter.year = null
    }
    showReport.value = false
    loading.value = false
    op.value.hide()
    getDissReport()

  }).catch(error => {
    loading.value = false
    if (error && error.error) {
      toast.add({ severity: "warn", summary: i18n.t('common.message.title.' + error.error), life: 3000 });
    }
  })


}

const getDissertationHtml = () => {
  loading.value = true;
  dissertationService.getDissertationHtml(lazyParams.value).then(res => {
    if (res.data) {
      generatedHtml.value = res.data.generated_html
      toggle(false)
    }
    loading.value = false
    showReport.value = true
  }).catch(error => {
    loading.value = false
    if (error && error.error) {
      toast.add({ severity: "warn", summary: i18n.t('common.message.title.' + error.error), life: 3000 });
    }
  })


}

const addReportByYear = () => {
  loading.value = true;
  lazyParams.value.html_content = generatedHtml.value
  dissertationService.addDissertationReportByYear(lazyParams.value).then(res => {
    if (res.data) {
      getDissReport();
    }
    lazyParams.value.filter.date_ranges = null
    lazyParams.value.filter.quarter = null
    lazyParams.value.filter.year = null
    loading.value = false
    showReport.value = false
    op.value.hide()
  }).catch(error => {
    loading.value = false
    if (error && error.error) {
      toast.add({ severity: "warn", summary: i18n.t('common.message.title.' + error.error), life: 3000 });
    }
  })
}

const formatLanuage = (code) => {
  switch (code) {
    case 'kz':
      return 'Қазақша';
    case 'en':
      return 'English';
    case 'ru':
      return 'Русский';
    default:
      return '';
  }
}
const getQuarterLabel = (code) => {
  const quarter = quarters.value.find(q => q.code === code);
  return quarter ? quarter.latin : '';
};

const deleteReport = (data) => {
  confirm.require({
    message: i18n.t('common.doYouWantDelete'),
    header: i18n.t('common.delete'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      onDeleteReport(data.value.id)
    },
  });
}

const onDeleteReport = (id) => {
  dissertationService.deleteReport(id).then(res => {
    if (res.data && res.data.is_success) {
      toast.add({ severity: "success", summary: i18n.t('common.success'), life: 3000 });
    } else {
      toast.add({ severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000 });
    }
    getDissReport()
  }).catch(error => {
    toast.add({ severity: "error", summary: error, life: 3000 });
  });
}

const toggle = (event) => {
  op.value.toggle(event);
}

const toggleFilter = (event) => {
  opFilter.value.toggle(event);
}


const actionToggle = (node) => {
  actionsNode.value = node
}

const initItems = computed(() => {
  return [
    {
      label: i18n.t('common.send'),
      icon: 'fa-solid fa-paper-plane',
      visible: (actionsNode.value && actionsNode.value.report_quarter === 5 && (actionsNode.value.doc_state == 1 || actionsNode.value.doc_state == 5)),
      command: () => {
        signView(actionsNode);
      }
    },
    {
      label: i18n.t('common.approvalList'),
      icon: 'pi pi-user-edit',
      visible: actionsNode.value && actionsNode.value.report_quarter === 5,
      command: () => {
        onUserEditView(actionsNode);
      }
    },
    {
      label: i18n.t('dissertation.dissReportView'),
      icon: 'fa-solid fa-eye',
      command: () => {
        onView(actionsNode);
      },
    },
    {
      label: i18n.t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
        deleteReport(actionsNode);
      },
    }
  ]
});

</script>

<style>
.p-datatable td {
  vertical-align: top;
}
</style>
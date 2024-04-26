<template>
    <h3>{{ $t("ref.myRefs") }}</h3>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <ToolbarMenu :data="menu"/>
  <div class="card flex flex-column" :style="{height: innerHeightInRem.toString()+'rem',
    minHeight: '300px'}">
    <div class="flex-grow-1" style="height: 300px; min-width: 300px;">
      <DataTable :value="references" dataKey="id" :rows="rows"
        :totalRecords="total" :paginator="true" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="
          $t('common.showingRecordsCount', {
            first: '{first}',
            last: '{last}',
            totalRecords: '{totalRecords}',
          })" :lazy="true" :loading="tableLoading" scrollable scrollHeight="flex"
        v-model:selection="selectedReference" selectionMode="single" :rowHover="true"
        @page="onPage($event)" @row-dblclick="doubleClick($event)" stripedRows>
        <Column :header="$t('ref.referenceDate')" style="width: 10%; min-width: 100px; flex-grow: 2; flex-shrink: 0;">
          <template #body="slotProps">
            {{ getShortDateString(slotProps.data.registerDate) }}
          </template>
        </Column>
        <Column :header="$t('ref.referenceNumber')" style="width: 10%; min-width: 100px;  flex-grow: 2; flex-shrink: 0;">
          <template #body="slotProps">
            {{ slotProps.data.number }}
          </template>
        </Column>
        <Column :header="$t('ref.referenceType')" style="width: 40%; min-width: 400px;  flex-grow: 8; flex-shrink: 0;">
          <template #body="slotProps">
            {{ $i18n.locale === 'kz' ? slotProps.data.template.descriptionKaz : $i18n.locale === 'ru' ? slotProps.data.template.descriptionRus : slotProps.data.template.descriptionEng }}
          </template>
        </Column>
        <Column :header="$t('ref.additionalInfo')" style="width: 25%; min-width: 250px;  flex-grow: 5; flex-shrink: 0;">
          <template #body="slotProps">
            <div class="flex flex-wrap gap-2">
              <span v-if="hasActiveErrorRequest(slotProps.data.requests)"
                class="customer-badge rejected">
                {{ $t('ref.statusErrorRequest') }}
              </span>
              <span v-if="hasSalaryRequest(slotProps.data.requests)"
                class="customer-badge issued">
                {{ $t('ref.statusSalary') }}
              </span>
            </div>
          </template>
        </Column>
        <Column :header="$t('ref.referenceStatus')" style="width: 10%; min-width: 100px;  flex-grow: 2; flex-shrink: 0;">
          <template #body="slotProps">
            <span v-if="slotProps.data.docHistory.stateId === Enum.ISSUED.ID"
              class="customer-badge issued">
              {{ $t('ref.statusIssued') }} 
            </span>
            <span v-else-if="slotProps.data.docHistory.stateId === Enum.REJECTED.ID"
              class="customer-badge rejected">
              {{ $t('ref.statusRejected') }}
            </span>
            <span v-else class="customer-badge applied">
              {{ $t('ref.statusApplied') }}
            </span>
          </template>
        </Column>
        <Column style="width: 5%; min-width: 50px;  flex-grow: 1; flex-shrink: 0;">
          <template #body="slotProps">
            <Button v-if="slotProps.data.isPublic" class="p-button-text p-button-help"
              icon="fa-solid fa-link" v-tooltip.bottom="$t('ref.sharedLinkTooltip')"
              v-clipboard:copy="apiDomain + '/document/' + slotProps.data.uuid" 
              v-clipboard:success="onCopy" v-clipboard:error="onFail"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Sidebar v-model:visible="visibility.referenceSidebar" position="full" :pt="{header: {style: 'justify-content: space-between;'}}">
    <template #header>
      <Button class="p-sidebar-close p-sidebar-icon p-link" icon="fa-solid fa-arrow-left"
        @click="visibility.referenceSidebar = false"></Button>
    </template>
    <ReferencePage :referenceProp="selectedReference"></ReferencePage>
  </Sidebar>
  <Dialog :header="$t('ref.getRef')" v-model:visible="visibility.getRefStep1Dialog"
    :style="{width: '60vw'}" :modal="true" maximizable>
    <ReferenceFolderFile @chosen="templateChosen" @selected="templateSelected"></ReferenceFolderFile>
    <template #footer>
      <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
        :disabled="!selectedTemplate" @click="nextStep()"> {{ $t("ref.get") }} </Button>
    </template>
  </Dialog>
  <Dialog :header="selectedTemplate ? this.$i18n.locale === 'kz' ? selectedTemplate.descriptionKaz : this.$i18n.locale === 'ru' ? selectedTemplate.descriptionRus : selectedTemplate.descriptionEng : ''" 
    v-model:visible="visibility.getRefStep2Dialog" :style="{width: '40vw'}" :modal="true">
    <div class="flex flex-column gap-2">
      <div v-for="param in selectedTemplateParams" :key="param" class="flex gap-1 align-items-center">
        <Checkbox v-model="selectedTemplateParams[param.description].value" :inputId="param.description" :binary="true" />
        <label :for="param.description">{{ $t('ref.' + param.description) }}</label>
      </div>
    </div>
    <template #footer>
      <Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
        :disabled="!selectedTemplate" @click="newReference()"> {{ $t("ref.get") }} </Button>
    </template>
  </Dialog>
</template>
<script>
import api from '@/service/api';

import { getHeader, smartEnuApi, apiDomain } from "@/config/config";
import { getShortDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";

import ReferenceFolderFile from './ReferenceFolderFile.vue';
import ReferencePage from './ReferencePage.vue';
import ToolbarMenu from "@/components/ToolbarMenu.vue";

export default {
  name: 'References',
  components: {ToolbarMenu, ReferenceFolderFile, ReferencePage },
  props: {
    
  },
  emits: [],
  data() {
    return {
      Enum: Enum,
      apiDomain: apiDomain,

      innerHeightInRem: 0,
      loading: false,
      tableLoading: false,

      visibility: {
        getRefStep1Dialog: false,
        getRefStep2Dialog: false,
        filterOverlayPanel: false,
        referenceSidebar: false,
      },

      references: [],
      selectedReference: null,
      selectedTemplate: null,
      selectedTemplateParams: {},
      total: 0,

      page: 0,
      rows: 10,
    }
  },
  mounted() {
    this.getReferences();

    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
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
    onResize() {
      this.innerHeightInRem = (window.innerHeight - 50 - 45) / parseFloat(getComputedStyle(document.documentElement).fontSize);
    },
    open(name) {
      this.visibility[name] = true
    },
    close(name) {
      this.visibility[name] = false
    },
    onCopy() {
      this.showMessage('success', this.$t('ncasigner.successCopy'));
    },
    onFail() {
      this.showMessage('warn', this.$t('ncasigner.failCopy'));
    },
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getReferences();
    },
    doubleClick(event) {
      this.selectedReference = event.data;
      this.open('referenceSidebar');
    },
    getReferences() {
      this.tableLoading = true

      api.post('/documents', {
        sourceType: null,
        docType: Enum.DocType.Reference,
        lang: null,
        templateId: null,
        folderId: null,
        departmentId: null,
        page: this.page,
        rows: this.rows,
      }, { 
        headers: getHeader() 
      }).then(res => {
        this.references = res.data.documents
        this.total = res.data.total

        this.tableLoading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false
      })
    },
    nextStep() {
      if (!this.selectedTemplate) {
        return
      }
      
      this.close('getRefStep1Dialog');

      if (Object.keys(this.selectedTemplateParams).length > 0) {
        this.open('getRefStep2Dialog');
      } else {
        this.newReference();
      }
    },
    newReference() {
      this.close('getRefStep2Dialog');
      this.loading = true

      api.post('/document/create', {
        templateId: this.selectedTemplate.id,
        folderId: null,
        docType: Enum.DocType.Reference,
        templateParams: this.selectedTemplateParams,
      }, { 
        headers: getHeader() 
      }).then(res => {
        this.getReferences();
        this.selectedReference = res.data;
        this.open('referenceSidebar');

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    templateChosen(event) {
      this.selectedTemplate = event;
      this.getParameters();
    },
    templateSelected(event) {
      this.selectedTemplate = event;
      this.getParameters();
      this.nextStep();
    },
    getParameters() {
      var text = this.selectedTemplate.mainTextKaz;
      this.selectedTemplateParams = {};
      let map = new Map();

      var r = /{(.*?)}/g;
      var existParams = text.match(r);
      var rep = {"{": "", "}": ""};

      for (var i = 0; i < existParams.length; i++) {
        var existParam = existParams[i].replace(/{|}/g, function(matched) {
          return rep[matched];
        });

        var splited = existParam.split(":");
        if (splited[0].startsWith('template') && splited.length > 1) {
          if (map.has(splited[1])) {
            continue
          }

          this.selectedTemplateParams[splited[1]] = {
            name: splited[0],
            description: splited[1],
            value: false,
          };

          map.set(splited[1], true);
        } else {
          continue;
        }
      }
    },
    hasSalaryRequest(requests) {
      let result = false

      if (!requests) {
        return result
      }

      requests.forEach(req => {
        if (req.type === Enum.DocumentRequestType.ReferenceSalaryRequest) {
          result = true
        }
      });

      return result
    },
    hasActiveErrorRequest(requests) {
      let result = false

      if (!requests) {
        return result
      }

      requests.forEach(req => {
        if (req.type === Enum.DocumentRequestType.ReferenceErrorCorrection && req.status === 0) {
          result = true
        }
      });

      return result
    },
  },
/*<Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
            @click="open('referenceSidebar')" :disabled="!selectedReference"> <i class="fa-regular fa-address-card" />
    &nbsp;{{ $t("ref.open") }} </Button>
<Button class="p-button-info align-items-center" style="padding: 0.25rem 1rem;"
            @click="selectedTemplate = null; open('getRefStep1Dialog')"> <i class="fa-solid fa-file-circle-plus" />
    &nbsp;{{ $t("ref.getRef") }} </Button>*/
  computed: {
    menu () {
      return [
        {
          label: this.$t('ref.open'),
          icon: "fa-regular fa-address-card",
          disabled: !this.selectedReference,
          command: () => {this.open('referenceSidebar')},
        },
        {
          label: this.$t('ref.getRef'),
          icon: "fa-solid fa-file-circle-plus",
          visible: this.selectedNews && this.selectedNews.history.status.id === this.statuses.created && (!this.isModer ||
              !this.isPublisher || !this.isAdmin || !this.isEnuWebAdmin || !this.isEnuWebFacAdmin),
          command: () => {this.selectedTemplate = null; this.open('getRefStep1Dialog')},
        }
      ]
    },
  }
}
</script>
<style scoped>
.l-card {
  background-color: #ffffff;
  padding: 1rem;
}

span.issued {
  background: #2BAE66FF;
  color: #FCF6F5FF;
}

span.rejected {
  background: #990011FF;
  color: #FCF6F5FF;
}

span.applied {
  background: #A2A2A1FF;
  color: #F1F4FFFF;
}
</style>
<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <TitleBlock :title="$t('contracts.statusGPCFull')" :show-back-button="true"/>
  <ToolbarMenu :data="menu" @filter="toggle('filterOverlayPanel', $event)" :filter="true" :filtered="filtered"></ToolbarMenu>
  <BlockUI :blocked="loading" class="card card-grow">
    <DataTable :value="documents" dataKey="id" :rows="rows" :totalRecords="total"
               :paginator="true" :paginatorTemplate="paginatorTemplate" :rowsPerPageOptions="[10, 25, 50]"
               :currentPageReportTemplate="currentPageReportTemplate" :lazy="true" :loading="tableLoading"
               scrollable scrollHeight="flex" stripedRows class="flex-grow-1" @page="onPage"
               rowGroupMode="rowspan" :groupRowsBy="getGroupRowsBy()">
      <template #empty>
        {{ this.$t("common.recordsNotFound") }}
      </template>
      <Column field="number" :header="$t('contracts.columns.number')" style="min-width: 15px;">
        <template #body="slotProps">
          {{ slotProps.data.number }}
        </template>
      </Column>
      <Column field="contractNumber" :header="$t('contracts.columns.contractNumber')" style="min-width: 15px;">
        <template #body="slotProps">
          {{ slotProps.data.contractNumber }}
        </template>
      </Column>
      <Column field="contractDate" :header="$t('contracts.columns.contractDate')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ getShortDateString(slotProps.data.contractDate) }}
        </template>
      </Column>
      <Column field="executorName" :header="$t('contracts.columns.executorName')" style="min-width: 30px;">
        <template #body="slotProps">
          {{ slotProps.data.executorName }}
        </template>
      </Column>
      <Column field="executorWorkPlace" :header="$t('contracts.columns.executorWorkPlace')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.executorWorkPlace }}
        </template>
      </Column>
      <Column field="executorPosition" :header="$t('contracts.columns.executorPosition')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ projectPositionsLabel(slotProps.data.executorPosition) }}
        </template>
      </Column>
      <Column field="irn" :header="$t('contracts.columns.irn')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.irn }}
        </template>
      </Column>
      <Column field="theme" :header="$t('contracts.columns.theme')" style="min-width: 35px;">
        <template #body="slotProps">
          {{ slotProps.data.theme }}
        </template>
      </Column>
      <Column field="sciadviorName" :header="$t('contracts.columns.sciadviorName')" style="min-width: 30px;">
        <template #body="slotProps">
          {{ slotProps.data.sciadviorName }}
        </template>
      </Column>
      <Column field="mnvoNumber" :header="$t('contracts.columns.mnvoNumber')" style="min-width: 15px;">
        <template #body="slotProps">
          {{ slotProps.data.mnvoNumber }}
        </template>
      </Column>
      <Column field="mnvoDate" :header="$t('contracts.columns.mnvoDate')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ getShortDateString(slotProps.data.mnvoDate) }}
        </template>
      </Column>
      <Column field="contractSum" :header="$t('contracts.columns.contractSum')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.contractSum }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.serviceDate')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ getShortDateString(slotProps.data.serviceDate) }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.actSumPercentage')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.actSumPercentage }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.actSum')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.actSum }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.actNumber')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ slotProps.data.actNumber }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.actDate')" style="min-width: 20px;">
        <template #body="slotProps">
          {{ getShortDateString(slotProps.data.actDate) }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.actName')" style="min-width: 50px;">
        <template #body="slotProps">
          {{ slotProps.data.actName }}
        </template>
      </Column>
      <Column :header="$t('contracts.columns.status')" style="min-width: 40px;">
        <template #body="slotProps">
          <div class="flex flex-wrap column-gap-1 row-gap-1">
            <span :class="'customer-badge status-' + slotProps.data.status.code">
              {{ slotProps.data.status[$i18n.locale === 'en' ? 'eng' : $i18n.locale === 'ru' ? 'rus' : 'kz'] }}
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
  </BlockUI>
  <!-- filterOverlayPanel -->
  <OverlayPanel ref="filterOverlayPanel">
    <div class="p-fluid" style="min-width: 320px;">
      <div class="field" >
        <label>{{ $t('contracts.filter.regNumber') }}</label>
        <InputText type="text" v-model="tempFilter.regNumber"/>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.regDate') }}</label>
        <PrimeCalendar v-model="tempFilter.regDate" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.contragent') }}</label>
        <FindUser v-model="tempFilter.contragent" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field" >
        <label>{{ $t('contracts.filter.executorWorkPlace') }}</label>
        <InputText type="text" v-model="tempFilter.executorWorkPlace"/>
      </div>
      <div class="field" >
        <label>{{ $t('contracts.filter.projectPosition') }}</label>
        <InputText type="text" v-model="tempFilter.projectPosition"/>
      </div>
      <div class="field" >
        <label>{{ $t('contracts.filter.irn') }}</label>
        <InputText type="text" v-model="tempFilter.irn"/>
      </div>
      <div class="field" >
        <label>{{ $t('contracts.filter.theme') }}</label>
        <InputText type="text" v-model="tempFilter.theme"/>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.sciadvisor') }}</label>
        <FindUser v-model="tempFilter.sciadvisor" :max="1" :userType="3"></FindUser>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.mnvo') }}</label>
        <InputText type="text" v-model="tempFilter.mnvo"/>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.mnvoDate') }}</label>
        <PrimeCalendar v-model="tempFilter.mnvoDate" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
      </div>
      <div class="field">
        <label>{{ $t('contracts.filter.contractSum') }}</label>
        <InputText type="text" v-model="tempFilter.contractSum"/>
      </div>
      <div class="field">
        <Button :label="$t('common.clear')" @click="clearFilter();toggle('filterOverlayPanel', $event);getActs()" class="mb-2 p-button-outlined"/>
        <Button :label="$t('common.search')" @click="saveFilter();toggle('filterOverlayPanel', $event);getActs()" class="mt-2"/>
      </div>
    </div>
  </OverlayPanel>
</template>
<script>
import {DocService} from "@/service/doc.service";
import FindUser from "@/helpers/FindUser.vue";
import {getShortDateString} from "@/helpers/helper";
import {getHeader} from "@/config/config";

export default {
  name: 'StatusActsGPC',
  components: {FindUser},
  props: {},
  data() {
    return {
      service: new DocService(),
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),

      loading: false,
      tableLoading: false,

      documents: [],
      total: 0,
      page: 0,
      rows: 10,

      filtered: false,
      filter: {
        applied: false,
        regNumber: null,
        regDate: null,
        contragent: [],
        executorWorkPlace: null,
        projectPosition: null,
        irn: null,
        theme: null,
        sciadvisor: [],
        mnvo: null,
        mnvoDate: null,
        contractSum: null,
      },

      tempFilter: {
        applied: false,
        regNumber: null,
        regDate: null,
        contragent: [],
        executorWorkPlace: null,
        projectPosition: null,
        irn: null,
        theme: null,
        sciadvisor: [],
        mnvo: null,
        mnvoDate: null,
        contractSum: null,
      },
    }
  },
  mounted() {
    this.$emit('apply-flex', true);

    this.getActs();
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
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
    getGroupRowsBy() {
      return ['number', 'contractNumber', 'contractDate', 'executorName', 'executorWorkPlace', 'executorPosition',
      'irn', 'theme', 'sciadviorName', 'mnvoNumber', 'mnvoDate', 'contractSum'];
    },
    onPage(event) {
      this.page = event.page;
      this.rows = event.rows;
      this.getActs();
    },
    getActs() {
      this.tableLoading = true;

      this.service.getGPCActsStatus({
        page: this.page,
        rows: this.rows,
        type: 'default',
        filter: {
          regNumber: this.filter.regNumber,
          regDate: this.filter.regDate,
          contragent: this.filter.contragent.length > 0 && this.filter.contragent[0] ? this.filter.contragent[0].userID : null,
          executorWorkPlace: this.filter.executorWorkPlace,
          projectPosition: this.filter.projectPosition,
          irn: this.filter.irn,
          theme: this.filter.theme,
          sciadvisor: this.filter.sciadvisor.length > 0 && this.filter.sciadvisor[0] ? this.filter.sciadvisor[0].userID : null,
          mnvo: this.filter.mnvo,
          mnvoDate: this.filter.mnvoDate,
          contractSum: this.filter.contractSum,
        },
      }, {
        headers: getHeader()
      }).then(res => {
        this.total = res.data.total;
        this.documents = [];

        for (let i = 0; i < res.data.documents.length; i++) {
          for (let j = 0; j < res.data.documents[i].children.length; j++) {
            let doc = {};
            doc.number = this.page*this.rows + i+1;
            doc.contractNumber = res.data.documents[i].number;
            doc.contractDate = res.data.documents[i].registerDate;
            doc.executorName = res.data.documents[i].newParams.contragent.value.data ?
                this.getFullname(res.data.documents[i].newParams.contragent.value.data) : '';
            doc.executorWorkPlace = res.data.documents[i].newParams.executor_work_place.value;
            doc.executorPosition = res.data.documents[i].newParams.project_position.value;
            doc.irn = res.data.documents[i].newParams.irn.value;
            doc.theme = res.data.documents[i].newParams.theme.value;
            doc.sciadviorName = res.data.documents[i].newParams.sciadvisor.value.data ?
                this.getFullname(res.data.documents[i].newParams.sciadvisor.value.data) : '';
            doc.mnvoNumber = res.data.documents[i].newParams.mnvo_agreement.value;
            doc.mnvoDate = res.data.documents[i].newParams.mnvo.value;
            doc.contractSum = res.data.documents[i].newParams.agreement_sum.value;
            doc.serviceDate = res.data.documents[i].children[j].newParams.service_date.value;
            doc.actSumPercentage = res.data.documents[i].children[j].newParams.percentage.value;
            doc.actSum = res.data.documents[i].children[j].newParams.act_amount.value;
            doc.actNumber = res.data.documents[i].children[j].number;
            doc.actDate = res.data.documents[i].children[j].registerDate;
            doc.actName = res.data.documents[i].children[j].newParams.table.value[0].work_type;
            doc.status = {
              code: res.data.documents[i].children[j].docHistory.code,
              eng: res.data.documents[i].children[j].docHistory.stateEn,
              rus: res.data.documents[i].children[j].docHistory.stateRus,
              kz: res.data.documents[i].children[j].docHistory.stateKaz,
            }

            this.documents.push(doc);
          }
        }

        this.tableLoading = false;
      }).catch(err => {
        this.documents = [];
        this.total = 0;

        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false;
      });
    },
    toggle(ref, event) {
      if (ref === 'filterOverlayPanel') {
        this.tempFilter = JSON.parse(JSON.stringify(this.filter));
        this.tempFilter.regDate = this.tempFilter.regDate ? new Date(this.tempFilter.regDate) : null;
        this.tempFilter.mnvoDate = this.tempFilter.mnvoDate ? new Date(this.tempFilter.mnvoDate) : null;
      }

      this.$refs[ref].toggle(event);
    },
    saveFilter() {
      this.filter = JSON.parse(JSON.stringify(this.tempFilter));
      this.filter.applied = true;
      this.filtered = true;
    },
    clearFilter() {
      this.filter = {
        applied: false,
        regNumber: null,
        regDate: null,
        contragent: [],
        executorWorkPlace: null,
        projectPosition: null,
        irn: null,
        theme: null,
        sciadvisor: [],
        mnvo: null,
        mnvoDate: null,
        contractSum: null,
      };
      this.filtered = false;
    },
    getFullname(user) {
      if (!user) {
        return '';
      }

      let name = '';

      if (this.$i18n.locale === 'en' && this.validString(user.thirdnameEn) && this.validString(user.firstnameEn)) {
        name = user.thirdnameEn + ' ' + user.firstnameEn

        if (this.validString(user.lastnameEn)) {
          name += ' ' + user.lastnameEn
        }

        return name
      }

      name = user.thirdName + ' ' + user.firstName

      if (this.validString(user.lastName)) {
        name += ' ' + user.lastName
      }

      return name
    },
    validString(str) {
      if (str && str.length > 0) {
        return true;
      }

      return false;
    },
    projectPositionsLabel(data) {
      return this.$t('contracts.projectPositions.' + data);
    },
    exportReport() {
      this.tableLoading = true;

      this.service.getGPCActsStatus({
        page: this.page,
        rows: this.rows,
        type: 'export',
        language: this.$i18n.locale,
        filter: {
          regNumber: this.filter.regNumber,
          regDate: this.filter.regDate,
          contragent: this.filter.contragent.length > 0 && this.filter.contragent[0] ? this.filter.contragent[0].userID : null,
          executorWorkPlace: this.filter.executorWorkPlace,
          projectPosition: this.filter.projectPosition,
          irn: this.filter.irn,
          theme: this.filter.theme,
          sciadvisor: this.filter.sciadvisor.length > 0 && this.filter.sciadvisor[0] ? this.filter.sciadvisor[0].userID : null,
          mnvo: this.filter.mnvo,
          mnvoDate: this.filter.mnvoDate,
          contractSum: this.filter.contractSum,
        },
      }, {
        headers: getHeader(),
        responseType: "blob",
      }).then(res => {
        let blob = new Blob([res.data]);
        let downloadElement = document.createElement("a");
        let href = window.URL.createObjectURL(blob)
        downloadElement.href = href;
        downloadElement.download = 'Статус актов ГПХ.xlsx';
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
        window.URL.revokeObjectURL(href);

        this.tableLoading = false;
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.tableLoading = false;
      });
    }
  },
  computed: {
    menu() {
      return [
        {
          label: this.$t('common.export'),
          icon: "fa-solid fa-file-excel",
          command: () => {
            this.exportReport()
          },
        },
      ]
    },
  },
}
</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
}
.card {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}
.card-grow {
  flex-grow: 1;
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
.status-status_rejected {
  background: #fdfdfd;
  color: #ff0000;
}
:deep(.p-datatable.p-datatable-scrollable > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead) {
  background: transparent;
}
</style>
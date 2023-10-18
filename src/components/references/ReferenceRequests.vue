<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <div class="l-card flex flex-column p-0" :style="{height: innerHeightInRem.toString()+'rem',
    minHeight: '300px'}">
    <TabView v-model:activeIndex="panelActiveIndex.outside" class="flex flex-column flex-grow-1">
      <TabPanel :header="$t('requests.requests')" >
        <DataTable v-if="requests" :value="requests" dataKey="id" :rows="requestBody.rows"
          :totalRecords="total" :paginator="true" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="
            $t('common.showingRecordsCount', {
              first: '{first}',
              last: '{last}',
              totalRecords: '{totalRecords}',
            })" :lazy="true" :loading="tableLoading" scrollable scrollHeight="flex"
          v-model:selection="selectedRequest" selectionMode="single" :rowHover="true"
          @page="onPage($event)" @update:selection="selectedRequestChanged()">
            <Column :header="$t('requests.requestType')" style="width: 50%; min-width: 500px; flex-grow: 5; flex-shrink: 0;">
              <template #body="slotProps">
                <div class="flex align-items-center flex-wrap card-container gap-3">
                  <span :class="slotProps.data.type">{{ $t('requests.types.' + slotProps.data.type) }}</span>
                  <i style="color:green" v-if="slotProps.data.status > 0" class="fa-solid fa-square-check fa-xl"></i>
                </div>
              </template>
            </Column>
            <Column :header="$t('requests.requestedUser')" style="width: 20%; min-width: 200px; flex-grow: 2; flex-shrink: 0;">
              <template #body="slotProps">
                {{ slotProps.data.requestedUser ? slotProps.data.requestedUser.fullName : "" }}
              </template>
            </Column>
            <Column :header="$t('requests.requestedTime')" style="width: 20%; min-width: 200px; flex-grow: 2; flex-shrink: 0;">
              <template #body="slotProps">
                {{ getLongDateString(slotProps.data.createdTime) }}
              </template>
            </Column>
            <Column style="width: 10%; min-width: 100px; flex-grow: 1; flex-shrink: 0;">
              <template #body="slotProps">
                <Button icon="fa-solid fa-arrow-right" @click="this.selectedRequest = slotProps.data;selectedRequestChanged();this.panelActiveIndex.outside = 1"></Button>
              </template>
            </Column>
        </DataTable>
      </TabPanel>
      <TabPanel :header="$t('requests.selectedRequest')" :disabled="!selectedRequest">
        <TabView v-model:activeIndex="panelActiveIndex.inside" @tab-change="panelTabChanged()" class="flex flex-column flex-grow-1">
          <TabPanel :header="$t('requests.information')" >
            <Menubar :model="menuItems" class="mb-2" style="height: 2.5rem;"></Menubar>
            <div v-if="selectedRequest" class="flex flex-column flex-grow-1 ml-2 mr-2">
              <div class="p-fluid lg:col-6 mb-2" v-if="selectedRequest.type === Enum.DocumentRequestType.ReferenceErrorCorrection">
                <InlineMessage severity="error" class="justify-content-start">{{ selectedRequest.commentary }}</InlineMessage>
              </div>
              <div class="lg:col-6">
                <p> {{ $t('requests.requestType') + ": " }}
                  <span :class="selectedRequest.type">{{ $t('requests.types.' + selectedRequest.type) }}</span>
                </p>
              </div>
              <div class="flex-grow-1 p-2" style="overflow: scroll; height: 150px;" v-if="selectedRequestParams">
                <div v-for="param in selectedRequestParams" :key="param.id">
                  <label v-if="param.name == 'text' || param.name == 'date'">{{ $t('requests.params.' + param.description) }}</label>
                  <div class="p-fluid lg:col-6 mb-3" v-if="param.name == 'text' && param.properties.translate">
                    <InputText v-model="param.value.kz" type="text" class="mb-1" @input="input()"></InputText>
                    <InputText v-model="param.value.ru" type="text" class="mb-1" @input="input()"></InputText>
                    <InputText v-model="param.value.en" type="text" @input="input()"></InputText>
                  </div>
                  <div class="p-fluid lg:col-6 mb-3" v-else-if="param.name == 'text'">
                    <InputText v-model="param.value" type="text"
                      :disabled="param.properties.readonly" @input="input()"></InputText>
                  </div>
                  <div class="p-fluid lg:col-6 mb-3" v-else-if="param.name == 'date'">
                    <PrimeCalendar v-model="param.value" dateFormat="dd.mm.yy" showIcon
                      :disabled="param.properties.readonly" @update:modelValue="input()"></PrimeCalendar>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel :header="$t('requests.reference')" :disabled="!selectedRequest || !selectedRequest.doc.filePath">
            <embed :src="pdf" style="width: 100%; height: 100%;" v-if="pdf" type="application/pdf"/>
          </TabPanel>
        </TabView>
      </TabPanel>
    </TabView>
  </div>
</template>
<script>
import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";
import { getLongDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";
import { DocService } from "@/service/doc.service";

export default {
  name: 'ReferenceRequests',
  components: {},
  props: {
    
  },
  emits: [],
  data() {
    return {
      Enum: Enum,

      innerHeightInRem: 0,
      loading: false,
      tableLoading: true,

      requests: null,
      selectedRequest: null,
      selectedRequestParams: [],
      pdf: null,
      
      panelActiveIndex: {
        outside: 0,
        inside: 0,
      },
      changed: false,
      
      total: 0,
      requestBody: {
        page: 0,
        rows: 10,
        requestTypes: [
          Enum.DocumentRequestType.ReferenceErrorCorrection, 
          Enum.DocumentRequestType.ReferenceSalaryRequest
        ],
      },
      docService: new DocService(),

      menuItems: [
        {
          label: this.$t('requests.save'),
          icon: "fa-regular fa-floppy-disk",
          disabled: () => !this.changed || !this.selectedRequest || 
            this.selectedRequest.status > 0,
          command: () => this.updateStatus(1)
        },
        {
          label: this.$t('requests.reject'),
          icon: "fa-solid fa-ban",
          disabled: () => !this.selectedRequest || this.selectedRequest.status > 0,
          command: () => this.updateStatus(2)
        },
      ]
    }
  },
  mounted() {
    this.initApiCall();

    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    getLongDateString: getLongDateString,
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
    initApiCall() {
      this.tableLoading = true
      this.docService.docrequests(this.requestBody).then(res => {
        this.requests = res.data.docrequests
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
    updateStatus(status) {
      this.loading = true;
      this.parseParams();

      let requestBody = {
        requestId: this.selectedRequest.id,
        status: status,
        docParams: this.selectedRequest.doc.newParams,
      };
      
      this.docService.docrequestUpdate(requestBody).then(res => {
        this.selectedRequest.status = status
        this.selectedRequest.completedUserId = (JSON.parse(window.localStorage.getItem("loginedUser"))).userID
        this.selectedRequest.completedTime = Date.now()

        if (status === 1) {
          const req = {uuid: this.selectedRequest.doc.uuid,}
          this.docService.documentGet(req).then(res => {
            this.selectedRequest.doc = res.data;
            this.getParams();
            this.loading = false;
          }).catch(err => {
            if (err.response && err.response.data && err.response.data.localized) {
              this.showMessage('error', this.$t(err.response.data.localizedPath), null)
            } else {
              console.log(err)
              this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
            }

            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      }).catch(err => { 
        if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    panelTabChanged() {
      if (this.panelActiveIndex.inside === 1 && this.pdf == null) {
        this.getPdf()
      }
    },
    selectedRequestChanged() {
      this.changed = false;
      this.pdf = null;
      this.panelActiveIndex.inside = 0;

      this.getParams();
    },
    getParams() {
      this.selectedRequestParams = [];

      let param = this.selectedRequest.doc.newParams['registration_number']
      this.selectedRequestParams.push(param)

      param = this.selectedRequest.doc.newParams['registration_date']
      param.value = param.value ? new Date(param.value) : null
      this.selectedRequestParams.push(param)

      param = this.selectedRequest.doc.newParams['full_name']
      this.selectedRequestParams.push(param)

      param = this.selectedRequest.doc.newParams['structural_unit']
      this.selectedRequestParams.push(param)
      
      param = this.selectedRequest.doc.newParams['position']
      this.selectedRequestParams.push(param)

      param = this.selectedRequest.doc.newParams['work_start_date']
      param.value = new Date(param.value)
      this.selectedRequestParams.push(param)

      if (this.selectedRequest.doc.newParams['salary'].value) {
        param = this.selectedRequest.doc.newParams['salary_amount']
        this.selectedRequestParams.push(param)
      }
    },
    parseParams() {
      for (const ind in this.selectedRequestParams) {
        const param = this.selectedRequestParams[ind]
        this.selectedRequest.doc.newParams[param.description].value = param.value
      }
    },
    getPdf() {
      if (!this.selectedRequest.doc.filePath) {
        return
      }

      this.loading = true
      const req = {
        uuid: this.selectedRequest.doc.uuid,
      }
      this.docService.documentDownload(req).then(res => {
        this.pdf = b64toBlob(res.data);

        this.loading = false
      }).catch(err => {
        if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.loading = false
      })
    },
    onPage(event) {
      this.requestBody.page = event.page;
      this.initApiCall();
    },
    input() {
      this.changed = true
    },
  }
}
</script>
<style scoped>
.l-card {
  background-color: #ffffff;
  padding: 1rem;
}

.reference_error_correction, .reference_salary_request {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.reference_error_correction {
  background: #feedaf;
  color: #ff0000;
}

.reference_salary_request {
  background: #17a2b8;
  color: #fff;
}

:deep(.p-tabview-panels) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0rem;
}

:deep(.p-tabview-panel) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

</style>
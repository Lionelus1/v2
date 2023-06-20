<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
  <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
  <div>
    <TabView v-model:activeIndex="panelActiveIndex.outside">
      <TabPanel :header="$t('requests.requests')">
        <DataTable v-if="requests" :value="requests" dataKey="id" :rows="requestBody.rows"
          :totalRecords="total" :paginator="true" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="
            $t('common.showingRecordsCount', {
              first: '{first}',
              last: '{last}',
              totalRecords: '{totalRecords}',
            })" :lazy="true" :loading="loading"
          v-model:selection="selectedRequest" selectionMode="single" :rowHover="true"
          @page="onPage($event)" @row-select="select($event)" style="margin: -1rem;">
            <Column :header="$t('requests.requestType')">
              <template #body="slotProps">
                <div class="flex align-items-center flex-wrap card-container gap-3">
                  <span :class="slotProps.data.type">{{ $t('requests.types.' + slotProps.data.type) }}</span>
                  <i style="color:green" v-if="slotProps.data.status > 0" class="fa-solid fa-square-check fa-xl"></i>
                </div>
              </template>
            </Column>
            <Column :header="$t('requests.requestedUser')">
              <template #body="slotProps">
                {{ slotProps.data.requestedUser ? slotProps.data.requestedUser.fullName : "" }}
              </template>
            </Column>
            <Column :header="$t('requests.requestedTime')">
              <template #body="slotProps">
                {{ getLongDateString(slotProps.data.createdTime) }}
              </template>
            </Column>
            <Column>
              <template #body="slotProps">
                <Button icon="fa-solid fa-arrow-right" @click="this.selectedRequest = slotProps.data;this.panelActiveIndex.outside = 1"></Button>
              </template>
            </Column>
        </DataTable>
      </TabPanel>
      <TabPanel :header="$t('requests.selectedRequest')" :disabled="!selectedRequest">
        <TabView v-model:activeIndex="panelActiveIndex.inside" @tab-change="panelTabChanged()" style="margin: -1rem;">
          <TabPanel :header="$t('requests.information')" >
            <Menubar :model="menuItems" class="mb-4" style="height: 2.5rem; margin: -1rem; "></Menubar>
            <div v-if="selectedRequest">
              <div class="p-fluid lg:col-8 mb-2" style="margin-top: -1rem;"
              v-if="selectedRequest.type === Enum.DocumentRequestType.ReferenceErrorCorrection">
                <InlineMessage severity="error" class="justify-content-start">{{ selectedRequest.commentary }}</InlineMessage>
              </div>
              <div class="lg:col-8">
                <p> {{ $t('requests.requestType') + ": " }}
                  <span :class="selectedRequest.type">{{ $t('requests.types.' + selectedRequest.type) }}</span>
                </p>
              </div>
              <div class="p-fluid lg:col-8">
                <div v-for="param in selectedRequest.doc.params"
                  :key="param.id">
                  <label v-if="param.name == 'text'">{{ param.description == 'date' || param.description == 'number' ? $t('common.' + param.description) : param.description }}</label>
                  <InputText v-if="param.name == 'text'" v-model="param.value" type="text" class="mb-3"
                    :disabled="param.description == 'date' || param.description == 'number'" @input="input()"></InputText>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel :header="$t('requests.reference')">
            <div style="margin: -1rem;">
              <embed :src="pdf" style="width: 100%; height: 1000px" v-if="pdf" type="application/pdf"/>
            </div>
          </TabPanel>
        </TabView>
      </TabPanel>
    </TabView>
  </div>
</template>
<script>
import axios from 'axios';

import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";
import { getLongDateString } from "@/helpers/helper";
import Enum from "@/enum/docstates/index";

export default {
  name: 'ReferenceRequests',
  components: {},
  props: {
    
  },
  emits: [],
  data() {
    return {
      Enum: Enum,

      requests: null,
      selectedRequest: null,
      total: 0,
      pdf: null,

      panelActiveIndex: {
        outside: 0,
        inside: 0,
      },
      loading: true,
      changed: false,

      requestBody: {
        page: 0,
        rows: 10,
        requestTypes: [
          Enum.DocumentRequestType.ReferenceErrorCorrection, 
          Enum.DocumentRequestType.ReferenceInfoRequest
        ],
      },

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
    initApiCall() {
      this.loading = true

      axios.post(smartEnuApi + '/docrequests', this.requestBody, {
        headers: getHeader()
      }).then(res => {
        this.requests = res.data.docrequests
        this.total = res.data.total

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
    updateStatus(status) {
      this.loading = true

      let requestBody = {
        requestId: this.selectedRequest.id,
        status: status,
      }

      if (status === 1) {
        requestBody['docParams'] = this.selectedRequest.doc.params
      }

      axios.post(smartEnuApi + '/docrequest/update', requestBody, {
        headers: getHeader()
      }).then(res => {
        this.selectedRequest.status = status
        this.selectedRequest.completedUserId = (JSON.parse(window.localStorage.getItem("loginedUser"))).userID
        this.selectedRequest.completedTime = Date.now()

        if (status === 1) {
          this.getPdf()
        } else {
          this.loading = false
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

        this.loading = false
      })
    },
    panelTabChanged() {
      if (this.panelActiveIndex.inside === 1 && this.pdf == null) {
        this.getPdf()
      }
    },
    getPdf() {
      this.loading = true

      axios.post(smartEnuApi + '/document/download', {
        uuid: this.selectedRequest.doc.uuid,
      }, {
        headers: getHeader() 
      }).then(res => {
        this.pdf = b64toBlob(res.data);

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
    select(event) {
      this.pdf = null
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
.reference_error_correction, .reference_info_request {
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

.reference_info_request {
  background: #17a2b8;
  color: #fff;
}
</style>
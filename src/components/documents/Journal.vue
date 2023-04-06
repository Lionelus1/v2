<template>
  <div>
    <div class="content-section">
      <div class="feature-intro ml-3">
        <h4>{{ $t("contracts.journal") }}</h4>
      </div>
      <div class="content-section implementation">
        <div class="card">
          <div>
            <Menubar
                :model="initMenu"
                :key="active"
                style="height: 36px;margin-top: 0px;margin-right: -13px;margin-left: -13px;">
              <template #end>
                <Button type="button" icon="pi pi-filter"
                        :label="$t('common.filter')" @click="toggle('globalFilter', $event)" aria:haspopup="true"
                        aria-controls="overlay_panel" class="p-button-text p-button-plain" :class="[{'active': isFilterActive}]"></Button>
              </template>
            </Menubar>
            <OverlayPanel ref="globalFilter" appendTo="body">
              <div class="p-fluid">
                <div class="field">
                  <label for="status-filter">{{ $t('common.status') }}</label>
                  <Dropdown v-model="filters.status.value" :options="statuses" :placeholder="$t('common.select')" class="p-column-filter" :showClear="true">
                    <template #value="slotProps">
                      <span v-if="slotProps.value" :class="'customer-badge status-' + slotProps.value.value">
                        {{
                          $i18n.locale === 'kz' ? slotProps.value.nameKz : $i18n.locale === 'ru' ? slotProps.value.nameRu : slotProps.value.nameEn
                        }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span :class="'customer-badge status-' + slotProps.option.value">
                        {{
                          $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru' ? slotProps.option.nameRu : slotProps.option.nameEn
                        }}
                      </span>
                    </template>
                  </Dropdown>
                </div>
                <div class="field">
                  <label>{{ $t('common.author') }}</label>
                  <InputText type="text" v-model="filters.author.value" :placeholder="$t('common.author')" />
                </div>
                <div class="field">
                  <label>{{ $t('contracts.cafedraGroup') }}</label>
                  <InputText type="text" v-model="filters.department.value" :placeholder="$t('contracts.cafedraGroup')" />
                </div>
                <div class="field">
                  <Button :label="$t('common.clear')" @click="clearFilter(true)" class="mb-2 p-button-outlined"/>
                  <Button :label="$t('common.search')" @click="initApiCall()" class="mt-2"/>
                </div>
              </div>
            </OverlayPanel>
            <!-- {{contracts}} -->
            <DataTable
                v-if="contracts"
                selectionMode="single"
                v-model:selection="selectedContract"
                :lazy="true"
                :totalRecords="total"
                :value="contracts"
                @page="onPage($event)"
                :paginator="true"
                :first="lazyParams.first"
                :rows="lazyParams.rows"
                dataKey="id"
                :rowHover="true"
                :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[10, 25, 50]"
                :currentPageReportTemplate="
                $t('common.showingRecordsCount', {
                  first: '{first}',
                  last: '{last}',
                  totalRecords: '{totalRecords}',
                })"
                responsiveLayout="scroll"
                @sort="onSort($event)"
                @filter="onFilter($event)">
              <Column field="createDate" :header="$t('faq.createDate')"></Column>
              <Column field="owner.fullName" :header="$t('common.createdBy')"></Column>
              <Column field="owner.mainPosition.department" :header="$t('contracts.cafedraGroup')">
                <template #body="{ data }">
                  {{ initDepartment(data) }}
                </template>
              </Column>
              <Column field="number" :header="$t('common.number')"></Column>
              <Column field="registerDateS" :header="$t('common.registeredDate')"></Column>
              <Column field="template" :header="$t('common.description')">
                <template #body="{ data }">
                  <div v-if="data.template">
                    {{ $i18n.locale === 'ru' ? data.template.descriptionRus : data.template.descriptionKaz }}
                  </div>
                  <div v-else>
                    {{  data['name' + $i18n.locale] }}
                  </div>
                </template>
              </Column>
              <Column field="state" :header="$t('common.state')">
                <template #body="slotProps">
                  <span :class="'customer-badge status-' + slotProps.data.docHistory.stateEn">
                    {{ $t("common.states." + slotProps.data.docHistory.stateEn) }}
                  </span>
                  &nbsp;<i style="color:green" v-if="slotProps.data.signedByMe" class="fa-solid fa-square-check fa-xl not-approved"></i>
                </template>
              </Column>
              <Column>
                <template #body="slotProps">
                  <Button @click="deleteFile(slotProps.data.id)"
                          v-if="slotProps.data.owner.userID == loginedUser.userID && slotProps.data.docHistory.state != 7" type="button"
                          icon="pi pi-trash" class="p-button-danger"></Button>
                </template>
              </Column>

            </DataTable>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {smartEnuApi, getHeader, b64toBlob} from "@/config/config";
import {FilterMatchMode} from "primevue/api";

import axios from "axios";

export default {
  data() {
    return {
      loginedUser: null,
      loading: false,
      filters: {
        author: {value: null, matchMode: FilterMatchMode.CONTAINS},
        status: {value: null, matchMode: FilterMatchMode.EQUALS},
        department: {value: null, matchMode: FilterMatchMode.CONTAINS},
      },
      statuses: [
        {
          id: 1,
          nameRu: "Создан",
          nameKz: "Құрылды",
          nameEn: "Created",
          value: "created"
        },
        {
          id: 2,
          nameRu: "На согласовании",
          nameKz: "Келісуде",
          nameEn: "In approval",
          value: "inapproval"
        },
        {
          id: 3,
          nameRu: "Согласован",
          nameKz: "Келісілді",
          nameEn: "Approved",
          value: "approved"
        },
        {
          id: 4,
          nameRu: "На доработке",
          nameKz: "Түзетуде",
          nameEn: "Revision",
          value: "revision"
        },
        {
          id: 6,
          nameKz: "Қол қоюда",
          nameRu: "На подписи",
          nameEn: "Signing",
          value: "signing"
        },
        {
          id: 7,
          nameRu: "Подписан",
          nameKz: "Қол қойылды",
          nameEn: "Signed",
          value: "signed"
        },
        
      ],
      contracts: [],
      selectedContract: null,
      total: 0,
      lazyParams: {
        page: 0,
        rows: 10,
        first: 0
      },
      isFilterActive: false
    }
  },
  computed: {
    initMenu() {
      return [
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          command: () => {
            if (this.selectedContract != null) {
              this.$router.push('/documents/contract/' + this.selectedContract.id)
            }
          }
        }
      ];
    }
  },
  methods: {
    initApiCall() {
      if (this.filters.author.value || this.filters.status.value) {
        this.isFilterActive = true;
      }
      localStorage.setItem("journalCurrentPage", JSON.stringify(this.lazyParams));
      localStorage.setItem("contractFilters", JSON.stringify(this.filters));
      let url = "/agreement/journal";
      this.loading = true;
      this.lazyParams.userID = this.$store.state.loginedUser.userID
      let localFilter = JSON.parse(JSON.stringify(this.filters));
      this.lazyParams.filters = localFilter
      if (this.filters.status.value != null && this.filters.status.value.id != null) {
        this.lazyParams.filters.status.value = this.filters.status.value.id;
      }
      axios.post(smartEnuApi + url, this.lazyParams, {headers: getHeader()}).then((res) => {
        this.loading = false
        this.total = res.data.total
        this.contracts = res.data.docs
      }).catch((error) => {
        console.log(error)
        this.loading = false
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    clearFilter() {
      this.isFilterActive = false;
      this.filters.author.value = null
      this.filters.status.value = null
      this.filters.department.value = null
      this.initApiCall();
    },
    onPage(event) {
      this.lazyParams = event;
      this.lazyParams.sortLang = this.$i18n.locale;
      this.initApiCall();
    },
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    getLoginedUser() {
      this.loginedUser = this.$store.state.loginedUser;
    },
    deleteFile(fileID) {
      this.$confirm.require({
        message: this.$t("common.doYouWantDelete"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: () => {
          let url = "/doc/removeFile";
          axios.post(smartEnuApi + url, {id: fileID, hide: false}, {headers: getHeader()})
              .then(_ => {
                    this.showMessage('success', this.$t('common.success'), this.$t('common.message.successCompleted'));
                    this.initApiCall();

                  },
                  error => {
                    console.log(error);
                  });
        },
      });
    },
    showMessage(msgtype, message, content) {
      this.$toast.add({severity: msgtype, summary: message, detail: content, life: 3000});
    },
    initDepartment(data) {
      try {
        let result = ""
        if (this.$i18n.locale === "kz") {
          result = data.owner.mainPosition.department.cafedra ? data.owner.mainPosition.department.cafedra.nameKz + "/" : "";
          result += data.owner.mainPosition.department.name;
        } else if (this.$i18n.locale === "ru") {
          result = data.owner.mainPosition.department.cafedra ? data.owner.mainPosition.department.cafedra.name + "/" : "";
          result += data.owner.mainPosition.department.name;
        } else {
          result = data.owner.mainPosition.department.cafedra ? data.owner.mainPosition.department.cafedra.nameEn + "/" : "";
          result += data.owner.mainPosition.department.name;
        }
        return result
      } catch (ex) {
        console.log(ex)
        return null;
      }

    }

  },
  created() {
    let oldPath = this.$router.options.history.state.forward;
    if (oldPath && oldPath.indexOf('/documents/contract/') !== -1) {
      this.lazyParams = JSON.parse(localStorage.getItem("journalCurrentPage"))
      this.filters = JSON.parse(localStorage.getItem("contractFilters"))
      if (this.filters.author.value || this.filters.status.value) {
        this.isFilterActive = true;
      }
    }
    this.initApiCall();
    this.getLoginedUser();
  },

};
</script>

<style scoped>
.active {
  background: #2196F3 !important;
  color: #fff !important;
}
</style>
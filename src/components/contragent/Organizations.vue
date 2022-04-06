<template>
  <div>
    <div class="content-section introduction">
      <div class="feature-intro p-ml-3">
        <h4 style="display: inline">{{ $t("contragent.organization") }}</h4>
        <label style="color: grey"
          >&nbsp;{{ this.$t("common.records") }}: {{ this.count }}</label
        >
      </div>
    </div>
    <div class="content-section implementation">
      <div class="card p-p-0">
        <div class="p-col">
          <Menubar
            :model="menu"
            :key="active"
            style="
              height: 36px;
              margin-top: -7px;
              margin-right: -7px;
              margin-left: -7px;
            "
          >
            <template #end>
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                  @keyup.enter="initApiCall"
                  style="height: 30px"
                  v-model="filters['global'].value"
                  placeholder="іздеу"
                />
              </span>
            </template>
          </Menubar>
          <div class="box">
            <DataTable
              class="p-datatable-sm"
              v-model:selection="selectedOrganizations"
              selectionMode="single"
              dataKey="id"
              :value="organizations"
              :paginator="true"
              :rowHover="true"
              :filters="filters"
              :loading="loading"
              :totalRecords="total"
              :lazy="true"
              :rows="lazyParams.rows"
              @page="onPage($event)"
              @sort="onSort($event)"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="
                $t('common.showingRecordsCount', {
                  first: '{first}',
                  last: '{last}',
                  totalRecords: '{totalRecords}',
                })
              "
            >
              <template #empty>
                {{ this.$t("common.recordsNotFound") }}
              </template>
              <template #loading>
                {{ this.$t("common.recordsLoading") }}
              </template>
              <Column
                selectionMode="multiple"
                headerStyle="width: 3em"
              ></Column>
              <Column field="name" :header="$t('common.name')" :sortable="true">
                <template #body="slotProps">
                  <Button
                    class="p-button-link p-text-left"
                    @click="toggle($event, slotProps.data)"
                    >{{
                      this.$i18n.locale != "ru"
                        ? '"' +
                          slotProps.data.name +
                          '" ' +
                          slotProps.data.form.shortname
                        : slotProps.data.form.shortnameru +
                          ' "' +
                          slotProps.data.nameru +
                          '"'
                    }}</Button
                  >
                </template>
              </Column>
              <Column
                field="iin"
                :header="$t('contact.bin')"
                :sortable="true"
              ></Column>
              <Column
                field="locality.name"
                :header="$t('contact.locality')"
                :sortable="true"
              ></Column>
              <Column
                field="phone"
                :header="$t('contact.phone')"
                :sortable="true"
              ></Column>
            </DataTable>
            <Sidebar
              v-model:visible="sideVisible"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
            >
              <Organization
                :modelValue="currentOrganization"
                :readonly="readOnly"
                @inserted="inserted"
              ></Organization>
            </Sidebar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { smartEnuApi, getHeader, findRole } from "@/config/config";
import axios from "axios";
import Organization from "./Organization.vue";
import Enum from "@/enum/docstates/index";
import { FilterMatchMode, FilterOperator } from "primevue/api";

export default {
  components: { Organization },
  data() {
    return {
      localmenu: [{
          label: this.$t("common.activeList"),
          items:[{
            label: this.$t("common.organization"),
            icon: "pi pi-home",
            command: () => {
              this.addOrganization()
            }
          }
          ]
      }],
      isAdmin: false,
      readOnly: true,
      active: null,
      organizations: null,
      total: 10,
      lazyParams: {
        page: 0,
        rows: 10,
        userType: Number(this.$route.params.type),
        sortLang: this.$i18n.locale,
        orgID: this.orgID
      },
      count: 0,
      selectedOrganizations: null,
      currentOrganization: {},
      orgShowCount: 15,
      loading: true,
      sideVisible: false,
      filters: {
        global: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
      },
      menu: [
        {
          label: "",
          icon: "pi pi-fw pi-refresh",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Updated",
              detail: "Data Updated",
              life: 3000,
            });
          },
        },
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
        },
        {
          label: this.$t("common.contacts"),
          icon: "pi pi-fw pi-user",
        },
      ],
    };
  },
  props: {
    modelValue: null,
    pagemenu: null,
  },
  methods: {
    findRole: findRole,
    inserted(value) {
      this.sideVisible = false;
      this.organizations.push(value.value);
    },
    initApiCall() {
      this.isAdmin = this.findRole(null, 'main_administrator')
      this.localmenu[0].items[0].disabled = !this.isAdmin
      this.$emit("update:pagemenu", this.localmenu)
      let url = "/contragent/organizations";
      if (
        this.filters.global.value != null &&
        this.filters.global.value != ""
      )
      {
        this.lazyParams.page = 0;
      }
      this.lazyParams.filters = this.filters
      axios
        .post(smartEnuApi + url, this.lazyParams,  {headers: getHeader()})
        .then((res) => {
          this.organizations = res.data.organizations;
          this.total = res.data.count
        })
        .catch((error) => {
          console.error(error);
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    onPage(event) {
      this.lazyParams = event;
      this.lazyParams.sortLang = this.$i18n.locale;
      this.initApiCall();
    },
    onSort(event) {
      this.lazyParams = event;
      this.lazyParams.filters = this.filters;
      this.lazyParams.sortLang = this.$i18n.locale;
      this.initApiCall();
    },
    onFilter() {
      this.lazyParams.filters = this.filters;
      this.lazyParams.sortLang = this.$i18n.locale;
      this.initApiCall();
    },
    addOrganization() {
      this.readOnly = false;
      this.currentOrganization = {
        
        id: null,
        name: "",
        nameru: "",
        form: {
          id: 1,
          name: "",
          shortname: "",
          namerus: "",
          shortnameru:"",
        },
        iin: null,
        address: null,
        addressru: null,
        postal: null,
        email: null,
        city: null,
        phone: null,
        bankaccount: null,
        state: 1,
        bank: {
          id: null,
          resident : null,
          name: null,
          namerus: null,
        },
        resident: 1,
        locality: {
          id: null,
          name: null,
          nameru: null,
          parentID: null,
        },
        type: 1,
        chief: null,
      };
      this.sideVisible = true;
    },
    toggle(event, data) {
      this.currentOrganization = data;
      this.selectedOrganizations = data;
      this.sideVisible = true;
      this.readOnly = true;
    },
  },
  mounted() {
    this.initApiCall();
    this.loading = false;
  },
};
</script>
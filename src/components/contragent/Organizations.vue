<template>
  <div>
    <div class="content-section introduction pb-3">
      <div class="feature-intro ml-3">
        <h4 style="display: inline">{{ $t("contragent.organization") }}</h4>
        <label style="color: grey"
          >&nbsp;{{ this.$t("common.records") }}: {{ this.count }}</label
        >
      </div>
    </div>
    <div class="content-section implementation">
      <div class="card p-0">
        <div class="p-col">
          <Menubar
            :model="menu"
            :key="active"
            style="height: 36px;
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
                  :placeholder="$t('common.search')"
                />
              </span>
            </template>
          </Menubar>
          <div class="box">
            <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
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
                selectionMode="single"
                headerStyle="width: 3em"
              ></Column>
              <Column field="name" :header="$t('common.name')" :sortable="true">
                <template #body="slotProps">
                  <Button
                    class="p-button-link text-left"
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
              ></Column>
              <Column
                field="phone"
                :header="$t('contact.phone')"
              ></Column>
            </DataTable>
            <Sidebar
              v-model:visible="sideVisible"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
            >
              <Organization id="orgOrgs"
                :modelValue="currentOrganization"
                :readonly="readOnly && !isAdmin"
                @changed="changed"
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
import Enum from "@/enum/docstates/index";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import {ContragentService} from "@/service/contragent.service"
export default {
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
      loading: false,
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
        orgID: -1
      },
      count: 0,
      selectedOrganizations: null,
      currentOrganization: {},
      orgShowCount: 15,
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
           //ToDo
           
          },
        },
        {
          label: this.$t("bank.card"),
          icon: "pi pi-fw pi-id-card",
          command: () => {
            this.toggle(null, this.selectedOrganizations)
          }
        },
        {
          label: this.$t("common.contacts"),
          icon: "pi pi-fw pi-user",
        },
        {
          label: this.$t("common.createNew"),
          icon: "pi pi-fw pi-plus",
          visible: this.selectedMode,
          command: () => {
              this.addOrganization()
          }
        }
      ],
      contragentService: new ContragentService()
    };
  },
  props: {
    modelValue: null,
    pagemenu: null,
    selectedMode: {
      type: Boolean,
      default: false
    },
  },
  emits:['changed'],
  setup(props, context) {
    function updateValue(currentOrganization) {
      context.emit("update:modelValue", currentOrganization);
      context.emit("update:windowOpened", false);
    }
    return {
      updateValue,
    };
  },
  methods: {
    findRole: findRole,
    changed(value) {
      this.sideVisible = false;
      this.organizations.push(value.value);
      this.$emit("changed",value)
    },
    initApiCall() {
      this.isAdmin = this.findRole(null, 'main_administrator') || this.findRole(null, "career_administrator")
      this.localmenu[0].items[0].disabled = !this.isAdmin
      this.$emit("update:pagemenu", this.localmenu)
      let url = "/contragent/organizations";
      this.loading =true;
      this.lazyParams.filters = this.filters
      this.contragentService.organizations(this.lazyParams).then((res) => {
          this.organizations = res.data.organizations;
          this.total = res.data.count
          this.loading = false;
        })
        .catch((error) => {
          console.error(error);
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          this.loading = false;
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
      if (this.selectedMode && event) {
         this.updateValue(data);
         this.$emit("selected", {value: data})
      } else {
          this.sideVisible = true;
          this.readOnly = true;
      }

    },
  },
  mounted() {
    this.initApiCall();
  },
  computed() {
    
  }
};
</script>
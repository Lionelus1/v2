<template>
  <div :style="organization ? 'margin:-1em; margin-top:0' : ''">
    <div
      class="content-section introduction"
      :style="organization ? 'margin-top:-1.5em; margin-bottom:1.5em' : ''"
    >
      <div class="feature-intro p-ml-3">
        <h4 style="display: inline">
          {{
            personType === PersonType.IndividualEntrepreneur
              ? $t("common.person")
              : $t("common.personal")
          }}
        </h4>
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
              <InputText
                @keyup.enter="initApiCall"
                style="height: 30px"
                v-model="filters['global'].value"
                placeholder="іздеу"
              />

              <Button
                icon="pi pi-search"
                style="height: 30px"
                class="p-ml-1"
                @click="initApiCall"
              />
            </template>
          </Menubar>
          <div class="box">
            <DataTable
              class="p-datatable-sm"
              v-model:selection="selectedPersons"
              selectionMode="single"
              :value="persons"
              :paginator="true"
              :rowHover="true"
              :filters="filters"
              :loading="loading"
              :lazy="true"
              :totalRecords="count"
              @page="onPage($event)"
              @sort="onSort($event)"
              :rows="lazyParams.rows"
              dataKey="id"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="
                $t('common.showingRecordsCount', {
                  first: '{first}',
                  last: '{last}',
                  totalRecords: '{totalRecords}',
                })
              "
              responsiveLayout="scroll"
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
              <Column
                style="display: none"
                field="fname"
                :sortable="true"
              ></Column>
              <Column
                style="display: none"
                field="sname"
                :sortable="true"
              ></Column>
              <Column
                field="fullName"
                :header="$t('common.name')"
                :sortable="true"
              >
                <template #body="slotProps">
                  <Button
                    class="p-button-link p-text-left"
                    @click="toggle($event, slotProps.data)"
                    >{{
                      slotProps.data.thirdName +
                      " " +
                      slotProps.data.firstName +
                      " " +
                      (slotProps.data.lastName ?? "")
                    }}</Button
                  >
                </template>
              </Column>

              <Column
                :header="$t('common.organization')"
                :headerClass="staffDisplay"
                :bodyClass="staffDisplay"
                field="orgName"
                :sortable="true"
              >
                <template
                  v-if="personType != PersonType.IndividualEntrepreneur"
                  #body="slotProps"
                >
                  {{
                    this.$i18n.locale != "ru"
                      ? '"' +
                        slotProps.data.organization.name +
                        '" ' +
                        slotProps.data.organization.form.shortname
                      : slotProps.data.organization.form.shortnameru +
                        ' "' +
                        slotProps.data.organization.nameru +
                        '"'
                  }}
                </template>
              </Column>
              <Column
                :header="$t('contact.position')"
                :headerClass="staffDisplay"
                :bodyClass="staffDisplay"
              >
                <template
                  v-if="personType != PersonType.IndividualEntrepreneur"
                  #body="slotProps"
                >
                  {{ slotProps.data.mainPosition["name" + $i18n.locale] }}
                </template>
              </Column>

              <Column
                field="iin"
                :header="$t('contact.iin')"
                :sortable="true"
              ></Column>
              <Column
                field="email"
                :header="$t('contact.email')"
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
              <Person :modelValue="currentPerson" :organization="organization" :addMode="addMode" :readonly="true" @userCreated="insertUser"></Person>
              
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
import Person from "./Person.vue";
import Enum from "@/enum/docstates/index";
import { FilterMatchMode, FilterOperator } from "primevue/api";

export default {
  components: { Person },
  data() {
    return {
      active: null,
      persons: null,
      addMode: false,
      personType: Number(this.$route.params.type),
      PersonType: Enum.PersonType,
      lazyParams: {
        page: 0,
        rows: 10,
        userType: Number(this.$route.params.type),
        sortLang: this.$i18n.locale,
        orgID: this.organization ? this.organization.id : null
      },
      staffDisplay:
        this.personType === Enum.PersonType.IndividualEntrepreneur
          ? "dnone"
          : "",
      count: 0,
      selectedPersons: null,
      currentPerson: {},
      orgShowCount: 15,
      loading: true,
      sideVisible: false,
      filters: {
        global: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        userType: {
          value:
            Number(this.$route.params.type) ===
            Enum.PersonType.OrganizationMember
              ? "student"
              : "INDIVIDUALENTREPRENEUR",
          matchMode:
            Number(this.$route.params.type) ===
            Enum.PersonType.OrganizationMember
              ? FilterMatchMode.NOT_EQUALS
              : FilterMatchMode.EQUALS,
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
        {
          label: this.$t("common.createNew"),
          icon: "pi pi-fw pi-plus",
          visible: this.insertMode,
          command: () => {
              this.addPerson()
          }
        }
      ],
      localmenu: [{
          label: this.$t("common.activeList"),
          items:[{
            label: this.$t("common.person"),
            icon: "pi pi-home",
            disabled: false,
            command: () => {
              this.addPerson()
            }
          }
          ]
      }],
    };
  },
  props: {
    modelValue: null,
    organization: null,
    signRight: Number,
    windowOpened: Boolean,
    pagemenu: null,
    insertMode: {
      type: Boolean,
      default: false
    }
    
  },
  setup(props, context) {
    function updateValue(currentPerson) {
      context.emit("update:modelValue", currentPerson);
      context.emit("update:windowOpened", false);
    }
    return {
      updateValue,
    };
  },
  watch: {
    "$route.params.type": function (id) {
      this.personType = Number(this.$route.params.type);
      this.initApiCall();
    },
  },

  methods: {
    findRole: findRole,
    initApiCall() {
      this.isAdmin = this.findRole(null, 'main_administrator')
      this.localmenu[0].items[0].disabled = !this.isAdmin
      this.$emit("update:pagemenu", this.localmenu)
      let url = "/contragent/persons";
      this.personType = Number(this.$route.params.type);
       if (this.$route.params.type === undefined) {
        this.personType = 2
      }

      this.filters.userType.value =
        this.personType  === Enum.PersonType.OrganizationMember
          ? "student"
          : "INDIVIDUALENTREPRENEUR";
      
      this.filters.userType.matchMode =
        this.personType  === Enum.PersonType.OrganizationMember
          ? FilterMatchMode.NOT_EQUALS
          : FilterMatchMode.EQUALS;
     
      this.staffDisplay =
        this.personType === Enum.PersonType.IndividualEntrepreneur
          ? "dnone"
          : "";
      this.lazyParams.filters = this.filters;
      if (
        this.filters.global.value != null &&
        this.filters.global.value != ""
      ) {
        this.lazyParams.page = 0;
      }
     
      this.lazyParams.orgID = this.organization != null ? this.organization.id : null
      axios
        .post(smartEnuApi + url, this.lazyParams, { headers: getHeader() })
        .then((res) => {
          this.persons = res.data.persons;
          this.count = res.data.count;
          if (!this.persons) {
            this.persons= []
          }

        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          if (error.response.status == 404) {
            this.persons = [];
            this.count = 0;
          }

          console.error(error);
        });
    },
    insertUser(user) {
      this.persons.push(user)
    },
    toggle(event, data) {
      this.addMode = false;
      this.currentPerson = data;
      this.selectedPersons = data;
      if (this.organization) {
        this.updateValue(data);
        this.$emit("updated",event)
      }
      else this.sideVisible = true;

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
    addPerson(){
      this.currentPerson = {
        IIN: null,
        name: null,
        type: null,
        mail: null,
        info: null,
        id : null,
        photo: null,
        lastName: null,
        thirdName: null,
        firstName: null,
        birthday: null,
        gender: null,
        state: null,
        residnet: null,
        locality: {
          id: null,
          name: null,
        },
        address: null, 
        addressrus: null,
        phone: null,
        email: null,
        idnumber: null,

        mainPosition: {
          id: null,
          name:null,
          nameen: null,
          namekz:null,
          nameru:null,
        },
        bank: {}
        
      }
      this.addMode = true
      this.sideVisible = true;

    }
  },

  mounted() {
    this.lazyParams.filters = this.filters;
    this.initApiCall();
    this.loading = false;
  },
};
</script>

<style>
.dnone {
  display: none;
}
</style>

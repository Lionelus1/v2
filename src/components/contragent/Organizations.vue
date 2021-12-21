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
              :rows="orgShowCount"
              :filters="filters"
              :loading="loading"
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
                :readonly="true"
              ></Organization>
            </Sidebar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { smartEnuApi, getHeader } from "@/config/config";
import axios from "axios";
import Organization from "./Organization.vue";
import Enum from "@/enum/docstates/index";
import { FilterMatchMode, FilterOperator } from "primevue/api";

export default {
  components: { Organization },
  data() {
    return {
      active: null,
      organizations: null,
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
  },
  methods: {
    initApiCall() {
      let url = "/contragent/organizations";

      var req = {
        id: 0,
        count: this.orgShowCount,
        orgtype: Enum.ContragentType.Bank + Enum.ContragentType.Organization,
      };
      axios
        .post(smartEnuApi + url, req,  {headers: getHeader()})
        .then((res) => {
          this.organizations = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    toggle(event, data) {
      this.currentOrganization = data;
      this.selectedOrganizations = data;
      this.sideVisible = true;
    },
  },
  mounted() {
    this.initApiCall();
    this.loading = false;
  },
};
</script>
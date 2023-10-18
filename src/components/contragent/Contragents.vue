<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
    <BlockUI :blocked="loading" :fullScreen="true"></BlockUI>
    <div class="content-section introduction">
      <div class="feature-intro ml-3">
        <h4 style="display: inline">{{ $t("contragent.title") }}</h4>
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
              margin-top: 7px;
              margin-right: -7px;
              margin-left: -7px;
            "
          >
            <template #end>
              <div class="p-formgroup-inline">
                <div>
                  <Button
                    :label="agentType ? agentType.name : $t('common.filter')"
                    icon="pi pi-filter"
                    style="height: 28px; right: 5px"
                    class="p-button-secondary p-button-text"
                    @click="openAgentTypeSelect"
                  />
                  <OverlayPanel
                    ref="op"
                    appendTo="body"
                    :showCloseIcon="true"
                    id="overlay_panel"
                    style="width: 200px"
                    :breakpoints="{ '960px': '75vw' }"
                  >
                    <DataTable
                      :value="contragent"
                      v-model:selection="agentType"
                      selectionMode="single"
                      @rowSelect="onAgentTypeChange"
                      responsiveLayout="scroll"
                    >
                      <Column
                        field="name"
                        headerClass="hidden"
                        header="Name"
                        sortable
                        style="width: 50%"
                      ></Column>
                    </DataTable>
                  </OverlayPanel>
                </div>
                <div>
                  <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                      style="height: 30px"
                      v-model="filters['global'].value"
                      placeholder="іздеу"
                    />
                  </span>
                </div>
              </div>
            </template>
          </Menubar>
          <div class="box">
            <DataTable
              class="p-datatable-sm"
              v-model:selection="currentOrganization"
              selectionMode="single"
              dataKey="id"
              :value="contragents"
              :paginator="true"
              :rowHover="true"
              :rows="orgShowCount"
              :filters="filters"
              :loading="loading"
            >
              <template #empty>{{
                this.$t("common.recordsNotFound")
              }}</template>
              <template #loading>{{
                this.$t("common.recordsLoading")
              }}</template>
              <Column
                selectionMode="multiple"
                headerStyle="width: 3em"
              ></Column>
              <Column
                field="data.name"
                :header="$t('common.name')"
                :sortable="true"
              >
                <template #body="slotProps">
                  <Button
                    v-if="slotProps.data.type == ContragentType.Organization"
                    class="p-button-link text-left"
                    @click="toggle($event, slotProps.data)"
                    >{{
                      this.$i18n.locale != "ru"
                        ? '"' +
                          slotProps.data.data.name +
                          '" ' +
                          slotProps.data.data.form.shortname
                        : slotProps.data.data.form.shortnameru +
                          ' "' +
                          slotProps.data.data.nameru +
                          '"'
                    }}</Button
                  >
                  <Button
                    v-if="slotProps.data.type == ContragentType.Person"
                    class="p-button-link text-left"
                    @click="toggle($event, slotProps.data)"
                    >{{
                      slotProps.data.data.lname +
                      " " +
                      slotProps.data.data.fname +
                      " " +
                      (slotProps.data.data.sname ?? "")
                    }}</Button
                  >
                  <Button
                    v-if="slotProps.data.type == ContragentType.Bank"
                    @click="toggle($event, slotProps.data)"
                    class="p-button-link text-left"
                    >{{
                      this.$i18n.locale != "ru"
                        ? '"' +
                          slotProps.data.data.organization.name +
                          '" ' +
                          slotProps.data.data.organization.form.shortname
                        : slotProps.data.data.organization.form.shortnameru +
                          ' "' +
                          slotProps.data.data.organization.nameru +
                          '"'
                    }}</Button
                  >
                </template>
              </Column>
              <Column
                field="data.iin"
                :header="
                  agentType.value == ContragentType.Person
                    ? $t('contact.iin')
                    : $t('contact.bin')
                "
                :sortable="true"
              >
                <template #body="slotProps">
                  {{
                    slotProps.data.type === this.ContragentType.Bank
                      ? slotProps.data.data.organization.iin
                      : slotProps.data.data.iin
                  }}
                </template>
              </Column>
              <Column
                field="data.phone"
                :header="$t('contact.phone')"
                :sortable="true"
              >
                <template #body="slotProps">
                  {{
                    slotProps.data.type === this.ContragentType.Bank
                      ? slotProps.data.data.organization.phone
                      : slotProps.data.data.phone
                  }}
                </template>
              </Column>
              <Column
                field="data.email"
                :header="$t('contact.email')"
                :sortable="true"
              >
                <template #body="slotProps">
                  {{
                    slotProps.data.type === this.ContragentType.Bank
                      ? slotProps.data.data.organization.email
                      : slotProps.data.data.email
                  }}
                </template>
              </Column>
            </DataTable>
            <Sidebar
              v-model:visible="organizationVisible"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
            >
              <Organization
                :modelValue="currentOrganization"
                :readonly="true"
              ></Organization>
            </Sidebar>
            <Sidebar
              v-model:visible="personVisible"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
            >
              <Person
                :modelValue="currentOrganization"
                :readonly="true"
              ></Person>
            </Sidebar>
            <Sidebar
              v-model:visible="bankVisible"
              position="right"
              class="p-sidebar-lg"
              style="overflow-y: scroll"
            >
              <Bank :modelValue="currentOrganization" :readonly="true"></Bank>
            </Sidebar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getHeader, smartEnuApi } from "@/config/config";
import Bank from "./Bank.vue";
import Enum from "@/enum/docstates/index";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import {ContragentService} from "@/service/contragent.service"
export default {
  components: { Bank },
  data() {
    return {
      active: null,
      contragents: null,
      count: 0,
      ContragentType: Enum.ContragentType,
      currentOrganization: {},
      agentType: {
        name: this.$t("common.organization"),
        value: Enum.ContragentType.Organization,
      },
      orgShowCount: 15,
      loading: false,
      organizationVisible: false,
      personVisible: false,
      bankVisible: false,
      filters: {
        global: {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
      },

      contragent: [
        {
          name: this.$t("common.organization"),
          value: Enum.ContragentType.Organization,
        },
        { name: this.$t("common.person"), value: Enum.ContragentType.Person },
        { name: this.$t("bank.title2"), value: Enum.ContragentType.Bank },
      ],
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
      contragentService: new ContragentService()
    };
  },
  props: {
    modelValue: null,
    windowOpened: Boolean,
  },
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
    initApiCall() {
      let url = "/contragent/contragents";
      var req = {
        id: 0,
        count: this.orgShowCount,
        agenttype: this.agentType.value,
      };
      this.loading = true
      this.contragentService.contragents(req).then((res) => {
          this.contragents = res.data;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.error(error);
        });
    },
    toggle(event, data) {
      this.currentOrganization = data.data;
      this.updateValue(data.data);
      this.$emit("selected", {value: data.data})
    },
    openAgentTypeSelect(event) {
      this.$refs.op.toggle(event);
    },
    onAgentTypeChange(event) {
      this.$refs.op.hide();
      this.initApiCall();
    },
    getOrgTypeName() {
      return this.agentType ? this.agentType.name : this.$t("common.filter");
    },
  },
  mounted() {
    this.agentType = {
      name: this.$t("common.organization"),
      value: Enum.ContragentType.Organization,
    };
    this.initApiCall();
    this.loading = false;
  },
};
</script>
<style>
.hidden {
  display: none;
}
</style>
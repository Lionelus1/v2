<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ this.$t("roleControl.giveRole")}}</h3>
      <div>
        <Menubar :model="menu" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
    </div>
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-field pb-3">
          <label>{{ this.$t("common.organizationNameLabel") }}</label>
          <InputText type="text" v-model="selectedOrganizationText" disabled />
        </div>
        <div class="p-field pb-3">
          <label>{{ this.$t("roleControl.employeeLabel") }}</label>
          <FindUser v-model="employeeFullName" :max="1" searchMode="local" :user-type="3"></FindUser>
<!--          <div class="p-inputgroup">-->
<!--            <InputMask v-model="iin" :placeholder="this.$t('roleControl.employeeIIN')" mask="999999999999"/>-->
<!--            <Button icon="pi pi-search" class="p-button-warning" @click="searchEmployee"/>-->
<!--          </div>-->
<!--          <div style="margin-top: 0.5rem;" class="p-field">-->
<!--            <InputText type="text" v-model="employeeFullName" disabled />-->
<!--          </div>-->
        </div>
        <div class="p-field">
          <label>{{ this.$t("roleControl.roleLabel") }}</label>
          <Dropdown class="dropdown" v-model="role" :options="roles"
            :optionLabel="itemLabel" :placeholder="$t('roleControl.selectRole')"
            :filter="true" :showClear="true" dataKey="id"
            :emptyFilterMessage="$t('roleControl.noResult')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RoleControlService from "./RoleControlService";
import FindUser from "@/helpers/FindUser";

export default {
  name: "AddRole",
  props: {
    selectedOrganization: null,
  },
  components: {
    FindUser
  },
  data() {
    return {
      roles: [],
      role: null,
      iin: null,
      employee: null,
      selectedOrganizationText: '',
      employeeFullName: null,
      params: {
        roleId: 0,
        userId: 0,
        orgId: null,
      },
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => this.isDisabled(),
          command: () => this.save(),
        }
      ]
    }
  },
  roleControlService: null,
  created() {
    this.roleControlService = new RoleControlService();
  },
  mounted() {
    this.selectedOrganizationText = this.selectedOrganization ? this.selectedOrganization.bin + ' - ' + this.selectedOrganization['name' + this.$i18n.locale] : this.$t('roleControl.selectOrg')
    this.roleControlService.getRoles(this.selectedOrganization.id).then(response => {
      this.roles = response.data
    })
  },
  methods: {
    save() {
      this.params.orgId = this.selectedOrganization.id;
      this.params.roleId = this.role.id;
      this.params.userId = this.employeeFullName[0].userID;
      this.roleControlService.addRoleRelation(this.params).then(result => {
        this.emitter.emit("roleRelationAdded", true);
      });
    },
    // searchEmployee() {
    //   if (this.iin.length === 12) {
    //     this.roleControlService.getEmployeeByIIN(this.iin).then(response => {
    //       this.employee = response.data
    //       this.employeeFullName = this.employee.thirdName + ' ' + this.employee.firstName + ' ' + this.employee.lastName
    //     }).catch(error => {
    //       if (error.response.status == 401) {
    //         this.$store.dispatch("logLout")
    //       }
    //       if (error.response.status == 400) {
    //         this.$toast.add({
    //           severity: "error",
    //           summary: this.$t('roleControl.employeeNotFound'),
    //           life: 3000,
    //         })
    //       } else {
    //         this.$toast.add({
    //           severity: "error",
    //           summary: error,
    //           life: 3000,
    //         })
    //       }
    //     })
    //   } else {
    //     this.employee = null
    //     this.employeeFullName = this.$t('roleControl.selectEmployee')
    //   }
    // },
    itemLabel(item) {
      return item[this.$i18n.locale] + ' (' + item.name + ')';
    },
    isDisabled() {
      return !(this.selectedOrganization !== null && this.employeeFullName !== null && this.role !== null);
    }
  }
}
</script>

<style>
#carddiv label {
  position: inherit;
}
</style>

<template>
  <div>
    <div class="p-col-12">

      <Toolbar class="p-mb-4">
        <template #end>
          <Button icon="pi pi-plus" class="p-button-success p-mr-2" @click="showAddCouncilDialog()" />
          <Button icon="pi pi-print" class="p-button-info p-mr-2" @click="openNew" />
          <Button icon="pi pi-trash" class="p-button-danger" @click="deleteMember()" :disabled="!selectedMember"/>
        </template>
        <template #start>
          <h4>{{ $t("dissertation.members") }}</h4>
        </template>
      </Toolbar>
      <DataTable selectionMode="single" v-model:selection="selectedMember" 
          :lazy="true"
          :totalRecords="membersCount"
          :value="MembersList"
          @page="reload($event)"
          
          :paginator="true"
          :rows="lazyParams.rows"
          dataKey="memberID"
          :rowHover="true"

          :loading="loading"
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
          @sort="reload($event)"
          @filter="reload($event)"
        >
           <Column field="fullName" :header="$t('common.fullName')" sortable="true" style="min-width:12rem"></Column>
           <Column :field="('academicDegree.name'+$i18n.locale)" sortable="true" :header="$t('common.academicDegree')"  style="min-width:12rem"></Column>
           <Column :field="('academicTitle.name' + $i18n.locale)" sortable="true" :header="$t('common.academicTitle')"  style="min-width:12rem"></Column>
           <Column :field="($i18n.locale=='ru' ? 'organization.nameRu' :  'organization.name')" sortable="true" :header="$t('common.workPlace')"  style="min-width:12rem"></Column>
           <Column :field="('mainPosition.name'+$i18n.locale)" sortable="true" :header="$t('contact.position')"  style="min-width:12rem"></Column>
           <Column field="specialitites" :header="$t('common.role')" style="min-width:12rem">
           <template #body="slotProps">
             <span v-for="role in slotProps.data.roles" :key="role.id" >
               {{getRoleName(role)}}
             </span>
           </template>
           </Column>
           <Column headerStyle="width: 4rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
             <template #body="slotProps">
              <Button icon="pi pi-trash" class="p-button-danger" @click="deleteMember(slotProps.data)"/>
            </template>
          </Column>

          </DataTable>
          <Dialog v-model:visible="dialog.addMember.state" :style="{width: '450px'}" :header="$t('dissertation.members')" :modal="true" class="p-fluid">
            <div class="p-fluid">
              <div class="p-field">
                <label for="name">{{$t('common.fullName')}}</label>
                <FindUser v-model="selectedMembers" :max="1" :editMode="true"></FindUser>
                <small class="p-error" v-if="submitted && validationErrors.members">{{$t('dissertation.validationErrors.selectSecretary')}}</small>
              </div>
              <div class="p-field">
                <label for="name">{{$t('common.role')}}</label>
                <RolesByName v-model="selectedRole" roleGroupName="dissertation_council"></RolesByName>
                <small class="p-error" v-if="submitted && validationErrors.role">{{$t('common.message.selectRole')}}</small>
              </div>
              <!-- <div v-if="selectedRole != null && (selectedRole.name=== 'dissertation_council_reviewer' || selectedRole.name=== 'dissertation_council_temporary_member')" class="p-field"> -->
              <div v-if="selectedRole != null && (selectedRole.name=== 'dissertation_council_reviewer')" class="p-field">
                <label for="name">{{$t('dissertation.doctorals')}}</label>
                <FindDoctorals :max="2" v-model="selectedDoctorals"></FindDoctorals>
                <small class="p-error" v-if="submitted && validationErrors.doctorals">{{$t('dissertation.validationErrors.selectDoctorals')}}</small>
              </div>
              
            </div>
            <template #footer>
                <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog(dialog.addMember)"/>
                <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addMember" />
            </template>
        </Dialog>
    </div>

  </div>
</template>
<script>
import { mapState} from "vuex";
import RolesByName from "../smartenu/RolesByName.vue"
import FindUser from "@/helpers/FindUser";
import Enums from "@/enum/docstates/index";
import axios from 'axios';
import {getHeader, smartEnuApi, findRole} from "@/config/config";
import FindDoctorals from "./FindDoctorals.vue"

export default {
  components: {  FindUser , RolesByName, FindDoctorals},
 data() {
   return {
    councilID:-1,
    dialog: {
      addMember: {
        state: false
      },
      deleteMember: {
        state: false
      },
    },
    selectedMembers : null,
    selectedMember: null,
    selectedDoctorals: null,
    selectedRole : null,
    
    Enums: Enums,
    MembersList :[],
    DissertationCouncilRoles: [],
    membersCount : -1,
    submitted: false,
    validationErrors :{
      members: false,
      role: false,
      doctorals: false,
    },
    loading: false,
    lazyParams: {
      page: 0,
      rows: 10,
    },
   }
 },
 created() {
   this.councilID = Number(this.$route.params.id);
   this.loadCouncil()
 },
 methods: {
  isDissertationAdmin() {
    if (this.myDetails && this.myDetails.status)
      this.myDetails.status = this.statuses.indexOf(this.myDetails.status);
  },
  findRole: findRole,
  deleteMember(data) {
    
    if (data !== undefined) {

      this.selectedMember = data
      
    }
    this.$confirm.require({
      message: this.$t("common.confirmation"),
      header: this.$t("common.confirm"),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        axios
        .post(smartEnuApi + "/dissertation/deleteCouncilMember", {id : this.selectedMember.memberID},  {
          headers: getHeader(),
        })
        .then((response) => {
          this.MembersList.splice(this.MembersList.indexOf(this.selectedMember),1);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
        
      },
    });
  },
  
  showAddCouncilDialog(){
  
    this.selectedMembers = null;
    this.selectedRole = null;
    this.dialog.addMember.state = true;
  },
  showDialog(dialog) {
    dialog.state = true;
  },
  hideDialog(dialog) {
    dialog.state = false;
  },
  reload(event) {
      //this.lazyParams = event;
      this.lazyParams = event;
      this.loadCouncil();
    },
  loadCouncil() {
    this.loading = true;
      this.lazyParams.id = this.councilID
      axios
        .post(smartEnuApi + "/dissertation/getcouncilmembers", this.lazyParams,  {
          headers: getHeader(),
        })
        .then((response) => {
          this.MembersList = response.data;
          if (this.MembersList.length>0 && this.membersCount <0) {
            this.membersCount = this.MembersList[0].count;
          }
          this.loading = false;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
  },
  
  addMember() {
    this.submitted = true;
    var request =  {userID: this.selectedMembers[0].userID, roleID: this.selectedRole.id, councilID: this.councilID}
    if (this.validateAddConsulMemberForm()) {
      // if (this.selectedRole != null && (this.selectedRole.name === "dissertation_council_reviewer" || this.selectedRole.name === "dissertation_council_temporary_member")) {
      if (this.selectedRole != null && (this.selectedRole.name === "dissertation_council_reviewer")) {
        request.dissertations = []
        this.selectedDoctorals.forEach(element => {
          request.dissertations.push(element.dissertation.id)
        });
      }
      axios.
        post(smartEnuApi + "/dissertation/addCouncilMember", 
          request, 
          {
          headers: getHeader(),
        })
        .then((res) => {
          this.selectedMembers[0].memberID = res.data;
          this.selectedMembers[0].roles = []
          this.selectedMembers[0].roles.push(JSON.parse(JSON.stringify(this.selectedRole)))
          this.MembersList.push(JSON.parse(JSON.stringify(this.selectedMembers[0])));
          this.submitted = false;
          this.hideDialog(this.dialog.addMember);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } 
          if (error.response.status == 302) {
            this.$toast.add({severity:"error", summary: this.$t('dissertation.title'), detail:this.$t('dissertation.message.hasSameMember'), life: 3000});
          }
          else {
            this.$toast.add({
            severity: "error",
            summary: "dissertationNewCouncilError\n" + error,
            life: 3000
            })
          }
        })
    }
    
  },
  validateAddConsulMemberForm() {
    this.validationErrors.members = !this.selectedMembers;
    this.validationErrors.role =  !this.selectedRole;
    this.validationErrors.doctorals = !((this.selectedRole && this.selectedRole.name != "dissertation_council_reviewer") || (this.selectedRole && this.selectedRole.name == "dissertation_council_reviewer" && this.selectedDoctorals != null))
    return !this.validationErrors.members && !this.validationErrors.role  && !this.validationErrors.doctorals
  },
  getRoleName(role) {
    //alert("Hello");
    switch(this.$i18n.locale) {
      case "kz": return role.kz;
      case "en": return role.en;
      case "ru": return role.ru;
    }
  }
 },
 computed: {
        ...mapState(["loginedUser"]),
    },
}
</script>
<style scoped>

</style>
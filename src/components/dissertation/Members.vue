<template>
  <div>
    <div class="p-col-12">

      <Toolbar class="p-mb-4">
        <template #end>
          <Button icon="pi pi-plus" class="p-button-success p-mr-2" @click="showAddCouncilDialog()" />
          <Button icon="pi pi-print" class="p-button-info p-mr-2" @click="openNew" />
          <Button icon="pi pi-trash" class="p-button-danger" @click="deleteCouncil()" :disabled="!selectedCouncil"/>
        </template>
        <template #start>
          <h4>{{ $t("dissertation.members") }}</h4>
        </template>
      </Toolbar>
      <DataTable selectionMode="single" v-model:selection="selectedCouncil" 
          :lazy="true"
          :totalRecords="(MembersList.length)"
          :value="MembersList"
          @page="reload($event)"
          
          :paginator="true"
          :rows="lazyParams.rows"
          dataKey="id"
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
           <Column :field="($i18n.locale=='kz'? 'academicDegree.nameKz' : $i18n.locale=='ru'? 'academicDegree.nameRu': 'academicDegree.nameEn')" sortable="true" :header="$t('common.academicDegree')"  style="min-width:12rem"></Column>
           <Column :field="($i18n.locale=='kz'? 'academicTitle.nameKz' : $i18n.locale=='ru'? 'academicTitle.nameRu': 'academicTitle.nameEn')" sortable="true" :header="$t('common.academicTitle')"  style="min-width:12rem"></Column>
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
             <template #body>
              <Button type="button" icon="pi pi-user-edit"></Button>
            </template>
          </Column>

          </DataTable>
          <Dialog v-model:visible="dialog.addMember.state" :style="{width: '450px'}" :header="$t('dissertation.members')" :modal="true" class="p-fluid">
            <div class="p-fluid">
              <div class="p-field">
                  <label for="name">{{$t('common.role')}}</label>
                  <RolesByName v-model="DissertationCouncilRoles" roleGroupName="dissertation_council"></RolesByName>
                  <small class="p-error" v-if="submitted && validationErrors.faculty">{{$t('dissertation.validationErrors.selectDepartment')}}</small>
                </div>
                <div class="p-field">
                  <label for="name">{{$t('common.fullName')}}</label>
                  <FindUser v-model="newCouncil.members" :max="1"></FindUser>
                  <small class="p-error" v-if="submitted && validationErrors.members">{{$t('dissertation.validationErrors.selectSecretary')}}</small>
                </div>
                <div class="p-field">
                  <label for="name">{{$t('dissertation.specialityCode')}}</label>
                  <SpecialitySearch :educationLevel="Enums.EducationLevel.Doctorate"  v-model="newCouncil.specialities" id="name"></SpecialitySearch>
                  <small class="p-error" v-if="(submitted && validationErrors.speciality)">{{$t('dissertation.validationErrors.selectSpeciality')}}</small>
                </div>
                <div class="p-field">
                  <label for="name">{{$t('dissertation.faculty')}}</label>
                  <DepartmentList v-model="newCouncil.department"></DepartmentList>
                  <small class="p-error" v-if="submitted && validationErrors.faculty">{{$t('dissertation.validationErrors.selectDepartment')}}</small>
                </div>
               
                <div class="p-field">
                  <label for="name">{{$t('faq.createDate')}}</label>
                  <PrimeCalendar 
                  style="width: 150px"
                  :disabled="disabled"
                  v-model="newCouncil.createdDate"
                  dateFormat="dd.mm.yy"
                  placeholder="dd.mm.yyyy"
                  :monthNavigator="true"
                  :yearNavigator="true"
                  yearRange="2000:2030"
                />
                <small class="p-error" v-if="submitted && validationErrors.createdDate">{{$t('dissertation.validationErrors.selectCreatedDate')}}</small>
                </div>
            </div>
            <template #footer>
                <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog(dialog.addMember)"/>
                <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addMember" />
            </template>
        </Dialog>
        {{members}}
    </div>
  </div>
</template>
<script>
import { mapState} from "vuex";
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import DepartmentList from "../smartenu/DepartmentList.vue"
import RolesByName from "../smartenu/RolesByName.vue"
import FindUser from "@/helpers/FindUser";
import Enums from "@/enum/docstates/index";
import axios from 'axios';
import {getHeader, header, smartEnuApi} from "@/config/config";
export default {
  components: { SpecialitySearch, DepartmentList, FindUser , RolesByName},
 data() {
   return {
     councilID:-1,
    dialog: {
      addMember: {
        state: false
      },
      deleteCouncil: {
        state: false
      },
    },
    newCouncil : {
      specialities: [],
      department: null,
      members: [],
      createdDate: null,
    },
    selectedCouncil : null,
    selectedRole : null,
    
    Enums: Enums,
    MembersList :[],
    DissertationCouncilRoles: [],
    CouncilsCount : 10,
    submitted: false,
    validationErrors :{
      speciality : false,
      faculty: false,
      members: false,
      createdDate: false,
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
  deleteCouncil() {
    this.$confirm.require({
      message: this.$t("common.confirmation"),
      header: this.$t("common.confirm"),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        axios
        .post(smartEnuApi + "/dissertation/deletecouncil", {id : this.selectedCouncil.id},  {
          headers: getHeader(),
        })
        .then((response) => {
          this.MembersList.splice(this.MembersList.indexOf(this.selectedCouncil),1);
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
    this.newCouncil.specialities = [];
    this.newCouncil.department = null;
    this.newCouncil.members = [];
    this.newCouncil.createdDate = null;
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
      let id = this.councilID
      //this.lazyParams.countMode = null;
      axios
        .post(smartEnuApi + "/dissertation/getcouncilmembers", {id:id},  {
          headers: getHeader(),
        })
        .then((response) => {
          this.MembersList = response.data;
          console.log(this.MembersList);
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
    if (this.validateAddConsulForm()) {
      axios.
        post(smartEnuApi + "/dissertation/newcouncil", this.newCouncil, {
          headers: getHeader(),
        })
        .then((res) => {
          this.newCouncil.id = res.data;
          this.MembersList.push(JSON.parse(JSON.stringify(this.newCouncil)));
          this.submitted = false;
          this.hideDialog(this.dialog.addMember);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
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
  validateAddConsulForm() {
    alert(this.newCouncil.members.count)
    this.validationErrors.speciality = !this.newCouncil.specialities || this.newCouncil.specialities.count <=0;
    this.validationErrors.faculty = !this.newCouncil.department;
    this.validationErrors.members = !this.newCouncil.members || this.newCouncil.members.count<=0;
    this.validationErrors.createdDate =  !this.newCouncil.createdDate;
    return !this.validationErrors.members && !this.validationErrors.speciality && !this.validationErrors.faculty && !this.validationErrors.createdDate;
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
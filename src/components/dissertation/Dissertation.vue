<template>
  <div>
    <div class="p-col-12">

      <Toolbar class="p-mb-4">
        <template #end>
          <Button v-if="isDissertationAdmin" icon="pi pi-plus" class="p-button-success p-mr-2" @click="showAddCouncilDialog()" />
          <Button v-if="isDissertationAdmin" icon="pi pi-print" class="p-button-info p-mr-2" @click="openNew" />
          <Button v-if="isDissertationAdmin"  icon="pi pi-trash" class="p-button-danger" @click="deleteCouncil()" :disabled="!selectedCouncil"/>
        </template>
        <template #start>
          <h4>{{ $t("dissertation.title") }}</h4>
        </template>
      </Toolbar>
      <DataTable selectionMode="single" v-model:selection="selectedCouncil" 
          :lazy="true"
          :totalRecords="CouncilsCount"
          :value="CouncilsList"
          @page="onPage($event)"
          
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
          @sort="onSort($event)"
          @filter="onFilter($event)"
        >
           <Column field="specialitites" :header="$t('dissertation.directionCode')" style="min-width:12rem">
           <template #body="slotProps">
             <span v-for="sp in slotProps.data.specialities" :key="sp.id" >
               {{sp.trainingDirection.code}}-{{getTrainigName(sp)}}<span v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>

             </span>
           </template>
           </Column>
           <Column field="specialitites" :header="$t('dissertation.specialityCode')" style="min-width:12rem">
           <template #body="slotProps">
             <span v-for="sp in slotProps.data.specialities" :key="sp.code" >
               {{sp.code}}-{{getTrainigName(sp)}}<span v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>
             </span>
           </template>
           </Column>
           <Column field="Secretary" :header="$t('dissertation.secretary')" sortable="true" style="min-width:12rem">
            <template #body="slotProps">
             <span v-if="slotProps.data.members.length>0"> {{slotProps.data.members[0].fullName }}</span>
           </template>
           </Column>
           <Column :field="($i18n.locale=='kz'? 'department.nameKz' : $i18n.locale=='en'? 'department.nameEn': 'department.name')" sortable="true" :header="$t('common.faculty')"  style="min-width:12rem"></Column>
           <Column headerStyle="width: 7rem; text-align: left" bodyStyle="text-align: left; overflow: visible">
             <template #body="slotProps">
              <Button type="button" icon="pi pi-user-edit" @click="openCouncil(slotProps.data.id)"></Button>
            </template>
          </Column>

          </DataTable>
          <Dialog v-model:visible="dialog.addCouncil.state" :style="{width: '450px'}" :header="$t('dissertation.title')" :modal="true" class="p-fluid">
            <div class="p-fluid">
                <div class="p-field">
                  <label for="name">{{$t('dissertation.specialityCode')}}</label>
                  <SpecialitySearch :educationLevel="Enums.EducationLevel.Doctorate"  v-model="newCouncil.specialities" id="name"></SpecialitySearch>
                  <small class="p-error" v-if="(submitted && validationErrors.speciality)">{{$t('dissertation.validationErrors.selectSpeciality')}}</small>
                </div>
                <div class="p-field">
                  <label for="name">{{$t('common.faculty')}}</label>
                  <DepartmentList :autoLoad="true" v-model="newCouncil.department" :placeHolder="$t('smartenu.selectFaculty')"></DepartmentList>
                  <small class="p-error" v-if="submitted && validationErrors.faculty">{{$t('dissertation.validationErrors.selectDepartment')}}</small>
                </div>
                <div class="p-field">
                  <label for="name">{{$t('dissertation.secretary')}}</label>
                  <FindUser v-model="newCouncil.members" :max="1"></FindUser>
                  <small class="p-error" v-if="submitted && validationErrors.members">{{$t('dissertation.validationErrors.selectSecretary')}}</small>
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
                <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog(dialog.addCouncil)"/>
                <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addCouncil" />
            </template>
        </Dialog>
    </div>
  </div>
</template>
<script>
import { mapState} from "vuex";
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import DepartmentList from "../smartenu/DepartmentList.vue"
import Enums from "@/enum/docstates/index";
import axios from 'axios';
import {getHeader, findRole, smartEnuApi} from "@/config/config";
export default {
  components: { SpecialitySearch, DepartmentList },
 data() {
   return {
    dialog: {
      addCouncil: {
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
    
    Enums: Enums,
    CouncilsList :[],
    isDissertationAdmin : false,
    CouncilsCount : -1,
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
   this.loadCouncilsList()
 },
 mounted() {
    this.checkRole()
 },
 methods: {
  findRole: findRole,
  checkRole() {
    this.isDissertationAdmin = this.findRole(null, 'dissertation_chief') 
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
          this.CouncilsList.splice(this.CouncilsList.indexOf(this.selectedCouncil),1);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
        
      },
    });
  },
  openCouncil(id) {
    this.$router.push({name: "Members", params: {id: id,role:1}});
  },
  showAddCouncilDialog(){
    this.newCouncil.specialities = [];
    this.newCouncil.department = null;
    this.newCouncil.members = [];
    this.newCouncil.createdDate = null;
    this.dialog.addCouncil.state = true;
  },
  showDialog(dialog) {
    dialog.state = true;
    
  },
  hideDialog(dialog) {
    dialog.state = false;
  },
  onPage(event) {
      //this.lazyParams = event;
      this.lazyParams = event;
      this.loadCouncilsList();
    },
    onSort(event) {
      this.lazyParams = event;
      this.loadCouncilsList();
    },
    onFilter() {
      this.lazyParams.filters = this.filters;
      this.loadCouncilsList();
    },
 
  loadCouncilsList() {
    this.loading = true;

      this.lazyParams.userID =  this.$store.state.loginedUser.userID
      axios
        .post(smartEnuApi + "/dissertation/getcouncils", this.lazyParams,  {
          headers: getHeader(),
        })
        .then((response) => {
          this.CouncilsList = response.data;
          if (this.CouncilsList.length> 0 && this.CouncilsCount < 0){
            this.CouncilsCount = this.CouncilsList[0].count

          }
          this.loading = false;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
         
        });
    
  },
  addCouncil() {
    this.submitted = true;
    if (this.validateAddConsulForm()) {
      axios.
        post(smartEnuApi + "/dissertation/newcouncil", this.newCouncil, {
          headers: getHeader(),
        })
        .then((res) => {
          this.newCouncil.id = res.data;
          this.CouncilsList.push(JSON.parse(JSON.stringify(this.newCouncil)));
          this.submitted = false;
          this.hideDialog(this.dialog.addCouncil);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout"); 
          } 
          else {
            console.log(error.response.data)
            this.$toast.add({
            severity: "error",
            summary:  this.$t('common.message.' + error.response.data.error),
            life: 3000
            })
          }
        })
    }
    
  },
  validateAddConsulForm() {
    this.validationErrors.speciality = !this.newCouncil.specialities || this.newCouncil.specialities.count <=0;
    this.validationErrors.faculty = !this.newCouncil.department;
    this.validationErrors.members = !this.newCouncil.members;
    this.validationErrors.createdDate =  !this.newCouncil.createdDate;
    return !this.validationErrors.members && !this.validationErrors.speciality && !this.validationErrors.faculty && !this.validationErrors.createdDate;
  },
  getTrainigName(sp) {
      switch(this.$i18n.locale) {
      case "kz": return sp.trainingDirection.nameInKz;
      case "en": return sp.trainingDirection.nameInEn;
      case "ru": return sp.trainingDirection.nameInRu;
    }
  }
 },
 computed: {
        ...mapState(["loginedUser"]),
    },
}
</script>

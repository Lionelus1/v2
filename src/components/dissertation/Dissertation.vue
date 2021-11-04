<template>
  <div>
    <div class="p-col-12">

      <Toolbar class="p-mb-4">
        <template #right>
          <Button icon="pi pi-plus" class="p-button-success p-mr-2" @click="showDialog(dialog.addCouncil)" />
          <Button icon="pi pi-print" class="p-button-info p-mr-2" @click="openNew" />
          <Button icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
        </template>
        <template #left>
          <h4>{{ $t("dissertation.title") }}</h4>
        </template>
      </Toolbar>
      <DataTable
          :lazy="true"
          :totalRecords="CouncilsCount"
          :value="CouncilsList"
          @page="onPage($event)"
          :paginator="true"
          :rows="10"
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
               {{sp.trainingDirection.code}}<span v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>

             </span>
           </template>
           </Column>
           <Column field="Specialitites" :header="$t('dissertation.specialityCode')" style="min-width:12rem">
           <template #body="slotProps">
             <span v-for="sp in slotProps.data.specialities" :key="sp.code" >
               {{sp.code}}<span v-if="slotProps.data.specialities.indexOf(sp)<slotProps.data.specialities.length-1">, </span>
             </span>
           </template>
           </Column>
           <Column field="Secretary" :header="$t('dissertation.secretaryname')" sortable="true" style="min-width:12rem">
            <template #body="slotProps">
             <span v-if="slotProps.data.secretary.length>0"> {{slotProps.data.secretary[0].fullName }}</span>
           </template>
           </Column>
           <Column :field="($i18n.locale=='kz'? 'Department.nameKz' : $i18n.locale=='en'? 'Department.nameEn': 'Department.name')" :header="$t('dissertation.faculty')"  style="min-width:12rem"></Column>
           <Column field="inactive"  style="min-width:12rem"></Column>


          </DataTable>
          <Dialog v-model:visible="dialog.addCouncil.state" :style="{width: '450px'}" :header="$t('dissertation.title')" :modal="true" class="p-fluid">
            <div class="p-fluid">
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
                  <label for="name">{{$t('dissertation.secretary')}}</label>
                  <FindUser v-model="newCouncil.secretary" :max="1"></FindUser>
                  <small class="p-error" v-if="submitted && validationErrors.secretary">{{$t('dissertation.validationErrors.selectSecretary')}}</small>
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
                </div>
                
                {{newCouncil}}
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
import {

    mapState
} from "vuex";
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import DepartmentList from "../smartenu/DepartmentList.vue"
import FindUser from "@/helpers/FindUser";
import Enums from "@/enum/docstates/index";
import axios from 'axios';
import {getHeader, header, smartEnuApi} from "@/config/config";
export default {
  components: { SpecialitySearch, DepartmentList, FindUser },
 data() {
   return {
    dialog: {
      addCouncil: {
        state: false
      }
    },
    newCouncil : {
      specialities: null,
      department: null,
      secretary: null,
      createdDate: null,
    },
    
    Enums: Enums,
    CouncilsList : [
      
    ],
    Councils:[],
    CouncilsCount : 10,
    submitted: false,
    validationErrors :{
      speciality : false,
      faculty: false,
      secretary: false,
      createdDate: false,
    }
   }
 },
 methods: {
  isDissertationAdmin() {
    if (this.myDetails && this.myDetails.status)
      this.myDetails.status = this.statuses.indexOf(this.myDetails.status);
  },
  showDialog(dialog) {
    dialog.state = true;
  },
  hideDialog(dialog) {
    dialog.state = false;
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
          this.CouncilsList.push(this.newCouncil);
          this.submitted = false;
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
    this.validationErrors.speciality = !this.newCouncil.specialities || this.newCouncil.specialities.count <=0;
    this.validationErrors.faculty = !this.newCouncil.department;
    this.validationErrors.secretary = !this.newCouncil.secretary;
    this.validationErrors.createdDate =  !this.newCouncil.createdDate;
    return !this.validationErrors.secretary && !this.validationErrors.speciality && !this.validationErrors.faculty && !this.validationErrors.createdDate;
  }
 },
 computed: {
        ...mapState(["loginedUser"]),
    },
}
</script>

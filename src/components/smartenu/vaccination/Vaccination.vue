<template>
  <div>

    <div class="p-col-12">
    <h4>{{ $t("vaccination.title") }}</h4>

      <ConfirmDialog></ConfirmDialog>
        <div class="card">
          <div class="p-field">
          <div class="p-grid p-formgrid">
          <div class="p-col-10 p-mb-2 p-lg-2 p-mb-lg-0 vac-center">
          <label class="p-text-bold p-text-uppercase">{{ $t("common.myData") }}</label>
        </div>
        <div class="p-col-10 p-mb-2 p-lg-3 p-mb-lg-0">
          <ToggleButton style="width:210px" @change="saveMyDetails" :class="(!disabled ? 'p-button-outlined p-button-success ':'')" v-model="disabled" :offLabel="$t('common.save')" :onLabel="$t('common.edit')" offIcon="pi pi-check" onIcon="pi pi-pencil" />
        </div>
        <div class="p-col-10 p-mb-2 p-lg-3 p-mb-lg-0">
          <Button style="width:210px"  v-if="(myDetails.status === VS_Vaccinated && disabled && myDetails.pasportPath)" v-bind:label="$t('vaccination.pasport')" icon="pi pi-download" @click="downloadFile(myDetails.pasportPath, VS_Vaccinated)" />
          <FileUpload style="width:210px"  v-else-if="myDetails.status === VS_Vaccinated" mode="basic" :customUpload="true" @uploader="uploadPassport($event)" :auto="true" :chooseLabel="$t('vaccination.pasport')"></FileUpload>
        </div>
      </div>
      </div>
      <div>
      <div class="p-grid p-formgrid">
        <div class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0  p-field p-grid">
          <label class="p-col-fixed" style="width:60px">{{$t('common.status')}}</label>
          <div class="p-col vac-center">
            <Dropdown :disabled="disabled" style="width:150px" v-model="myDetails.status" @change="Change()" :options="statuses" >
              <template #value="slotProps" >
                <span>{{$t('vaccination.status.'+statuses[slotProps.value])}}</span>
              </template>
              <template #option="slotProps">
                <span>{{$t('vaccination.status.'+statuses[slotProps.index])}}</span>
              </template>
            </Dropdown>
          </div>
        </div>
        <div v-if="myDetails.status == VS_FirstComponent || myDetails.status == VS_Vaccinated" class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0 p-field p-grid">
          <label class="p-col-fixed" style="width:60px">{{$t('vaccination.vaccine')}}</label>
          <div class="p-col">
            <Dropdown style="width:150px" :disabled="disabled" ref="vaccine" placeholder="Select a Vaccine" @change="VaccineSelect()" v-model="myDetails.vaccine" :options="vaccines" optionLabel="vname">
                  <template #value="slotProps" >
                    <span>{{(slotProps.value.id >= 0 ? slotProps.value.vname : (slotProps.value.vname === -1 ? $t('common.other') : $t('common.select')))}}</span>
                  </template>
                  <template #option="slotProps">
                    <span>{{(slotProps.option.id >= 0 ? slotProps.option.vname : (slotProps.option.id === -1 ? $t('common.other') : $t('common.select')))}}</span>
                  </template>
            </Dropdown>
          </div>
        </div>
        <div v-if="myDetails.status == VS_FirstComponent" class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0 p-field p-grid">
          <label class="p-col-fixed" style="width:60px">{{$t('common.date')}} </label>
            <div class="p-col">
              <PrimeCalendar style="width:150px" :disabled="disabled" v-model="myDetails.date1" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
           </div>
            </div>
            <div v-if="myDetails.status == VS_Vaccinated" class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0 p-field p-grid">
              <label class="p-col-fixed" style="width:60px">{{$t('common.date')}} </label>
              <div class="p-col">
                <PrimeCalendar style="width:150px" :disabled="disabled" v-model="myDetails.date2" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
              </div>
            </div>
             <div v-if="myDetails.status == VS_Planned" class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0 p-field p-grid">
              <label class="p-col-fixed" style="width:60px">{{$t('common.date')}} </label>
              <div class="p-col">
                <PrimeCalendar style="width:150px" :disabled="disabled" v-model="myDetails.plannedDate" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
              </div>
            </div>
            <div v-if="myDetails.status == VS_Vaccinated || myDetails.status == VS_FirstComponent" class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0 p-field p-grid">
              <label class="p-col-fixed" style="width:60px">{{$t('vaccination.clinic')}} </label>
              <div class="p-col">
                <InputText :disabled="disabled" style="width:150px" v-model="myDetails.clinic" type="text"/>
              </div>
            </div>
            <div v-if="myDetails.status == VS_Rejected" class="p-col-12 p-mb-2 p-lg-4 p-mb-lg-0 p-field p-grid">
              <label class="p-col-fixed" style="width:60px">{{$t('common.reason')}} </label>
              <div class="p-col">
                <Textarea v-model="myDetails.rejectReason" rows="2" cols="30" />
              </div>
            </div>
            <div class="p-col vac-center" style="align:left">
              <!-- <Button class="p-button-help" v-if="myDetails.status === VS_Rejected"  :label="$t('vaccination.doctorsNote')" icon="pi pi-upload" />&nbsp; -->
              <Button v-if="(myDetails.status === VS_Rejected && disabled && myDetails.doctorsNotePath)" v-bind:label="$t('vaccination.doctorsNote')" icon="pi pi-download" @click="downloadFile(myDetails.doctorsNotePath, VS_Rejected)" />
              <FileUpload v-else-if="myDetails.status === VS_Rejected" mode="basic" :customUpload="true" @uploader="uploadDoctorsNote($event)" :auto="true" :chooseLabel="$t('vaccination.doctorsNote')"></FileUpload>
            </div>
            <div class="p-mt-2 p-col vac-center">

          </div>
          </div>
        </div>
        <br/>
        <!-- <Button class="p-button-help" v-if="myDetails.status === VS_Vaccinated"  :label="$t('vaccination.pasport')" icon="pi pi-upload" /> -->

      </div>
      <div v-if="(myDetails.userRole === 'dean' || myDetails.userRole === 'prorector' || myDetails.userRole === 'dephead' || myDetails.department === 'Департамент по социальному и гражданскому развитию')" class="card">
        <h5>{{ $t("vaccination.list") }}</h5>
         <DataTable :lazy="true" :totalRecords="detailsCount" :value="vaccinated" @page="onPage($event)" :paginator="true" class="p-datatable-vaccinated" :rows="10"
            dataKey="id" :rowHover="true" v-model:selection="selectedCustomers" v-model:filters="filters" filterDisplay="menu" :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50]"
            :currentPageReportTemplate="$t('common.showingRecordsCount', {first: '{first}', last: '{last}', totalRecords: '{totalRecords}' })"
            :globalFilterFields="['userRole','fullName','plannedDate','status', 'date2', 'date1']" responsiveLayout="scroll"
            @sort="onSort($event)" @filter="onFilter($event)"
            >

          <template #empty> {{$t('common.recordsNotFound')}} </template>
          <template #loading> Loading vaccinated data. Please wait. </template>
          <Column field="userRole" :header="$t('common.type')" sortable>
            <template #body="{data}">
              {{$t('common.' + data.userRole)}}
            </template>
            <template #filter="{filterModel}">
              <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/>
            </template>
          </Column>
          <Column :header="$t('common.fullName')" field="fullName" sortable>
            <template #body="{data}">
              <span class="p-column-title">{{$t('common.fullName')}}</span>
              {{data.fullName}}
            </template>
            <template #filter={filterModel}>
              <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/></template>
          </Column>
          <Column :header="$t('common.department')" field="department" sortable>
            <template #body="{data}">
              <span class="p-column-title">{{$t('common.department')}}</span>
              {{(data.facultet != null ? data.facultet + " / " : "") + (data.department != null ? data.department : "" )}}
            </template>
            <template #filter={filterModel}>
              <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by department"/></template>
          </Column>
          <Column :header="$t('vaccination.plannedDate')" field="plannedDate" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.plannedDate)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.date1')" field="date1" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.date1)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.date2')" field="date2" dataType="date" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{formatDate(data.date2)}}
            </template>
            <template #filter="{filterModel}">
              <PrimeCalendar v-model="filterModel.value" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" :monthNavigator="true" :yearNavigator="true" yearRange="2000:2030" />
            </template>
          </Column>
          <Column :header="$t('vaccination.vaccine')" field="vaccine.vname" style="min-width:10rem" sortable>
            <template #body="{data}">
              {{data.vaccine.vname}}
            </template>

          </Column>
          <Column field="status" :header="$t('common.status')" sortable :filterMenuStyle="{'width':'14rem'}" style="min-width: 10rem">
            <template #body="{data}">
              <span :class="'customer-badge status-' + statuses[data.status]">{{$t('vaccination.status.' + statuses[data.status])}}</span>
            </template>
            <template #filter="{filterModel}">
              <Dropdown v-model="filterModel.value"  :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                <template #value="slotProps" >
                  <span v-if="slotProps.value"  :class="'customer-badge status-' + slotProps.value">{{$t('vaccination.status.' + slotProps.value)}}</span>
                  <span v-else :class="'customer-badge status-' + slotProps.value">{{slotProps.value}}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'customer-badge status-' + slotProps.option">{{$t('vaccination.status.' + slotProps.option)}}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column :exportable="false">
            <template #body="slotProps">
              <Button v-if="slotProps.data.status == VS_Vaccinated" icon="pi pi-download" class="p-button-rounded p-button-success p-mr-2" @click="downloadFile(slotProps.data.pasportPath, VS_Vaccinated)" />
              <Button v-else-if="slotProps.data.status == VS_Rejected" icon="pi pi-download" class="p-button-rounded p-button-success p-mr-2" @click="downloadFile(slotProps.data.doctorsNotePath, VS_Rejected)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <!-- Диалогтар -->
    <Dialog :header="$t('vaccination.fillVacTitle')" v-model:visible="addVaccineDialogDisplay" :breakpoints="{'960px': '75vw'}" :style="{width: '50vw'}" modal="true">

       <InputText id="" style="width:100%" v-model="newVaccine.vname" />
        <transition-group name="p-message" tag="div">
            <Message v-for="msg of addVaccineDialogMessage" :severity="msg.severity" :key="msg.id">{{msg.content}}</Message>
        </transition-group>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" @click="CloseDialog('addvaccine')" class="p-button-text"/>
        <Button :label="$t('common.save')" icon="pi pi-check" @click="AddNewVaccine" autofocus />
      </template>
    </Dialog>

  </div>
</template>

<script>
import {FilterMatchMode,FilterOperator} from 'primevue/api';
import axios from "axios";
import { getHeader, header, smartEnuApi } from "@/config/config";
const VS_FirstComponent = 0;
const VS_Vaccinated = 1;
const VS_Planned = 2;
const VS_Rejected = 3;
const VS_NoData = 4;
export default {
  data() {
    return {
      passportFile:null,
      doctorsNoteFile:null,
      disabled: true,
      otherVaccine: {"id" : -1, "vname": "other"},
      lazyParams: {
        page :0,
        rows: 10,
        countMode: null,
      },
      addVaccineDialogDisplay: false,
      newVaccine : {vname:''},
      addVaccineDialogMessage: [],
      detailsCount : 0,
      currentDetailPage: 1,
      detailPagecount : 10,
      vaccinated: [ ],
      myDetails: {},
      loading : true,
      filters: {
          'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
          'userRole': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
          'fullName': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
          'department': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
          'plannedDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'date1': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'date2': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
          'status': {value: null, matchMode: FilterMatchMode.EQUALS},
      },

      statuses: ["firstcomponent", "vaccinated", "planned", "rejected", "noData"],
      usertype: ["personal", "student", "teacher"],
      vaccines: [],
      template : this.$t('common.showingRecordsCount'),
    };
  },
  created() {
    this.LoadConstants();
    this.getVaccineCatalog();
    this.getMyDetails();
    this.getDetailsCount();
    this.getDetailsList();
  },
  mounted() {
    this.loading = false;

  },
  methods: {
    Change() {
      if (this.myDetails && this.myDetails.status)
        this.myDetails.status = this.statuses.indexOf(this.myDetails.status)

    },
    CloseDialog(name) {
      if (name === 'addvaccine') {
        this.addVaccineDialogDisplay = false
        this.$refs.vaccine.$el.getElementsByTagName('input')[0].focus();
      }
    },
    VaccineSelect() {
      if (this.myDetails.vaccine.id === -1) {
        this.addVaccineDialogDisplay = true
        this.addVaccineDialogMessage = []
      }
    },
    AddNewVaccine() {
      if (this.newVaccine.vname === '') {
        this.addVaccineDialogMessage = [
          {severity: 'error', content: this.$t('vaccination.fillVacTitle'), id: 0},
        ]
        return;
      }

      axios
        .post(smartEnuApi + "/addNewVaccine", this.newVaccine, {
          headers: getHeader(),
        })
        .then((response) => {
          this.myDetails.vaccine = response.data;
          this.vaccines.splice(this.vaccines.length-1,1);
          this.vaccines.push(response.data)
          this.vaccines.push(this.otherVaccine)
          this.addVaccineDialogDisplay = false;
           this.$toast.add({
            severity: "success",
            summary: this.$t("common.message.succesSaved"),
            life: 3000,
          });
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "addNewVaccineError:\n" + error,
            life: 3000,
          });
        });
    },
    LoadConstants() {
      this.VS_NoData = VS_NoData,
      this.VS_FirstComponent = VS_FirstComponent;
      this.VS_Vaccinated = VS_Vaccinated;
      this.VS_Planned = VS_Planned;
      this.VS_Rejected = VS_Rejected;
      this.VS_NoData = VS_NoData;
    },
    LoadMyDetail() {

      this.myDetails = {};
      axios
        .get(smartEnuApi + "/getMyDetails", {
          headers: getHeader(),
        })
        .then((response) => {
          this.myDetails = response.data;

        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("vaccination.error.list") + ":\n" + error,
            life: 3000,
          });
        });
    },
    onPage(event) {
            //this.lazyParams = event;
            this.lazyParams = event
            this.getDetailsList();
    },
     onSort(event) {
            this.lazyParams = event;
            this.getDetailsList();
        },
        onFilter() {
            this.lazyParams.filters = this.filters;
            this.getDetailsList();
        },
    formatDate(value) {
      var result = "";
      if (value == null) {
        return result
      }
      var date = new Date(value)
      result = date.toLocaleDateString('kk-KZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) ;
      return result == 'Invalid Date' ? '' : result
    },
    getDetailsCount() {

      this.lazyParams.countMode = 1

      axios
        .post(smartEnuApi + "/getDetailsList", this.lazyParams, {
          headers: getHeader(),
        })
        .then((response) => {
          this.detailsCount = response.data;
          //this.detailsCount = 20000;

        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("vaccination.error.list") + ":\n" + error,
            life: 3000,
          });
        });
    },
    getDetailsList() {
      this.loading = true;

      this.lazyParams.countMode = null
      axios
        .post(smartEnuApi + "/getDetailsList", this.lazyParams, {
          headers: getHeader(),
        })
        .then((response) => {
          this.getDetailsCount()
          this.vaccinated = response.data;
          this.loading = false;

        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("vaccination.error.list") + ":\n" + error,
            life: 3000,
          });
        });
    },
    getVaccineCatalog() {
      this.vaccines = [];
      axios
        .get(smartEnuApi + "/getAllVaccines", {
          headers: getHeader(),
        })
        .then((response) => {
          this.vaccines.push({id : -2, vname: this.$t('common.select')})
          response.data.forEach(element => {
            this.vaccines.push(element)
          });
          this.vaccines.push(this.otherVaccine)
          this.loading = false;
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("vaccination.error.list") + ":\n" + error,
            life: 3000,
          });
        });
    },
    getMyDetails() {
      axios
        .get(smartEnuApi + "/getMyDetails", {
          headers: getHeader(),
        })
        .then((response) => {
          this.myDetails = response.data

          // if (this.myDetails.vaccine.id === null) {
          //   this.myDetails.vaccine.id = -2
          //   this.myDetails.vaccine.vname = this.$t("common.select")
          // }


          if (this.myDetails.status === null) {
            this.myDetails.status = VS_NoData
          }
          if (this.myDetails.date2 != null) {
            this.myDetails.date2 = new Date(this.myDetails.date2)
          }
          if (this.myDetails.date1 != null) {
            this.myDetails.date1 = new Date(this.myDetails.date1)
          }
          if (this.myDetails.plannedDate != null) {
            this.myDetails.plannedDate = new Date(this.myDetails.plannedDate)
          }
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "getMyDetailsError:\n" + error,
            life: 3000,
          });
        });
    },
     downloadFile(filename, status) {
       var req = {filename : filename, status :status}

      axios
        .post(smartEnuApi + "/downloadFile", {filename : filename, status :status}, {
          headers: getHeader(),
        })
        .then((response) => {
         // const blob = new Blob([response.data], )
          const link = document.createElement('a')
          link.href = 'data:application/octet-stream;base64,' + response.data;
          link.setAttribute('download', filename);
          link.download = filename
          link.click()
          URL.revokeObjectURL(link.href)
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "downloadFileError:\n" + error,
            life: 3000,
          });
        });
    },
    saveMyDetails() {
      if (this.disabled) {
        this.disabled = false;
        this.$confirm.require({
          message: this.$t('common.confirmation'),
          header: this.$t('common.confirm'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
             let data = new FormData();
            switch(this.myDetails.status){
              case VS_NoData:
                this.myDetails = {status : this.myDetails.status, userId: this.myDetails.userId}
                break;
              case VS_Rejected:
                this.myDetails = {userRole: this.myDetails.userRole, department: this.myDetails.department, status: this.myDetails.status, userId: this.myDetails.userId, rejectReason: this.myDetails.rejectReason, doctorsNotePath: this.myDetails.doctorsNotePath}
                if (this.myDetails.rejectReason === null || this.doctorsNoteFile === null) {
                  this.$toast.add({ severity: "error", summary: this.$t('common.message.fillError'),life: 3000,});
                  return;
                }
                data.append("doctorsnote", this.doctorsNoteFile)
                break;
              case VS_Planned:
                this.myDetails = { userRole: this.myDetails.userRole, department: this.myDetails.department, status : this.myDetails.status, userId: this.myDetails.userId, plannedDate : this.myDetails.plannedDate}
                if (this.myDetails.plannedDate === null) {
                  this.$toast.add({ severity: "error", summary: this.$t('common.message.fillError'),life: 3000,});
                  return;
                }
                break;
              case VS_FirstComponent:
                this.myDetails = { userRole: this.myDetails.userRole, department: this.myDetails.department, status : this.myDetails.status, userId: this.myDetails.userId, plannedDate : this.myDetails.plannedDate,
                  date1: this.myDetails.date1, vaccine: this.myDetails.vaccine, clinic: this.myDetails.clinic
                }
                if ( this.myDetails.vaccine.id < 0 || this.myDetails.date1 === null || this.myDetails.date1 === '' || this.myDetails.vaccine.id === null || this.myDetails.clinic === null) {
                  this.$toast.add({ severity: "error", summary: this.$t('common.message.fillError'),life: 3000,});
                  return;
                }
                break;
              case VS_Vaccinated:
                this.myDetails = {userRole: this.myDetails.userRole, department: this.myDetails.department, status : this.myDetails.status,  userId: this.myDetails.userId, plannedDate : this.myDetails.plannedDate,
                  date1: this.myDetails.date1, date2: this.myDetails.date2,  vaccine: this.myDetails.vaccine, clinic: this.myDetails.clinic,
                  pasportPath: this.myDetails.pasportPath
                }
                 if (this.myDetails.vaccine.id < 0 || this.myDetails.date2 === null || this.myDetails.date2 === '' || this.myDetails.vaccine.id === null || this.myDetails.clinic === null || this.passportFile === null) {
                  this.$toast.add({ severity: "error", summary: this.$t('common.message.fillError'),life: 3000,});
                  return;
                }
                data.append("passport", this.passportFile)
                break;


            }

            data.append('myDetails', JSON.stringify(this.myDetails))


            axios
              .post(smartEnuApi + "/updateMyDetails", data, {
                headers: getHeader(),
              })
              .then((response) => {
                this.myDetails.doctorsNotePath = response.data.doctorsNotePath
                this.myDetails.pasportPath = response.data.pasportPath
                this.$toast.add({severity:'success', summary:this.$t('common.save'), detail:this.$t('common.message.succesSaved'), life: 3000});
                this.disabled = true;
                this.getDetailsList();
                  })
                  .catch((error) => {
                    this.$toast.add({
                      severity: "error",
                      summary: "saveMyDetailsError:\n" + error,
                      life: 3000,
                    });
                  });
          },
          reject: () => {
            this.disabled = false;
          }
        });
      }
  },
  uploadPassport(event) {
    this.passportFile = event.files[0];
  },
  uploadDoctorsNote(event) {
    this.doctorsNoteFile = event.files[0];
  },
  },


};
</script>

<style lang="scss" scoped>
::v-deep(.p-paginator) {
    .p-paginator-current {
        margin-left: auto;
    }
}

::v-deep(.p-progressbar) {
    height: .5rem;
    background-color: #D8DADC;

    .p-progressbar-value {
        background-color: #607D8B;
    }
}

::v-deep(.p-datepicker) {
    min-width: 25rem;

    td {
        font-weight: 400;
    }
}

::v-deep(.p-datatable.p-datatable-vaccinated) {
    .p-datatable-header {
        padding: 1rem;
        text-align: left;
        font-size: 1.5rem;
    }

    .p-paginator {
        padding: 1rem;
    }

    .p-datatable-thead > tr > th {
        text-align: left;
    }

    .p-datatable-tbody > tr > td {
        cursor: auto;
    }

    .p-dropdown-label:not(.p-placeholder) {
        text-transform: uppercase;
    }
}
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-vaccinated{
    background: #c8e6c9;
    color: #256029;
  }
  &.status-firstcomponent{
    background: #b3e5fc;
    color: #23547b;
  }
  &.status-noData {
    background: #ffcdd2;
    color: #c63737;
  }
  &.status-rejected {
    background: #feedaf;
    color: #8a5340;
  }
   &.status-planned {
    background: #eccfff;
    color: #694382;
  }
}
.vac-center {
  display: flex;
  justify-content: left;
  align-items: center;
}
</style>

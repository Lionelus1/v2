<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em;" />
  <div>  
    <div> 
      <Toolbar class="mb-4 ">
        <template #start>
          <PrimeCalendar
            style="width: 140px"
            :disabled="disabled"            
            dateFormat="dd.mm.yy"
            selectionMode="single"        
            v-model="selectDate"           
            :placeholder="$t('common.date')"
            @date-select="getQueueReport"
            :monthNavigator="true"
            :yearNavigator="true"
            yearRange="2000:2030"
            :showIcon="true"                             
          />
        </template>

        <template #end>
        <Button           
          icon="pi pi-print " 
          v-tooltip.bottom="$t('common.add')"            
          class="p-button-primary mr-2 mr-4 no-print"  
          @click="printWindow"/>  
        </template>          
      </Toolbar>
    
    </div>
    <div class="card">            
      <DataTable :value="reports">
          <Column field="parentName" v-bind:header="$t('queue.title')">  
            <template #body="slotProps">
              {{slotProps.data["parentName"+$i18n.locale]}} -> {{slotProps.data["name"+$i18n.locale]}}
            </template>           
          </Column>         
          <Column field="fullName" v-bind:header="$t('queue.operator')">
            <template #body="slotProps">
              {{slotProps.data.queueOperator.fullName}}
            </template>
          </Column>
          <Column field="called" v-bind:header="$t('queue.calledcount')" ></Column>
          <Column field="serviced" v-bind:header="$t('queue.serviced')"></Column>
          <Column field="dontCome" v-bind:header="$t('queue.dnshowup')"></Column>
          <Column field="redirect" v-bind:header="$t('queue.redirected')"></Column>
          <Column field="workTime" v-bind:header="$t('queue.averageTime')">
            <template #body="slotProps">
              {{ convertTime(slotProps.data.workTime>0 && slotProps.data.serviced>0 ? (slotProps.data.workTime/slotProps.data.serviced):" ")}}
            </template>
          </Column>
      </DataTable>
    </div>
<!--    <Toolbar class="mb-4 ">
      <template #center>
        <span>{{$t('queue.reservation')}}:</span>
        <div class="grid gap-2">
          <PrimeCalendar
              style="width: 250px"
              dateFormat="dd.mm.yy"
              selectionMode="single"
              v-model="selectDateReserve"
              :placeholder="$t('common.date')"
              @date-select="getTimes(parseInt(this.$route.params.id), selectDateReserve)"
              :monthNavigator="true"
              :yearNavigator="true"
              yearRange="2000:2030"
              :showIcon="true"
          />
          <Dropdown @change="changeQueues" v-model="selectedQueue" :options="queues" option-label="queueNamekz" :placeholder="$t('common.select')"
                    class="p-inputtext-lg w-full mb-4"/>
          <Dropdown v-if="selectDayBool" @change="changeQueues2" v-model="selectedDay" :options="queues" option-label="queueNamekz" :placeholder="$t('common.select')"
                    class="p-inputtext-lg w-full mb-4"/>
          <Dropdown v-if="selectDayBool2" @change="changeQueues3" v-model="selectedDay2" :options="queues" option-label="queueNamekz" :placeholder="$t('common.select')"
                    class="p-inputtext-lg w-full mb-4"/>
        </div>
      </template>
    </Toolbar>
    <div class="card">
      <DataTable :value="timesList" tableStyle="min-width: 50rem">
        <template #empty> {{ $t('common.noData') }}</template>
        <Column field="revision_time" :header="$t('queue.time')"></Column>
        <Column field="reservision_number" :header="$t('queue.number')"></Column>
        <Column field="full_name" :header="$t('common.fullName')"></Column>
        <Column field="phone_number" :header="$t('contact.phone')"></Column>
        <Column field="email" :header="$t('contact.email')"></Column>
      </DataTable>
    </div>-->

  </div>
 
</template>

<script>
import {getHeader, smartEnuApi, findRole } from "@/config/config";
import api from "@/service/api";
export default {
 
  data() {
    return {
      reports:[],
      timesList:[],
      selectDate: null,
      selectDateReserve: null,
      queues: [],
      lazyParams: {
        first: 0,
        rows: 10,
        parentID: null,
      },
      selectedQueue: null,
      selectedDay: null,
      selectedDay2: null,
      selectDayBool: false,
      selectDayBool2: false,
    }
  },
  methods: {   
    findRole : findRole,
    changeQueues(event){
      this.getQueue(event.value.key,event.value)
      this.selectDayBool = true
      this.getTimes(event.value.key)
      console.log(this.timesList)
    },
    changeQueues2(event){
      this.getQueue(event.value.key,event.value)
      this.selectDayBool2 = true
      this.getTimes(event.value.key)
      console.log(this.timesList)
    },
    changeQueues3(event){
      //this.getQueue(event.value.key,event.value)
      this.getTimes(event.value.key)
    },
    getQueue(parentID) {
      this.submitted = true
      this.lazyParams.parentID = parentID
      api
          .post("/queue/allQueues", this.lazyParams, {
            headers: getHeader(),
          })
          .then((response) => {
            this.queues = response.data.queues;
            this.loading = false;
          })
          .catch((error) => {
            this.$toast.add({
              severity: "error",
              summary: this.$t("smartenu.loadError") + ":\n" + error,
              life: 3000,
            });
            if (error.response.status === 401) {
              this.$store.dispatch("logLout");
            }
          });
    },
    getTimes(id) {
      api
          .post("/queue/getQueueAvailableInfo", {id: id, date: this.selectDateReserve}, {
            headers: getHeader(),
          })
          .then((response) => {
            if (response.data) {
              response.data.forEach(entry => {
                const t = new Date(entry.revision_time).toISOString().substring(11, 16);
                entry.revision_time = t;
              });
              response.data.map(e => {
                e.full_name = e.last_name + ' ' + e.first_name
              });
              this.timesList = response.data
            }
          })
          .catch((error) => {
            console.log(error)
            this.loading = false;
            this.$toast.add({
              severity: "error",
              summary: this.$t("smartenu.loadError") + ":\n" + error,
              life: 3000,
            });
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            }
          });
    },
    getQueueReport(queueID) {
      this.loading = true  
      api
      .post("/queue/queueReport", {selectedDay:this.selectDate},{
        headers: getHeader(),
      })
      .then((response) => {
        this.reports = response.data; 
        // alert(JSON.stringify(this.reports));        
        this.loading = false;                  
      })
      .catch((error) => {
        this.loading = false;
        this.$toast.add({
          severity: "error",
          summary: this.$t("smartenu.loadError") + ":\n" + error,
          life: 3000,
        });
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },

    printWindow(){		
	    window.print();
    },

    padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    },
    convertTime(secn) {  
      var sec=Number(secn)
      var hours = Math.floor(sec/3600);
      (hours >= 1) ? sec = sec - (hours*3600) : hours = '00';
      var min = Math.floor(sec/60);
      (min >= 1) ? sec = sec - (min*60) : min = '00';
      (sec < 1) ? sec='00' : void 0;
      (min.toString().length == 1) ? min = '0'+min : void 0;    
      (sec.toString().length == 1) ? sec = '0'+sec : void 0;    
      console.log(hours+':'+min+':'+sec);
      return hours+':'+min+':'+Math.round(sec);
    }
    // padZero(string){
    //   return ("00" + string).slice(-2);
    // },

    // toReadableString(secn) {
    //   var hrs = ~~(secn / 3600 % 24),
    //       mins = ~~((secn % 3600) / 60)

    //   return hrs + ":" + this.padZero(mins) ;
    //}




  },
  created(){
    var queueID = parseInt(this.$route.params.id) ;   
    this.getQueueReport(queueID)
    //this.getQueue(queueID)
    //this.getTimes(queueID)
  },


 
};
</script>

<style scoped>
 @media print
    {    
        .no-print, .no-print *
        {
            display:none !important;
        }
    }
     @media print
    {    
        .show-print, .show-print *
        {
            display: block !important;
            width:100% !important;
        }
    }
.font-style {    
    width:300px;
    height:300px;
    font-size:220px;
}
.col2{
  display:block;
  float:left;
  width:50%;
} 
.col1{
  display:block;
  
  width:100%;
}  

</style>
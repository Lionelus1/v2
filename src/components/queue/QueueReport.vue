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
      
    </div>
 
</template>

<script>
import {getHeader, smartEnuApi, findRole } from "@/config/config";
import axios from "axios";
export default {
 
  data() {
    return {
      reports:[],
      selectDate:null,
      
      
    }
  },
  methods: {   
    findRole : findRole,

    getQueueReport(queueID) {
      this.loading = true  
      axios
      .post(smartEnuApi + "/queue/queueReport", {selectedDay:this.selectDate},{
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
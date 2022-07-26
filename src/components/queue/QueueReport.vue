<template>
  <div>  
      <div> 
        <div class="p-col">
          <PrimeCalendar
            style="width: 140px"
            :disabled="disabled"            
            dateFormat="dd.mm.yy"        
            v-model="selectDate"           
            :placeholder="$t('common.date')"
            :date-select="selectDate"
            :monthNavigator="true"
            :yearNavigator="true"
            yearRange="2000:2030"
            :showIcon="true"                       
          />
        </div>
        
      </div>               
    
    <div class="card">            
      <DataTable :value="reports" responsiveLayout="scroll">
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
          <Column field="averageTime" v-bind:header="$t('queue.averageTime')">
            <template #body="slotProps">
              {{convertTime(slotProps.data.averageTime)}}
            </template>
          </Column>
      </DataTable>
    </div>   
      
    </div>
 
</template>

<script>
import { authHeader, getHeader, smartEnuApi, findRole, b64toBlob } from "@/config/config";
import axios from "axios";
export default {
 
  data() {
    return {
      reports:[],
      selectDate: null,
      
      
    }
  },
  methods: {   
    findRole : findRole,

    getQueueReport(queueID) {
        this.loading = true  
        // alert(this.selectDate) 
        axios
        .post(smartEnuApi + "/queue/queueReport", {queueID:queueID,Date:this.selectDate},{
          headers: getHeader(),
        })
        .then((response) => {
          this.reports = response.data;         
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
   
    
    
  },
  created(){
    var queueID = parseInt(this.$route.params.id) ;   
    this.getQueueReport(queueID)
  },
 
  
 
};
</script>

<style scoped>

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
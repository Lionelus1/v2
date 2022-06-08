<template>
  <div>    
    <h5 class="p-col-6 p-offset-3 p-text-center p-text-bold">{{ reportTitle }}</h5>
    <br/>
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
          <Column field="called" header="Шақырылған адам саны" ></Column>
          <Column field="serviced" header="Қызмет алды"></Column>
          <Column field="dontCome" v-bind:header="$t('queue.dnshowup')"></Column>
          <Column field="redirect" v-bind:header="$t('queue.redirect')"></Column>
          <Column field="averageTime" header="Орташа қызмет көрсету уақыты">
            <template #body="slotProps">
              {{slotProps.data.averageTime}}
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
      
      
    }
  },
  methods: {   
    findRole : findRole,

    getQueueReport(parentID) {
        this.loading = true 
        // alert(parentID)    
        axios
        .post(smartEnuApi + "/queue/queueReport", {queueID:parentID},{
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
   
    
    
  },
  created(){
    var parentID = parseInt(this.$route.params.key) ;   
    this.getQueueReport(parentID)
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
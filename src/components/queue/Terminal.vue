<template>
 
    <div class="card">       
      <Sidebar  v-model:visible="visible" :baseZIndex="10000" :showCloseIcon="!findRole(null, 'queue_terminal')" position="full">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em;" />
        <div class="p-w-100 text-center" style="min-height:100%;v-align:middle">
          <SelectButton v-model="selectedlanguage" :options="languages" optionLabel="name" @click="selected" /><br>          
          <div >
            <div :class="'card primary-box p-ripple p-w-100'+' '+ (queues.length>6 ? 'col2':'col1')" v-for="queue of queues" :key="queue.key"  style=" margin-top:auto">           
              <Button  :label="queue['queueName' + $i18n.locale]" class="p-button-info p-button-lg" @click="registerQueue(queue)" style="width:90%;height:100px"/>            
            </div>
          </div>
        </div>
        
      </Sidebar>
      <div>
        <div style ="display:none">
            <embed
            ref = "pdfDocument"            
            id="pdfDocument"            
            type="application/pdf"
            :src="'data:application/pdf;base64,' + queinfo"
          />  
        </div>
      </div>
    </div>
    <!-- p:dialog position="right"  -->
     <Dialog
      v-model:visible="ticketVisible"
      :closable="false"
      header=""
      :style="{ width: '400px' }"   
        
      >
      <div class="confirmation-content">       
        <embed :src="queinfo + '#toolbar=0'" style="width: 100%;height: 320px;" v-if="queinfo" type="application/pdf" />        
        <h3 class="p-error">{{$t("queue.warning")}}</h3>
      </div>
      <template #footer> 
        <Button
          style="width:100%;height:40px;margin-bottom: 1.5rem;"
          :label="$t('common.print')"         
          class="p-button p-component p-button-success"                 
          @click="printDocument(queinfob64)"
        />    
        <Button
          style="width:100%;height:40px"
          :label="$t('common.close')"         
          class="p-button p-component p-button-secondary"          
          @click=" ticketVisible = false, selectedlanguage={name: 'Қазақ тілі', code: 'kz'}, selected() "
        />
      </template>
    </Dialog>
</template>

<script>
import { authHeader, getHeader, smartEnuApi, findRole, b64toBlob } from "@/config/config";
import api from "@/service/api";

export default {
 
  data() {
    return {
      ticketVisible:false,
      visible: true,
      printVisisble: true,
      printVisibleStartedTime: null,
      lazyParams: {
        first: 0,
        rows: 100,
        parentID: null,
      },
      cols:"",
      colCount: 2,      
      queinfo: null,
      queinfob64: null,
      selectedQueue: null,
      queues: [],
      loading: false,
      languages: [
				{name: 'Қазақ тілі', code: 'kz'},
				{name: 'Русский язык', code: 'ru'},
				{name: 'English', code: 'en'}
			],
      selectedlanguage: {name: 'Қазақ тілі', code: 'kz'},
      
    }
  },
  methods: {   
    findRole : findRole,
    b64toBlob: b64toBlob,
    selected() {
      this.$i18n.locale = this.selectedlanguage.code
    },
    printDocument(document) {
      let socket = new WebSocket("ws://localhost:8765");
      socket.onopen = function(e) {
        socket.send(document);
        
      };  
      this.ticketVisible=false;
    },
    selectDefaultParams() {
        this.ticketVisible = false, 
        this.selectedlanguage ={name: 'Қазақ тілі', code: 'kz'}; 
        this.selected()
    },
  
   
    getQueue(parentID) {
        this.loading = true  
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
    registerQueue(queue) {
      this.selectedQueue = queue
      this.loading = true      
      var req = {
        queueID: queue.key, lang: this.selectedlanguage.code
      }
      api
      .post("/queue/registerService", req,  {
          headers: getHeader(),
        })
      .then(response => {
        this.printVisibleStartedTime = Date.now()
        this.queinfob64 = response.data
        this.queinfo = this.b64toBlob(response.data)
        this.ticketVisible = true
        this.loading = false
        setTimeout(() => {
					if (this.ticketVisible && Date.now() - this.printVisibleStartedTime > 29000) {
            this.ticketVisible = false;
            this.selectDefaultParams()
					}
				}, 30000);
      })      
      .catch((error) => {
        alert(error)
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
    
  },
  created(){
    var parentID = parseInt(this.$route.params.id) ;      
    this.getQueue(parentID)
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
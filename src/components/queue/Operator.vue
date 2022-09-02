<template>
{{service}}
  <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em;" />
  <div class="card summary">
    <h3>{{ (this.queue != null ? this.queue['queueName' + $i18n.locale]:"")}}</h3>
  </div>
  <div class="p-grid p-fluid dashboard">
    <div class="p-col-12 p-lg-6">
      <div class="card summary p-m-0">
        <span class="title">{{$t('queue.ticketCount')}}</span>
        <span class="count visitors">{{service.count}}</span>
      </div>
      <div class="card summary">
        <span class="title">{{$t('queue.downtime')}}</span>
        <span class="count visitors">{{downInfo.duration}}</span>
        <Button :label="$t('queue.next')" :disabled="service.state===0" class="p-mt-2 p-mb-1" @click="callNextCustomer(true, null)"></Button>
        
        <Inplace :active="false" class="p-inplace-display"  ref="selectTicket">
          <template #display>
            <Button :label="$t('queue.selectTicket')" class="p-button-warning" style="left: -0.5rem;" :disabled="service.state===0" ></Button>
          </template>
          <template #content>
            <div class="p-grid p-fluid">
              <div class="p-col-12 p-lg-6 p-md-6 p-sm-6 p-mb-0">
                <InputText  :placeholder="$t('common.number')" autoFocus v-model="number" />
              </div>
              <div class="p-col-12 p-lg-6 p-md-6 p-sm-6">
                <Button :label="$t('queue.call')" :disabled="service.state===0" class="p-mb-6 p-button-warning p-mb-2" @click="callNextCustomer(true, number)"></Button>
              </div>
            </div>
          </template>
        </Inplace>
      </div>
    </div>
    <div class="p-col-12 p-lg-6">
      <div class="card summary p-m-0">
        <span class="title">{{$t('queue.called')}}</span>   
        <span class="count revenue">{{service.number>0 ? service.number : "-"}}</span>
      </div>
      <div class="card summary">
        <span class="title">{{$t('queue.serviceTime')}}</span>
        <span class="count revenue">{{service.info.duration}}</span>
        <!-- :disabled="service.info.hour<1 && service.info.minute<1 && service.info.second<=59" -->
        <Button :disabled="service.info.hour<1 && service.info.minute<1 && service.info.second<=59" :label="$t('queue.dnshowup')"  class="p-mb-1 p-mt-2 p-button-danger" @click="changeState(3, null)" ></Button>
        <Button :label="$t('queue.served')" class="p-mb-1 p-button-success" @click="changeState(1, null)"></Button>
        <Inplace :active="false" class="p-inplace-display"  ref="redirect" >
          <template #display>
            <Button :label="$t('queue.redirect')" class="p-button-primary" style="left: -0.5rem;" :disabled="service.state===null" @click="getNeigborQueue(parentID)"></Button>
          </template>
          <template #content>
            <div class="p-grid p-fluid">
              <div class="p-col-12 p-lg-6 p-md-6 p-sm-6 p-mb-0">
                <Dropdown v-model="selectedQueue" :options="neigbors" :optionLabel="'queueName'+$i18n.locale" :placeholder="$t('common.select')" />
              </div>
              <!-- <div class="p-col-12 p-lg-1 p-md-6 p-sm-6">
                <Button   icon="pi pi-undo" class="p-mb-6 p-button-primary p-mb-1" @click="getNeigborQueue()"></Button>
              </div> -->
              <div class="p-col-12 p-lg-6 p-md-6 p-sm-6">
                <Button :label="$t('queue.redirect')" :disabled="selectedQueue === null" class="p-mb-6 p-button-primary p-mb-2" @click="changeState(2, selectedQueue.key)"></Button>
              </div>
            </div>
          </template>
        </Inplace>
      </div>
    </div>
    
  </div>
  
</template>

<script>

import {  getHeader, smartEnuApi, findRole } from "@/config/config";
import axios from "axios";
export default {

  data() {
    return {
      lazyParams: {
        first: 0,
        rows: 100,
       
      },
      selectedQueue: null, 
      number: null,

      downInfo: {
        start: Date.now(),
        duration: "",
        hour: 0,
        minute:0,
        second:0,
        counting: true,
      },
      queues: [],
      neigbors: [],
      queue: null,
      service:{
        count: null,
        info: {
          start: Date.now(),
          duration: "",
          counting: false,
          hour: 0,
          minute:0,
          second:0,
        },
        state: -1,
      },
      counting: true,
      redirectVisible:false

     
    }
  },
  methods: {   
    getQueue(parentID) {
        this.loading = true  
        this.lazyParams.parentID = parentID
         //alert(parentID)
        axios
        .post(smartEnuApi + "/queue/allQueues", this.lazyParams, {
          headers: getHeader(),
        })
        .then((response) => {
          this.queues = response.data.queues;
          this.callNextCustomer(false, null);
          if (this.queues.length> 0) {
            this.queues.forEach(queue=> {
              if (queue.key == this.$route.params.id) {
                this.queue = queue
                return
              }
            })
          }

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
    getNeigborQueue(parentID) {
        this.loading = true         
        this.lazyParams.id = parentID
        axios
        .post(smartEnuApi + "/queue/getneigbors", this.lazyParams, {
          headers: getHeader(),
        })
        .then((response) => {
          this.neigbors = response.data.queues;      
          this.loading = false;
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
    callNextCustomer(call, number) {
       this.loading = true  
       axios
        .post(smartEnuApi + "/queue/callCustomer", {
          queueID: Number(this.$route.params.parentID),
          windowID: Number(this.$route.params.id),
          number: number!= null ? Number(number): null,
          call: call
        }, {
          headers: getHeader(),
        })
        .then((response) => {
          this.service = response.data;
          // alert(JSON.stringify(this.service))
          this.service.info = {
            start: Date.now(),
            duration: "",
            counting: call,
            hour: 0,
            minute: 0,
            second: 0,
          }
          if (!call) {
            this.service.state = -1
          }
          
          this.counter(this.service.info)
          this.downInfo.counting = !call
          this.$refs.selectTicket.close()
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.log(error.response)
          this.$toast.add({
            severity: "error",
            summary: this.$t("queue.norows"),
            life: 3000,
          });
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });


    },
    
  
    changeState(state, redirectID){
      var workSecond=this.service.info.second+(this.service.info.minute*60)+(Number(this.service.info.hour*3600));
      this.loading = true
      axios
        .post(smartEnuApi + "/queue/statusChange", {serviceID: this.service.id, state: state, redirectID: redirectID,workTime: workSecond}, {
          headers: getHeader(),
        })
        .then((_) => {         
          this.service = {
            state:-1,
            info:{
              start: Date.now(),
              duration: "",
              counting: false,
              hour: 0,
              minute: 0,
              second: 0,     
            }
          }
          this.getQueue()
          this.$toast.add({
            severity: "success",
            summary: this.$t("common.message.successCompleted"),
            life: 3000,
          });
          if (state === 2) {
            this.selectedQueue = null;
            this.$refs.redirect.close()
          }
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: this.$t("smartenu.loadError") + ":\n" + error,
            life: 3000,
          });
        });
          
      
    },
    padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    },
    counter(info) {
      var final = Date.now() 
      var milliseconds = final- info.start;
      info.second = Math.floor(milliseconds / 1000);
      info.minute = Math.floor(info.second / 60);
      info.hour = Math.floor(info.minute / 60);

      info.second = info.second % 60;
      info.minute = info.minute % 60;
      info.hour = info.hour % 24;
      
      info.duration = info.counting ? `${this.padTo2Digits(info.hour)}:${this.padTo2Digits(info.minute)}:${this.padTo2Digits(info.second)}` : "00:00:00";
      if (!info.counting) {
        return
      }
      setTimeout(() => {
        this.counter(info)
      }, 1000)
    },
    getRedirectNumber(){
    
      this.redirectVisible=true
    }

   
  },

  mounted() {
      var parentID = parseInt(this.$route.params.parentID) ;
      this.getQueue(parentID); 
      this.counter(this.downInfo);
      this.getNeigborQueue(parentID)
      
  },
 
};
</script>

<style scoped>
.font-style {    
    width:300px;
    height:300px;
    font-size:220px;
}

</style>
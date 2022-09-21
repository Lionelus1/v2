
<template>
  <!-- <div class="feature-intro p-d-block">
      <h1>Smart.enu жүйесіне қош келдіңіз.</h1>
  </div> -->
  <div class="grid">
    
    <div class="col-6">
      <div class="card p-text-center p-text-info">      
        <h5>SMART.ENU қосымшасы арқылы QR сканерлеңіз!</h5>
        <h5>Используйте QR сканер приложения SMART.ENU!</h5>
        <h5>Use the QR scanner of the SMART.ENU app!</h5>
        <Avatar icon="pi pi-user" class="mr-2" size="xlarge" />
        <Avatar icon="pi pi-user" class="mr-2" size="large" style="background-color:#2196F3; color: #ffffff"/>
        <Avatar icon="pi pi-user" class="mr-2" style="background-color:#9c27b0; color: #ffffff" />
        
      </div>
    </div>
  </div>
  <div class="car p-text-center">
        
    </div>
  <div class="p-fluid p-formgrid p-grid p-jc-center p-pt-2">
      
      <qrcode-vue size="500" render-as="svg" margin="2" :value="qrCode"></qrcode-vue>
  </div>
</template>

<script>

  import axios from 'axios';
  import {getHeader,header, smartEnuApi,etspTokenEndPoint,socketApi} from "../config/config";
  import QrcodeVue from "qrcode.vue";

  const authUser = {};
  export default {
       name : "OutQr",
       components: {QrcodeVue},
       data(){
        return {
          qrCode:"",
          connection:null,
          gateName:"outGate_main"
        }
      },
      
      methods:{
          connect() {
            let t = this;
            this.connection =new WebSocket(socketApi+'/ws');
            

            this.connection.onmessage = function(data) {
                //alert(JSON.parse(data.data).body)
                t.qrCode = JSON.parse(data.data).body;
            }
            
            this.connection.onopen = function(event) {
                let d = {"key":"somekey", "value":"someid"};
                t.connection.send(t.gateName);
            }
        },
       
    },
    mounted() {
        
        this.connect();
    }
  }
</script>

<style lang="scss">
  .flexgrid-demo {
      .vertical-container {
          margin: 0;
          border-radius: 4px;
      }
  }
  .pi-eye {
    transform:scale(1.6);
    margin-right: 1rem;
  }
  .pi-eye-slash {
      transform:scale(1.6);
      margin-right: 1rem;
  }
</style>
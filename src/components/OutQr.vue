
<template>
  <!-- <div class="feature-intro p-d-block">
      <h1>Smart.enu жүйесіне қош келдіңіз.</h1>
  </div> -->
  <div class="grid">
    <div class="col-12">
      <div class="card">
        
        <h5 class="p-text-center p-text-uppercase">Smart.enu жүйесіне қош келдіңіз.</h5>
        <Avatar icon="pi pi-user" class="mr-2" size="xlarge" />
        <Avatar icon="pi pi-user" class="mr-2" size="large" style="background-color:#2196F3; color: #ffffff"/>
        <Avatar icon="pi pi-user" class="mr-2" style="background-color:#9c27b0; color: #ffffff" />
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col-12 p-text-center">
        <img src="/assets/layout/images/logo_eng.png" alt="Image" width="250"/>
    </div>
  </div>
  <div class="p-fluid p-formgrid p-grid p-jc-center p-pt-2">
    
  </div>
</template>

<script>

  import axios from 'axios';
  import {getHeader,header, smartEnuApi,etspTokenEndPoint} from "../config/config";
  

  const authUser = {};
  export default {
       name : "OutQr",
       data(){
        return {
          
        }
      },
      created() {
        //alert("welcome qr out gate");
        
      },
      methods:{
        
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
<template>
  <div class="w-100">жүктелуде . . . </div>
</template>
<script>
import axios from 'axios';
import {mapActions} from 'vuex';
import {getHeader, smartEnuApi} from "../config/config";

export default {
  name:"Auth",
  methods:{
    ...mapActions([
      'setLoginedUser'
    ]),
    getLoginedUser(){
      axios.get(smartEnuApi +'/logineduserinfo',{headers:getHeader()})
      .then(response=>{
        window.localStorage.setItem("loginedUser",JSON.stringify(response.data));
        this.setLoginedUser();
        let oldPath = this.$store.state.attemptedUrl;
        if(oldPath.length==0){
          location.replace('/#/');
        }else{
          this.$store.dispatch("solveAttemptedUrl","");
          location.replace("/#"+oldPath); 
        }
      })
      .catch(error => {
        this.$router.push({name:'Login'});
      })
    }
  },
  created(){
    this.getLoginedUser();
  }
}
</script>

<template>
  <div class="w-100">жүктелнуде . . . </div>
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
        //alert(JSON.stringify(response.data));
        window.localStorage.setItem("loginedUser",JSON.stringify(response.data));
        this.setLoginedUser();
        this.$router.push({name:'/smartenu/vaccination'});
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
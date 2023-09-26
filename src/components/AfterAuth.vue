<template>
  <div class="w-100">жүктелуде . . . </div>
</template>
<script>
import axios from 'axios';
import {mapActions} from 'vuex';
import {getHeader, smartEnuApi, findRole} from "../config/config";

export default {
  name:"Auth",
  methods:{
    ...mapActions([
      'setLoginedUser', 'setUserSiteSlug'
    ]),
    findRole: findRole,
    getLoginedUser(){
      axios.get(
        smartEnuApi +'/logineduserinfo', 
        { headers:getHeader() }
      ).then(response => {
        window.localStorage.setItem("loginedUser", JSON.stringify(response.data));
        this.setLoginedUser();

        if (response.data.organization.id || response.data.mainPosition.id || response.data.mainPosition.department.id || 
          response.data.positions.length > 0) {
          window.localStorage.setItem("showPositionsDialog", true);
        }

        let oldPath = this.$store.state.attemptedUrl;
        if (oldPath.length == 0) {
          if (this.findRole(null, "student")) {
            location.replace('/#/human-resources/career/vacancies');
          } else {
            location.replace('/#/');
          }
        } else {
          this.$store.dispatch("solveAttemptedUrl", "");
          location.replace("/#"+oldPath);
        }
      }).catch(error => {
        this.$router.push({name:'Login'});
      })
    },
    getUserSlug() {
      axios.get(smartEnuApi + `/getUserSlug`, {headers: getHeader()}).then(res => {
        if (res.data) {
          localStorage.setItem("userSlug", JSON.stringify(res.data))
          this.setUserSiteSlug()
        } else {
          localStorage.removeItem("userSlug")
          this.$store.dispatch('removeUserSiteSlug')
        }
      }).catch(error => {
        localStorage.removeItem("userSlug")
        this.$store.dispatch('removeUserSiteSlug')
      });
    }
  },
  created(){
    this.getLoginedUser();
    this.getUserSlug()
  }
}
</script>

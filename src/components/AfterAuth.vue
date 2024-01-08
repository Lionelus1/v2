<template>
  <div class="w-100">жүктелуде . . . </div>
</template>
<script>
import {mapActions} from 'vuex';
import {getHeader, smartEnuApi, findRole} from "../config/config";
import { UserService } from "@/service/user.service";

export default {
  name:"Auth",
  data() {
    return {
      service: new UserService(),
    }
  },
  methods:{
    ...mapActions([
      'setLoginedUser', 'setUserSiteSlug'
    ]),
    findRole: findRole,
    getLoginedUser(){
      this.service.loginedUserInfo().then(response=>{
        window.localStorage.setItem("loginedUser",JSON.stringify(response.data));
        this.setLoginedUser();

        if (response.data.mainPosition || (response.data.positions && response.data.positions.length > 0)) {
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
        console.log(error)
        this.$router.push({name:'Login'});
      })
    },
    getUserSlug() {
      this.service.getUserSlug().then(res => {
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
    this.getUserSlug();
  }
}
</script>

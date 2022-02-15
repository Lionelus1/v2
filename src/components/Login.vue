
<template>
  <div class="flexgrid-demo ">

      <div class="p-grid p-ai-center vertical-container">
        <div class="p-lg-4 p-md-8 p-sm-12 p-lg-offset-4 p-md-offset-2 p-sm-offset-0 p-text-center">
          <Fieldset legend="Login System">
            <div class="p-fluid text-center">
                <div class="p-field p-col-12">
                    <span class="p-float-label">
                        <InputText id="inputtext" type="text" v-model="loginData.username" />
                        <label for="inputtext">{{ $t('common.enterLogin') }}</label>
                    </span>
                </div>
                <div class="p-field p-col-12">
                    <span class="p-float-label">
                        <InputText id="inputpassword" type="password" v-model="loginData.password" @keyup.enter="login" />
                        <label for="inputpassword">{{$t('common.enterPassword')}}</label>
                    </span>
                </div>
            </div>
            <div class="p-w-100 p-text-right p-pr-2">
              <Button :label="$t('common.login')" icon="pi pi-check" @click="login" iconPos="right" />
            </div>
          </Fieldset>
        </div>
      </div>

  </div>
</template>

<script>

  import axios from 'axios';
  import {header, smartEnuApi} from "../config/config";

  const authUser = {};
  export default {
       name : "Login",
       data(){
        return {
          loginData:{
            username:'',
            password:''
          }
        }
      },
      created() {
        this.$store.dispatch("logLout");
      },
      methods:{
        login(){
          //alert(JSON.stringify(header));
          axios.post(smartEnuApi+'/login',{
            'username':this.loginData.username,
            'password':this.loginData.password
          },header)
          .then((res)=>{
            if(res.status===200){
              authUser.access_token=res.data.access_token;
              authUser.refresh_token = res.data.refresh_token;
              window.localStorage.setItem('authUser',JSON.stringify(authUser));
              this.$router.push({name:'AfterAuth'});
            }
            if(res.status===401){
              alert("Сіз енгізген ақпарат дұрыс емес.");
            }
          })
          .catch(error => {
              alert(error.message)
              alert("Сіз енгізген ақпарат дұрыс емес.");

          });
        }

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
</style>
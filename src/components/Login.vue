
<template>
  <div class="flexgrid-demo ">

          
            
            
          
          <TabView @tabChange="etspLogin" scrollable>
            <TabPanel header="Login System">
              <div class="p-fluid text-center">
                  <div class="p-field p-col-12">
                      <span class="p-float-label">
                          <InputText id="inputtext" type="text" v-model="loginData.username" />
                          <label for="inputtext">{{ $t('common.enterLogin') }}</label>
                      </span>
                  </div>
                  <div class="p-field p-col-12">
                      <span class="p-float-label">
                        <Password :feedback="false" toggleMask v-model="loginData.password" @keyup.enter="login"></Password>
                          <label for="inputpassword">{{$t('common.enterPassword')}}</label>
                      </span>
                  </div>
              </div>
              <div class="p-w-100 p-text-right p-pr-2">
                  <Button :label="$t('common.login')" icon="pi pi-check" @click="login" iconPos="right" />
              </div>
            </TabPanel>
            <TabPanel header="ЭЦП">
               <div class="p-fluid text-center">
                  <div class="p-field p-col-12">
                      <!-- <span class="p-float-label">
                          <Password :feedback="false" toggleMask v-model="newPass.password1"></Password>
                          <label for="inputtext">{{ $t('common.newPassword') }}</label>
                      </span> -->
                      <Inplace :closable="true">
                        <template #display>
                            {{ text || $t('common.changePassword')}}
                        </template>
                        <template #content>
                            <Password :feedback="false" toggleMask v-model="newPass.password1" autoFocus></Password>
                            <Password :feedback="false" toggleMask v-model="newPass.password2"></Password>
                        </template>
                    </Inplace>
                  </div>
                  <!-- <div class="p-field p-col-12">
                      <span class="p-float-label">
                        <Password :feedback="false" toggleMask v-model="newPass.password2" @keyup.enter="signUp"></Password>
                        <label for="inputpassword">{{$t('common.newPasswordRe')}}</label>
                      </span>
                  </div> -->

                  <div class="p-w-100 p-text-right p-pr-2">
                      <Button :label="$t('common.login')" :disabled="isSignUp" icon="pi pi-check" @click="signUp" iconPos="right" />
                  </div>
              </div>
            </TabPanel>
           
        </TabView>

       
  </div>
</template>

<script>

  import axios from 'axios';
  import {getHeader,header, smartEnuApi,etspTokenEndPoint} from "../config/config";
  import {NCALayerClient} from "ncalayer-js-client";

  const authUser = {};
  export default {
       name : "Login",
       data(){
        return {
          loginData:{
            username:'',
            password:''
          },

          newPass:{
            password1:"",
            password2:""
          },

          userData:{},
          isSignUp:true
        }
      },
      created() {
        //alert("came");
        this.$store.dispatch("logLout");
      },
      methods:{
        signUp(){
          if(this.newPass.password1.length > 5 && (this.newPass.password1==this.newPass.password2)){
            this.userData.Password = this.newPass.password1;
            //alert(JSON.stringify(this.userData));
            this.postNewUserViaEtsp(this.userData)
          }else{
            if((this.newPass.password1==this.newPass.password2) && this.newPass.password1.length==0){
              this.userData.Password = "";
              //alert(JSON.stringify(this.userData));
              this.postNewUserViaEtsp(this.userData)
            }else{
              alert(this.$t('common.newPasswordError'));
            }
            
          }
        },
        postNewUserViaEtsp(userData){
          alert(JSON.stringify(userData));
          if(userData.company==null){
            userData.company="";
          }
          if(userData.bin==null){
            userData.bin="";
          }
          axios.post(etspTokenEndPoint+"/etsplogin",userData,header)
          .then(res=>{
              authUser.access_token=res.data.access_token;
              authUser.refresh_token = res.data.refresh_token;
              window.localStorage.setItem('authUser',JSON.stringify(authUser));
              this.$router.push({name:'AfterAuth'});  

          })
          .catch(error=>{
            alert(error.message)
          });    
        },
        etspLogin(event){
          var tabIndex = Number(event.index);
          if(tabIndex==1){
            //alert("i will do more thing");
            this.userData={};
            this.newPass.password1 = "";
            this.newPass.password2 = "";
            this.etspToken();  
          }

        },
        etspToken(){
          axios.post(etspTokenEndPoint+"/auth/generate/token",{}, {headers: getHeader()})
          .then(res=>{
              //alert(JSON.stringify(res));
              this.xmlSignature(res.data);
          })
          .catch(error=>{
            alert(error.message)
          });  
        },
        async xmlSignature(res) {
         
          let NCALaClient = new NCALayerClient();
          console.log("nc object ",NCALaClient);
          try {
            await NCALaClient.connect();
          } 
          catch (error) {
            alert(error.message);
            // this.$toast.add({
            //   severity: 'error',
            //   summary: this.$t('ncasigner.failConnectToNcaLayer'),
            //   life: 3000
            // });
            return
          }
          try {
            let XMLignature = await  NCALaClient.signXml('PKCS12', res.xml, 'AUTH')
            res.xmlSignature=XMLignature;
            this.loginVerify(res);

          } catch (error) {
            alert(error.message);
          }
        },
        loginVerify(reqBody){
           //alert(JSON.stringify(reqBody));
           axios.post(etspTokenEndPoint+"/auth/verify",reqBody, {headers: getHeader()})
          .then(res=>{
              //alert(JSON.stringify(res.data.subject));
              this.userData=res.data.subject;
              this.isSignUp=false;
              
          })
          .catch(error=>{
            alert(error.message)
          });  
        },
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
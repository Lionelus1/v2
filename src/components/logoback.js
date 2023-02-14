
<template>
  <div class="flexgrid-demo">

          <TabView  scrollable>
            <TabPanel header="Login System">
              <div class="p-fluid text-center">
                  <div class="p-field col-12">
                      <span class="p-float-label">
                          <InputText id="inputtext" type="text" v-model="loginData.username" />
                          <label for="inputtext">{{ $t('common.enterLogin') }}</label>
                      </span>
                  </div>
                  <div class="p-field col-12">
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
                  <div class="p-field col-12">
                      <!-- <span class="p-float-label">
                          <Password :feedback="false" toggleMask v-model="newPass.password1"></Password>
                          <label for="inputtext">{{ $t('common.newPassword') }}</label>
                      </span> -->
                      <Inplace :closable="true" @close="resetPassword">
                        <template #display>
                            {{ text || $t('common.changePassword')}}
                        </template>
                        <template #content>
                            <Password :feedback="false" toggleMask v-model="newPass.password1" autoFocus></Password>
                            <Password :feedback="false" toggleMask v-model="newPass.password2"></Password>
                        </template>
                    </Inplace>
                  </div>
                 

                 
                  <div class="grid">
                    <div class="col-8">
                      <Button icon="pi pi-upload " :label="$t('common.chooseCert')" class="p-button-danger"  @click="resetEtspLogin(-1)" iconPos="right" />
                    </div>
                    <div class="col-4">
                      <Button :label="$t('common.login')" :disabled="isSignUp"  icon="p-w-6 pi pi-check" @click="loginVerify" iconPos="right" />  
                    </div>
                    
                    
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

          eloginData:{
            connectionId : "",
            xmlSignature : "",
            password : ""
          },
          isSignUp:true
        }
      },
      created() {
        //alert("came");
        this.$store.dispatch("logLout");
      },
      methods:{
        resetPassword(){
          this.newPass = {
            password1:"",
            password2:""
          }
        },
      
        
        etspLogin(event){
          var tabIndex = Number(event.index);
          if(tabIndex==1){
            //alert("i will do more thing");
            this.resetEtspLogin();
          }

        },
        resetEtspLogin(p=5){
          this.eloginData={
            connectionId : "",
            xmlSignature : "",
            password : ""
          };
          if(p==5) {
            this.newPass.password1 = "";
            this.newPass.password2 = "";
          }
          
          this.etspToken();  
        },
        etspToken(){
          axios.post(smartEnuApi+"/etsptoken",{}, {headers: getHeader()})
          .then(res=>{
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
            return
          }
          try {
            let XMLignature = await  NCALaClient.signXml('PKCS12', res.xml, 'AUTH')
            this.eloginData.xmlSignature=XMLignature;
            this.eloginData.connectionId = res.connectionId;
            this.isSignUp=false;
          } catch (error) {
            alert(error.message);
          }
        },
        loginVerify(){
          if(this.newPass.password1.length > 5 && (this.newPass.password1==this.newPass.password2)){
            this.eloginData.password = this.newPass.password1;
            this.sendLoginData();
          }else{
            if((this.newPass.password1==this.newPass.password2) && this.newPass.password1.length==0){
              this.eloginData.password = this.newPass.password1;
              this.sendLoginData();
            }else{
              alert(this.$t('common.newPasswordError'));
            }
          }
        },
        sendLoginData(){
          
          if(this.eloginData.connectionId.length>4 && this.eloginData.xmlSignature.length>10){
            this.isSignUp=true;
            axios.post(smartEnuApi+"/etspverify",this.eloginData, {headers: getHeader()})
            .then(res=>{
                if(res.status===200){
                  authUser.access_token=res.data.access_token;
                  authUser.refresh_token = res.data.refresh_token;
                  window.localStorage.setItem('authUser',JSON.stringify(authUser));
                  this.$router.push({name:'AfterAuth'});
                }      
            })
            .catch(error=>{
              alert(error.message)
            });
          }
            
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
  .pi-eye {
    transform:scale(1.6);
    margin-right: 1rem;
  }
  .pi-eye-slash {
      transform:scale(1.6);
      margin-right: 1rem;
  }
</style>
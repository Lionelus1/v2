<template>
  <div style="overflow-x: hidden">
    <!-- <div class="feature-intro block">
  <h1>Smart.enu жүйесіне қош келдіңіз.</h1>
</div> -->
    <div class="lang_dropdown">
      <LanguageDropdown/>
    </div>
    <div class="grid">
      <div class="col-12">
        <div class="card welcome_text_block">
          <h5 class="text-center uppercase">{{ $t("common.loginWelcome") }}</h5>
          <Avatar icon="pi pi-user" class="mr-2" size="xlarge"/>
          <Avatar icon="pi pi-user" class="mr-2" size="large" style="background-color:#2196F3; color: #ffffff"/>
          <Avatar icon="pi pi-user" class="mr-2" style="background-color:#9c27b0; color: #ffffff"/>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 text-center">
        <img src="/assets/layout/images/logo_eng.png" alt="Image" width="250"/>
      </div>
    </div>
    <div class="p-fluid formgrid grid justify-content-center pt-2">

      <TabView class="tabview-custom p-xl-6 md:col-8 p-sm-12 lg:col-6 col-12"
               v-model:activeIndex="active" @tab-change="tabChanged">
        <TabPanel>
          <template #header>
            <span>Login System</span>
            <i class="pi pi-key ml-1"></i>
          </template>
          <div class="p-fluid text-left">
            <div class="field col-12">
              <label for="inputtext">{{ $t('common.enterLogin') }}</label>
              <InputText id="inputtext" type="text" v-model="loginData.username"/>


            </div>
            <div class="field col-12">
              <label for="inputpassword">{{ $t('common.enterPassword') }}</label>
              <Password :feedback="false" toggleMask v-model="loginData.password"
                        @keyup.enter="login"></Password>
            </div>
          </div>
          <div class="p-w-100 text-right">
            <Button :label="$t('common.login')" icon="pi pi-check" @click="login" iconPos="right"/>
          </div>
        </TabPanel>
        <TabPanel>
          <template #header>
            <span>ЭЦП</span>
            <i class="pi pi-folder ml-1"></i>
          </template>
          <div class="p-fluid text-center">
            <div class="field mb-3">
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </div>
            <div class="field col-12 pb-2">
              <Inplace :closable="true" @close="resetPassword">
                <template #display>
                  {{ text || $t('common.changePassword') }}
                </template>
                <template #content>
                  <Password :feedback="false" toggleMask v-model="newPass.password1" autoFocus></Password>
                  <Password :feedback="false" toggleMask v-model="newPass.password2"></Password>
                </template>
              </Inplace>
            </div>
            <div class="grid">
              <div class="col-8">
                <Button icon="pi pi-upload " :label="$t('common.chooseCert')" class="p-button-danger"
                        @click="resetEtspLogin(-1)" iconPos="right"/>
              </div>
              <div class="col-4">
                <Button :label="$t('common.login')" :disabled="isSignUp" icon="p-w-6 pi pi-check"
                        @click="loginVerify" iconPos="right"/>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <template #header>
            <span>QR</span>
            <i class="pi pi-qrcode ml-1"></i>
          </template>
          <div class="p-fluid text-center">
            <qrcode-vue size="300" render-as="svg" margin="2" :value="mgovSignUri"></qrcode-vue>
            <div class="field mb-3">
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script>

import axios from 'axios';
import {getHeader, header, smartEnuApi, socketApi, etspTokenEndPoint} from "../config/config";
import {NCALayerClient} from "ncalayer-js-client";
import {NCALayerClientExtension} from "@/helpers/ncalayer-client-ext";
import LanguageDropdown from "../LanguageDropdown";
import QrcodeVue from "qrcode.vue";

const authUser = {};
export default {
  name: "Login",
  components: {QrcodeVue, LanguageDropdown},
  data() {
    return {
      loginData: {
        username: '',
        password: ''
      },

      newPass: {
        password1: "",
        password2: ""
      },

      eloginData: {
        connectionId: "",
        xmlSignature: "",
        password: ""
      },
      isSignUp: true,
      mgovSignUri: "",
      active: 0
    }
  },
  created() {
    //alert("came");
    this.$store.dispatch("logLout");
  },
  methods: {
    resetPassword() {
      this.newPass = {
        password1: "",
        password2: ""
      }
    },
    tabChanged() {
      if (this.active === 2) {
        axios.post(smartEnuApi + "/etsptokenid", {}, {headers: getHeader()})
            .then(res => {
              this.mgovSignUri = 'mobileSign:' + smartEnuApi + '/mobileAuthParams?uuid=' + res.data.connectionId
              this.wsconnect(res.data.connectionId)
            })
            .catch(error => {
              alert(error.message)
            });
      }
    },

    wsconnect(connectionId) {
      let t = this;
      this.connection = new WebSocket(socketApi + '/authws');
      this.connection.onmessage = function (data) {
        let response = JSON.parse(data.data)
        if (response.result === 'error') {
          t.$toast.add({
            severity: 'error',
            summary: response.errorMessage,
            life: 3000
          });
        } else if (response.result === 'token') {
          authUser.access_token = response.data.tokens.access_token;
          authUser.refresh_token = response.data.tokens.refresh_token;
          window.localStorage.setItem('authUser', JSON.stringify(authUser));
          t.$router.push({name: 'AfterAuth'});
        }
      }
      this.connection.onopen = function (event) {
        t.connection.send(JSON.stringify(connectionId));
      }
    },

    etspLogin(event) {
      var tabIndex = Number(event.index);
      if (tabIndex == 1) {
        //alert("i will do more thing");
        this.resetEtspLogin();
      }

    },
    resetEtspLogin(p = 5) {
      this.eloginData = {
        connectionId: "",
        xmlSignature: "",
        password: ""
      };
      if (p == 5) {
        this.newPass.password1 = "";
        this.newPass.password2 = "";
      }

      this.etspToken();
    },
    etspToken() {
      axios.post(smartEnuApi + "/etsptoken", {}, {headers: getHeader()})
          .then(res => {
            this.xmlSignature(res.data);
          })
          .catch(error => {
            alert(error.message)
          });
    },
    async xmlSignature(res) {
      let NCALaClient = new NCALayerClientExtension();
      console.log("nc object ", NCALaClient);
      try {
        await NCALaClient.connect();
      } catch (error) {
        alert(error.message);
        return
      }
      try {
        let XMLignature = await NCALaClient.sign('xml', null, res.xml, 'auth', this.$i18n.locale, false)
        // let XMLignature = await  NCALaClient.signXml('PKCS12', res.xml, 'AUTH')
        this.eloginData.xmlSignature = XMLignature[0];
        this.eloginData.connectionId = res.connectionId;
        this.isSignUp = false;
      } catch (error) {
        alert(error.message);
      }
    },
    loginVerify() {
      if (this.newPass.password1.length > 5 && (this.newPass.password1 == this.newPass.password2)) {
        this.eloginData.password = this.newPass.password1;
        this.sendLoginData();
      } else {
        if ((this.newPass.password1 == this.newPass.password2) && this.newPass.password1.length == 0) {
          this.eloginData.password = this.newPass.password1;
          this.sendLoginData();
        } else {
          alert(this.$t('common.newPasswordError'));
        }
      }
    },
    sendLoginData() {
      if (this.eloginData.connectionId.length > 4 && this.eloginData.xmlSignature.length > 10) {
        this.isSignUp = true;
        axios.post(smartEnuApi + "/etspverify", this.eloginData, {headers: getHeader()})
            .then(res => {
              if (res.status === 200) {
                authUser.access_token = res.data.access_token;
                authUser.refresh_token = res.data.refresh_token;
                window.localStorage.setItem('authUser', JSON.stringify(authUser));
                this.$router.push({name: 'AfterAuth'});
              }
            })
            .catch(error => {
              alert(error.message)
            });
      }

    },
    login() {
      //alert(JSON.stringify(header));
      axios.post(smartEnuApi + '/login', {
        'username': this.loginData.username,
        'password': this.loginData.password
      }, {headers: getHeader()})
          .then((res) => {
            if (res.status === 200) {
              authUser.access_token = res.data.access_token;
              authUser.refresh_token = res.data.refresh_token;
              window.localStorage.setItem('authUser', JSON.stringify(authUser));
              this.$router.push({name: 'AfterAuth'});
            }
            if (res.status === 401) {
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
.welcome_text_block {
  height: 63px;
}

.lang_dropdown {
  position: absolute;
  top: 15px;
  right: 15px;
  width: fit-content;
  border: 1px solid #d1d1d1;
}

.flexgrid-demo {
  .vertical-container {
    margin: 0;
    border-radius: 4px;
  }
}

.p-password > .pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.p-password > .pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}

@media (max-width: 740px) {
  h5 {
    position: absolute;
    top: 15px;
    left: 15px;
  }
  h5.text-center {
    text-align: left !important;
  }
}

@media (max-width: 525px) {
  h5 {
    width: 165px;
    font-size: 15px;
  }
}
</style>

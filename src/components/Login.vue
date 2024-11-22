<template>
<div style="overflow-x: hidden">
    <Toast />
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
              <small class="p-error" v-if="loginDataCheck.username"> {{ $t("common.requiredField") }}
              </small>
            </div>
            <div class="field col-12">
              <label for="inputpassword">{{ $t('common.enterPassword') }}</label>
              <Password :feedback="false" toggleMask v-model="loginData.password"
                        @keyup.enter="login"></Password>
              <small class="p-error" v-if="loginDataCheck.password"> {{ $t("common.requiredField") }}
              </small>
            </div>
          </div>
          <div class="p-w-100 text-right">
            <Button :label="$t('common.login')" icon="pi pi-check" @click="login" iconPos="right"/>
          </div>
        </TabPanel>
        <TabPanel v-if="isNotMobile">
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
              <div class="qr_shadow">
                  <Qr v-if="qrSignUri" :qrData="qrSignUri"/>
              </div>
<!--            <qrcode-vue size="300" render-as="svg" margin="2" :value="qrSignUri"></qrcode-vue>-->
            <div v-if="mgovMobileRedirectUri" class="p-fluid text-center">
              <Button class="p-button-outlined" :label="$t('common.mgovMobile')" @click="redirectToMgovMobile"/>
            </div>
            <div v-if="mgovMobileRedirectUri">
              <hr>
            </div>
            <div v-if="mgovBusinessRedirectUri" class="p-fluid text-center">
              <Button class="p-button-outlined" :label="$t('common.mgovBusiness')" @click="redirectToMgovBusiness"/>
            </div>
            <div v-if="mgovBusinessRedirectUri">
              <hr>
            </div>
            <div class="field mb-3">
              <InlineMessage severity="info">{{ $t('ncasigner.noteMark') }}</InlineMessage>
            </div>
          </div>
          <QrGuideline/>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script>

import api from '@/service/api';
import {getHeader, header, smartEnuApi, socketApi, etspTokenEndPoint} from "../config/config";
import {NCALayerClient} from "ncalayer-js-client";
import {NCALayerClientExtension} from "@/helpers/ncalayer-client-ext";
import LanguageDropdown from "../LanguageDropdown";
import QrcodeVue from "qrcode.vue";
import QrGuideline from "./QrGuideline.vue";
import Qr from "@/components/Qr.vue";

const authUser = {};
export default {
  name: "Login",
  components: {Qr, QrGuideline, LanguageDropdown},
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
      connectionId: null,
      qrSignUri: "",
      mgovMobileRedirectUri: null,
      mgovBusinessRedirectUri: null,
      active: 0,
      isNotMobile: false,

      loginDataCheck: {
        username: false,
        password: false
      },
    }
  },
  created() {
    //alert("came");
    this.checkDevice()
    this.$store.dispatch("logLout");
  },
  methods: {
    redirectToMgovMobile() {
      window.open(this.mgovMobileRedirectUri)
    },
    redirectToMgovBusiness() {
      window.open(this.mgovBusinessRedirectUri)
    },
    checkDevice() {
      const ua = navigator.userAgent;
      this.isNotMobile = !/mobile/i.test(ua);
    },
    resetPassword() {
      this.newPass = {
        password1: "",
        password2: ""
      }
    },
    tabChanged() {
      if (this.active === 2 || (!this.isNotMobile && this.active === 1)) {
        if (this.connectionId  === null) {
          this.qrSignUri = ""
          this.mgovMobileRedirectUri = null
          this.mgovBusinessRedirectUri = null
          api.post("/etsptoken", {}, {headers: getHeader()})
              .then(res => {
                this.connectionId = res.data.connectionId;
                let mgovSignUri = smartEnuApi + '/mobileAuthParams/' + this.connectionId
                this.qrSignUri = 'mobileSign:' + mgovSignUri
                this.mgovMobileRedirectUri = "https://mgovsign.page.link/?link=" + mgovSignUri + "?mgovSign&apn=kz.mobile.mgov&isi=1476128386&ibi=kz.egov.mobile"
                this.mgovBusinessRedirectUri = "https://egovbusiness.page.link/?link=" + mgovSignUri + "?mgovSign&apn=kz.mobile.mgov.business&isi=1597880144&ibi=kz.mobile.mgov.business"
                this.wsconnect(this.connectionId)
              })
              .catch(error => {
                this.$toast.add({
                    severity: 'error',
                    summary: error.message,
                    life: 3000,
                });
              });
        } else {
          this.wsconnect(this.connectionId)
        }
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
          authUser.access_token = response.tokens.access_token;
          authUser.refresh_token = response.tokens.refresh_token;
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
      api.post("/etsptoken", {}, {headers: getHeader()})
          .then(res => {
            this.xmlSignature(res.data);
          })
          .catch(error => {
            this.$toast.add({
                severity: 'error',
                summary: error.message,
                life: 3000,
            });
          });
    },
    async xmlSignature(res) {
      let NCALaClient = new NCALayerClientExtension();
      console.log("nc object ", NCALaClient);
      try {
        await NCALaClient.connect();
      } catch (error) {
        this.$toast.add({
            severity: 'error',
            summary: error.message,
            life: 3000,
        });
        return
      }
      try {
        let XMLignature = await NCALaClient.sign('xml', null, res.xml, 'auth', this.$i18n.locale, false)
        // let XMLignature = await  NCALaClient.signXml('PKCS12', res.xml, 'AUTH')
        this.eloginData.xmlSignature = XMLignature[0];
        this.eloginData.connectionId = res.connectionId;
        this.isSignUp = false;
      } catch (error) {
        this.$toast.add({
            severity: 'error',
            summary: error.message,
            life: 3000,
        });
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
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.newPasswordError'),
            life: 3000,
          });
        }
      }
    },
    sendLoginData() {
      if (this.eloginData.connectionId.length > 4 && this.eloginData.xmlSignature.length > 10) {
        this.isSignUp = true;
        api.post("/etspverify", this.eloginData, {headers: getHeader()})
            .then(res => {
              if (res.status === 200) {
                authUser.access_token = res.data.access_token;
                authUser.refresh_token = res.data.refresh_token;
                window.localStorage.setItem('authUser', JSON.stringify(authUser));
                this.$router.push({name: 'AfterAuth'});
              }
            })
            .catch(error => {
              this.$toast.add({
                  severity: 'error',
                  summary: error.message,
                  life: 3000,
                });
            });
      }

    },
    login() {
      //alert(JSON.stringify(header));
      if (!this.checkLoginAndPassword()) {
        return
      }
      api.post('/login', {
        'username': this.loginData.username,
        'password': this.loginData.password,
        'session': this.$route.params.sessionID || localStorage.getItem('sessionID')
      }, {headers: getHeader()})
          .then((res) => {
            if (res.status === 200) {
              authUser.access_token = res.data.access_token;
              authUser.refresh_token = res.data.refresh_token;
              authUser.session_uuid = res.data.session_uuid
              window.localStorage.setItem('authUser', JSON.stringify(authUser));
              const sessionID = this.$route.params.sessionID || localStorage.getItem('sessionID');
              if (sessionID) {
                localStorage.removeItem("sessionID");
                const botURL = process.env.VUE_APP_BOT_URL;
                window.location.href = `${botURL}${res.data.session_uuid}`;
              } else {
                this.$router.push({name: 'AfterAuth'});
              }
            }
          })
          .catch(error => {
            if (error.response && error.response.status === 401) {
                this.$toast.add({
                  severity: 'error',
                  summary: this.$t('common.unauth'),
                  life: 3000,
                }); 
              return
            }else if (error.response) {
              this.$toast.add({
                severity: "error",
                summary: this.$t('common.unauth'),
                life: 3000,
              });
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t('responseExplanations.internalServerError'),
                life: 3000,
              });
            }
          });
    },
    checkLoginAndPassword() {
      this.loginDataCheck.username = this.loginData.username.length === 0 
      this.loginDataCheck.password = this.loginData.password.length === 0
        return (
            !this.loginDataCheck.username &&
            !this.loginDataCheck.password
        )
    }
  }
}
</script>

<style lang="scss" scoped>
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
.qr_shadow{
  width: fit-content;
  margin: 0 auto 20px auto ;
  box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12);
  border-radius: 4px;
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
    font-size: 14px!important;
  }
}

</style>

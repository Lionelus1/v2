<template>
    <div>
      <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
      
      <Menubar :model="items" class="m-0 pt-0 pb-0" @click="onMenuItemClick"></Menubar>
  
      <BlockUI class="card p-fluid" :blocked="loading">
        <component :is="selectedComponent" v-if="selectedComponent" :modelValue="per" :readonly="pageReadonly" @input="input" />
      </BlockUI>
      
    </div>
  </template>
  
  <script>
  import { findRole } from "@/config/config";
  import Enum from "@/enum/roleControls/index";
  
  import { ContragentService } from "@/service/contragent.service";
  import UserIDCard from '@/components/user/UserIDCard'
  import UserEducationEdit from '@/components/user/UserEducationEdit'
  import UserEducationView from '@/components/user/UserEducationView'
  import UserRequisite from '@/components/user/UserRequisite'
  import {UserService} from "@/service/user.service"
  
  
  
  export default {
    name: 'UserPage',
    components: {UserIDCard, UserService, UserEducationEdit, UserEducationView, UserRequisite },
    props: {
      person: null,
      readonly: {
        type: Boolean,
        default: false
      }
    },
    emits: ['personUpdated'],
    data() {
      return {
        service: new ContragentService(),
        loginedUser: null,
        findRole: findRole,
        enum: Enum,
  
        loading: false,
        changed: false,
        pageReadonly: false,
  
        per: JSON.parse(JSON.stringify(this.person)),
        validation: {
          iin: false,
          firstname: false,
          lastname: false, 
          birthday: false,
          email: false,
        },
  
        items: [
          {
            label: this.$t("common.save"),
            icon: "pi pi-fw pi-save",
            disabled: () => !this.changed,
            command: () => { this.save() },
          },
          { label: "Личные данные", value: "UserPeronalInfomation" },
          { label: "Удостоверение личности", value: "UserIDCard" },
          { label: "Образование", value: "UserEducationView" },
          { label: "Банковские реквизиты", value: "UserRequisite" }
        ],
        selectedComponent: 'UserPeronalInfomation',
        user: {},
        userService: new UserService()
      }
    },
    created() {
      this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
    },
    mounted() {
      this.getUserAccount()
      this.pageReadonly = true;
  
      if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || this.loginedUser.userID === this.per.userID)) {
          this.pageReadonly = false;
      }
  
    },
    methods: {
      showMessage(msgtype, message, content) {
        this.$toast.add({
          severity: msgtype,
          summary: message,
          detail: content,
          life: 3000
        });
      },
      save() {
        if (this.validate()) {
          this.showMessage("error", this.$t('common.message.fillError'));
          return
        }
  
        this.loading = true;
  
        this.service.updateUser(this.per).then(res => {
          this.loading = false;
  
          this.$emit('personUpdated', this.per)
        }).catch(err => {
          this.loading = false;
  
          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          } else {
            console.log(err);
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
          }
        })
      },
      input() {
        this.changed = true;
      },
      validate() {
        this.validation.iin = !this.per.IIN || this.per.IIN.length != 12;
        this.validation.firstname = !this.per.firstName || this.per.firstName.length < 1;
        this.validation.lastname =  !this.per.thirdName || this.per.thirdName.length < 1;
        this.validation.birthday = !this.per.birthday || this.per.birthday.id < 1;
        this.validation.email = !this.per.email || this.per.email.length < 1;
  
        return (this.validation.iin || this.validation.firstname || this.validation.lastname ||
          this.validation.birthday || this.validation.email);
      },
      onMenuItemClick(event) {
          console.log(event.target)
          if (event.target) {
            const menuItemValue = event.target.textContent
            
  
            switch (menuItemValue) {
            case "Личные данные":
              this.selectedComponent = "UserPeronalInfomation";
              break;
            case "Удостоверение личности":
              this.selectedComponent = "UserIDCard";
              break;
            case "Образование":
              this.selectedComponent = "UserEducationView";
              break;
            case "Банковские реквизиты":
              this.selectedComponent = "UserRequisite";
              break;
            default:
              this.selectedComponent = "UserPeronalInfomation";
              break;
          }
  
        }
      },
      getUserAccount() {
        const req = {
          userID: this.per.userID
        }
  
        this.userService.getUserAccount(req).then(response=>{
    
          this.user = response.data.user
        }).catch(err => {
          this.loading = false;
  
          if (err.response && err.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (err.response && err.response.data && err.response.data.localized) {
            this.showMessage('error', this.$t(err.response.data.localizedPath), null);
          } else {
            console.log(err);
            this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
          }
        })
      }
  
    }
  }
  </script>
  
  <style scoped>
  
  .custom-dropdown {
    margin-top: 8px;
  }
  .progress-spinner {
    position: absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
    z-index: 1102;
  }
  </style>
  
<template>
    <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
    <h3 v-if="personType == 1">
    {{this.$t("common.userDetail") + ' (' + this.$t("doctemplate.editor.individualEntrepreneur") + ')'}}
    </h3>
    <h3 v-else-if="personType == 2">
    {{ this.$t("common.userDetail") + ' (' + this.$t("roleControl.employeeLabel") + ')' }}
    </h3>
    <h3 v-else-if="personType == 3">
    {{ this.$t("common.userDetail") + ' (' + this.$t("common.student") + ')' }}
    </h3>

    <div
      v-if="userDetailSaved"
      id="contentcnv"
      class="col-12"
      :style="backcolor"
      ref="content"
    >
      <h6>{{ this.$t("common.message.userSuccessInserted") }}</h6>
      <table style="border: 1px solid black; border-collapse: collapse">
        <tr style="border: 1px solid black; border-collapse: collapse">
          <th style="border: 1px solid black; border-collapse: collapse">
            {{ this.$t("contact.iin") }}
          </th>
          <th style="border: 1px solid black; border-collapse: collapse">
            {{ this.$t("common.password") }}
          </th>
        </tr>
        <tr style="border: 1px solid black; border-collapse: collapse">
          <td style="border: 1px solid black; border-collapse: collapse">
            {{ per.IIN }}
          </td>
          <td style="border: 1px solid black; border-collapse: collapse">
            {{ password }}
          </td>
        </tr>
      </table>
    </div>
    <Button
      v-if="userDetailSaved"
      @click="download"
      :label="this.$t('common.download')"
      class="p-button-link"
    />

    <Menubar :model="items" class="m-0 pt-0 pb-0"></Menubar>
    <BlockUI v-if="!loading" class="p-fluid" :blocked="loading">
      <TabView class="custom-tabview">

        <TabPanel :header="this.$t('personalData')">
          <template template v-if="(per && per.userID) || customType === chapter.createUser">
            <UserPersonalInfomation @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :custom-type="customType" :userID="per ? per.userID : null" :readonly="pageReadonly"/>
          </template>
        </TabPanel>

        <TabPanel v-if="customType===chapter.myAccount || customType=== chapter.viewUser || customType === chapter.createUser"  :header="$t('hr.title.id')">
          <UserIDCard @personal-information-updated="handlePersonalInformationUpdate" :custom-type="customType" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel :header="this.$t('hr.educationLabel')">
          <UserEducationView  @personal-information-updated="handlePersonalInformationUpdate"  :custom-type="customType" :model-value="per" :userID="per.userID"  :readonly="pageReadonly"/>
        </TabPanel>
        
        <TabPanel v-if="customType===chapter.myAccount || customType=== chapter.viewUser || customType === chapter.createUser" :header="$t('bank.requisite')">
          <UserRequisite @personal-information-updated="handlePersonalInformationUpdate" :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="(customType===chapter.myAccount || customType=== chapter.viewUser) && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))"  :header="$t('science.scientific_grants')">
          <ScientificGrantsView :model-value="per" :userID="per.userID" :readonly="pageReadonly"></ScientificGrantsView>
        </TabPanel>

        <TabPanel v-if="customType !== chapter.createUser && customType !== chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="this.$t('science.areaScientificInterests')">
          <UserResearchInterestsView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType !== chapter.createUser && customType !== chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="this.$t('science.laborActivity')">
          <WorkExperienceView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType !== chapter.createUser && customType !== chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="this.$t('science.awardsAndHonors')">
          <UserAwardView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

        <TabPanel v-if="customType !== chapter.createUser && customType !== chapter.viewUser && (customType===chapter.scientists || findRole(null, 'teacher') || findRole(null, 'personal'))" :header="this.$t('science.professionalDevelopment')">
          <UserQualificationsView :model-value="per" :userID="per.userID" :readonly="pageReadonly"/>
        </TabPanel>

      </TabView>
    </BlockUI>

    <Sidebar v-model:visible="viewResume" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <ResumeView :userID="per.userID" :readonly="true"/>
    </Sidebar>

  <Sidebar v-model:visible="showScientificWorks" position="right" class="p-sidebar-lg">
    <ScienceWorks :scientist="per" :openCardInSidebar="true" />
  </Sidebar>
</template>


<script>
import { findRole } from "@/config/config";
import Enum from "@/enum/roleControls/index";

import { ContragentService } from "@/service/contragent.service";
import UserPersonalInfomation from '@/components/user/edit/UserPersonalInfomation'
import UserIDCard from '@/components/user/edit/UserIDCard'
import UserEducationEdit from '@/components/user/edit/UserEducationEdit'
import UserEducationView from '@/components/user/view/UserEducationView'
import UserRequisite from '@/components/user/edit/UserRequisite'
import {UserService} from "@/service/user.service"
import UserResearchInterestsView from "@/components/user/view/UserResearchInterestsView"
import WorkExperienceView from "@/components/user/view/WorkExperienceView"
import UserAwardView from "@/components/user/view/UserAwardView"
import UserQualificationsView from "@/components/user/view/UserQualificationsView"
import  ResumeView  from "@/components/humanResources/vacancy/ResumeView.vue";
import ScienceWorks from "@/components/documents/catalog/ScienceWorks.vue"
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import ScientificGrantsView from "@/components/user/view/ScientificGrantsView.vue";
import CryptoJS from "crypto-js";

export default {
  name: 'PersonPage',
  components: {
    ScientificGrantsView,
    UserPersonalInfomation, UserIDCard, UserEducationView, UserRequisite, UserResearchInterestsView,
    WorkExperienceView, UserAwardView, UserQualificationsView, ResumeView, ScienceWorks, },
  props: {
    person: null,
    userID: null,
    readonly: {
      type: Boolean,
      default: false
    },
    customType: {
      type: String,
      default: ''
    },
    personType: null,
  },
  emits: ['personUpdated',],
  data() {
    return {
      service: new ContragentService(),
      loginedUser: null,
      findRole: findRole,
      enum: Enum,

      loading: false,
      changed: true,
      pageReadonly: false,

      per: JSON.parse(JSON.stringify(this.person)) || null,
      validation: {
        iin: false,
        firstname: false,
        firstnameEn: false,
        lastname: false, 
        lastnameEn: false, 
        birthday: false,
        email: false,
        idnumber: false,
        iddate: false,
        idcardgivenorg: false,
        bankaccount: false,
        bank_id: false,
        internalPhone: false,
      },
      showResume: false,
      items: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.changed,
          command: () => { this.save() },
        },
        {
            label: this.$t("science.profileLink"),
            icon: "pi pi-fw pi-user",
            disabled: () => !this.per || !this.per.profile_links || this.per.profile_links.length < 1 ||
              this.per.profile_links[0].length < 1,
            command: () => {
              this.redirectToProfile();
            },
            visible: this.customType != 'createUser' && this.customType != 'viewUser' && (this.customType === 'scientists' || (findRole(null, 'teacher') || findRole(null, 'personal')))
        },
        {
          label: this.$t("dissertation.swList"),
          icon: "pi pi-fw pi-search",
          command: () => {
            this.openScientificWorksList();
          },
          visible: this.customType != 'createUser' && this.customType != 'viewUser' && (this.customType === 'scientists' || (findRole(null, 'teacher') || findRole(null, 'personal')))
        },
        {
          label: this.$t('common.theResume'),
          icon: "fa-solid fa-address-card",
          command: () => {
            this.openResumeV2();
          },
          visible: () => {
            if (this.customType === 'viewUser' && findRole(null, 'main_administrator') && this.showResume){
              return true;
            }
            return false;
          }
        },
      ],
      user: {},
      userService: new UserService(),
      file: null,
      fileBankRequisite: null,
      userPhoto: null,
      chapter: {
        myAccount: 'myAccount',
        scientists: 'scientists',
        viewUser: 'viewUser',
        createUser: 'createUser'
      },
      viewResume: false,
      showScientificWorks: false,
      userDetailSaved: false,
      password: null
    }
  },
  created() {
    this.loginedUser = JSON.parse(localStorage.getItem("loginedUser"));
  },
  mounted() {
    if (this.customType != this.chapter.createUser) {
      this.getUserAccount()
    }
    this.pageReadonly = true;

    if (!this.readonly && (this.findRole(this.loginedUser, this.enum.roles.MainAdministrator) || this.loginedUser.userID === this.per.userID)) {
        this.pageReadonly = false;
    } else {
      this.changed = false
    }

    this.emitter.on('idcardpath', (data) => {
      if (data !== true) {
        this.file = data
        this.changed = true;
      } 
    });
    
    this.emitter.on('bankrequisite', (data) => {
      if (data !== true) {
        this.fileBankRequisite = data
        this.changed = true;
      } 
    });

    this.emitter.on('userPhoto', (data) => {
      if (data !== true) {
        this.userPhoto = data
        this.changed = true;
      }
    });

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
        if (this.validation.internalPhone) {
          this.showMessage("error", "Номер рабочего телефона должен состоять из пяти цифр")
          return;
        }

        this.showMessage("error", this.$t('common.message.fillError'));
        return
      }

      this.loading = true;

      if (this.per.birthday) {
        const formattedBirthday = this.per.birthday;
        const birthdayDateObject = this.parseDate(formattedBirthday);

        if (birthdayDateObject) {
          this.per.birthday = birthdayDateObject;
        } else {
          this.per.birthday = null
        }
      }

      if (this.per.iddate) {
        const formattedIdDate = this.per.iddate;
        const idDateObject = this.parseDate(formattedIdDate);

        if (idDateObject) {
          this.per.iddate = idDateObject;
        } else {
          this.per.iddate = null
        }
      }

      const fd = new FormData();
      const req = {
        user: this.per
      }

      const searchMode = this.personType == 1 ? "individual_entrepreneur" : this.personType == 2 ? "staff" : this.personType == 3 ? "student" : null;

      if (searchMode != null && this.personType != null) {
        req.searchMode = searchMode
      }

      fd.append("id", JSON.stringify(req))
      if (this.file !== null) {
        fd.append("idImage", this.file);
      }
      if (this.fileBankRequisite !== null) {
        fd.append("bankRequisiteImage", this.fileBankRequisite)
      }

      if (this.userPhoto !== null) {
        fd.append("userPhoto", this.userPhoto)
      }

      this.userService.updateUserAccountHandler(fd).then(res => {
        this.file = null
        this.$emit('personUpdated', this.per)
        if ((this.personType != null && (this.personType == 1 || this.personType == 2) && this.per.userID == undefined) || this.per.password) {
          this.password = this.per.password
          this.userDetailSaved = true
        }

        this.per = res.data

        this.getUserAccount()
        this.showMessage('success', this.$t('common.success'));

        this.loading = false;
      }).catch(err => {
        this.loading = false;
        this.file = null
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    input() {
      this.changed = true;
    },
    handleModelUpdate(newValue) {

    },
    validate() {
      this.validation.iin = !this.per.IIN || this.per.IIN.length != 12;
      this.validation.firstname = !this.per.firstName || this.per.firstName.length < 1;
      this.validation.firstnameEn = !this.per.firstnameEn || this.per.firstnameEn.length < 1;
      this.validation.lastname =  !this.per.thirdName || this.per.thirdName.length < 1;
      this.validation.lastnameEn =  !this.per.thirdnameEn || this.per.thirdnameEn.length < 1;
      this.validation.internalPhone = !this.per.internalPhone || !/^\d{5}$/.test(this.per.internalPhone);
      this.validation.email = !this.per.email || this.per.email.length < 1;

      if (this.per?.internalPhone === undefined || this.per?.internalPhone?.length === 0) {
        this.validation.internalPhone = false
      }

      return (this.validation.iin || this.validation.firstname || this.validation.lastname ||
        this.validation.email || this.validation.firstnameEn ||
        this.validation.lastnameEn || this.validation.internalPhone);
    },
    handlePersonalInformationUpdate(updatedData) {
      if (updatedData != null) {
        this.per = updatedData;
        this.$emit("update:modelValue", this.per);
      }
    },
    getUserAccount() {
      const req = {
        userID: null
      }
      if (this.userID != null) {
        req.userID = this.userID
      } else {
        req.userID = this.per.userID
      }
      this.loading = true
      this.userService.getUserAccount(req).then(async response => {

        this.per = response.data.user
        this.$emit("update:modelValue", this.per);
        this.$emit("update:person", this.per);
        this.loading = false

        const result = await this.service.checkResume({userID: this.per?.userID});
        if (result.data) {
          this.showResume = true;
        }

      }).catch(err => {

        this.this.loading = false
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout");
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null);
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'));
        }
      })
    },
    openScientificWorksList() {
        this.showScientificWorks = true
    },
    redirectToProfile() {
      if (this.per.profile_links != null) {
        const firstLink = this.per.profile_links[0]; 

        if (firstLink) {
          window.open(firstLink, '_blank'); 
        } 
      } else {
        // TODO: Ссылка на профиль отсутствует
      } 
    },
    onMenuItemClick() {
      this.$emit('someEvent')
    },
    openResume() {
      this.viewResume = true
    },
    download() {
      this.backcolor = "background-color: white";
      var element = document.getElementById("contentcnv");
      var positionInfo = element.getBoundingClientRect();
      var divHeight = positionInfo.height;
      var divWidth = positionInfo.width;
      var ratio = divHeight / divWidth;
      html2canvas(this.$refs.content, {
        height: divHeight,
        width: divWidth,
      }).then(function (canvas) {
        var image = canvas.toDataURL("image/jpeg");
        var doc = new jsPDF(); // using defaults: orientation=portrait, unit=mm, size=A4
        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();
        height = ratio * width;
        doc.addImage(image, "JPEG", 10, 10, width - 10, height);
        doc.save("user-credentials.pdf"); //Download the rendered PDF.
      });
      this.backcolor = "background-color: var(--teal-100);";
      this.userDetailSaved = false;
    },
    parseDate(dateString) {
      let dateObject;

      if (/^[a-zA-Z]{3} [a-zA-Z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/.test(dateString)) {
        dateObject = new Date(dateString);
      } else {
        const parts = dateString.split('.');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          dateObject = new Date(year, month, day);
        }
      }

      if (dateObject instanceof Date && !isNaN(dateObject)) {
        return dateObject;
      } else {
        return null;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    hashUserId(userId) {
      const secretKey = 'secretKey';
      const encrypted = CryptoJS.AES.encrypt(userId, secretKey).toString();
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
    },
    async openResumeV2() {
      const hashedUserId = this.hashUserId(this.per.userID.toString());
      this.$router.push({ name: 'CurriculumVitae', params: { uuid: hashedUserId } });
    },
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

  .custom-tabview .p-tabview-nav {
    display: flex;
    flex-wrap: wrap; 
    gap: 8px;
  }

  .custom-tabview .p-tabview-nav .p-tabview-nav-link {
    min-width: 120px; 
    white-space: nowrap; 
  }

  #carddiv label {
  position: inherit;
}
.p-accordion .p-accordion-header .p-accordion-header-link {
  border: 0px;
  height: 25px;
  background-color: #ffffff;
}
.p-accordion .p-accordion-content {
  border: 0px;
}
.p-accordion
  .p-accordion-header:not(.p-disabled).p-highlight
  .p-accordion-header-link {
  background-color: #ffffff;
}

.border-indigo-300 {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.border {
  border-width: 1px;
}
.rounded {
  border-radius: 0.25rem;
}
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus\:border-indigo-300:focus {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}

</style>

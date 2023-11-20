<template>
  <div class="container" id="app" v-cloak>
    <div class="steps" v-if="mode == 'standard'">
      <ul class="steps-list">
        <li :class="{
                        'steps-item': true,
                        /*'done': index < activeIndex ,*/
                        'active': index === activeIndex,
                    }"
            v-for="(step, index) in steps"
            :key="step"
        >
          <span @click="setActive(index)"> {{ index + 1 }} </span>
          <div class="pt-2">{{ $i18n.locale === 'kz'? step.titleKz : $i18n.locale === 'en' ? step.titleEn : step.titleRu }}</div>
        </li>
      </ul>
      <div class="steps-content">
        <FindUser @add="updateModel" @remove="updateModel" v-model="selectedUsers"></FindUser>
        <Dropdown :disabled="!isNewStage" @change="updateModel" class="mt-2" v-model="certificate" :options="certificates" :optionLabel="'name' + $i18n.locale" :placeholder="$t('ncasigner.certType')" />
      </div>

      <div>
        <Button :disabled="!(isNewStage && steps.length < 10)" icon="pi pi-plus" class="p-button-rounded p-button-success"
                @click="addStep"/>
        <Button @click="clearSteps" class="btn danger ml-2"> {{ $t('common.clearApprovalList') }} </Button>
      </div>
    </div>
    <div class="steps" v-else>
      <ul class="steps-list">
        <li :class="{
                        'steps-item': true,
                        /*'done': index < activeIndex ,*/
                        'active': index === activeIndex,
                    }"
            v-for="(approvalStage, index) in approvalStages"
            :key="approvalStage"
        >
          <span @click="setActive(index)"> {{ index + 1 }} </span>
          <div class="pt-2">{{ $i18n.locale === 'kz'? approvalStage.titleKz : $i18n.locale === 'en' ? approvalStage.titleEn : approvalStage.titleRu }}</div>
        </li>
      </ul>
      <div class="steps-content">
        <Dropdown v-if="isNewStage" @change="approvalListChanged" v-model="approvalListItem" :options="approvalList" :optionLabel="'title' + $i18n.locale.charAt(0).toUpperCase() + $i18n.locale.slice(1)" :placeholder="$t('roleControl.instance')"></Dropdown>
        <FindUser :disabled="readonly || !approvalStages[activeIndex].userChangeable" class="mt-2" @add="updateModel" @remove="updateModel" v-model="selectedUsers"></FindUser>
        <Dropdown :disabled="true" @change="updateModel" class="mt-2" v-model="certificate" :options="certificates" optionValue="value" :optionLabel="'name' + $i18n.locale" :placeholder="$t('ncasigner.certType')" />
      </div>

      <div>
        <Button v-if="!readonly" :disabled="!(isNewStage && approvalStages.length < 10)" icon="pi pi-plus" class="p-button-rounded p-button-success"
                @click="addStep"/>
        <Button v-if="!readonly" @click="clearSteps" class="btn danger ml-2"> {{ $t('common.clearApprovalList') }} </Button>
        <Button v-if="!readonly && isNewStage && isEnuWorker" @click="approvalListControl = true" style="width: auto; color: white; font-weight: 700;"
                :disabled="!isNewStage" class="p-button-warning"> {{ $t('roleControl.addNewInstance') }} </Button>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="approvalListControl" :style="{width: '50vw'}" class="p-fluid" @hide="dialogHidden">
    <ApprovalListControl></ApprovalListControl>
  </Dialog>
</template>

<script>
import axios from 'axios';
import {smartEnuApi, getHeader} from "@/config/config";

import ApprovalListControl from '../../roleControl/ApprovalListControl.vue';

export default {
  name: "ApproveComponent",
  props: {
    modelValue: null,
    stages: null,
    mode: null, // 'standard', 'doc_template', 'doc_template_creating'
    readonly: null,
  },
  emits: ['clearStages'],
  components: { ApprovalListControl },
  data() {
    return {
      selectedUsers: null,
      certificates: [
        {namekz: "Жеке тұлғаның сертификаты", nameru: "Сертификат физического лица", nameen: "Certificate of an individual", value: "individual"},
        {namekz: "Ішкі құжат айналымы үшін (ГОСТ)", nameru: "Для внутреннего документооборота (ГОСТ)", nameen: "For internal document management (GOST)", value: "internal"},
        {namekz: "Бірінші басшының сертификаты", nameru: "Сертификат первого руководителя", nameen: "Certificate of the CEO", value: "ceo"},
        {namekz: "Кадр бөлімі қызметкерінің сертификаты", nameru: "Сертификат сотрудника отела кадров", nameen: "Certificate of the HR worker", value: "hr_worker"},
        {namekz: "Қол қою құқығы бар қызметкер сертификаты", nameru: "Сертификат сотрудника с правом подписи", nameen: "Certificate of the employee with the right to sign", value: "sign_right"},
        {namekz: "Қаржы құжаттарына қол қою құқығы бар қызметкер сертификаты", nameru: "Сертификат сотрудника с правом подписи финансовых документов", nameen: "Certificate of the employee with the right to sign financial docs", value: "financial_sign_right"},
      ],
      certificate: null,
      stage: this.modelValue != null ? this.modelValue.length + 1 : 1,
      stageValue: this.value,
      activeIndex: 0,
      isStepsFinished: false,
      stagesList: this.stages,
      steps: this.stages != null ? JSON.parse(JSON.stringify(this.stages)) : [
        {
          stage: 1,
          users: null
        }
      ],
      result: this.stages ? JSON.parse(JSON.stringify(this.stages)) : this.modelValue,
      isNewStage: this.mode === 'standard' ? !this.stages : false,
      approvalStages: this.modelValue,
      approvalList: [],
      approvalListItem: null,
      approvalListControl: false,
    }
  },
  setup(props, context) {
    function updateValue(e) {
      if (e) {
        context.emit("update:modelValue", e);
      }
    }

    return {
      updateValue,
    };
  },
  methods: {
    // prev() {
    //   if (this.activeIndex > 0) {
    //     this.activeIndex--;
    //   }
    // },
    // reset() {
    //   this.activeIndex = 0;
    //   this.isStepsFinished = false;
    // },
    // nextOfFinish() {
    //   if (!this.isLastStep) {
    //     this.activeIndex++;
    //   } else {
    //     this.isStepsFinished = true;
    //   }
    // },
    setActive(index) {
      this.activeIndex = index;
      if (this.mode == 'standard') {
        this.stage = index + 1;
        this.selectedUsers = this.result[index].users != null ? this.result[index].users : null;
        this.certificate = this.result[index].certificate;
      } else {
        this.approvalListItem = null
        this.approvalList.forEach((app) => {
          if (app.approvalListId === this.approvalStages[index].approvalListId) {
            this.approvalListItem = app;
            return;
          }
        })
        this.selectedUsers = this.approvalStages[index].users != null ? this.approvalStages[index].users : null
        this.certificate = this.approvalStages[index].certificate != null ?  this.approvalStages[index].certificate.value : null
      }
    },
    addStep() {
      if (this.mode == 'standard') {
        this.result.push({stage: this.result.length+1, users: null, certificate: null})
        this.stage += 1;
        this.activeIndex += 1;
        this.steps.push({stage: this.stage})
        this.selectedUsers = null;
        this.certificate = null;
      } else {
        this.approvalStages.push({
          stage: this.approvalStages.length + 1,
          users: null,
          userChangeable: false,
          certificate: null,
          approvalListId: 0,
        })
        this.setActive(this.activeIndex + 1)
      }
      //this.$emit('changeStep', this.stage);
    },
    updateModel() {
      if (this.mode == 'standard') {
        if (this.result.length ===0) {
          this.result.push({stage: this.stage, users: this.selectedUsers, certificate: this.certificate})
        } else {
          this.result[this.activeIndex].users= this.selectedUsers
          this.result[this.activeIndex].certificate = this.certificate
        }
        this.updateValue(this.result)
      } else {
        this.approvalStages[this.activeIndex].users = this.selectedUsers
        this.certificates.forEach((cert) => {
          if (cert.value === this.certificate) {
            this.approvalStages[this.activeIndex].certificate = cert;
            return;
          }
        })
        this.updateValue(this.approvalStages)
      }
      // this.initResult()
      // this.$emit('update:modelValue', this.result);
      // this.$emit('add', {stage: this.stage, users: this.selectedUsers, certificate: this.certificate});

      // if (preventDefault) {
      //  event.preventDefault();
      // }
    },
    clearSteps() {
      if (this.mode == 'standard') {
        this.steps = [{
          stage: 1,
          users: null
        }];
        this.stagesList = null;
        this.result = [];
        this.updateModel();
        this.setActive(0);
        this.isNewStage = true;
        this.$emit('clearStages', true)
      } else {
        this.approvalStages = [{
          stage: 1,
          users: null,
          userChangeable: false,
          certificate: null,
          approvalListId: 0,
        }];
        this.setActive(0);
        this.updateModel();
        this.isNewStage = true;
      }
    },
    approvalListChanged() {
      this.approvalStages[this.activeIndex].approvalListId = this.approvalListItem.approvalListId
      this.approvalStages[this.activeIndex].userChangeable = this.approvalListItem.userChangeable
      this.approvalStages[this.activeIndex].titleKz = this.approvalListItem.titleKz
      this.approvalStages[this.activeIndex].titleRu = this.approvalListItem.titleRu
      this.approvalStages[this.activeIndex].titleEn = this.approvalListItem.titleEn
      this.certificate = this.approvalListItem.certificate.value
      this.selectedUsers = this.approvalListItem.users
      this.updateModel()
    },
    dialogHidden() {
      this.getApprovalList()
    },
    getApprovalList() {
      axios.get(smartEnuApi + "/approvalList/get", {
        headers: getHeader(),
      }).then(response => {
        this.approvalList = response.data
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      })
    },
    isEnuWorker() {
      let currentUser = this.$store.state.loginedUser
      if (currentUser && currentUser.mainPosition.organization && currentUser.mainPosition.organization.iin && currentUser.mainPosition.organization.iin === '010140003594') {
        return true
      }

      return false 
    }
  },
  created() {
    this.setActive(0);
  },
  computed: {
    // activeStep() {
    //   return this.steps[this.activeIndex];
    // },
    // isFirstStep() {
    //   return this.activeIndex === 0;
    // },
    // isLastStep() {
    //   return this.activeIndex === this.steps.length - 1;
    // },
  },
  mounted() {
    if (this.mode != 'standard') {
      this.getApprovalList()
    }
  },
  unmounted() {
    this.result = [];
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

hr {
  margin: 1rem 0;
}

[v-cloak] {
  display: none;
}

strong,
.bold {
  font-weight: 500;
}

ol,
p,
ul {
  line-height: 1.7;
}

a {
  color: #3eaf7c;
  font-weight: 500;
  text-decoration: none;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 500;
  line-height: 1.45;
}

h1 {
  font-size: 2.2rem;
  font-weight: 600;
}

h2 {
  font-size: 1.65rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #eaecef;
}

h3 {
  font-size: 1.35rem;
}

.danger {
  color: #c02929;
}

.btn {
  color: #42b983;
  position: relative;
  place-content: center;
  place-items: center;
  width: fit-content;
  border-radius: 5px;
  letter-spacing: 0.05em;
  border: 1px solid #42b983;
  text-decoration: none;
  margin-right: 10px;
  padding: 0.5rem 1.5rem;
  white-space: nowrap;
  font-weight: 700;
  outline: none;
  background: #fff;
  transition: all 0.22s;
}

.btn:hover {
  cursor: pointer;
  opacity: 0.8;
}

.btn:disabled {
  background: #eee !important;
  border: #ddd !important;
  color: #aaa !important;
  cursor: not-allowed;
}

.btn:active {
  box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.btn.primary {
  background: #42b983;
  color: #fff;
}

.btn.danger {
  background: #e53935;
  color: #fff;
  border-color: #e53935;
}

.container {
  margin: 0 auto;
  max-width: 1000px;
}

.steps {
  position: relative;
}

.steps-list {
  list-style: none;
  margin: 0;
  margin-bottom: 1rem;
  padding: 0;
  display: flex;
  justify-content: space-between;
}

.steps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.steps-item span, .steps-item div {
  margin: 0 auto;
  text-align: center;
}

.steps-item span {
  cursor: pointer;
  border-radius: 50%;
  padding: .75rem 1rem;
  font-size: .75rem;
  background: #cccccc;
}

.steps-content {
  margin-bottom: 1rem;
}

.steps-item.active span, .steps-item.done span {
  background: #05a8ee;
}

.steps-item.active span {
  font-weight: bold;
  color: #ffffff;
}
</style>
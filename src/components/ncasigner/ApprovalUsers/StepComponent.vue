<template>
  <div class="container" id="app" v-cloak>
    <div class="steps">
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
          <div class="p-pt-2">{{ $i18n.locale === 'kz'? step.titleKz : $i18n.locale === 'en' ? step.titleEn : step.titleRu }}</div>
        </li>
      </ul>
      <div class="steps-content">
        <FindUser @add="updateModel" @remove="updateModel" v-model="selectedUsers"></FindUser>
        <Dropdown :disabled="!isNewStage" @change="updateModel" class="p-mt-2" v-model="sertificate" :options="sertificates" :optionLabel="'name' + $i18n.locale" :placeholder="$t('ncasigner.certType')" />
      </div>

      <div>
        <Button v-if="isNewStage" icon="pi pi-plus" class="p-button-rounded p-button-success"
                @click="addStep"/>
        <button @click="clearSteps" class="btn danger p-ml-2"> {{ $t('common.clearApprovalList') }} </button>
      </div>
    </div>
  </div>
</template>

<script>
import FindUser from "@/helpers/FindUser";

export default {
  name: "ApproveComponent",
  components: {FindUser},
  props: {
    modelValue: null,
    stages: null
  },
  emits: ['clearStages'],
  data() {
    return {
      selectedUsers: null,
      sertificates: [
        {namekz: "Жеке тұлғаның сертификаты", nameru: "Сертификат физического лица", nameen: "Certificate of an individual", value: "individual"},
        {namekz: "Ішкі құжат айналымы үшін (ГОСТ)", nameru: "Для внутреннего документооборота (ГОСТ)", nameen: "For internal document management (GOST)", value: "internal"},
        {namekz: "Бірінші басшының сертификаты", nameru: "Сертификат первого руководителя", nameen: "Certificate of the CEO", value: "ceo"},
        {namekz: "Кадр бөлімі қызметкерінің сертификаты", nameru: "Сертификат сотрудника отела кадров", nameen: "Certificate of the HR worker", value: "hr_worker"},
        {namekz: "Қол қою құқығы бар қызметкер сертификаты", nameru: "Сертификат сотрудника с правом подписи", nameen: "Certificate of the employee with the right to sign", value: "sign_right"},
        {namekz: "Қаржы құжаттарына қол қою құқығы бар қызметкер сертификаты", nameru: "Сертификат сотрудника с правом подписи финансовых документов", nameen: "Certificate of the employee with the right to sign financial docs", value: "financial_sign_right"},
      ],
      sertificate: null,
      stage: this.modelValue.length +1,
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
      isNewStage: !this.stages
    }
  },
  setup(props, context) {
    function updateValue(e) {
      if (e.value) {
        context.emit("update:modelValue", e.value);
      }
    }

    return {
      updateValue,
    };
  },
  methods: {
    prev() {
      if (this.activeIndex > 0) {
        this.activeIndex--;
      }
    },
    reset() {
      this.activeIndex = 0;
      this.isStepsFinished = false;
    },
    nextOfFinish() {
      if (!this.isLastStep) {
        this.activeIndex++;
      } else {
        this.isStepsFinished = true;
      }
    },
    setActive(index) {
      this.activeIndex = index;
      this.stage = index + 1;
      this.selectedUsers = this.result[index].users != null ? this.result[index].users : null;
      this.sertificate = this.result[index].sertificate;
    },
    addStep() {
      this.result.push({stage: this.result.length+1, users: null, sertificate: null})
      this.stage += 1;
      this.activeIndex += 1;
      this.steps.push({stage: this.stage})
      this.selectedUsers = null;
      this.sertificate = null;
      //this.$emit('changeStep', this.stage);
    },
    updateModel() {
      if (this.result.length ===0) {
        this.result.push({stage: this.stage, users: this.selectedUsers, sertificate: this.sertificate})
      } else {
        this.result[this.activeIndex].users= this.selectedUsers
        this.result[this.activeIndex].sertificate = this.sertificate
      }
      //this.initResult()
      this.$emit('update:modelValue', this.result);
      //this.$emit('add', {stage: this.stage, users: this.selectedUsers, sertificate: this.sertificate});

      //if (preventDefault) {
      //  event.preventDefault();
      //}
    },
    clearSteps() {
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
    }
  },
  created() {
    this.setActive(0);
  },
  computed: {
    activeStep() {
      return this.steps[this.activeIndex];
    },
    isFirstStep() {
      return this.activeIndex === 0;
    },
    isLastStep() {
      return this.activeIndex === this.steps.length - 1;
    },
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

.primary {
  color: #42b983;
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

.pt-5 {
  padding-top: 5rem;
}

.form-control {
  position: relative;
  margin-bottom: 0.5rem;
}

.form-control input {
  margin: 0;
  outline: none;
  border: 2px solid #ccc;
  display: block;
  width: 100%;
  color: #2c3e50;
  padding: 0.5rem 1.5rem;
  border-radius: 3px;
  font-size: 1rem;
}

.form-control label {
  display: block;
  margin: 0 0 0.3rem 0.3rem;
  font-weight: 500;
}

.form-control input:active,
.form-control input:focus {
  transition: border 0.22s;
  border: 2px solid #42b983;
}

.card {
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 2px 3px 10px rgba(0, 0, 0, 0.2);
  background: #fff;
}

.card.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
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
<template>
  <TitleBlock :title="$t('educationalPrograms.createEP')" :show-back-button="true"/>

  <div class="grid">
    <div class="col-12 lg:col-3">
      <div class="card p-6">
        <div class="steps flex" v-for="(item,index) of items" :key="item">
          <div class="step">
            <div class="circle" :class="active === index ? 'active' : ''">{{ index + 1 }}</div>
            <div class="connection"></div>
          </div>
          <div class="name font-semibold">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-9">
      <div class="card">
      <h4>{{ $t('educationalPrograms.formationEP') }} {{ items[label] }}</h4>
      <div class="m-0">
        <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-download" :label="$t('common.save')" @click="save()"/>
        <Button class="p-button-outlined mr-2" icon="pi pi-fw pi-send" :label="$t('common.send')" @click="openDialog('sendToApprove')"/>
        <Button class="p-button-outlined" icon="pi pi-fw pi-check-circle" :label="$t('common.approvalList')"/>
      </div>
      <div class="p-fluid">
        <div class="content" v-if="active === 0">
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.codeAndNameGroupEP") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.codeGroupAndEP") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.directionTraining") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.fieldEducation") }}</label>
            <Dropdown :placeholder="$t('common.select')"/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPKZ") }}</label>
            <InputText/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPRU") }}</label>
            <InputText/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.nameGroupEPEN") }}</label>
            <InputText/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.descriptionGroupEPKZ") }}</label>
            <InputText/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.descriptionGroupEPRU") }}</label>
            <InputText/>
          </div>
          <div class="field mt-3">
            <label for="course-code">{{ $t("educationalPrograms.descriptionGroupEPEN") }}</label>
            <InputText/>
          </div>
        </div>
        <div class="content" v-if="active === 1">
          <div class="field mt-3">
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.directionTraining") }}</label>
              <Dropdown :placeholder="$t('common.select')"/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.purposeEP") }}</label>
              <InputText/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.assignmentQualifications") }}</label>
              <InputText/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.trainingPeriod") }}</label>
              <InputText/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.degreeAwarded") }}</label>
              <InputText/>
            </div>
            <div class="field mt-3">
              <label for="course-code">{{ $t("educationalPrograms.typeEducationalProgram") }}</label>
              <InputText/>
            </div>
            <div class="field-checkbox mt-3">
                <Checkbox id="landing" name="landing"/>
                <label for="landing">{{ $t("educationalPrograms.doubleDegreeProgram") }}</label>
            </div>
            <div class="field-checkbox mt-3">
              <Checkbox name="landing" :binary="true"/>
              <label>{{ $t("educationalPrograms.jointEducationalProgram") }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const active = ref(0);
const items = ref([
  {
    label: 'Формирование ОП'
  },
  {
    label: 'Цели ОП'
  },
  {
    label: 'Справочник карта компетенции'
  },
  {
    label: 'Добавление курса'
  }
]);
</script>

<style lang="scss" scoped>
.steps {
  min-height: 80px;

  .step {
    display: flex;
    align-items: center;
    flex: 0;
    flex-direction: column;

    .circle {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border: 1px solid #ccc;
      padding: 5px;
      border-radius: 50%;
    }

    .circle.active {
      background: #2196f3;
      color: #fff;
    }

    .connection {
      width: 1px;
      background-color: #ccc;
      flex-grow: 1;
    }
  }

  .name {
    margin-left: 20px;
    margin-top: 10px;
  }
}

.steps:last-child {
  min-height: 0;
}
</style>
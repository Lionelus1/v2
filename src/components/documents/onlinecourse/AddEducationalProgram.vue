<template>
  <TitleBlock :title="$t('Создать ОП')" :show-back-button="true"/>

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
      <div class="card p-fluid">
        <h4>{{ $t('Формирование ОП') }} {{items[label]}}</h4>
        <Menubar :model="menu"></Menubar>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Область образования") }}</label>
          <Dropdown placeholder="таңдаңыз"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Академическая степень") }}</label>
          <Dropdown placeholder="таңдаңыз"/>
        </div>
        <div class="field">
          <label for="author">{{ $t("Автор курса") }}</label>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Наименование курса") }}</label>
          <InputText id="course-code"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Код курса") }}</label>
          <InputText id="course-code"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Язык обучения") }}</label>
          <Dropdown placeholder="таңдаңыз"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Цель курса") }}</label>
          <Textarea id="course-code" rows="5"/>
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Краткая аннотация") }}</label>
          <Textarea id="course-code" rows="3"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const active = ref(0);

const menu = computed(() => {
  return [
    {
      label: t('common.save'),
      icon: "pi pi-fw pi-download",
      command: () => {
      },
    },
    {
      label: t('common.send'),
      icon: "pi pi-fw pi-send",
      command: () => {
      }
    },
    {
      label: t('common.approvalList'),
      icon: "pi pi-fw pi-check-circle",
      visible: true,
      command: () => {
      }
    }
  ]
})
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
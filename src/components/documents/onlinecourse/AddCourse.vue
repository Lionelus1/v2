<template>
  <TitleBlock :title="$t('Курсты құру')" :show-back-button="true"/>
  <Menubar :model="menu"></Menubar>

  <div class="grid">
    <div class="col-12 lg:col-8">
      <div class="card p-fluid mt-3">
        <div class="field mt-3">
          <label for="course-code">{{ $t("Область образования") }}</label>
          <Dropdown placeholder="таңдаңыз" />
        </div>
        <div class="field mt-3">
          <label for="course-code">{{ $t("Академическая степень") }}</label>
          <Dropdown placeholder="таңдаңыз" />
        </div>
        <div class="field">
          <label for="author">{{ $t("Автор курса") }}</label>
          <InputText disabled v-model="$store.state.loginedUser.fullName" id="author" rows="3"/>
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
          <Dropdown placeholder="таңдаңыз" />
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
    <div class="col-12 lg:col-4">
      <div class="p-fluid mt-3">
        <div class="card field">
          <label for="course-code">{{ $t("Длительность курса") }}</label>
          <InputText id="course-code"/>
<!--          <PrimeCalendar v-model="date" selection-mode="range" :manualInput="true" dateFormat="dd.mm.yy" :showIcon="true"/>-->
        </div>
        <div class="field mt-3">
          <Fieldset legend="Формат обучения">
              <div class="field-radiobutton">
                <RadioButton inputId="blockType1" name="blockType"/>
                <label for="blockType1">{{ $t('Онлайн') }}</label>
              </div>
              <div class="field-radiobutton">
                <RadioButton inputId="blockType2"/>
                <label for="blockType2">{{ $t('Оффлайн') }}</label>
              </div>
            <div class="field-radiobutton m-0">
              <RadioButton inputId="blockType2"/>
              <label for="blockType2">{{ $t('Смешанный') }}</label>
            </div>
          </Fieldset>
        </div>
        <div class="card field mt-3">
          <label for="course-code">{{ $t("Картинка") }}</label>
          <div class="post-select-image-container">
            <div class="btn-select-image" >
              <div class="btn-select-image-inner">
                <i class="fa-regular fa-image"></i>
                <FileUpload ref="form" mode="basic" :customUpload="true"
                            :auto="true" v-bind:chooseLabel="$t('common.choose')" accept="image/*"
                            class="p-button-outlined" />
              </div>
            </div>
          </div>
        </div>

        <div class="card field mt-3">
          <label for="course-code">{{ $t("Пререквизиты") }}</label>
          <Dropdown placeholder="таңдаңыз" />
          <Button label="Добавить пререквезит" class="p-button-outlined p-button-sm w-fit mt-2 mb-4" icon="pi pi-plus-circle"/>
          <br>
          <label for="course-code">{{ $t("Постреквизиты") }}</label>
          <Dropdown placeholder="таңдаңыз" />
          <Button label="Добавить постреквезит" class="p-button-outlined p-button-sm w-fit mt-2" icon="pi pi-plus-circle"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
const {t, locale} = useI18n()

const menu = computed(() => {
  return [
  {
    label: t('common.save'),
    icon: "pi pi-fw pi-download",
    command: () => {},
  },
  {
    label: t('common.send'),
    icon: "pi pi-fw pi-send",
    command: () => {}
  },
  {
    label: t('common.approvalList'),
    icon: "pi pi-fw pi-check-circle",
    visible: true,
    command: () => {}
  }
]})
const date = ref();

</script>



<style lang="scss" scoped>

.post-select-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.btn-select-image {
  position: relative;
  display: block;
  overflow: hidden;
  text-align: center;
  background: #f8f9fb;
  border: 2px dashed #e4e5e7;
  border-radius: 3px;
  cursor: pointer;
}

.post-select-image-container .btn-select-image {
  width: 100%;
  height: 200px;
}

.btn-select-image .btn-select-image-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.btn-select-image svg {
  display: block;
  font-size: 48px;
  line-height: 48px;
  color: #dadbdd;
  margin-bottom: 15px;
}

.news-image-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 2px;
}

.news-image-container img {
  display: block;
  height: auto;
  width: 280px;
  min-width: 100%;
}

.btn-remove-image {
  font-size: 12px;
  position: absolute;
  right: 0;
  top: 0;
  color: #fff;
  cursor: pointer;
}
</style>
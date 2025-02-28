<template>
    <Dialog v-model:visible="showModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
            :header="currentData ? $t('common.edit') : $t('common.add') " :modal="true" class="p-fluid" @hide="hideDialog">
      <div class="field" v-if="degrees">
        <label>{{ degrees['name_' + $i18n.locale] }}</label>
        <Dropdown v-model="selectedDegree" :options="degrees.options" @change="onSelect"
                  :optionLabel="'name_' + $i18n.locale" :placeholder="$t('common.select')" />
      </div>
      <div>
        <div class="field">
          <label>{{ $t('common.nameInQazaq') }}</label>
          <InputText type="text" v-model="formData.name_kz"  />
          <small class="p-error" v-if="!formData.name_kz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('common.nameInRussian')}}</label>
          <InputText type="text" v-model="formData.name_ru"  />
          <small class="p-error" v-if="!formData.name_ru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('common.nameInEnglish') }}</label>
          <InputText type="text" v-model="formData.name_en"  />
          <small class="p-error" v-if="!formData.name_en && submitted">{{ $t("common.requiredField") }}</small>
        </div>

        <TabView >
      <TabPanel header="Қазақша">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.description_kz" :height="200" />
          <small v-show="!formData.description_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>

      </TabPanel>
      <TabPanel header="Русский">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.description_ru" :height="200" />
          <small v-show="!formData.description_ru && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
    
      </TabPanel>
      <TabPanel header="English">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.description_en" :height="200" />
          <small v-show="!formData.description_en && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
     
      </TabPanel>
    </TabView>
      </div>
  
      <template #footer>
        <Button v-if="currentData" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2" @click="save"/>
        <Button v-if="!currentData" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success mr-2" @click="add"/>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
                @click="hideDialog"/>
      </template>
    </Dialog>
  </template>
  
  <script>
  import {inject, onMounted, ref, unref} from "vue";
  import {useToast} from "primevue/usetoast";
  import {useI18n} from "vue-i18n";
  import {EnuWebService} from "@/service/enu.web.service";
  import {EduScoreService} from "@/service/edu.score.service";

  export default {
    name: "EduScoreCategoryAdd",
    props: ['isShow', 'selectedData', 'parent'],
    setup(props, context) {
      const emitter = inject('emitter');
      const toast = useToast()
      const i18n = useI18n()
      const formData = ref(props.selectedData ? props.selectedData : {})
      const showModal = ref(props.isShow)
      const submitted = ref(false)
      const eduScoreService = new EduScoreService()
      const enuService = new EnuWebService()
      const currentData = ref(props.selectedData ? props.selectedData : null)
      const categories = ref()
      const degrees = ref()
      const blockInfo = ref()
      const selectedDegree = ref()
  
      onMounted(() => {
      if (props.parent) {
        selectedDegree.value = props.parent.degree;
        formData.value.parent_id = props.parent.id;
        onSelect(props.parent.degree);
      }
    });
      const getBlock = () => {
        eduScoreService.getEduScoreBlock().then(res => {
          if (res.data) {
            blockInfo.value = res.data;
            getAcademicDegrees(blockInfo.value.block_id)
          }
        }).catch(_ => {
        });
      }
  
      const getAcademicDegrees = (block_id) => {
        enuService.getBlockParamsByBlockId(block_id).then(res => {
          if (res.data) {
            degrees.value = res.data[0]
          }
        }).catch(_ => {
        });
      }
      getBlock();
  
      const add = () => {
        submitted.value = true;
        if (!isValid()) return;
  
        eduScoreService.addScoreCategory(formData.value).then(res => {
          if (res.data && res.data.is_success) {
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          }
          submitted.value = false;
          hideDialog();
        }).catch(_ => {
          submitted.value = false;
        });
      }
  
      const save = () => {
        submitted.value = true;
        if (!isValid()) {
          return;
        }
  
        eduScoreService.editScoreCategory(unref(formData)).then(res => {
          if (res.data && res.data.is_success) {
            toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
          }
          submitted.value = false;
          hideDialog();
        }).catch(_ => {
          submitted.value = false;
        });
      }
  
      const hideDialog = () => {
        emitter.emit("showEduScoreCategoryAddDialog", false)
      }
  
      const onSelect = (event) => {
        formData.value.degree_type = event.value.value || event.value;
      }
  
      const isValid = () => {
        let errors = [];
  
        if (!formData.value.name_kz)
          errors.push(1);
        if (!formData.value.name_ru)
          errors.push(1);
        if (!formData.value.name_en)
          errors.push(1);
        
        if (!formData.value.degree_type)
          errors.push(1);
        return errors.length === 0
      }
  
      return {
        formData, showModal, currentData, submitted, degrees, selectedDegree,
        hideDialog, add, save, onSelect
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>

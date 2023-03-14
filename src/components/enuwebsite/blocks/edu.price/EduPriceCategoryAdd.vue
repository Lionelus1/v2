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
      <div class="field">
        <label>{{ 'Описание' }}</label>
        <Textarea :placeholder="'Описание'" type="text" rows="4" v-model="formData.desc" />
      </div>
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
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {inject, onMounted, ref, unref} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {AdmissionInfoService} from "@/service/admission.info.service";
import {EnuWebService} from "@/service/enu.web.service";
import {EduPriceService} from "@/service/edu.price.service";

export default {
  name: "EduPriceCategoryAdd",
  props: ['isShow', 'selectedData', 'parent'],
  setup(props, context) {
    const emitter = inject('emitter');
    const toast = useToast()
    const i18n = useI18n()
    const formData = ref(props.selectedData ? props.selectedData : {})
    const showModal = ref(props.isShow)
    const submitted = ref(false)
    const eduPriceService = new EduPriceService()
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
      eduPriceService.getEduPriceBlock().then(res => {
        if (res.data) {
          blockInfo.value = res.data;
          getAcademicDegrees(blockInfo.value.block_id)
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const getAcademicDegrees = (block_id) => {
      enuService.getBlockParamsByBlockId(block_id).then(res => {
        if (res.data) {
          degrees.value = res.data[0]
        }
      }).catch(error => {
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }
    getBlock();

    const add = () => {
      submitted.value = true;
      if (!isValid()) return;

      eduPriceService.addPriceCategory(formData.value).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        hideDialog();
      }).catch(error => {
        submitted.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const save = () => {
      submitted.value = true;
      if (!isValid()) {
        return;
      }

      eduPriceService.editPriceCategory(unref(formData)).then(res => {
        if (res.data && res.data.is_success) {
          toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
        }
        submitted.value = false;
        hideDialog();
      }).catch(error => {
        submitted.value = false;
        toast.add({severity: "error", summary: error, life: 3000});
      });
    }

    const hideDialog = () => {
      emitter.emit("showEduPriceCategoryAddDialog", false)
    }

    const onSelect = (event) => {
      formData.value.param_id = event.value.parameter_id || event.parameter_id;
      formData.value.catalog_value_id = event.value.id || event.id
    }

    const isValid = () => {
      let errors = [];

      if (!formData.value.name_kz)
        errors.push(1);
      if (!formData.value.name_ru)
        errors.push(1);
      if (!formData.value.name_en)
        errors.push(1);
      if (!formData.value.catalog_value_id)
        errors.push(1);
      return errors.length === 0
    }

    return {
      formData, showModal, currentData, submitted, categories, degrees, selectedDegree,
      hideDialog, add, save, onSelect
    }
  }
}
</script>

<style scoped>

</style>
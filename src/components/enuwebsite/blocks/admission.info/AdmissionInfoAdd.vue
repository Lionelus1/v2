<template>
  <Dialog v-model:visible="showModal" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="currentData ? $t('common.edit') : $t('common.add') " :modal="true" class="p-fluid" @hide="hideDialog">
    <div class="field" v-if="degrees">
      <label>{{ degrees[0]['name_' + $i18n.locale] }}</label>
      <Dropdown v-model="formData.level_id" :options="degrees[0].options"
                :optionLabel="'name_' + $i18n.locale" optionValue="value" :placeholder="$t('common.select')" />
    </div>
    <div class="field" v-if="formData.level_id">
      <label>{{ $t('smartenu.chooseCategory') }}</label>
      <Dropdown v-model="formData.admission_category_id" :options="categories"
                :optionLabel="'name_' + $i18n.locale" optionValue="id" :placeholder="$t('common.select')" />
    </div>
    <TabView v-if="formData.admission_category_id">
      <TabPanel header="Қазақша">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.short_info_kz" :height="200" />
          <small v-show="!formData.short_info_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('web.enrollDocs') }}</label>
          <TinyEditor v-model="formData.print_info_kz" />
          <small v-show="!formData.print_info_kz && submitted" class="p-error">
            {{ $t("smartenu.contentKzInvalid") }}
          </small>
        </div>
      </TabPanel>
      <TabPanel header="Русский">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.short_info_ru" :height="200" />
          <small v-show="!formData.short_info_ru && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.print_info_ru"  />
          <small v-show="!formData.print_info_ru && submitted" class="p-error">
            {{ $t("smartenu.contentKzInvalid") }}
          </small>
        </div>
      </TabPanel>
      <TabPanel header="English">
        <div class="field mt-3">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.short_info_en" :height="200" />
          <small v-show="!formData.short_info_en && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('web.shortInfo') }}</label>
          <TinyEditor v-model="formData.print_info_en" />
          <small v-show="!formData.print_info_en && submitted" class="p-error">
            {{ $t("smartenu.contentKzInvalid") }}
          </small>
        </div>
      </TabPanel>
    </TabView>
    <template #footer>
      <Button v-if="currentData" :label="$t('common.save')" icon="pi pi-check" class="p-button p-component p-button-success mr-2" @click="save"/>
      <Button v-if="!currentData" :label="$t('common.add')" icon="pi pi-check" class="p-button p-component p-button-success mr-2" @click="add"/>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
              @click="hideDialog"/>
    </template>
  </Dialog>
</template>

<script>
import {inject, ref, unref} from "vue";
import {AdmissionInfoService} from "@/service/admission.info.service";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {EnuWebService} from "@/service/enu.web.service";
import TinyEditor from "../../../TinyEditor";

export default {
  name: "AdmissionInfoAdd",
  props: ['isShow', 'selectedData', 'block'],
  components: {TinyEditor},
  setup(props, context) {
    const emitter = inject('emitter');
    const toast = useToast()
    const i18n = useI18n()
    const formData = ref(props.selectedData ? props.selectedData : {})
    const showModal = ref(props.isShow)
    const submitted = ref(false)
    const admissionInfoService = new AdmissionInfoService()
    const enuService = new EnuWebService()
    const currentData = ref(props.selectedData ? props.selectedData : null)
    const categories = ref()
    const degrees = ref()
    let blockInfo = ref(props.block)

    const getAcademicDegrees = () => {
      enuService.getBlockParamsByBlockId(blockInfo.value.block_id).then(res => {
        if (res.data) {
          degrees.value = res.data
        }
      }).catch(_ => {
      });
    }

    const getCategories = () => {
      admissionInfoService.getAdmissionCategories().then(res => {
        if (res.data) {
          categories.value = res.data
        }
      }).catch(_ => {
      })
    }

    getCategories();
    getAcademicDegrees();

    const add = () => {
      submitted.value = true;
      if (!isValid()) return;
      admissionInfoService.addAdmissionInfo(formData.value).then(res => {
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

      admissionInfoService.editAdmissionInfo(unref(formData)).then(res => {
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
      emitter.emit("showAdmissionAddDialog", false)
    }

    const isValid = () => {
      let errors = [];

      if (!formData.value.print_info_kz)
        errors.push(1);
      if (!formData.value.print_info_ru)
        errors.push(1);
      if (!formData.value.print_info_en)
        errors.push(1);
      return errors.length === 0
    }

    return {
      formData, showModal, currentData, submitted, categories, degrees,
      hideDialog, add, save
    }
  }
}
</script>

<style scoped>

</style>

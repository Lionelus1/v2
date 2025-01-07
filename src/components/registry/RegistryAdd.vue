<template>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ t("registry.menuTitle") }}</h4>
  </div>
  <ToolbarMenu :data="menu"/>
  <TabView v-model:activeIndex="activeTab" @tab-change="tabChanged" class="flex flex-column flex-grow-1">
    <TabPanel :header="selectedDirection['name_' + locale]">
      <BlockUI :blocked="loading" class="card">
        <div>
          <Dialog :header="t('registry.addNewAttribute')" v-model:visible="visibility.addAttributeDialog" :style="{ width: '450px' }" class="p-fluid">
            <div class="field">
              <label>{{ t('common.nameInQazaq') }}</label>
              <InputText v-model="newAttribute.label_kz" :placeholder="t('common.nameInQazaq')" />
            </div>
            <div class="field">
              <label>{{ t('common.nameInRussian') }}</label>
              <InputText v-model="newAttribute.label_ru" :placeholder="t('common.nameInRussian')" />
            </div>
            <div class="field">
              <label>{{ t('common.nameInEnglish') }}</label>
              <InputText v-model="newAttribute.label_en" :placeholder="t('common.nameInEnglish')" />
            </div>
            <div class="field">
              <label>{{ t('common.type') }}</label>
              <Dropdown v-model="newAttribute.type" :options="fieldTypes"  optionLabel="label"
                        optionValue="value" placeholder="Тип поля" />
            </div>
            <template #footer>
              <Button :label="t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger" @click="close('addAttributeDialog')" />
              <Button :label="t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success" @click="addNewAttribute" />
            </template>
          </Dialog>

          <div v-for="field in formFields" :key="field.key" class="field" style="margin-top: 10px;">
            <label>{{
                $i18n.locale === "kz" ? field.label_kz : $i18n.locale === "ru" ? field.label_ru :
                    field.label_en
              }} <span v-if="isCurrentUserSender"
                       style="font-size: 20px; color: red;">*</span></label>
            <div v-if="field.type === 1">
              <InputText style="width: 295px;" v-model="field.value" :type="field.type" :placeholder="$i18n.locale === 'kz' ? field.name_kz : $i18n.locale === 'ru' ? field.name_ru :
                  field.name_en" @input="input"/>
            </div>
            <div v-if="field.type === 2">
              <Textarea v-model="field.value" autoResize rows="5" cols="30"/>
            </div>
            <div class="p-field" v-if="field.type === 3" >
              <Dropdown
                  v-model="field.value"
                  :options="field.parents.map(item => item['label_' + $i18n.locale])"
                  autoResize
                  :appendTo="'body'"
                  :emptyMessage="$t('common.noOptions')"
                  style="width: 295px;"
              />
            </div>
          </div>
        </div>
      </BlockUI>
      <Button class="toggle-button" @click="open('addAttributeDialog')">{{
          t('registry.addNewAttribute')
        }}
      </Button>
    </TabPanel>
  </TabView>
</template>


<script setup>

import {computed, onMounted, reactive, ref, watch} from "vue";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {findRole} from "../../config/config";
import RegistryService from "../../service/registry_service";

const props = defineProps(['visible', 'isAdded', 'isSub'])
const emit = defineEmits(['hide']);
const toast = useToast()
const {t, locale} = useI18n()
const router = useRouter();
const route = useRoute();
const registryService = new RegistryService()

const types = ref([])
const params = ref(null)
const loading = ref(false)
const request = ref({})

const formData = ref({
  work_plan_name: null,
  lang: null,
  plan_type: null,
  science_params: null
})
const selectedDirection = ref({
  name_ru: 'Саулет братан',
  name_kz: 'Саулет братан',
  name_en: 'Saulet bratan',
})
const languages = ref([
  {
    id: 1,
    name: 'Қазақ'
  },
  {
    id: 2,
    name: 'Русский'
  },
  {
    id: 3,
    name: 'English'
  }
])
const reqFormFields = ref([])
const formFields = ref([
  // {
  //   key: 'name_kz',
  //   type: 'input-text',
  //   name_kz: 'Наименование на казахском',
  //   name_ru: 'Наименование на казахском',
  //   name_en: 'Наименование на казахском',
  //   model: '',
  //   code: 'name_kz',
  //   validation: 'required'
  // },
]);

const visibility = ref({
  Request: false,
  addAttributeDialog: false,
  documentInfoSidebar: false
});

const fieldTypes = [
  { label: t('registry.inputText'), value: 1 },
  { label: t('registry.textArea'), value: 2 },
];

const newAttribute = reactive({
  label_kz: '',
  label_ru: '',
  label_en: '',
  type: null,
});

const addNewAttribute = () => {
  if (!newAttribute.label_kz || !newAttribute.label_ru || !newAttribute.label_en) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('common.fillAllFields'), life: 3000 });
    return;
  }

  formFields.value.push({ ...newAttribute, model: '', code: newAttribute.name_en });
  reqFormFields.value.push({ ...newAttribute, registry_id: parseInt(route.params.id) });
  toast.add({ severity: 'success', summary: t('common.success'), detail: t('common.attributeAdded'), life: 3000 });
  close('addAttributeDialog');
  registryService.createRegistryParameter(reqFormFields.value[0]).then((res) => {
    console.log(res);
  })

};

const close = (dialog) => {
  visibility.value[dialog] = false;
  Object.assign(newAttribute, {
    label_kz: '',
    label_ru: '',
    label_en: '',
    type: null,
  });
};

const open = (name) => {
  visibility.value[name] = true;
};

// const close = (name) => {
//   visibility.value[name] = false;
// };

const menu = computed(() => [
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    // disabled: !isUserDataVaild() || (request.value.doc?.docHistory?.stateId != DocEnum.CREATED.ID &&
    //     request.value.doc?.docHistory?.stateId != DocEnum.REVISION.ID && request.value.doc?.docHistory?.stateId != null),
    command: save
  },
]);
const selectedApplication = computed(() => {
  return route.query.selectedApplicationId;
})

const getRegisterParameterApplication = () => {
  loading.value = true;

  const req = {
    page: 0,
    rows: 1,
    registry_id: parseInt(route.params.id, 10),
    id: parseInt(selectedApplication.value, 10),
  };

  registryService.getApplication(req)
      .then((res) => {
        if (res.data.applications.length === 1) {
          // Берем первый объект application
          const application = res.data.applications[0];

          // Перебираем параметры из application.parameters
          application.parameters.forEach((param) => {
            // Находим индекс объекта в formFields
            console.log(param);
            const index = formFields.value.findIndex((p) => p.id === param.parameter.id);

            // Если индекс найден, проверяем и добавляем value, если его нет
            if (index !== -1) {
              if (!Object.prototype.hasOwnProperty.call(formFields.value[index], 'value')) {
                formFields.value[index].value = ''; // Инициализируем значение value
              }
              formFields.value[index].value = param.value_ru; // Устанавливаем value_ru
            }
          });
        }
        loading.value = false;
      })
      .catch(() => {
        loading.value = false; // Обработка ошибки
      });
};






/*

const getValue  = (slotProps, id) => {
  if (slotProps && slotProps.data && slotProps.data.parameters) {
    const param = slotProps.data.parameters.find((p) => p.parameter.id === id);
    return param ? param.value_kz : '';
  }
  return '';
}*/

const save = () => {
  const id = selectedApplication.value ? selectedApplication.value : null
  const req = {
    id: parseInt(id),
    status: 0,
    registry: {
      id: parseInt(route.params.id),
    },
    parameters: formFields.value.map(field => ({
      parameter: {
        id: field.id,
        label_kz: field.label_kz || '',
        label_ru: field.label_ru || '',
        label_en: field.label_en || '',
        type: field.type || 1,
        registry_id: parseInt(route.params.id),
      },
      value_en: field.value || '',
      value_kz: field.value || '',
      value_ru: field.value || '',
    })),
  };
  if (selectedApplication.value && selectedApplication.value.length > 0) {
    registryService.updateApplication(req)
        .then(response => {
          console.log('Application saved successfully:', response);
        })
        .catch(error => {
          console.error('Error saving application:', error);
        });
  } else {
    registryService.createApplication(req)
        .then(response => {
          console.log('Application saved successfully:', response);
        })
        .catch(error => {
          console.error('Error saving application:', error);
        });
  }

}

const getRegisterParameter = () => {
  let req = {
    register_id: parseInt(route.params.id)
  };
  registryService.getRegistryParameters(req).then(response => {
    formFields.value = response.data.register_parameter;
    if (selectedApplication.value && selectedApplication.value.length > 0) {
      getRegisterParameterApplication()
    }
  }).catch(error => {
    console.error('Ошибка при получении параметров:', error);
  });
};

onMounted(() => {
  getRegisterParameter()
  // if (selectedApplication.value && selectedApplication.value.length > 0) {
  //   getRegisterParameterApplication();
  // }

})

</script>

<style scoped>

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}


:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field input {
  width: 350px;
}

.field label {
  margin-bottom: 5px;
  /* Расстояние между меткой и полем ввода */
}

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

.lang {
  margin-left: 20px;
}

.buttonLanguag {
  margin-bottom: 20px;
}
</style>

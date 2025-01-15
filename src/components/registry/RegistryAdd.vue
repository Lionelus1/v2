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
                        optionValue="value" placeholder="Тип поля" style="width: 350px;" />
            </div>
            <div class="field" v-if="newAttribute.type === 3">
              <label>{{ t('registry.dataEntry') }}</label>
              <Dropdown
                  v-model="newAttribute.additional_registry_id"
                  :options="registryData.map(item => ({
                  label: item['name_' + $i18n.locale],
                  value: item.id}))"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Тип поля"
                  style="width: 350px;"
              />
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
              }}</label>
            <div v-if="field.type === 1">
              <InputText style="width: 295px;" v-model="field.value_kz" :type="field.type" :placeholder="field.label_kz"/>
              <InputText style="width: 295px; margin-left: 15px" v-model="field.value_ru" :type="field.type" :placeholder="field.label_ru" />
              <InputText style="width: 295px; margin-left: 15px" v-model="field.value_en" :type="field.type" :placeholder="field.label_en"/>
            </div>
            <div v-if="field.type === 7">
              <InputNumber style="width: 295px;" v-model="field.value_kz" :type="field.type" :placeholder="field.label_kz"/>
              <InputNumber style="width: 295px; margin-left: 15px" v-model="field.value_ru" :type="field.type" :placeholder="field.label_ru" />
              <InputNumber style="width: 295px; margin-left: 15px" v-model="field.value_en" :type="field.type" :placeholder="field.label_en"/>
            </div>
            <div v-if="field.type === 2">
              <Textarea v-model="field.value_kz" autoResize rows="5" cols="30" :placeholder="field.label_kz"/>
              <Textarea style="margin-left: 15px" v-model="field.value_ru" autoResize rows="5" cols="30" :placeholder="field.label_ru"/>
              <Textarea style="margin-left: 15px" v-model="field.value_en" autoResize rows="5" cols="30" :placeholder="field.label_en"/>
            </div>
            <div class="p-field" v-if="field.type === 3" >
              <Dropdown
                  v-model="field.value_ru"
                  :options="field.additionalSelect ? field.additionalSelect : null"
                  autoResize
                  :optionLabel="$i18n.locale === 'kz' ? 'value_kz' : $i18n.locale === 'ru' ? 'value_ru' :
              'value_en' "
                  :optionValue="$i18n.locale === 'kz' ? 'value_kz' : $i18n.locale === 'ru' ? 'value_ru' :
              'value_en' "
                  style="width: 295px;"
                  @change="updateValues(field, field.additionalSelect)"
              />
            </div>
            <div class="field" v-if="field.type === 4" style="width: 295px;">
              <FindUser v-model="field.applicant" :max="1"/>
            </div>
            <div class="field" v-if="field.type === 5" style="width: 295px;">
              <PrimeCalendar
                  style="width: 340px"
                  dateFormat="dd.mm.yy"
                  selectionMode="single"
                  v-model="field.value_ru"
                  @input="(value) => updateDate(value, field)"
                  :placeholder="$t('common.date')"
                  :showIcon="true"
              />
            </div>
            <div class="field" v-if="field.type === 6" style="width: 295px;">
              <div class="col">
                <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="event => uploadPosterImageKk(event, field)"
                            :auto="true" v-bind:chooseLabel="$t('registry.photo')" accept="image/*"/>
                <div class="mt-3" v-if="poster.imageKkUrl">
                  <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
                </div>
              </div>
            </div>
          </div>
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
import FindUser from "../../helpers/FindUser.vue";
import {UserService} from "../../service/user.service";
import {FileService} from "../../service/file.service";
import {smartEnuApi, fileRoute} from "../../config/config";


const props = defineProps(['visible', 'isAdded', 'isSub'])
const emit = defineEmits(['hide']);
const toast = useToast()
const {t, locale} = useI18n()
const router = useRouter();
const route = useRoute();
const registryService = new RegistryService()
const fileService = new FileService()
const userService = new UserService()

const types = ref([])
const params = ref(null)
const loading = ref(false)
const request = ref({})
const registryData = ref(null)
const formData = ref({
  work_plan_name: null,
  lang: null,
  plan_type: null,
  science_params: null
})
const selectedDirection = ref({
  name_ru: 'Реестр',
  name_kz: 'Тізілім',
  name_en: 'Registry',
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

const poster = ref( {
  link: "",
  imageKk: null,
  imageRu: null,
  imageEn: null,
})
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
  { label: t('registry.dropdown'), value: 3 },
  { label: t('common.user'), value: 4 },
  { label: t('mailing.time'), value: 5 },
  { label: t('registry.file'), value: 6 },
  { label: t('registry.fileType'), value: 7 },
];

const newAttribute = reactive({
  label_kz: '',
  label_ru: '',
  label_en: '',
  type: null,
  additional_registry_id: null,
});

const updateValues = (field, selected) => {
  const matchedItem = selected.find(item => item.value_ru === field.value_ru);

  if (matchedItem) {
    field.value_kz = matchedItem.value_kz;
    field.value_ru = matchedItem.value_ru;
    field.value_en = matchedItem.value_en;
  }
}

const updateDate = (value, field) => {
  field.value_kz = value;
  field.value_ru = value;
  field.value_en = value;
}

const uploadPosterImageKk = (event, field) => {
  const fd = new FormData()
  fd.append("files[]", event.files[0])
  fd.append("watermark", false)
  fileService.uploadFile(fd).then(res => {
    if (res.data) {
      poster.value.image_kk_file = res.data[0];
      poster.value.imageKkUrl = smartEnuApi + fileRoute + poster.value.image_kk_file.filepath
      poster.value.imageKk = poster.value.image_kk_file.filepath
      field.value_en = poster.value.image_kk_file.filepath
      field.value_kz = poster.value.image_kk_file.filepath
      field.value_ru = poster.value.image_kk_file.filepath
    }
  }).catch(error => {
    toast.add({severity: "error", summary: error, life: 3000});
  })
}

const addNewAttribute = () => {
  if (!newAttribute.label_kz || !newAttribute.label_ru || !newAttribute.label_en) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('common.fillAllFields'), life: 3000 });
    return;
  }

  formFields.value.push({ ...newAttribute, model: '', code: newAttribute.name_en });
  reqFormFields.value.push({ ...newAttribute, registry_id: parseInt(route.params.id) });
  toast.add({ severity: 'success', summary: t('common.success'), detail: t('common.attributeAdded'), life: 3000 });
  close('addAttributeDialog');
  loading.value = true;
  registryService.createRegistryParameter(reqFormFields.value[0]).then((res) => {
    loading.value = false;
  }).catch((err) => {
    console.log(err);
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

          const application = res.data.applications[0];

          application.parameters.forEach((param) => {

            const index = formFields.value.findIndex((p) => p.id === param.parameter.id);

            if (index !== -1) {
              formFields.value[index].value_kz = param.value_kz || '';
              formFields.value[index].value_ru = param.value_ru || '';
              formFields.value[index].value_en = param.value_en || '';
            }

            if (param.parameter.type === 4) {
              formFields.value.forEach((field) => {


                const index = formFields.value.findIndex((p) => p.id === param.parameter.id);

                const req = {
                  page:0,
                  rows: 1,
                  filter:{
                    name: param.value_kz,
                  }
                }

                userService.getUsers(req).then((res) => {
                  if (res.data) {
                    formFields.value[index].applicant = res.data.foundUsers;
                  }
                })


              })
            }

          });
        }
        loading.value = false;
      })
      .catch(error => {
        if (error) {
          console.log(error);
        }
      });

};

const getRegisterParameterApplicationSelect = () => {
  loading.value = true;
  formFields.value.forEach((field, index) => {
    if (field.additional_registry_id) {
      if (field.type === 3) {
        const req = {
          page: 0,
          rows: 10,
          registry_id: field.additional_registry_id,
        };

        registryService.getApplication(req).then((res) => {

          const application = res.data.applications
          field.additionalSelect = application.flatMap((app) => {
            return app.parameters
                .filter(
                    (param) => param.parameter?.label_kz === "Атауы"
                )
                .map((param) => ({
                  value_kz: param.value_kz || "",
                  value_ru: param.value_ru || "",
                  value_en: param.value_en || "",
                }));
          });
          loading.value = false;
        }).catch((error) => {
          console.error(`Error fetching application for index ${index}:`, error);
        });
      }
    }
  });
};



const getRegistries = () => {
  loading.value = true;
  let req = {
    id: null,
    page: 0,
    rows: 10,
  }
  registryService.getRegistry(req).then(res => {
    loading.value = false;
    registryData.value = res.data.registries.map(registry => ({
      id: registry.id,
      name_kz: registry.name_kz,
      name_ru: registry.name_ru,
      name_en: registry.name_en
    }));
  }).catch(error => {
    if (error) {
      toast.add({severity: "error", summary: error.message, life: 3000});
    }
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
      value_en: field.applicant && field.applicant[0]
          ? String(field.applicant[0].fullName)
          : field.value_en || '',
      value_kz: field.applicant && field.applicant[0]
          ? String(field.applicant[0].fullName)
          : field.value_kz || '',
      value_ru: field.applicant && field.applicant[0]
          ? String(field.applicant[0].fullName)
          : field.value_ru || '',
    })),
    reservation: [
      {
        id: 146,
        application: {
          id: 5,
          registry: {
            id: parseInt(route.params.id)
          },
          status: 0,
          created_at: "2025-01-14T10:00:00Z"
        },
        reserved_from: "2025-01-17T10:00:00Z",
        reserved_until: "2025-01-18T10:00:00Z",
        created_by: 67894,
        status: 2,
        created_date: "2025-01-14T10:00:00Z",
        uuid: "7F4A4838D19711EFBBBD0242AC120003"
      }
    ],
  };
  loading.value = true;
  if (selectedApplication.value && selectedApplication.value.length > 0) {
    registryService.updateApplication(req)
        .then(response => {
          router.back()
        })
        .catch(error => {
          if (error) {
            loading.value = false;
            toast.add({severity: "error", summary: error, life: 3000});
          }

        });
  } else {
    registryService.createApplication(req)
        .then(response => {
          router.back()
          loading.value = false;
        })
        .catch(error => {
          if (error) {
            loading.value = false;
            toast.add({severity: "error", summary: error, life: 3000});
          }
        });
  }
}

const getRegisterParameter = () => {
  loading.value = true;
  let req = {
    register_id: parseInt(route.params.id)
  };
  registryService.getRegistryParameters(req).then(response => {
    loading.value = false;
    formFields.value = response.data.register_parameter;
      getRegisterParameterApplication()
      getRegisterParameterApplicationSelect()

  }).catch(error => {
    if (error) {
      toast.add({severity: "error", summary: error, life: 3000});
    }
    loading.value = false;
  });
};

onMounted(() => {
  getRegisterParameter()
  getRegistries()
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

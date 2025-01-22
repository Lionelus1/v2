<template>
  <div class="flex flex-row mb-3">
    <div class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ t('registry.registry') }}</h4>
  </div>
  <div class="card">
      <div class="registry-page">

        <div class="document-header">
          <h1>{{ t('registry.objectPassport') }}</h1>
        </div>

        <!-- Основная информация и таблица -->
        <div class="main-info">
          <h2>{{ t('registry.basicInformation') }}</h2>
          <table class="custom-table">
            <thead>
            <tr>
              <th>{{t('registry.field')}}</th>
              <th>{{ t('registry.meaning')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(param, index) in extractedDataNot4" :key="index">
              <td>{{  $i18n.locale === "kz" ? param.label_kz : $i18n.locale === "ru" ? param.label_ru :
                  param.label_en  }}</td>
              <td>{{ $i18n.locale === "kz" ? param.value_kz : $i18n.locale === "ru" ? param.value_ru :
                  param.value_en }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Изображение -->
        <div class="image-section">
          <h3 style="margin-top: 20px">{{ t('registry.img') }}</h3>
          <div v-for="(param, index) in extractedDataType4" :key="index">
            <img :src="'http://smart.enu.kz:8090/serve?path=' + param.value_ru" alt="Изображение объекта" />
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import RegistryService from "../../service/registry_service";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";


const registryService = new RegistryService()
const router = useRouter();
const route = useRoute();
const loading = ref(false)
const toast = useToast()
const {t, locale} = useI18n()

const extractedData = ref(null)
const extractedDataNot4 = ref(null)
const extractedDataType4 = ref(null)

const getRegisterParameterApplication = () => {
  loading.value = true;

  const req = {
    page: 0,
    rows: 1,
    registry_id: parseInt(route.params.id1, 10),
    id: parseInt(route.params.id2, 10),
  };

  registryService.getApplication(req)
      .then((res) => {
        // Разделяем данные на две группы
        const typeNot4 = [];
        const type4 = [];

        extractedData.value = res.data.applications[0].parameters.map(param => {
          const paramData = {
            value_en: param.value_en,
            value_ru: param.value_ru,
            value_kz: param.value_kz,
            label_kz: param.parameter.label_kz,
            label_ru: param.parameter.label_ru,
            label_en: param.parameter.label_en,
            type: param.parameter.type,
          };

          // Добавляем в соответствующий массив
          if (param.parameter.type === 6) {
            type4.push(paramData);
          } else {
            typeNot4.push(paramData);
          }

          return paramData;
        });

        // Здесь, если нужно, можно также сохранить эти данные в другие свойства:
        extractedDataNot4.value = typeNot4;
        extractedDataType4.value = type4;

        loading.value = false;
      })
      .catch(error => {
        if (error) {
          toast.add({severity: "error", summary: error, life: 3000});
        }
      });
};


onMounted(() => {
  getRegisterParameterApplication()
})
</script>

<style scoped>
/* Центрирование заголовка */
.document-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.document-header h1 {
  margin: 0;
  font-size: 26px;
}

/* Стили для таблицы */
.custom-table {
  width: 80%; /* Уменьшаем ширину таблицы */
  font-size: 14px; /* Уменьшаем размер шрифта */
  border-collapse: collapse; /* Убираем двойные границы */
}

.custom-table th,
.custom-table td {
  padding: 8px; /* Уменьшаем отступы в ячейках */
  border: 1px solid #ddd; /* Легкие границы */
}

.custom-table th {
  text-align: left; /* Выравниваем заголовки по левому краю */
  background-color: #f4f4f4; /* Цвет фона для заголовков */
}

.custom-table td {
  text-align: left; /* Выравниваем значения по левому краю */
}
.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}
.image-section img {
  max-width: 40%; /* Ограничиваем ширину изображения до 80% от доступной */
  max-height: 400px;
  height: auto; /* Сохраняем пропорции изображения */
}
</style>

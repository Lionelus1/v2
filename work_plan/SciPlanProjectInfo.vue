<template>
  <Dialog v-if="dialogVisible"
          :visible="dialogVisible"
          :style="{ width: '90%'}"
          :header="$t('common.sciProject')"
          :modal="true"
          :closable="false"
          class="p-fluid">
<div class="content_sci">
  <TabView>
      <TabPanel :header="$t('common.mainInfo')">
        <!-- Main Info Tab -->
        <div v-if="planDoc && planDoc.params" class="flex flex-column p-4">
          <DataTable :rows="20" class="table_no_header mt-4" :value="filteredParamsMainInfo">
            <Column>
              <template #body="s">
                {{ $t(s.data.description) }}
              </template>
            </Column>
            <Column>
              <template #body="s">
                <div v-if="isMultiLanguage(s.data.value)" class="horizontal-fields full-width">
                  <div class="field-group">
                    <label for="kz">{{ $t('common.language.kz') }}</label>
                    <textarea id="kz" v-model="s.data.value.kz" class="resizable-textarea"></textarea>
                  </div>
                  <div class="field-group">
                    <label for="ru">{{ $t('common.language.ru') }}</label>
                    <textarea id="ru" v-model="s.data.value.ru" class="resizable-textarea"></textarea>
                  </div>
                  <div class="field-group">
                    <label for="en">{{ $t('common.language.en') }}</label>
                    <textarea id="en" v-model="s.data.value.en" class="resizable-textarea"></textarea>
                  </div>
                </div>
                <!-- Project Type -->
                <div class="field" v-else-if="s.data.name === 'projectTypeOfResearch'">
                  <Dropdown v-model="s.data.value" :options="sciTypes" class="p-column-filter">
                    <template #value="slotProps">
                      <span v-if="slotProps.value">
                        {{
                          $i18n.locale === 'kz' ? slotProps.value.nameKz :
                              $i18n.locale === 'ru' ? slotProps.value.nameRu :
                                  slotProps.value.nameEn
                        }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span>
                        {{ $i18n.locale === 'kz' ? slotProps.option.nameKz :
                            $i18n.locale === 'ru' ? slotProps.option.nameRu :
                                slotProps.option.nameEn
                        }}
                      </span>
                    </template>
                  </Dropdown>
                </div>
                <!-- Priority Area -->
                <div class="field" v-else-if="s.data.name === 'nameOfPriorityArea'">
                  <Dropdown v-model="s.data.value" :options="ActualData" class="p-column-filter">
                    <template #value="slotProps">
                      <span v-if="slotProps.value">
                        {{
                          $i18n.locale === 'kz' ? slotProps.value.value_kz :
                              $i18n.locale === 'ru' ? slotProps.value.value_ru :
                                  slotProps.value.value_en
                        }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span>
                        {{ $i18n.locale === 'kz' ? slotProps.option.value_kz :
                          $i18n.locale === 'ru' ? slotProps.option.value_ru :
                              slotProps.option.value_en
                        }}
                      </span>
                    </template>
                  </Dropdown>
                </div>
                <!-- Documents -->
                <div v-else-if="s.data.name === 'projectContract'">
                  <Button icon="fa-solid fa-download" @click="downloadContract('contract')" :label="$t('contracts.contract')" />
                </div>
                <div v-else-if="s.data.name === 'projectPlan'">
                  <Button icon="fa-solid fa-download" @click="downloadContract('additional')" :label="$t('common.additionalInfo')" />
                </div>
                <div v-else>
                  <InputText v-model="s.data.value" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.fundInfo')">
        <!-- Funding Info Tab -->
        <div v-if="planDoc && planDoc.params" class="flex flex-column">
          <DataTable :rows="10" class="table_no_header mt-4" :value="filteredParamsFundingInfo">
            <Column>
              <template #body="s">
                {{ $t(s.data.description) }}
              </template>
            </Column>
            <Column>
              <template #body="s">
                <div v-if="isMultiLanguage(s.data.value)" class="horizontal-fields full-width">
                  <div class="field-group">
                    <label for="kz">{{ $t('common.language.kz') }}</label>
                    <textarea id="kz" v-model="s.data.value.kz" class="resizable-textarea"></textarea>
                  </div>
                  <div class="field-group">
                    <label for="ru">{{ $t('common.language.ru') }}</label>
                    <textarea id="ru" v-model="s.data.value.ru" class="resizable-textarea"></textarea>
                  </div>
                  <div class="field-group">
                    <label for="en">{{ $t('common.language.en') }}</label>
                    <textarea id="en" v-model="s.data.value.en" class="resizable-textarea"></textarea>
                  </div>
                </div>
                <!-- Contract Date -->
                <div v-else-if="s.data.name === 'projectContractDate'">
                  <PrimeCalendar v-model="s.data.value" dateFormat="dd.mm.yy" showIcon :showButtonBar="true" :manualInput="false"/>
                </div>
                <!-- Funding Source -->
                <div class="field" v-else-if="s.data.name === 'projectFundingType'">
                  <Dropdown :loading="loadingFunding" v-model="s.data.value" :options="fundingData" class="p-column-filter">
                    <template #value="slotProps">
                      <span v-if="slotProps.value">
                        {{
                          $i18n.locale === 'kz' ? slotProps.value.value_kz :
                              $i18n.locale === 'ru' ? slotProps.value.value_ru :
                                  slotProps.value.value_en
                        }}
                      </span>
                    </template>
                    <template #option="slotProps">
                      <span>
                        {{ $i18n.locale === 'kz' ? slotProps.option.value_kz :
                          $i18n.locale === 'ru' ? slotProps.option.value_ru :
                              slotProps.option.value_en
                        }}
                      </span>
                    </template>
                  </Dropdown>
                </div>
                <!-- Implementation Period -->
                <div v-else-if="s.data.name === 'projectYears'">
                  <PrimeCalendar v-model="s.data.value" dateFormat="yy" selectionMode="range" view="year" showIcon :manualInput="false" />
                </div>
                <div v-else>
                  <InputText v-model="s.data.value" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.resultInfo')">
        <!-- Result Info Tab -->
        <div v-if="planDoc && planDoc.params" class="flex flex-column position-relative">
          <div class="button-container">
            <Button :label="$t('common.add') + ' ' + $t('common.projectRes')" icon="pi pi-plus" @click="addToProjectRes"/>
          </div>
          <DataTable class="table_no_header mt-4" :value="filteredParamsResultInfo">
            <Column>
              <template #body="s">
                <div v-if="s.data.name === 'projectRes'" class="horizontal-fields full-width">
                  <table>
                    <thead>
                    <tr>
                      <th></th>
                      <th>{{ $t('common.projectYear') }}</th>
                      <th>{{ $t('common.projectRes') }} {{ $t('common.language.kz') }}</th>
                      <th>{{ $t('common.projectRes') }} {{ $t('common.language.ru') }}</th>
                      <th>{{ $t('common.projectRes') }} {{ $t('common.language.en') }}</th>
                      <th>{{ $t('common.projectPulish') }}</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in s.data.value" :key="index">
                      <td>
                        <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="removeFromProjectRes(index, s.data.value)"/>
                      </td>
                      <td>
                        <PrimeCalendar v-model="item.year" view="year" dateFormat="yy" showIcon :manualInput="false" ></PrimeCalendar>
                      </td>
                      <td>
                        <textarea id="kz" v-model="item.resKz" class="resizable-textarea"></textarea>
                      </td>
                      <td>
                        <textarea id="kz" v-model="item.resRu" class="resizable-textarea"></textarea>
                      </td>
                      <td>
                        <textarea id="kz" v-model="item.resEn" class="resizable-textarea"></textarea>
                      </td>
                      <td>
                        <div v-for="(pub, pubIndex) in item.publish" :key="pubIndex" class="publication">
                          <Button icon="pi pi-times" @click="removeResult(pubIndex, item.publish)" class="p-button-danger p-button-sm" />
                          {{ pubIndex + 1 }} {{ pub.pubName }}
                        </div>
                      </td>
                      <td>
                        <Button :label="$t('common.projectPublishAdd')" icon="pi pi-plus" @click="addPublication(item.publish)" />
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>
    </TabView>
</div>
    <template #footer>
      <div class="dialog-footer">
        <Button
            :label="$t('common.save')"
            icon="pi pi-check"
            class="p-button-primary"
            :loading="loadingProject"
            @click="saveParams"
        />
        <Button
            :label="$t('common.close')"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="closeDialog"
        />
      </div>
    </template>

  </Dialog>
</template>
<script>
import RegistryService from "@/service/registry_service";

export default {
  name: 'SciPlanProjectInfo',
  props: {
    dialogVisible: {
      type: Boolean,
      required: false
    },
    planDoc: Object,
    filteredParamsMainInfo: Array,
    filteredParamsFundingInfo: Array,
    filteredParamsResultInfo: Array,
    loadingProject: Boolean,
  },
  data(){
    return {
      registryService: new RegistryService(),
      fundingData: [],
      ActualData: [],
      loadingFunding: false,
      loadingActual: false,
      sciTypes: [
        {
          nameKz: 'Іргелі',
          nameRu: 'Фундаментальное',
          nameEn: 'Fundamental',
        },
        {
          nameKz: 'Қолданбалы',
          nameRu: 'Прикладное',
          nameEn: 'Applied',
        }
      ],
    }
  },
  methods: {
    getRegisterParamterApplactionFunding() {
      this.loadingFunding = true;
      const req = {
        page: 0,
        rows: 10,
        search_text: "Виды финансирования",
      };
      this.registryService.getApplication(req).then((res) => {

        this.loadingFunding = false;
        if (res.data.applications){
          this.fundingData = this.processDropdownData(res.data.applications)
        }
      });
    },
    getRegisterParamterApplactionActual() {
      this.loadingActual = true;
      const req = {
        page: 0,
        rows: 10,
        search_text: "Наименования приоритетного направления",
      };
      this.registryService.getApplication(req).then((res) => {

        this.loadingActual = false;
        if (res.data.applications){
          this.ActualData = this.processDropdownData(res.data.applications)
        }
      });
    },
    processDropdownData(applications) {
      return applications.map(app => {
        const nameParam = app.parameters.find(param => param.parameter.label_en.trim() === "Name");

        return {
          value_kz: nameParam ? nameParam.value_kz : '',
          value_ru: nameParam ? nameParam.value_ru : '',
          value_en: nameParam ? nameParam.value_en : ''
        };
      });
    },
    closeDialog() {
      this.$emit('update:dialogVisible', false); // Уведомление родителя о закрытии
    },
    addToProjectRes() {
      // Новый объект для добавления
      const newObject = {
        publish: [],
        resEn: "",
        resKz: "",
        resRu: "",
        year: "",
      };

      // Находим элемент projectRes
      const projectRes = this.filteredParamsResultInfo.find(
          (item) => item.name === "projectRes"
      );

      // Добавляем новый объект в value
      if (projectRes && Array.isArray(projectRes.value)) {
        projectRes.value.push(newObject);
      }
    },
    //удалить результат
    removeFromProjectRes(index, array) {
      array.splice(index, 1); // Удаляем элемент по индексу
    },
    //удалить публикацию
    removeResult(index, array) {
      array.splice(index, 1);
    },
    //добавить публикацию
    addPublication(resultData) {
      this.$emit('add-pub', resultData);
    },
    // Проверяем, содержит ли value языковые ключи
    isMultiLanguage(value) {
      return typeof value === 'object' && value !== null && ('kz' in value || 'ru' in value || 'en' in value);
    },
    downloadContract(type) {
      this.$emit('download-contract', type);
    },
    saveParams() {
      this.$emit('save-project-params');
      // Реализация сохранения параметров
    },
  },
  created() {
    this.getRegisterParamterApplactionFunding();
    this.getRegisterParamterApplactionActual();
  }
};
</script>

<style scoped>
.content_sci{
  min-height: 75vh;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem; /* Расстояние между кнопками */
}

.full-width {
  display: flex;
  justify-content: space-between;
  gap: 16px; /* Расстояние между полями */
  width: 100%; /* Растягивает контейнер по всей ширине */
}

.field-group {
  flex: 1; /* Устанавливает равную ширину для всех полей */
  display: flex;
  flex-direction: column;
}

.field-group label {
  margin-bottom: 4px; /* Отступ между меткой и полем */
}

InputText {
  width: 100%; /* Поля ввода заполняют доступное пространство */
}
.resizable-textarea {
  width: 100%; /* Растягиваем поле по ширине родительского контейнера */
  min-height: 50px; /* Минимальная высота (примерно 2 строки текста) */
  resize: vertical; /* Разрешаем изменение размера по вертикали */
  padding: 8px; /* Отступ внутри текстового поля */
  font-size: 14px; /* Размер текста */
  border: 1px solid #ccc; /* Стандартная рамка */
  border-radius: 4px; /* Скругленные углы */
  box-sizing: border-box; /* Включаем отступы и границы в общую ширину */
}
.resizable-textarea:focus {
  border-color: #007bff; /* Цвет рамки при фокусе */
  outline: none; /* Убираем стандартный фокус браузера */
}

.button-container {
  position: absolute;
  top: 10px; /* Отступ сверху */
  left: 10px; /* Отступ слева */
  z-index: 10; /* Поверх остальных элементов */
}

.position-relative {
  position: relative; /* Для корректного позиционирования дочерних элементов */
}

.multi-data-table {
  margin-top: 40px; /* Учитывает место для кнопки */
}

.flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.p-fluid {
  height: 100%; /* Диалог занимает всю доступную высоту */
  display: flex;
  flex-direction: column; /* Содержимое размещается вертикально */
  box-sizing: border-box;
}
.resizable-textarea {
  width: 100%;
  min-height: 50px;
  resize: vertical;
}
.table_no_header {
  border-collapse: collapse;
  width: 100%;
}
.button-container {
  margin-bottom: 10px;
}
.dialog-footer {
  margin-top: auto; /* Футер остаётся внизу */
}
</style>
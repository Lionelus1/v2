<template>
  <Dialog v-model:visible="editVisible" :closable="true" :style="{ width: '1200px' }"
          :breakpoints="{'960px': '75vw', '640px': '90vw'}" @close="hideDialog" @hide="hideDialog" :close-on-escape="true"
          :header="$t('smartenu.mailingCreateTitle')" :modal="true" class="p-fluid">
    <div>
      <div class="card p-fluid">
        <div class="flex align-items-center">
          <h4 class="m-0">{{ $t("smartenu.categories") }}</h4>
        </div>
        <div class="flex flex-wrap gap-3 pt-4">
          <div v-for="category in categories" :key="category.id" class="flex align-items-center pr-3 pb-1">
            <Checkbox class="checkbox-container" v-model="selectedCategories" :id="'category-' + category.id"
                      :value="category.id" @change="handleCategoryChange(category.id)"/>
            <label class="ml-2 label-large" :for="'category-' + category.id">{{ category['name' + $i18n.locale] }}</label>
          </div>
        </div>
        <div v-if="showOtherEmailField" class="field mt-3">
          <FloatLabel>
            <Chips v-model="emails" placeholder="Введите почту"/>
          </FloatLabel>
          <p></p>
          <div class="hint-container">
            <i class="fas fa-asterisk required-icon"></i>
            <h6 class="hintTextEmail">{{ $t("common.hintTextEmail") }}</h6>
          </div>
        </div>
        <div class="template-selection-container">
          <div class="flex align-items-center">
            <h4 class="pb-2">{{ $t("smartenu.templateBuilder") }}</h4>
          </div>
          <div class="templates-grid">
            <div
                v-for="template in templates"
                :key="template.id"
                :class="['template-card', { selected: template.id === selectedTemplate }]"
                @click="selectTemplate(template.id)"
            >
              <h4>{{ $i18n.locale === "kz" ? template.template_name_kz : $i18n.locale === "ru" ? template.template_name_ru : template.template_name_en }}</h4>
              <div v-html="getTemplateContent(template)" class="template-content"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-content-end pt-2">
          <Button class="p-button p-component w-max" label="Submit" @click="nextPage">Далее</Button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import { useToast } from "primevue/usetoast";
import 'primeicons/primeicons.css'

export default {
  name: "AddEditMailing",
  props: ['isVisible', 'value'],
  data() {
    return {
      editVisible: this.isVisible,
      mailingData: null,
      submitted: false,
      emails: [],
      selectedTemplate: null,
      templates: [],
      showOtherEmailField: false,
      toast: new useToast(),
      categories: [
        {id: 1, nameen: 'Contractors', namekz: 'Контрагенттер', nameru: 'Контрагенты'},
        {id: 2, nameen: 'Employees', namekz: 'Қызметкерлер', nameru: 'Сотрудники'},
        {id: 3, nameen: 'Private Individuals', namekz: 'Жеке тұлғалар', nameru: 'Частные лица'},
        {id: 4, nameen: 'Students', namekz: 'Оқушылар', nameru: 'Обучающиеся'},
        {id: 5, nameen: 'Graduates', namekz: 'Түлектер', nameru: 'Выпускники'},
        {id: 6, nameen: 'Others', namekz: 'Басқа', nameru: 'Другое'},
      ],
      selectedCategories: [],
      data: this.value,
    };
  },
  methods: {
    async fetchTemplates() {
      try {
        const response = await fetch(`${smartEnuApi}/mailing/getAllMailingTemplates`, {
          method: 'GET',
          headers: getHeader(),
        });
        const data = await response.json();
        this.templates = data;
      } catch (error) {
        console.error('Ошибка при получении шаблонов:', error);
      }
    },
    getTemplateContent(template) {
      const lang = this.$i18n.locale;
      let content = '';

      switch (lang) {
        case 'kz':
          content = template.template_content_kz?.String || '';
          break;
        case 'ru':
          content = template.template_content_ru?.String || '';
          break;
        case 'en':
          content = template.template_content_en?.String || '';
          break;
        default:
          content = template.template_content_en?.String || '';
      }

      if (template.id === 2) {
        const style = `
          <style>
            .content {
                text-align: center !important;
                position: relative !important;
            }
            .content .megaphone {
                position: absolute !important;
                left: 2% !important;
                top: 135px !important;
                width: 100px !important;
                height: 100px !important;
            }
            .content .monitor {
                top: 10px !important;
                width: 250px !important;
                height: 200px !important;
            }
            .content .icon1 {
                position: absolute !important;
                top: 40px !important;
                left: 53% !important;
                transform: translateX(-60%) !important;
                width: 70px !important;
                height: 70px !important;
            }
            .content h1 {
                font-size: 24px !important;
                margin: 20px 0 !important;
            }
            .content p {
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            .footer {
                padding-top: 20px !important;
                text-align: center !important;
            }
            .footer p {
                margin: 5px 0 !important;
            }
            .btn {
                display: inline-block !important;
                margin-top: 20px !important;
                padding: 10px 20px !important;
                text-decoration: none !important;
                border-radius: 5px !important;
                transition: background-color 0.3s !important;
            }
          </style>
        `;

        content = content.replace(
            `<div style="display: flex; justify-content: center; height: 180px; width: max-content; margin: 0 auto;">
            <img src="assets/layout/images/mailing/mailing.png" alt="Invitation Image" class="monitor" style="aspect-ratio: 16/12; height: 200px; position: absolute; left: 50%; transform: translate(-37%, 0)">
        </div>`,
            `<div>
            <img src="assets/layout/images/mailing/mailing.png" alt="Invitation Image" class="monitor">
          </div>`
        );

        content = content.replace('</head>', `${style}</head>`);
      }

      return content;
    },
    handleCategoryChange(categoryId) {
      if (categoryId === 6) {
        this.selectedCategories = [6];
        this.showOtherEmailField = true;
      } else {
        this.selectedCategories = this.selectedCategories.filter(id => id !== 6);
        this.showOtherEmailField = false;
      }
    },
    selectTemplate(templateId) {
      this.selectedTemplate = templateId;
    },
    nextPage() {
      if (this.selectedCategories.length === 0) {
        this.toast.add({
          severity: "error",
          detail: this.$t('mailing.textCategory'),
          life: 3000,
        });
        return;
      }

      if (this.selectedCategories[0] === 6 && this.emails.length === 0) {
        this.toast.add({
          severity: "error",
          detail: this.$t('mailing.textEmails'),
          life: 3000,
        });
        return
      }

      if (!this.selectedTemplate) {
        this.toast.add({
          severity: "error",
          detail: this.$t('mailing.textTemplate'),
          life: 3000,
        });
        return;
      }

      const data = {
        templateId: this.selectedTemplate,
        selectedCategories: this.selectedCategories,
        emails: this.emails,
        data: this.value,
      };

      localStorage.setItem('mailingData', JSON.stringify(data));

      this.$router.push({ name: 'TemplateEditor2' });
    },
    hideDialog() {
      this.emitter.emit('addEditMailingDialogHide', true);
    },
  },
  mounted() {
    this.fetchTemplates();
  }
};
</script>

<style>
.category-option input[type="checkbox"] {
  margin-right: 5px;
}

.template-selection-container {
  margin-top: 20px;
}

.templates-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between; /* Обеспечивает равномерное распределение */
}

.template-card {
  flex: 1 1 calc(25% - 20px); /* Подгоняет размер карточки под 4 карточки в ряд с учетом отступов */
  border: 1px solid #ccc;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.template-card h4 {
  margin: 0 0 10px;
}

.template-card .template-content {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.template-card:hover {
  transform: scale(1.05);
}

.template-card.selected {
  border-color: #007bff;
  background-color: #e9f7fe;
}

.hint-container {
  display: flex; /* Использование Flexbox для выравнивания элементов по горизонтали */
  align-items: center; /* Выравнивание по вертикали по центру */
}

.hintTextEmail {
  border-color: #bfc0c3; /* Цвет границы */
  color: #999;        /* Цвет текста */
  font-size: 14px;       /* Размер шрифта */
  font-style: italic;    /* Стиль шрифта (например, курсив) */
  font-weight: normal;   /* Насыщенность шрифта (например, обычный) */
  margin: 0; /* Убираем отступы вокруг текста, чтобы лучше выравнивать */
}

.required-icon {
  color: #ff3939; /* Цвет иконки */
  margin-right: 5px; /* Отступ между иконкой и текстом */
}

.checkbox-container {
  width: 20px;
  height: 20px;
}

.checkbox-container input[type="checkbox"] {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  -webkit-transform: scale(1.5);
}

.label-large {
  font-size: 1.2rem;
  margin-left: 0.5rem;
}
</style>

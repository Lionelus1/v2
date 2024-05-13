<template>
  <div class="col-12">
    <TitleBlock :title="t('helpDesk.category')"/>
    <div class="card">
      <DataTable :lazy="true" :value="categories" dataKey="id" :loading="loading" responsiveLayout="scroll"
                 :rowHover="true">
        <template #empty>{{ $t("common.noData") }}</template>
        <template #loading>{{ $t("common.loading") }}</template>

        <Column :field="'name_' + locale" :header="$t('helpDesk.application.categoryApplication')">
          <template #body="{ data }">
            {{ data['name_' + locale] }}
            <!--            <a href="javascript:void(0)" @click="navigateToView(data)">
                          {{ data['name_' + locale] }}
                        </a>-->
          </template>
        </Column>

        <Column field="is_active" style="width: 200px" :header="t('helpDesk.active')">
          <template #body="{data}">
            <InputSwitch v-model="data.is_active" @change="toggleCategory(data)"/>
          </template>
        </Column>

        <Column class="text-right" style="width: 200px">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)"/>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>
</template>

<script setup>

import ActionButton from "@/components/ActionButton.vue";
import {computed, onMounted, ref} from "vue";
import {getHeader, smartEnuApi, findRole} from "@/config/config";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useRouter} from "vue-router";
import {useConfirm} from "primevue/useconfirm";
import {HelpDeskService} from "../../service/helpdesk.service";

const {t, locale} = useI18n()
const toast = useToast()
const router = useRouter()
const confirm = useConfirm()

const service = new HelpDeskService()
const loading = ref(false)
const list = ref()
const isAdmin = ref(null)
const formData = ref()
const categories = ref(null)
const lazyParams = ref({
  page: 0,
  rows: 10
})
const request = ref(null)
const initItems = computed(() => {
  return [
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pen',
      command: editCategory
    }
  ];
})

const toggle = (data) => {
  request.value = data
}
const toggleCategory = (data) => {
  let req = {
    id: data.id,
    name_kz: data.name_kz,
    name_ru: data.name_ru,
    name_en: data.name_en,
    code: data.code,
    is_active: data.is_active
  }
  service.helpDeskUpdateCategory(req).then(() => {
  }).catch((err) => {
  })
}

const editCategory = () => {
  let id = request.value.id;
  router.push({name: 'EditCategories', params: {id: request.value.id}});
}

const getCategory = () => {
  service.helpDeskCategoryGet(
      {
        ID: null,
        SearchText: null,
        Page: 0,
        Rows: 10,
      })
      .then((res) => {
        categories.value = res.data.category
      })
      .catch((err) => {
      });
};

onMounted(() => {
  isAdmin.value = (findRole(null, 'main_administrator') || findRole(null, "career_administrator"))
  getCategory()
});
</script>

<style scoped>
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

.status-status_created {
  background: #6c757d;
  color: #fff;
}

.status-status_signing {
  background: #17a2b8;
  color: #fff;
}

.status-status_signed {
  background: #28a745;
  color: #fff;
}

.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}

.status-status_approved {
  background: #007bff;
  color: #ffffff;
}

.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}

.status-rejected {
  background: red;
  color: #fff;
}

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
}

.customer-badge.operational-plan {
  background-color: #3B82F6;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.customer-badge.simple-plan {
  background-color: #10b981;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lang {
  margin-left: 20px;
}

.buttonLanguag {
  margin-bottom: 20px;
}
</style>

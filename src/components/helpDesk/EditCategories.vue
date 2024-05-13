<template>
  <TitleBlock :title="t('helpDesk.category')" :show-back-button="true"/>
  <div class="col-12">
    <ToolbarMenu :data="menu"/>

    <div class="card">
      <h4 style="margin-bottom: 15px">Первая линия</h4>
      <div class="field" style="padding-right: 915px">
        <label>{{ t("common.organizationNameLabel") }}</label>
        <Dropdown disabled class="w-full mr-2" v-model="selectedOrganization" :options="userOrganizations"
                  :optionLabel="itemLabel" :placeholder="t('roleControl.selectOrg')" :filter="true" :showClear="true"
                  @change="handleSelectionChange" dataKey="id" :emptyFilterMessage="t('roleControl.noResult')" @filter="handleFilter"/>
      </div>
      <div class="field" style="padding-right: 915px">
        <label>{{ t('roleControl.nameDepartment') }}</label>
        <Dropdown class="dropdown" v-model="selectedDepartment" :options="departments"
                  :optionLabel="localizeDepartment" :placeholder="t('roleControl.selectDepartment')"
                  :filter="true" :showClear="true"
                  dataKey="id" :emptyFilterMessage="t('roleControl.noResult')"
                  @filter="handleFilterDepartment"/>
      </div>

      <div class="field" style="padding-right: 915px">
        <label>{{ t("roleControl.roleLabel") }}</label>
        <Dropdown class="dropdown" v-model="role" :options="roles"
                  :optionLabel="localizeRole" :placeholder="t('roleControl.selectRole')"
                  :filter="true" :showClear="true" dataKey="id"
                  :emptyFilterMessage="t('roleControl.noResult')"/>
      </div>
<!--      <div class="field" style="padding-right: 915px">-->
<!--        <label>Выберите Департамент</label>-->
<!--        <Dropdown filter v-model="categoryData.selectedDirection"-->
<!--                  :placeholder="t('common.select')"/>-->
<!--      </div>-->
<!--      <div class="field" style="padding-right: 915px">-->
<!--          <label>Выберите Должность</label>-->
<!--          <Dropdown filter style="margin-top: 5px" v-model="categoryData.selectedPosition" :placeholder="t('common.select')"/>-->
<!--      </div>-->
<!--            <div class="buttonCategory" style="margin-bottom: 20px; margin-top: 15px">-->
<!--              <Button class="toggle-button">{{ t('helpDesk.categoryLine') }}-->
<!--              </Button>-->
<!--            </div>-->
      <div style="margin-top: 40px" class="field">
        <label>{{ t('helpDesk.categoryKz') }}<span
            style="font-size: 20px; color: red;">*</span></label>
        <!-- :disabled="!!responseUserData.fullName" -->
        <InputText v-model="categoryData.nameKz" type="text" :placeholder="t('helpDesk.categoryKz')"
                   @input="input"/>
      </div>
      <div class="field">
        <label>{{ t('helpDesk.categoryRu') }}<span
            style="font-size: 20px; color: red;">*</span></label>
        <!-- :disabled="!!responseUserData.fullName" -->
        <InputText v-model="categoryData.nameRu" type="text" :placeholder="t('helpDesk.categoryRu')"
                   @input="input"/>
      </div>
      <div class="field">
        <label>{{ t('helpDesk.categoryEn') }}<span
            style="font-size: 20px; color: red;">*</span></label>
        <!-- :disabled="!!responseUserData.fullName" -->
        <InputText v-model="categoryData.nameEn" type="text" :placeholder="t('helpDesk.categoryEn')"
                   @input="input"/>
      </div>
      <div class="field">
        <label>{{ t('helpDesk.categoryCode') }}<span
            style="font-size: 20px; color: red;">*</span></label>
        <!-- :disabled="!!responseUserData.fullName" -->
        <InputText v-model="categoryData.code" type="text" :placeholder="t('helpDesk.categoryCode')"
                   @input="input"/>
      </div>
      <div class="field">
        <label>{{ t('helpDesk.activeCategory') }}<span
            style="font-size: 20px; color: red;">*</span></label>
        <InputSwitch v-model="categoryData.isActive" @change="toggleCategory"/>
      </div>
    </div>
  </div>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {HelpDeskService} from "../../service/helpdesk.service";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import RoleDepartmentRel from "@/service/role.department.rel.js"
import RoleControlService from "../roleControl/RoleControlService";
import api from "@/service/api"
import {getHeader} from "@/config/config";

const {t, locale} = useI18n()
const router = useRouter();
const route = useRoute();
const toast = useToast()
const confirm = useConfirm()
const roleDepartmentRel = new RoleDepartmentRel()
const roleControlService = new RoleControlService()
const userOrganizations = ref(null)
const selectedOrganization = ref(null)
const currentUser = ref(null)
const orgParams = ref({
  searchText: null,
})
const request = ref({})
const roles = ref([])
const role = ref(null)

const loading = ref(false)
const searchText = ref(null)
const service = new HelpDeskService()
const categories = ref(null)
const categoryId = ref(route.params.id)
const selectedDepartment =ref(null)
const departments = ref([])
const categoryData = ref({
  nameKz: null,
  nameRu: null,
  nameEn: null
})
const menu = computed(() => [
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    command: saveData
  }
]);

const saveData = () => {
  saveCategoryLine()
  saveCategory()
}

const saveCategoryLine = () => {
  let req = {
    id: null,
    categoryId: categoryData.value.id,
    department_id: selectedDepartment.value?.id || null,
    position_id: role.value?.id || null
  }
  console.log(req)
}
const saveCategory = () => {
  request.value = {
    id: categoryData.value.id,
    name_kz: categoryData.value.nameKz,
    name_ru: categoryData.value.nameRu,
    name_en: categoryData.value.nameEn,
    code: categoryData.value.code
  }
  // service.helpDeskUpdateCategory(request.value).then(() => {
  // }).catch((err) => {
  //   console.log(err)
  // })
  console.log(request.value);
}

const input = () => {
  console.log("Category")
}

const itemLabel = (item) => {
  if (item.bin) {
    return item.bin + ' - ' + item['name' + locale.value]
  } else {
    return item['name' + locale.value]
  }
}

const handleFilter = (event) => {
  if (event.value && event.value.length > 3) {
    orgParams.value.searchText = event.value
    getOrganizations()
  } else if (orgParams.value.searchText.length > 3) {
    orgParams.value.searchText = null
    getOrganizations()
  }
}

const handleSelectionChange = () => {
  if (selectedOrganization.value) {
    getDepartment()
  } else {
    departments.value = []
    selectedDepartment.value = null
    searchText.value = null
  }
}

const getDepartment = () => {
  loading.value = true
  const orgId = selectedOrganization.value ? selectedOrganization.value.id : null;
  if (!orgId) {
    loading.value = false;
    return;
  }

  const req = {
    orgId: orgId,
    searchText: searchText.value,
  }

  api.post('/departments', req, {
    headers: getHeader()
  }).then(res => {
    departments.value = res.data.departments;

    loading.value = false;
  }).catch(err => {
    departments.value = []

    if (err.response && err.response.data && err.response.data.localized) {
      toast.add({
        severity: "error",
        summary: t(err.response.data.localizedPath),
        life: 3000,
      })
    } else {
      console.log(err)
      toast.add({
        severity: "error",
        summary: t('common.message.actionError'),
        life: t('common.message.actionErrorContactAdmin'),
      })
    }

    loading.value = false;
  });
}

const getRoles = () => {
  roleControlService.getRoles(2).then(response => {
    roles.value = response.data
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    })
  })
}

const getOrganizations = () => {
  roleControlService.getOrganizations(orgParams.value).then(response => {
    userOrganizations.value = response.data
    if (userOrganizations.value.length === 1) {
      selectedOrganization.value = userOrganizations.value
      handleSelectionChange()
    } else if (userOrganizations.value.length > 1 && currentUser.value.mainPosition) {
      let result = userOrganizations.value.find(element => element.id === currentUser.value.mainPosition.organization.id);
      if (result) {
        selectedOrganization.value = result
        handleSelectionChange()
      }
    }
  }).catch(error => {
    toast.add({
      severity: "error",
      summary: error,
      life: 3000,
    })
  })
}

const localizeRole = (role) => {
  const localizedText = t(role[locale.value]);
  return localizedText
}

const localizeDepartment = (department) => {
  const localizedText = t(department['name'+capitalize(locale.value)])
  return localizedText
}

const capitalize = (str) => {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const handleFilterDepartment = (event) => {
  if (event.value && event.value.length > 1) {
    searchText.value = event.value
    handleSelectionChange()
  } else {
    handleSelectionChange()
  }
}

const getCategory = () => {
  service.helpDeskCategoryGet(
      {
        ID: Number(categoryId.value),
        SearchText: null,
        Page: 0,
        Rows: 10,
      })
      .then((res) => {
        categoryData.value.id = res.data.category[0].id
        categoryData.value.nameKz = res.data.category[0].name_kz
        categoryData.value.nameRu = res.data.category[0].name_ru
        categoryData.value.nameEn = res.data.category[0].name_en
        categoryData.value.code = res.data.category[0].code
        categoryData.value.isActive = res.data.category[0].is_active
      })
      .catch((err) => {
        console.log(err)
      });
};

const toggleCategory = () => {
  request.value = {
    id: categoryData.value.id,
    is_active: categoryData.value.isActive
  }
}

onMounted(() => {
  currentUser.value = JSON.parse(localStorage.getItem("loginedUser"))
  categoryId.value = route.params.id
  getCategory();
  getOrganizations()
  getRoles()
})
</script>

<style scoped>
.line-category {
  display: flex;
  width: 200px; /* Задаем ширину контейнера на всю доступную ширину */
  max-width: 800px; /* Устанавливаем максимальную ширину контейнера */
  margin: 0 auto; /* Центрируем контейнер по горизонтали */
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
</style>
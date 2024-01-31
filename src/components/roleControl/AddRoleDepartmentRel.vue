<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
          <h3>{{ t("roleControl.giveDepartmentRoleRel")}}</h3>
            <div>
                <Menubar :model="menu" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
            </div>
        </div>
        <div class="p-col-12 p-md-12 p-fluid">
          <div class="card w-full">
              <div class="p-field pb-3">
                  <label>{{ t("common.organizationNameLabel") }}</label>
                  <Dropdown class="w-full mr-2" v-model="selectedOrganization" :options="userOrganizations"
                      :optionLabel="itemLabel" :placeholder="t('roleControl.selectOrg')" :filter="true" :showClear="true"
                      @change="handleSelectionChange" dataKey="id" :emptyFilterMessage="t('roleControl.noResult')" @filter="handleFilter"/>
              </div>

              <div class="p-field pb-3">
                  <label>{{ t('roleControl.nameDepartment') }}</label>
                  <Dropdown class="dropdown" v-model="selectedDepartment" :options="departments" 
                      :optionLabel="localizeDepartment" :placeholder="t('roleControl.selectDepartment')" 
                      :filter="true" :showClear="true"
                      dataKey="id" :emptyFilterMessage="t('roleControl.noResult')"
                      @filter="handleFilterDepartment"/>
              </div>

              <div class="p-field">
                <label>{{ t("roleControl.roleLabel") }}</label>
                <Dropdown class="dropdown" v-model="role" :options="roles" 
                  :optionLabel="localizeRole" :placeholder="t('roleControl.selectRole')" 
                  :filter="true" :showClear="true" dataKey="id" 
                  :emptyFilterMessage="t('roleControl.noResult')"/>
              </div>
          </div>
        </div>
   
    </div>
</template>

<script setup>
    import { ref, defineProps, inject, onMounted } from 'vue';
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {useRouter, useRoute} from "vue-router";
    import {useConfirm} from "primevue/useconfirm";
    import RoleDepartmentRel from "@/service/role.department.rel.js"
    import RoleControlService from "./RoleControlService";
    import api from "@/service/api"
    import {getHeader} from "@/config/config";


    const {t, locale} = useI18n()
    const toast = useToast()
    const router = useRouter()
    const route = useRoute()
    const confirm = useConfirm()
    const roleDepartmentRel = new RoleDepartmentRel()
    const roleControlService = new RoleControlService()
    const userOrganizations = ref(null)
    const selectedOrganization = ref(null)
    const currentUser = ref(null)
    const orgParams = ref({
        searchText: null,
    })
    const roles = ref([])
    const role = ref(null)
    const selectedDepartment =ref(null)
    const departments = ref([])
    const loading = ref(false) 
    const menu = [
        {
          label: t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => isDisabled(),
          command: () => save(),
        }
    ]
    const searchText = ref(null)
    const emitter = inject("emitter");

    const save = () => {
      if (isDisabled()) {
        return
      }
      const req = {
        department_id: selectedDepartment.value.id,
        role_id: role.value.id
      }

      roleDepartmentRel.insertDepartmentRoleRel(req).then(res => {
        loading.value = false;
        emitter.emit('departmentRoleRelAdded', true)
        toast.add({
            severity: "save",
            summary: t('common.save'),
            life: t('common.message.actionErrorContactAdmin'),
        })
      }).catch(err => {

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

    const isDisabled = () => {
      return !(selectedOrganization.value !== null && selectedDepartment.value !== null && role.value !== null);
    }

    onMounted(() => {
      currentUser.value = JSON.parse(localStorage.getItem("loginedUser"))
      getOrganizations()
      getRoles()

    })

</script>
<template>
    <div>
        <div class="mb-3"> 
        <div class="block lg:flex justify-content-between align-items-center">
        <Button
                :label="$t('roleControl.giveDepartmentRoleRel')"
                icon="pi pi-plus"
                class="p-button-success p-mr-2 mt-2 lg:m-0"
                v-on:click="giveNewRole"
        />
            <span class="p-input-icon-left">
                <InputText type="search"
                        v-model="lazyParams.searchText"
                        :placeholder="$t('common.search')"
                        @keyup.enter="searchDepartmentRoleRel"
                        @click="clearData"/>
                <Button icon="pi pi-search" class="p-ml-1" @click="searchDepartmentRoleRel"/>
            </span>
        </div>
         </div>
    <DataTable :lazy="true"
              :value="departments_role_rel"
              @page="onPage($event)"
              :totalRecords="total"
              :paginator="true"
              paginatorTemplate="FirstPageLink
                                PrevPageLink
                                PageLinks
                                NextPageLink
                                LastPageLink
                                CurrentPageReport
                                RowsPerPageDropdown"
              :rowsPerPageOptions="[10, 25, 50]"
              :currentPageReportTemplate="$t('common.showingRecordsCount',
                                                { first: '{first}',
                                                last: '{last}',
                                                totalRecords: '{totalRecords}'
                                              })"
              class="p-datatable-customers"
              :rows="10"
              :rowHover="true"
              v-model:selection="role"
              selection-mode="single"
              @row-select="select($event)"
              :loading="loading"
              responsiveLayout="scroll"
              @sort="onSort($event)">
        <Column field="department.name" :header="$t('roleControl.nameDepartment')">
            <template #body="slotProps">
                <div v-if="slotProps.data.department">
                    {{ localizeDepartment(slotProps.data.department) }}
                </div>
            </template>
        </Column>

        <Column :header="$t('roleControl.roleName')">
            <template #body="slotProps">
                <div v-if="slotProps.data.department.role && slotProps.data.department.role.length > 0">
                    {{ localizeRole(slotProps.data.department.role[0]) }}
                </div>
            </template>
        </Column>
        
        <Column>
            <template #body="slotProps">
                <Button icon="pi pi-times" class="p-button-danger"
                        @click="openDelete(slotProps.data)"/>
            </template>
        </Column>

    </DataTable>

    <Sidebar v-model:visible="isView"
             position="right"
             class="p-sidebar-lg"
             style="overflow-y: scroll">
      <AddRoleDepartmentRel />
    </Sidebar>

    <Dialog v-model:visible="isDeleting"
            :style="{ width: '450px' }"
            :modal="true"
            :closable="false">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
        <span v-if="department_role_rel">
        {{  $t("common.doYouWantDelete") }}?
        </span>
      </div>
      <template #footer>
        <Button :label="$t('common.yes')"
                icon="pi pi-check"
                class="p-button p-component p-button-success p-mr-2"
                @click="deleteRoleDepartmentRel"/>
        <Button :label="$t('common.no')"
                icon="pi pi-times"
                class="p-button p-component p-button-danger p-mr-2"
                @click="closeRoleDepartmentRel"/>
      </template>
    </Dialog>

    </div>
</template>

<script setup>
    import { ref, defineProps, inject, onMounted } from 'vue';
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {useRouter, useRoute} from "vue-router";
    import {useConfirm} from "primevue/useconfirm";
    import RoleDepartmentRel from "@/service/role.department.rel.js"
    import AddRoleDepartmentRel from "./AddRoleDepartmentRel.vue"

    const {t, locale} = useI18n()
    const toast = useToast()
    const router = useRouter()
    const route = useRoute()
    const confirm = useConfirm()
    const roleDepartmentRel = new RoleDepartmentRel()

    const lazyParams = ref({
        page: 0,
        rows: 10,
        searchText: null,
        sortField: null,
        sortOrder: 0,
        orgId: 0,
    })
    const loading = ref(false)
    const total = ref(0)
    const first =  ref(0)
    const departments_role_rel = ref([])
    const department_role_rel = ref([])
    const roles = ref([])
    const role = ref(null)
    const isView = ref(false)
    const emitter = inject("emitter");
    const isDeleting = ref(false)
    
    const getDepartmentRoleRel = () => {
        loading.value = true;
        const req = {
            page: lazyParams.value.page,
            rows: lazyParams.value.rows,
            searchText: lazyParams.value.searchText,
        }

        roleDepartmentRel.getDepartmentRoleRel(req).then(res => {
            departments_role_rel.value = res.data.departments_role_rel
            total.value = res.data.total
            loading.value = false;
        }).catch(err => {
            loading.value = false;

            toast.add({
                severity: "error",
                detail: t("roleControl.noResult"),
                life: 3000,
            })

        })
    }

    const onPage = (event) => {
        lazyParams.value.page = event.page
        lazyParams.value.rows = event.rows
        first.value = event.first
        getDepartmentRoleRel();
    }

    const onSort = (event) => {
      lazyParams.value.sortField = event.sortField
      lazyParams.value.sortOrder = event.sortOrder
      getDepartmentRoleRel();
    }

    const select = (event) => {
        department_role_rel.value = event.data
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

    const giveNewRole = () => {
        isView.value = true
    }

    const openDelete = (data) => {
        isDeleting.value = true
        department_role_rel.value = data 
    }

    const deleteRoleDepartmentRel = () => {
        const req = {
            department_role_rel_id: department_role_rel.value.department_role_rel_id
        }

        roleDepartmentRel.deleteDepartmentRoleRel(req).then(res => {
            toast.add({
                severity: "save",
                summary: t('common.save'),
                life: t('common.message.actionErrorContactAdmin'),
            })
            loading.value = false;
            getDepartmentRoleRel()
            isDeleting.value =false
        }).catch(err => {

            if (err.response && err.response.data && err.response.data.localized) {
            toast.add({
                severity: "error",
                summary: t('common.message.actionError'),
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

            isDeleting.value =false
            loading.value = false;
        });
     }

    const closeRoleDepartmentRel = () => {
        department_role_rel.value = null
        isDeleting.value = false
    }

    const clearData = () => {
      if (!lazyParams.value.searchText) {
        return;
      }
      lazyParams.value.searchText = null;
      getDepartmentRoleRel()
    }

    const searchDepartmentRoleRel = (event) => {
        if (event.explicitOriginalTarget.value && event.explicitOriginalTarget.value.length > 1) {
            lazyParams.value.searchText = event.explicitOriginalTarget.value
            getDepartmentRoleRel()
      } else if (lazyParams.value.searchText.length < 1) {
            lazyParams.value.searchText = null
            getDepartmentRoleRel()
      }
    }

    onMounted(() => {
        getDepartmentRoleRel()

        emitter.on('departmentRoleRelAdded', (data) => {
          if (data === true) {
              isView.value = false
              getDepartmentRoleRel()
          }
        });
    })
</script>
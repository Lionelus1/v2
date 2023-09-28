<template>
	<div class="card">
        <Toolbar>
            <template #start>
				<Button :label="$t('roleControl.givePosRel')" icon="pi pi-plus"
					class="p-button-success p-mr-2" v-on:click="openSidebar"/>
            </template>
        </Toolbar>
    
        <DataTable :lazy="true" :value="positionRels"
            @page="onPage($event)" :totalRecords="total" :paginator="true"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 25, 50]"
            :currentPageReportTemplate="$t('common.showingRecordsCount', { first: '{first}', last: '{last}', totalRecords: '{totalRecords}' })"
            :rows="10" :rowHover="true" :loading="loading" responsiveLayout="scroll">

            <template #empty> {{ $t('common.noData') }}</template>
            <template #loading> {{ $t('common.loading') }}</template>
            <Column :header="$t('common.fullName')">
                <template #body="body">
                <span>
                    {{ body.data.entity ? body.data.entity.fullName : '' }}
                </span>
                </template>
            </Column>
            <Column :header="$t('contact.iin')">
                <template #body="body">
                <span>
                    {{ body.data.entity ? body.data.entity.IIN : '' }}
                </span>
                </template>
            </Column>
            <Column :header="$t('common.organizationName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.department.organization.name }}
                </span>
                </template>
            </Column>
            <Column :header="$t('roleControl.departmentName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.department.name }}
                </span>
                </template>
            </Column>
            <Column :header="$t('roleControl.positionName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.position.namekz }}
                </span>
                </template>
            </Column>
        </DataTable>
        <Sidebar v-model:visible="sidebarVisible" position="right"
             class="p-sidebar-lg" style="overflow-y: scroll">
			<h5>
				{{ $t('roleControl.givePosRel') }}
			</h5>
            <div>
                <label>{{ $t('common.fullName') }}</label>
                <FindUser v-model="user"/>
            </div>
			<div>
				<div style="margin-bottom: 0.5rem;">
					<label>{{ $t('contact.position') }}</label>
					<br>
					<Dropdown v-model="position" :optionLabel="positionLabel"
										:options="positions" class="w-full md:w-14rem"></Dropdown>
				</div>
				<div>
					<label>{{ $t('common.organizationName') }}</label>
					<br>
					<Dropdown class="dropdown" v-model="selectedOrganization" :options="organizations" 
                        :optionLabel="organizationLabel" :placeholder="$t('roleControl.selectOrg')" 
                        :filter="true" :showClear="true" @change="handleSelectedOrgChanged"
                        dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"
                        @filter="handleFilter"/>
				</div>
                <div>
					<label>{{ $t('roleControl.departmentName') }}</label>
					<br>
					<Dropdown class="dropdown" v-model="selectedDepartment" :options="departments" 
                        :optionLabel="departmentLabel" :placeholder="$t('roleControl.selectDep')" 
                        :filter="true" :showClear="true"
                        dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"
                        @filter="handleFilterDepartment"/>
				</div>
			</div>
			<div>
				<Button :label="$t('common.save')" icon="pi pi-check" :disabled="position === null || role === null"
								@click="savePositionRel" style="margin-top: 10px"/>
			</div>
            </Sidebar>
            <!--  ДИАЛОГОВОЕ ОКНО ДЛЯ УДАЛЕНИЯ ЗАПИСИ В ТАБЛИЦЕ  -->
            <!-- <Dialog v-model:visible="dialogVisible" :style="{ width: '450px' }"
                    :modal="true" :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
                <span>
                {{ $t("common.doYouWantDelete") }}?
                </span>
            </div>
            <template #footer>
                <Button :label="$t('common.yes')" icon="pi pi-check"
                        class="p-button p-component p-button-success p-mr-2"
                        @click="deletePositionRoleRelation"/>
                <Button :label="$t('common.no')" icon="pi pi-times"
                        class="p-button p-component p-button-danger p-mr-2"
                        @click="dialogVisible = false"/>
            </template>
            </Dialog> -->
         
    </div>
</template>
<script setup>
    import { smartEnuApi, getHeader } from "@/config/config";
    import axios from 'axios';
    import { ref, onMounted } from "vue";
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import FindUser from "@/helpers/FindUser";
    import RoleControlService from "./RoleControlService";

    const loading = ref(false)
    const toast = useToast()
    const {t, locale} = useI18n()
    const total = ref(0)
    const sidebarVisible = ref(false)
    const dialogVisible = ref(false)
    const selectedOrganization = ref(null)
    const selectedDepartment = ref(null)
    const user = ref(null)
    const positionRels = ref([])
    const getParams = { 
					page: 0,
					rows: 10,
				}
    const positions =  ref([])
    const position = ref(null)
    const roleControlService = new RoleControlService()
    const orgParams = {
        searchText: null
    }
    const departmentRequest = {
        page: 0,
        rows: 10,
        orgId: null,
        searchText: null,
    }
    const organizations = ref([])
    const departments = ref([])



    const initPositionRels = () => {        
        loading.value = true

        axios.post(smartEnuApi + '/positionRel', getParams, {
            headers: getHeader()
        }).then(res => {
            positionRels.value = res.data.position_rel
            total.value = res.data.total
            loading.value = false
        }).catch(err => {
            if (err.response.status == 401) {
                this.$store.dispatch("logLout")
            }
            
            this.$toast.add({
                severity: "error",
                detail: this.$t("roleControl.noResult"),
                life: 3000,
            })

            loading.value = false
        })
    }

    const  initPositions = () => {
            axios.get(smartEnuApi + '/positionRoleRel/positions', {
                headers: getHeader()
            }).then(res => {
                positions.value = res.data
            }).catch(err => {
                if (err.response.status == 401) {
                    this.$store.dispatch("logLout")
                }

                this.$toast.add({
                    severity: "error",
                    detail: this.$t("roleControl.failedToLoad"),
                    life: 3000,
                })
            })
    }

    const onPage = (event) => {
        getParams.page = event.page
        getParams.rows = event.rows
        initPositionRels()
    }   
    
    const positionLabel = (item) => {
		return item['namekz']
	}
    
    const organizationLabel = (item) => {
        if (item.bin) {
            return item.bin + ' - ' + item['name' + locale.value]
        } else {
            return item['name' + locale.value]
        }
	}

    const departmentLabel = (item) => {
        return item.name
	}

    const getOrganizations = () => {
      roleControlService.getOrganizations(orgParams).then(response => {
        organizations.value = response.data
      }).catch(error => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout")
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        })
      })
    }

    const handleSelectedOrgChanged = (event) => {
        if (selectedOrganization.value) {
            departmentRequest.orgId = selectedOrganization.value.id
            departmentRequest.searchText = null
            getDepartments()
        } 
    }

    const getDepartments = () => {
      departmentRequest.orgId = selectedOrganization.value.id
      roleControlService.getDepartments(departmentRequest).then(response => {
        departments.value = response.data.departments
      }).catch(error => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout")
        }
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        })
      })
    }


    const handleFilter = (event) => {
      if (event.value && event.value.length > 3) {
        orgParams.searchText = event.value
        getOrganizations()
      } else if (orgParams.searchText.length > 3) {
        orgParams.searchText = null
        getOrganizations()
      }
    }

    const handleFilterDepartment = (event) => {
      if (event.value && event.value.length > 3) {
        departmentRequest.searchText = event.value
        getDepartments()
      } else if (departmentRequest.searchText && departmentRequest.searchText.length > 3) {
        departmentRequest.searchText = null
        getDepartments()
      }
    }

    const  savePositionRel = () => {
        console.log(user.value[0].userID, 'test')
        if (position.value === null || selectedDepartment.value === null || user.value === null) {
            return
        }

        loading.value = true

        axios.post(smartEnuApi + '/positionRel/create', {
            userId: user.value[0].userID,
            positionId: position.value.id,
            department_id: selectedDepartment.value.id
        }, {
            headers: getHeader()
        }).then(res => {
            closeSidebar()
        }).catch(err => {
            if (err.response.status == 401) {
               this.$store.dispatch("logLout")
            }
            
            this.$toast.add({
                severity: "error",
                detail: this.$t("common.message.saveError"),
                life: 3000,
            })
  
        })
        closeSidebar()
        loading.value = false
    }

    const closeSidebar = ()=> {
        sidebarVisible.value = false
        initPositionRels()
    }
    
    const openSidebar = () => {
        sidebarVisible.value = true
        initPositions()
        getOrganizations()
    }
 
    onMounted(() => {
        initPositionRels()
    })
	

</script>

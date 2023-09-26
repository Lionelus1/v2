<template>
	<div class="card">
        <Toolbar>
            <template #start>
				<Button :label="$t('roleControl.givePosRel')" icon="pi pi-plus"
					class="p-button-success p-mr-2" v-on:click="open('create', nil)"/>
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
                    {{ body.data.total }}
                    {{ body.data.position_rel.fullName }}
                </span>
                </template>
            </Column>
            <Column :header="$t('contact.iin')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.role.name + ' - ' + slotProps.data.role[$i18n.locale] }}
                </span>
                </template>
            </Column>
            <Column :header="$t('common.organizationName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.role.name + ' - ' + slotProps.data.role[$i18n.locale] }}
                </span>
                </template>
            </Column>
            <Column :header="$t('roleControl.departmentName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.role.name + ' - ' + slotProps.data.role[$i18n.locale] }}
                </span>
                </template>
            </Column>
            <Column :header="$t('roleControl.positionName')">
                <template #body="slotProps">
                <span>
                    {{ slotProps.data.role.name + ' - ' + slotProps.data.role[$i18n.locale] }}
                </span>
                </template>
            </Column>
        </DataTable>

         
    </div>
</template>
<script setup>
    import { smartEnuApi, getHeader } from "@/config/config";
    import axios from 'axios';
    import { ref, onMounted } from "vue";

    const loading = ref(false)
    const total = ref(0)
    const view = {
					create: false,
					delete: false,
				}
    const positionRels = ref([])

    const getParams = {
					page: 0,
					rows: 10,
				}

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

    const open = (name, data) => {  
        view[name] = true
        this.forDeleting = data
    }

    const onPage = (event) => {
        console.log('test')
        getParams.page = event.page
        getParams.rows = event.rows
        initPositionRels()
    }

    onMounted(() => {
        initPositionRels()
    })
	

</script>

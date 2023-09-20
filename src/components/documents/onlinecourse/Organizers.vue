<template>
    <h3>{{ $t('course.organizers') }}</h3>
    <div>
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <div class="surface-card p-4 shadow-2 border-round">
            <div>
                <DataTable
                    selectionMode="single"
                    v-model:selection="organizer"
                    :lazy="true"
                    :totalRecords="total"
                    :value="organizers"
                    @page="onPage($event)"
                    :paginator="true"
                    :first="lazyParams.page"
                    :rows="lazyParams.rows"
                    dataKey="id"
                    :rowHover="true"
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[10, 25, 50]"
                    :currentPageReportTemplate="
                    $t('common.showingRecordsCount', {
                        first: '{first}',
                        last: '{last}',
                        totalRecords: '{totalRecords}',
                    })"
                    responsiveLayout="stack"
                    breakpoint="480px"
                    @sort="onSort($event)"
                    @filter="onFilter($event)">
                    <Column :field="'name' + $i18n.locale" :header="$t('common.name')"></Column>
                    <Column field="journalCode" :header="$t('common.code')"></Column>
                    <Column field="lastNumber" :header="$t('course.lnum')"></Column>
                    <!-- <Column headerStyle="width:60px;">
                        <template #body="slotProps">
                        <Button @click="template=slotProps.data;templateEditorVisilble = true"
                                type="button"
                                icon="pi pi-eye" class="p-button-info"></Button>
                        </template>
                    </Column> -->
                </DataTable>
            </div>
        </div>
    </div>
</template>
<script>

import {OnlineCourseService} from "@/service/onlinecourse.service";
export default {
    name: "Organizers",
   
    data() {
        return {
            organizers: [],
            service: new OnlineCourseService(),
            lazyParams : {
              page: 0,
              rows: 10,
            },
            organizer: null,
            total: 0,
            saving:false,
            loading: false,
        }
    },
    methods: {
        getCourseOrganizers() {
            this.loading = true,
            this.service.getCourseOrganizers(this.lazyParams).then(response => {
                this.organizers = response.data.organizers
                this.total = response.data.total
                this.loading = false
            }).catch(_=> {
                this.loading = false
            });
        },
        onPage(event) {
            this.lazyParams = event;
            this.getCourseOrganizers();
        }, 
       
    },
    created() {
        this.getCourseOrganizers()
    }
}
</script>

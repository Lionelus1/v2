<template>
    <div>
        <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
        <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-2xl font-medium text-900 mb-3">{{ $t('course.categories') }}</div>
            <div>
                <TreeTable :value="categories" :lazy="true" :paginator="true" :rows="lazyParams.rows" :loading="loading"
                    @nodeExpand="onExpand" @page="onPage" :totalRecords="total">
                    <Column field="name" :header="$t('common.name')" :expander="true">
                        <template #body="slotProps">{{slotProps.node["name" + $i18n.locale]}}</template>
                    </Column>
                    <Column field="organizer" :header="$t('course.organizers')">
                        <template #body="slotProps">{{slotProps.node.organizer["name" + $i18n.locale]}}</template>
                    </Column>
                </TreeTable>
            </div>
        </div>
    </div>
</template>
<script>

import {OnlineCourseService} from "@/service/onlinecourse.service";
export default {
    name: "Categories",
   
    data() {
        return {
            categories: [],
            service: new OnlineCourseService(),
            lazyParams : {
              page: 0,
              rows: 10,
              parentID: null,
            },
            category: null,
            total: 0,
            saving:false,
            loading: false,

        }
    },
    methods: {
        getCourseCategories() {
            this.loading = true,
            this.service.getCourseCategories(this.lazyParams).then(response => {
                if (this.lazyParams.parentID) 
                {
                    this.category.children = response.data.categories;
                } 
                else 
                {
                    this.categories = response.data.categories
                    this.total = response.data.total
                }
                this.loading = false
            }).catch(_=> {
                this.loading = false
            });
        },
        onPage(event) {
            this.lazyParams = event;
            this.lazyParams.parentID = null
            this.getCourseCategories();
        },
        onExpand(node) {
            this.category = node;
            if (!node.children) {
                this.lazyParams.parentID = node.id
                this.getCourseCategories();
            }

        }
       
    },
    created() {
        this.getCourseCategories()
    }
}
</script>

<template>
    <div class="main_container">
        <h3>{{ $t("dissertation.swList") }}</h3>
        <div class="card">
            <TreeTable :value="data" class="p-treetable-sm"  :loading="loading"
                       @nodeExpand="onExpand" @page="onPage" :expandedKeys="expandedKeys" responsiveLayout="scroll"
                       selectionMode="single" v-model:selectionKeys="currentNode" @nodeSelect="navigateToEvent">
                <template #header>
                    <div class="flex justify-content-between">
                        <div>
                            <Button class="mr-2 mb-2" icon="pi pi-external-link" :label="$t('bank.card')"/>
                            <Button class="mr-2 mb-2" icon="pi pi-plus" :label="$t('common.addPost')"/>
                        </div>
                        <Button class="mr-2 mb-2" icon="pi pi-filter" :label="$t('common.filter')"/>
                    </div>
                </template>
                <Column field="name" :header="$t('common.name')" :expander="true">
                    <template #body="slotProps">
                        {{ slotProps.node.name }}
                    </template>
                </Column>
                <Column field="author" :header="$t('common.author')">
                    <template #body="slotProps">
                        {{ slotProps.node.author }}
                    </template>
                </Column>
                <Column field="status" :header="$t('common.status')">
                    <template #body="slotProps">
                        <span :class="'customer-badge status-' + slotProps.node.stateen">{{ slotProps.node.status }}</span>
                    </template>
                </Column>
                <Column field="year" :header="$t('educomplex.columns.year')">
                    <template #body="slotProps">
                        {{ slotProps.node.year }}
                    </template>
                </Column>
                <Column field="path">
                    <template #body="{}">
                        <div class="flex justify-content-end">
                            <Button class="p-button-text p-button-info p-1 mr-2"><i class="fa-solid fa-eye fa-xl"></i></Button>
                            <Button class="p-button-text p-button-warning p-1 mr-2"><i class="fa-solid fa-pencil fa-xl"></i></Button>
                            <Button class="p-button-text p-button-danger p-1 mr-2">
                                <i class="fa-solid fa-trash-can fa-xl"></i></Button>
                        </div>
                    </template>
                </Column>
            </TreeTable>
        </div>
    </div>
</template>

<script setup>
const loading = false
const currentNode = null
const expandedKeys = {}

const data = [
    {
        name: 'Научные труды',
        author: 'Андаков Дилмухан',
        status: 'Создан',
        stateen: 'signed',
        year: 2023,
        children: [{
            name: 'Научные труды',
            author: 'Андаков Дилмухан',
            status: 'Создан',
            stateen: 'signed',
            year: 2023,
        }]
    },
    {
        name: 'Научные труды',
        author: 'Андаков Дилмухан',
        status: 'На согласовании',
        stateen: 'inapproval',
        year: 2023,
    }

]
const onExpand = (node)=> {
    console.log(node)
}
const onPage = (node)=> {
    console.log(node)
}
const navigateToEvent = (node)=> {
    console.log(node)
}
</script>

<style scoped>

</style>
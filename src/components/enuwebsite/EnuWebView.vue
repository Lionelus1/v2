<template>
    <div class="p-col-12">
        <div class="card">
        <table style="width:100%;">
                <tbody>
                    <tr>
                        <td><h3>{{ $t("enuNewSite.menuPage") }}</h3></td>
                        <td> <Button :label="$t('enuNewSite.addMenu')" icon="pi pi-plus" class="p-ml-2" v-on:click="createMenu"/>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
         <div class="card">
        <DataTable :value="menus" dataKey="menuId" :paginator="true" :rows="50" sortMode="single" :rowHover="true">
            <Column field="titleKz"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true">
               <template #body="{ data }">
                 {{ $i18n.locale === 'kz' ? data.titleKz : $i18n.locale === 'ru' ? data.titleRu : data.titleEn }}
               </template>      
            </Column>
            <Column field="orderId" :header="$t('enuNewSite.menuOrder')" :sortable="true">
                <template #body="{ data }">
                 {{ data.orderId }}
               </template>
            </Column>
            <Column field="isMain" :header="$t('enuNewSite.isMainMenu')" :sortable="true">
                <template #body="{ data }">
                 {{ data.isMain }}
               </template>
            </Column>
            <Column headerStyle="width: 8em" bodyStyle="text-align: center">
        <template #header>
            <Button type="button" icon="pi pi-cog"></Button>
        </template>
        <Column v-for="menu of menus" :key="menu.menuId" :field="menu.titleKz"></Column>
        <template #body="">
                    <Button type="button" icon="pi pi-pencil" class="p-button-warning"></Button>
                </template>
            </Column>
           
            
        </DataTable>
    </div>
   


</div>
</template>

<script>
    import {EnuWebService} from "@/service/enuWeb.service"; 
    export default {
        name: "EnuWebView",
        data(){
            return {
            menus: [],
            menuTitle: "",
            menuService: new EnuWebService()
            };
        },
        async created(){
            await this.getMenus();
        },
        methods: {
            async getMenus() {
                this.menuService.getAllMenus().then(res =>{
                    if(res.data){
                        this.menus = res.data;

                    }
                }).catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.$store.dispatch("logLout");
                        } else {
                        this.$toast.add({
                            severity: "error",
                            summary: error,
                            life: 3000,
                        });
                        }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dialog_img {
        padding: 0 100px;
    }

    @media (max-width: 780px) {
        .dialog_img {
            padding: 0;
        }
    }

</style>

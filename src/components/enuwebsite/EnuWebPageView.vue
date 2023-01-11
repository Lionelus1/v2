<template>
    <div class="p-col-12">
        <div class="card">
        <table style="width:100%;">
                <tbody>
                    <tr>
                        <td><h3>{{ $t("enuNewSite.pageLink") }}</h3></td>
                        <td> <Button :label="$t('enuNewSite.addPage')" icon="pi pi-plus" class="p-ml-2" v-on:click="createMenu"/>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
         <div class="card">
        <DataTable :value="pages" dataKey="pageId" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
            <Column field="titleKz"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true">
               <template #body="{ data }">
                 {{ $i18n.locale === 'kz' ? data.titleKz : $i18n.locale === 'ru' ? data.titleRu : data.titleEn }}
               </template>      
            </Column>
            <Column headerStyle="width: 8em" bodyStyle="text-align: center">
        <template #body="">
                    <Button type="button" icon="pi pi-pencil" class="p-button-warning"></Button>
                </template>
           
            <Column v-for="page of pages" :key="page.pageId" :field="page.titleKz" header="Edit" :expander="true" :sortable="true">
               <template #body="">
                 <Button type="button" icon="pi pi-pencil" class="p-button-warning"></Button>
               </template>      
            </Column>
        </Column>
            
        </DataTable>
    </div>

</div>
</template>

<script>
    import {EnuWebService} from "@/service/enuWeb.service"; 
    export default {
        name: "EnuWebPageView",
        data(){
            return {
            pages: [],
            pageTitle: "",
            pageService: new EnuWebService()
            };
        },
        async created(){
            await this.getPages();
        },
        methods: {
            async getPages() {
                this.pageService.getAllPages().then(res =>{
                    if(res.data){
                        this.pages = res.data;

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

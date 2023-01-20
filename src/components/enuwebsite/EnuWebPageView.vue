<template>
    <div class="p-col-12">
        <div class="card">
        <table style="width:100%;">
                <tbody>
                    <tr>
                        <td><h3>{{ $t("enuNewSite.pageLink") }}</h3></td>
                        <td> <Button :label="$t('enuNewSite.addPage')" icon="pi pi-plus" class="p-ml-2" @click="createPage"/>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
<!-- Delete Confirmation Dialog Box Begin -->
    <Dialog v-model:visible="deleteVisible" :style="{ width: '450px' }" :modal="true">
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
      <span v-if="pageData">{{ $t("common.doYouWantDelete") }}
          <b>
            {{
              $i18n.locale === "kz" ? pageData.title_kz : $i18n.locale === "ru" ? pageData.title_ru : pageData.title_en
            }}
            
          </b>?
        </span>
    </div>
    <template #footer>
      <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button p-component p-button-success p-mr-2"
              @click="onDeletePage(pageData)"/>
      <Button :label="$t('common.no')" icon="pi pi-times" class="p-button p-component p-button-danger p-mr-2"
              @click="deleteVisible = false"/>
    </template>
  </Dialog>
  <!-- Delete Confirmation Dialog Box End -->
         <div class="card">
        <DataTable :value="pages" responsiveLayout="scroll" dataKey="enu_page_id" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
            <Column field="title_kz"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true">
               <template #body="{ data }">
                 {{ $i18n.locale === 'kz' ? data.title_kz : $i18n.locale === 'ru' ? data.title_ru : data.title_en }}
               </template>      
            </Column>
            <Column field="page_view"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true" style="text-align: right;">
               <template #body="{ data }">
                <Button type="button" icon="pi pi-eye" class="p-button-warning" @click="onView(data)"></Button>
               </template>      
            </Column>
            <Column field="page_edit"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true" style="text-align: right;">
               <template #body="{ data }">
                <Button type="button" icon="pi pi-pencil" class="p-button-warning" @click="onEditPage(data)"></Button>
               </template>      
            </Column>

            <Column field="page_delete"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true" style="text-align: right;">
               <template #body="{ data }">
                <ConfirmDialog></ConfirmDialog>
                <Button type="button"  icon="pi pi-trash" class="p-button-danger" @click="delPage(data.enu_page_id)"></Button>
               </template>      
            </Column>
            
            
        </DataTable>
    </div>

</div>
<Dialog v-model:visible="pageView" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}" header="#"
          :modal="true" class="p-fluid">
    <h3 v-html="selectedPage.title_kz"></h3><hr/>
    <div v-html="$i18n.locale === 'kz' ? selectedPage.content_kz : $i18n.locale === 'ru' ? selectedPage.content_ru : selectedPage.content_en"></div>
</Dialog>
<!-- =============Add Page Dialog Popup=============== -->
<Dialog v-model:visible="display" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :header="$t('enuNewSite.addEditPageTitle')"
          :modal="true" class="p-fluid">
        <TabView>
            <!-- ============================Kazakhsha=========================== -->
        <TabPanel header="Қазақша">
          <div class="p-field p-mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText id="title_kz" v-model="formData.title_kz"   rows="3" 
                       />
            <!-- <small class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small> -->
            <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>

          </div>

          <div class="p-field">
            <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
            <Editor id="content_kz" v-model="formData.content_kz"  editorStyle="height: 320px"/>
            <small v-show="!formData.content_kz && submitted"  class="p-error">{{$t("smartenu.contentKzInvalid")}}</small>
          </div>
                   
        </TabPanel>
        <!-- ====================================End Kazakhsha content================ -->

        <!-- ============================Orissha ==================================-->
        <TabPanel header="Русский">
          <div class="p-field p-mt-3">
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
            <InputText id="title_ru" v-model="formData.title_ru" rows="3" />
            <small v-show="!formData.title_ru && submitted"  class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
          </div>

          <div class="p-field">
            <label for="kz-content">{{ $t("common.contentInRussian") }}</label>
            <Editor id="content_ru" v-model="formData.content_ru"  editorStyle="height: 320px"/>
            <small v-show="!formData.content_ru && submitted"  class="p-error">{{$t("smartenu.contentKzInvalid")}}</small>
          </div>
         
         
        </TabPanel>
        <!-- =================================End Orissha=========================== -->

        <!-- ===============================Begin English Line========================== -->
        <TabPanel header="English">
          <div class="p-field p-mt-3">
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
            <InputText id="title_en" v-model="formData.title_en"  rows="3"/>
            <small v-show="!formData.title_en && submitted"  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
          </div>  
          <div class="p-field">
            <label for="kz-content">{{ $t("common.contentInEnglish") }}</label>
            <Editor  id="content_en" v-model="formData.content_en" editorStyle="height: 320px"/>
            <small v-show="!formData.content_en && submitted"  class="p-error">{{
                $t("smartenu.contentKzInvalid")
              }}</small>
          </div>  
        </TabPanel>
        <!-- =====================End English=========================== -->
      </TabView>

    <!-- ==========Dialog Footer========= -->
    <template #footer>
        <Button
            v-bind:label="$t('common.save')"
            icon="pi pi-check"
            class="p-button p-component p-button-success p-mr-2"
            v-on:click="addButtonName"
        />
        <Button
            v-bind:label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button p-component p-button-danger"
            @click="hideDialog"
        />
    </template>
</Dialog>
</template>

<script>
    import {EnuWebService} from "@/service/enuWeb.service"; 
import { throwStatement } from "@babel/types";
    export default {
        name: "EnuWebPageView",
        data(){
            return {
            pages: [],
            editPage: [],
            enuPageID: null,
            pageTitle: "",
            display: false,
            pageView: false,
            deleteVisible: false,
            allPage: [],
            pageData: null,
            addButtonName: this.addPage,
            submitted: false,
            pageService: new EnuWebService(),
            formValid: [],
            formData: {
                enu_page_id: null,
                title_kz: null,
                title_ru: null,
                title_en: null,
                content_kz: null,
                content_ru: null,
                content_en: null,

            },
            selectedPage: {
                enu_page_id: null,
                title_kz: null,
                title_ru: null,
                title_en: null,
                content_kz: null,
                content_ru: null,
                content_en: null,
            },

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
                        this.allPage = res.data;

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
            },
            createPage(){
                this.display = true;
            },
            hideDialog() {
                this.display = false;
                this.formData = {};
                this.addButtonName = this.addPage;
            },
            isDelete(){
                if (this.isDeletable === false){
                    this.isDeletable = true;
                }else{
                    this.isDeletable = false;
                }
            },
            delPage(id) {
                this.pageData = {};
                this.pageData = this.allPage.find((x) => x.enu_page_id === id);
                this.deleteVisible = true;
                
            },  
            addPage(){
                this.submitted = true;
                

                if (this.validatePage().length > 0){
                    return;
                }
                this.pageService.addPage(this.formData).then(res => {
                    if(res.data !== null){
                      this.$toast.add({
                            severity: "success",
                            summary: this.$t("enuNewSite.createdPageSuccessMsg"),
                            life: 3000,
                        });
                        console.log("Successfully added");
                    }
                    console.log("Successfully added");
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
                this.display = false;
            },
            validatePage() {
                this.formValid = [];
                if(!this.formData.title_kz){
                    this.formValid.push({title_kz: true});
                }
                if(!this.formData.title_ru){
                    this.formValid.push({title_ru: true});
                }
                if(!this.formData.title_en){
                    this.formValid.push({title_en: true});
                }
                if(!this.formData.content_kz){
                    this.formValid.push({content_kz: true});
                }
                if(!this.formData.content_ru){
                    this.formValid.push({content_ru: true});
                }
                if(!this.formData.content_en){
                    this.formValid.push({content_en: true});
                }
                return this.formValid;
            },
            onDeletePage(data){
               
                this.selectedPage = data;
                this.pageService.deletePage(data).then(res => {
                    if(res.data !== null){
                      this.$toast.add({
                            severity: "success",
                            summary: "Successfully deleted",
                            life: 3000,
                        });
                        console.log("Successfully added");
                        
                    }
                    console.log("Successfully deleted");
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
                        console.log(error);
                });
                this.deleteVisible = false;

            },
            onView(data){
                //alert(data);
                this.selectedPage.content_kz = data.content_kz;
                this.selectedPage.content_ru = data.content_ru;
                this.selectedPage.content_en = data.content_en;
                this.selectedPage.title_kz = data.title_kz;
                this.pageView = true;
            },
            onEditPage(data){
                
                //alert(data.enu_page_id);
                this.addButtonName = this.onSavePage;
                this.display = true;
                this.formData.enu_page_id = data.enu_page_id;
                this.formData.title_kz = data.title_kz;
                this.formData.title_ru = data.title_ru;
                this.formData.title_en = data.title_en
                this.formData.content_kz = data.content_kz;
                this.formData.content_ru = data.content_ru;
                this.formData.content_en = data.content_en;
                
                console.log(data.enu_page_id);
            },
            onSavePage(){
                alert(this.formData.enu_page_id);
                console.log(this.formData);
                this.pageService.editPage(this.formData).then(res => {
                    if(res.data !== null){
                      this.$toast.add({
                            severity: "success",
                            summary: this.$t("enuNewSite.createdPageSuccessMsg"),
                            life: 3000,
                        });
                        console.log("Successfully added");
                        
                    }
                    console.log("Successfully added");
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
                        console.log(error);
                });
                this.display = false;

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

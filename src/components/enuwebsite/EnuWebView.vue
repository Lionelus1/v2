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
        <DataTable :value="menus" dataKey="menuId" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
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
<!-- Add Menu Modal Pop Up -->
<Dialog v-if="display" v-model:visible="display" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :header="$t('enuNewSite.addEditMenuPageTitle')"
          :modal="true" class="p-fluid">
    
        <TabView>
        <TabPanel header="Қазақша">
          <div class="p-field p-mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText id="kz-title" v-model="formData.titleKz"  rows="3"
                       />
            <!-- <small class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small> -->
          </div>
                   
        </TabPanel>
        <TabPanel header="Русский">
          <div class="p-field p-mt-3">
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
            <InputText id="ru-title" v-model="formData.titleRu"
                       rows="3" />
            <!-- <small  class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small> -->
          </div>
         
        </TabPanel>
        <TabPanel header="English">
          <div class="p-field p-mt-3">
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
            <InputText id="en-title" v-model="formData.titleEn"  rows="3"/>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
          </div>    
        </TabPanel>
      </TabView>

      <!-- Menu Order -->
      <div class="card" v-if="menus.length > 0" v-show="selectMenuVisible">
        <div class="p-field">
            <label for="menuorder-label">{{ $t('enuNewSite.menuOrderLabel') }}</label>
            <InputText id="menu-order"  rows="3" mode="decimal" v-model="formData.orderId"/>
          </div>  
         
      </div>

       <!-- Menu Direction -->
       <!-- <div class="card" v-if="menus.length > 0" v-show="selectMenuVisible">
        <div class="p-field">
            <label for="menuorder-label">{{ $t('enuNewSite.menuOrderLabel') }}</label>
            <InputText id="menuOrderNum"  rows="3" mode="decimal"/>
          </div>  
         
      </div> -->

      <!-- Select Menu -->
      <div class="card" v-if="menus.length > 0" v-show="selectMenuVisible">
        <div class="p-field">
            <label for="choose-parent-ment">{{ $t('enuNewSite.selectParentMenu') }}</label>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
            <!-- osy jerge page selector block keledi -->
            {{ selectedMenu  }}
            <Dropdown v-model="selectedMenu"  optionDisabled="true" :options="menus" optionLabel="titleKz" optionValue="menuId" :placeholder="$t('enuNewSite.selectMenu')" />
            
          </div>  
         
      </div>


    
     <!-- Select Page -->
      <div class="card" v-if="pages.length > 0" v-show="selectPageVisible">
        <div class="p-field">
            <label for="choose-page">{{ $t("enuNewSite.selectMainPage") }}</label>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
            <!-- osy jerge page selector block keledi -->
            {{ selectedPage  }}
            <Dropdown v-model="selectedPage" optionDisabled="true"  :options="pages" optionLabel="titleKz" optionValue="pageId" :placeholder="$t('enuNewSite.selectPage')" />
          </div>  
          <div class="p-field p-mt-1">
            
          </div>
         
      </div>
      <!-- Custom Menu Link -->
      <div class="card" v-show="customMenuLink">
        <div class="p-field">
            <label for="addCustom-link">{{ $t('enuNewSite.addCustomLink') }}</label>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
            <!-- osy jerge page selector block keledi -->
            {{ selectedMenu  }}
            <InputText id="en-title"  rows="3"/>
            
          </div>  
         
      </div>
     

	<template #footer>
    <div class="left" style="float:left;">
      <Button
            :label="$t('enuNewSite.giveCustomLink')"
            icon="pi pi-external-link"
            class="p-button p-component p-button-success p-mr-2"
            @click="hideSelectMenus"
        />
    
    <Button
            :label="$t('enuNewSite.createNewPageButton')"
            icon="pi pi-plus"
            class="p-button p-component p-mr-2"
            v-on:click="addNews"
        />
    </div>
    <div class="right" style="float:right;">
      <Button
            v-bind:label="$t('common.save')"
            icon="pi pi-check"
            class="p-button p-component p-button-success p-mr-2"
            v-on:click="addMenu"
        />
        <Button
            v-bind:label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button p-component p-button-danger"
            @click="hideDialog"
        />
    </div>
    
       
	</template>
</Dialog>
</template>

<script>
    import {EnuWebService} from "@/service/enuWeb.service"; 

    export default {
        name: "EnuWebView",
        props: ['parentId'],
        data(){
            return {
            menus: [],
            pages: [],
            menu:[],
            menuTitle: "",
            display: false,
            submitted: false,
            selectMenuVisible: true,
            selectPageVisible: true,
            customMenuLink: false,
            selectedPage: null,
            selectedMenu: null,
            menuService: new EnuWebService(),
            pageService: new EnuWebService(),
            formData: {
              titleKz: "",
              titleRu: "",
              titleEn: "",
              parentId: this.parentId ? this.parentId : null,
              pageId: this.pageId ? this.pageId : null,
              menuLink: null,
              isMain: false,
              orderId: 0,
              directionId: null
            }
            };
        },
        async created(){
            await this.getMenus();
            await this.getPages();
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
            },
            async getPages() {
                this.pages = [];
                this.pageService.getAllPages().then(res =>{
                    if(res.data){
                        this.pages = res.data;
                        console.log(res.data);

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
            createMenu() {
                // this.catTreeElementsList = [];
                // this.catTree.root = this.createCatTree(null, null);
                // this.newsData = {};
                this.display = true;
                // this.submitted = false;
                // this.newsData.id = null;
                // this.newsData.contentCategoryRelations = [];
                // this.selectedCatTree = [];
                //alert("Worked");
            },
            hideDialog() {
            this.display = false;
            this.selectedMenu=null;
            this.selectedPage=null;
            this.submitted = false;
            },
            hideSelectMenus(){

              if (this.selectMenuVisible == true && this.selectPageVisible == true && this.customMenuLink == false){
                  this.selectMenuVisible=false;
                  this.selectPageVisible=false;
                  this.customMenuLink=true;
                  this.selectedMenu=null;
                  this.selectedPage=null;

              }else{
                this.selectMenuVisible=true;
                this.selectPageVisible=true;
                this.customMenuLink=false;
                this.selectedMenu=null;
                this.selectedPage=null;
              }
            },
            addMenu(){
              this.submitted = true;
              if (this.selectedPage) {
                this.formData.pageId = this.selectedPage;
              }
              //if (this.sele)
              this.menuService.addMenu(this.formData).then(res =>{
                    if(res.data.is_success){
                      this.$toast.add({
                            severity: "success",
                            summary: 'Success',
                            life: 3000,
                        });
                        this.display = false;
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
            async insertMenu(){
              

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

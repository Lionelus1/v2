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
        <DataTable :value="menus" dataKey="menu_id" :paginator="true" :rows="10" sortMode="single" :rowHover="true">
            <Column field="menu_title_kz"  :header="$t('common.nameInQazaq')" :expander="true" :sortable="true">
               <template #body="{ data }">
                 {{ $i18n.locale === 'kz' ? data.menu_title_kz : $i18n.locale === 'ru' ? data.menu_title_ru : data.menu_title_en }}
               </template>      
            </Column>
            <Column field="order_id" :header="$t('enuNewSite.menuOrder')" :sortable="true">
                <template #body="{ data }">
                 {{ data.order_id }}
               </template>
            </Column>
            <Column field="is_main" :header="$t('enuNewSite.isMainMenu')" :sortable="true">
                <template #body="{ data }">
                 {{ data.is_main }}
               </template>
            </Column>
            <Column headerStyle="width: 8em" bodyStyle="text-align: center">
        <template #header>
            <Button type="button" icon="pi pi-cog"></Button>
        </template>
        <Column v-for="menu of menus" :key="menu.menu_id" :field="menu.menu_title_kz"></Column>
        <template #body="">
                    <Button type="button" icon="pi pi-pencil" class="p-button-warning"></Button>
                </template>
            </Column>
           
            
        </DataTable>
    </div>
   
</div>
<!-- Add Menu Modal Pop Up -->
<Dialog v-model:visible="display" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :header="$t('enuNewSite.addEditMenuPageTitle')"
          :modal="true" class="p-fluid">
    
        <TabView>
        <TabPanel header="Қазақша">
          <div class="p-field p-mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText id="kz-title" v-model="formData.menu_title_kz"  rows="3"
            :class="{ 'p-invalid': !formData.menu_title_kz && submitted }" />
            <small v-show="!formData.menu_title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
                   
        </TabPanel>
        <TabPanel header="Русский">
          <div class="p-field p-mt-3">
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
            <InputText id="ru-title" v-model="formData.menu_title_ru" rows="3" 
            :class="{ 'p-invalid': !formData.menu_title_ru && submitted }" />
            <small v-show="!formData.menu_title_ru && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
          </div>
         
        </TabPanel>
        <TabPanel header="English">
          <div class="p-field p-mt-3">
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
            <InputText id="en-title" v-model="formData.menu_title_en"  rows="3"
            :class="{ 'p-invalid': !formData.menu_title_en && submitted }" />
            <small v-show="!formData.menu_title_en && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
          </div>    
        </TabPanel>
      </TabView>

      <!-- Menu Order -->
      <div class="card">
        <div class="p-field">
            <label for="menuorder-label">{{ $t('enuNewSite.menuOrderLabel') }}</label>
            <InputNumber id="order_id"  rows="3"  v-model="formData.order_id"/>
          </div>  
         
      </div>

       <!-- Menu Direction -->
       <!-- <div class="card" v-if="menus.length > 0" v-show="selectMenuVisible">
        <div class="p-field">
            <label for="menuorder-label">{{ $t('enuNewSite.menuOrderLabel') }}</label>
            <InputText id="menuOrderNum"  rows="3" mode="decimal"/>
          </div>  
         
      </div> -->
      <div class="p-fluid">
        <div class="p-field">
           

        </div>
      </div>

      <!-- Select Menu -->
      <div class="card" v-if="menus.length > 0" v-show="selectMenuVisible">
        <div class="p-field">
            <label for="choose-parent-ment">{{ $t('enuNewSite.selectParentMenu') }}</label>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
            <!-- osy jerge page selector block keledi -->
            <!-- {{ selectedMenu  }} -->
            <Dropdown v-model="selectedMenu"  optionDisabled="true" :options="menus" optionLabel="menu_title_kz" optionValue="menu_id" :placeholder="$t('enuNewSite.selectMenu')" />
            
          </div>  
         
      </div>

     <!-- Select Page -->
      <div class="card" v-if="pages.length > 0" v-show="selectPageVisible">
        <div class="p-field">
            <label for="choose-page">{{ $t("enuNewSite.selectMainPage") }}</label>
            <!-- <small  class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small> -->
            <!-- osy jerge page selector block keledi -->
            {{ selectedPage  }}
            <Dropdown v-model="selectedPage" optionDisabled="true"  :options="pages" optionLabel="title_kz" optionValue="enu_page_id" :placeholder="$t('enuNewSite.selectPage')" />
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
            <InputText id="en-title" v-model="formData.link"  rows="3"/>
            <!-- <small v-show="!formData.link && submitted" class="p-error">{{ $t("enuNewSite.customLinkInvalid") }}</small> -->
            
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
            @click="visibleRight = true"
            
        />
        
        <input v-model="checked" type="checkbox" name="check" v-on:click="setMainMenu" />
        <label for="check">Main Menu: {{checked}}</label>
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

<!-- Add Page Right Sidebar
<Sidebar v-model:visible="visibleRight" position="right" class="p-sidebar-sm">
	Content
</Sidebar> -->
</template>

<script>
    import {EnuWebService} from "@/service/enuWeb.service"; 

    export default {
        name: "EnuWebView",
        props: ['parentId'],
        data(){
            return {
            display: this.isVisible ?? false,
            menus: [],
            pages: [],
            menu:[],
            menuTitle: "",
            //display: false,
            submitted: false,
            selectMenuVisible: true,
            selectPageVisible: true,
            customMenuLink: false,
            selectedPage: null,
            selectedMenu: null,
            menuService: new EnuWebService(),
            pageService: new EnuWebService(),
            formData: {
                menu_title_kz: null,
                menu_title_ru: null,
                menu_title_en: null,
                parent_id: this.menu_id ? this.menu_id : null,
                page_id: null,
                link: null,
                is_main: null,
                order_id: null,
                direction_id: null
            },
            formValid: [],
            checked: this.is_main ? this.is_main : null,
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
               
                this.display = true;
                
              
            },
            hideDialog() {
                this.emitter.emit('addEditNewsDialogHide', true);
                this.display = false;
                this.selectedMenu=null;
                this.selectedPage=null;
                this.submitted = false;
                this.formData.menu_title_kz = null;
                this.formData.menu_title_ru = null;
                this.formData.menu_title_en = null;
                this.formData.direction_id = null;
                this.formData.is_main = null;
                this.formData.order_id = null;
                this.formData.parent_id = null;

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
              if (this.validateMenus().length > 0) {
                    return;
              }
              if (this.selectedPage != null) {
                this.formData.page_id = this.selectedPage;
              }
              
              if(this.selectedMenu != null) {
                this.formData.parent_id = this.selectedMenu;
              }

              this.menuService.addMenu(this.formData).then(res =>{
                    if(res.data.is_success){
                      this.$toast.add({
                            severity: "success",
                            summary: this.$t("enuNewSite.createdMenuSuccessMsg"),
                            life: 3000,
                        });
                        console.log("Successfully added");
                        this.display = false;
                        this.formData.menu_title_kz = "";
                        this.formData.menu_title_en = null;
                        this.formData.menu_title_ru = null;
                        this.formData.is_main = null;
                        this.checked = null;
                        this.hideDialog();
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
            validateMenus() {
                this.formValid = [];
                if(!this.formData.menu_title_kz){
                    this.formValid.push({menu_title_kz: true})
                }
                if(!this.formData.menu_title_ru){
                    this.formValid.push({menu_title_ru: true})
                }
                if(!this.formData.menu_title_en){
                    this.formValid.push({menu_title_en: true})
                }
                // if(!this.formData.parent_id){
                //     this.formValid.push({parent_id: true})
                // }
                // if(!this.formData.page_id){
                //     this.formValid.push({page_id: true})
                // }
                // if(!this.formData.link){
                //     this.formValid.push({link: true})
                // }
                // if(!this.formData.is_main){
                //     this.formValid.push({is_main: true})
                // }
                // if(!this.formData.order_id){
                //     this.formValid.push({order_id: true})
                // }
                // if(!this.formData.direction_id){
                //     this.formValid.push({direction_id: true})

                // }
                return this.formValid;
            },
            setMainMenu(){
                if(this.formData.is_main === null){
                    this.formData.is_main = true;
                }else{
                    this.formData.is_main = null;
                }
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

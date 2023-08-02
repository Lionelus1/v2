<template>
    <Dialog v-model:visible="editMenuVisible" :style="{ width: '1000px' }"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }" :header="currentMenu ? $t('web.editMenu') : $t('web.addMenu')"
        :modal="true" class="p-fluid" @hide="hideDialog">
        <div class="field">
            <label>{{ $t("common.nameInQazaq") }}</label>
            <InputText v-model="formData.menu_title_kz" rows="3"
                :class="{ 'p-invalid': !formData.menu_title_kz && submitted }" />
            <small v-show="!formData.menu_title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
        </div>
        <div class="field">
            <label>{{ $t("common.nameInRussian") }}</label>
            <InputText v-model="formData.menu_title_ru" rows="3"
                :class="{ 'p-invalid': !formData.menu_title_ru && submitted }" />
            <small v-show="!formData.menu_title_ru && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
        </div>
        <div class="field">
            <label>{{ $t("common.nameInEnglish") }}</label>
            <InputText v-model="formData.menu_title_en" rows="3"
                :class="{ 'p-invalid': !formData.menu_title_en && submitted }" />
            <small v-show="!formData.menu_title_en && submitted" class="p-error">{{ $t("smartenu.titleEnInvalid") }}</small>
        </div>
        <div class="field" v-if="!currentMenu">
            <label>{{ $t('web.menuParent') }}</label>
            <TreeSelect v-model="selectedTreeMenu" :options="menus" :placeholder="$t('common.choose')"
                @node-expand="expandMenuTreeSelect" @nodeSelect="menuTreeSelect"></TreeSelect>
        </div>
        <div class="field">
            <label>{{ $t('web.menuType') }}</label>
            <div class="field-radiobutton">
                <RadioButton inputId="menuType1" name="menuType" :value="1" v-model="menuType" @change="typeChange" />
                <label for="menuType1">{{ $t('web.page') }}</label>
            </div>
            <div class="field-radiobutton">
                <RadioButton inputId="menuType2" name="menuType" :value="2" v-model="menuType" @change="typeChange" />
                <label for="menuType2">{{ $t('common.link') }}</label>
            </div>
        </div>
        <div class="field" v-if="menuType === 1">
            <label for="choose-page">{{ $t("web.selectMainPage") }}
                <a href="javascript:void(0)" @click="showAddPage" class="ml-2 text-underline">{{ $t('common.createNew')
                }}</a>
            </label>
            <Dropdown v-model="formData.page_id" optionDisabled="true" :options="pages" optionLabel="title_kz"
                optionValue="enu_page_id" :filter="true" :showClear="true" :placeholder="$t('web.selectPage')"
                :loading="pageLoading" />
        </div>
        <div class="field" v-if="menuType === 2">
            <label>{{ $t('common.link') }}</label>
            <InputText id="en-title" v-model="formData.link" :placeholder="$t('common.link')" />
        </div>


        <div class="field">
            <label>{{ $t('web.onMain') }}</label>
            <div>
                <Checkbox inputId="is_main" v-model="formData.is_main" :binary="true" />
                <label class="ml-2" for="is_main">{{ $t('common.yes') }}</label>
            </div>
        </div>
        <div class="field">
            <label>{{ $t('web.isHidden') }}</label>
            <div>
                <Checkbox inputId="hidden" v-model="formData.hidden" :binary="true" />
                <label class="ml-2" for="hidden">{{ $t('common.yes') }}</label>
            </div>
        </div>
        <div class="field">
            <label>{{ $t('web.addToUsefulLink') }}</label>
            <div>
                <Checkbox inputId="is_usefull_link" v-model="formData.is_usefull_link" :binary="true" />
                <label class="ml-2" for="is_main">{{ $t('common.yes') }}</label>
            </div>
        </div>
        <div class="field">
            <label>{{ $t('web.menuOrderLabel') }}</label>
            <InputNumber v-model="formData.order_id" name="order_id" />
        </div>
        <div class="field" v-if="formData.is_usefull_link">
            <label>{{ $t('web.usefulLinkDescKZ') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" v-model="formData.description_kz"
                maxlength="80"></Textarea>
        </div>
        <div class="field" v-if="formData.is_usefull_link">
            <label>{{ $t('web.usefulLinkDescRU') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" v-model="formData.description_ru"
                maxlength="80"></Textarea>
        </div>
        <div class="field" v-if="formData.is_usefull_link">
            <label>{{ $t('web.usefulLinkDescEN') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" v-model="formData.description_en"
                maxlength="80"></Textarea>
        </div>
        <div class="field">
            <label>{{ $t('web.bgImg') }}</label>
            <CustomFileUpload @upload="uploadFile" :accept="'image/*'" v-model="bgImg" :multiple="false"
                :preview="formData.background_image"></CustomFileUpload>
        </div>
        <template #footer>
            <Button v-if="currentMenu" :label="$t('common.save')" icon="pi pi-check"
                class="p-button p-component p-button-success mr-2" @click="editMenu" />
            <Button v-if="!currentMenu" :label="$t('common.add')" icon="pi pi-check"
                class="p-button p-component p-button-success mr-2" @click="addMenu" />
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger"
                @click="hideDialog" />
        </template>
    </Dialog>

    <Sidebar v-model:visible="addPageVisible" position="right" class="p-sidebar-lg " style="overflow-y: scroll">
        <AddPage></AddPage>
    </Sidebar>
</template>

<script>
import { EnuWebService } from "@/service/enu.web.service";
import AddPage from "@/components/enuwebsite/pages/AddPage.vue";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import {webEnuDomain} from "@/config/config";

export default {
    name: "AddMenu",
    props: ['isVisible', 'allPages', 'menu_id', 'currentMenu'],
    components: { AddPage, CustomFileUpload },
    data() {
        return {
            editMenuVisible: this.isVisible ?? false,
            addPageVisible: false,
            menus: null,
            pages: this.allPages ? this.allPages : [],
            menu: [],
            menuTitle: "",
            submitted: false,
            selectMenuVisible: true,
            selectPageVisible: true,
            customMenuLink: false,
            selectedPage: null,
            selectedMenu: this.currentMenu,
            enuService: new EnuWebService(),
            formData: this.currentMenu ? this.currentMenu : {
                menu_title_kz: null,
                menu_title_ru: null,
                menu_title_en: null,
                parent_id: this.menu_id ? this.menu_id : null,
                page_id: null,
                link: null,
                order_id: null,
                is_header: false,
                is_middle: false,
                icon: "",
                hidden: false

            },
            bgImg: null,
            formValid: [],
            menuType: !this.currentMenu ? 1 : this.currentMenu && this.currentMenu.page_id ? 1 : 2,
            checked: this.is_main ? this.is_main : null,
            menuTree: null,
            selectedTreeMenu: null,
            lazyParams: {
                page: 1,
                rows: 30,
                parent_id: this.currentMenu ? this.currentMenu.menu_id : null,
            },
            pageLoading: false,
            pageLazyParams: {
                searchText: null
            }
        };
    },

    created() {
        this.getMenus(null)
        this.getPages(null)
      console.log(this.menu_id)
      console.log(!this.currentMenu || !this.menu_id)
    },
    mounted() {
        this.emitter.on('pageCreated', data => {
            if (data) {
                this.addPageVisible = false;
                this.getPages(data);
            }
        });
    },
    methods: {
        typeChange() {
            if (this.menuType === 1) {
                this.formData.link = null
            }
        },
        expandMenuTreeSelect(node) {
            this.lazyParams.parent_id = Number(node.menu_id)
            this.parentNode = node
            this.getMenus(node)
        },
        getMenus(parentData) {
            this.loading = true;
            if (parentData == null) {
                this.lazyParams.parent_id = null;
            }
            this.enuService.getMenusTree(this.lazyParams).then(res => {
                if (parentData == null) {
                  this.menus = res.data.menus;
                  this.TN = res.data.tn_res;
                  this.total = res.data.total;
                  this.tableName = res.data.table_name;
                  if (this.menus) {
                    let index = 0;
                    this.menus = this.menus.filter(x => !x.link);
                    this.menus.map(e => {
                      e.label = e['menu_title_' + this.$i18n.locale];
                      e.key = index.toString();
                      e.children = [];
                      if (e.path) {
                        e.url = `${webEnuDomain}/${this.$i18n.locale}/page/${e.path}`
                      }
                      index++;
                    })
                  }
                } else {
                  parentData.children = res.data.menus;
                  parentData.children = parentData.children.filter(x => !x.link);
                  if (parentData.children) {
                    let index = 0;
                    parentData.children.map(e => {
                      e.label = e['menu_title_' + this.$i18n.locale];
                      e.key = `${e.key}-${index}`;
                      e.children = !e.leaf ? [] : null;
                      if (e.path) {
                        e.url = `${webEnuDomain}/${this.$i18n.locale}/page/${e.path}`
                      }
                      index++;
                    })
                  }
                }
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                this.$toast.add({
                    severity: "error",
                    summary: error,
                    life: 3000,
                });
            });
        },
        mapMenu(menus) {
            menus.map(e => {
                e.label = e['menu_title_' + this.$i18n.locale];
                e.key = e.menu_id;
                e.children = [];
            });
        },
        menuTreeSelect(node) {
            this.formData.parent_id = node.menu_id;
        },
        uploadFile(event) {
            this.bgImg = event.files
        },
        addMenu() {
            this.submitted = true;
            if (!this.validateMenus()) {
                return;
            }

            const fd = new FormData();
            fd.append('menu', JSON.stringify(this.formData))
            if (this.bgImg) fd.append('background_image', this.bgImg[0]);

            this.enuService.addMenu(fd).then(res => {
                if (res.data.is_success) {
                    this.formData = {};
                    this.hideDialog();
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("web.createdMenuSuccessMsg"),
                        life: 3000,
                    });
                }
            }).catch(error => {
              console.log(error)
                this.$toast.add({
                    severity: "error",
                    summary: error,
                    life: 3000,
                });
            });
        },
        editMenu() {
            this.submitted = true;
            if (!this.validateMenus()) {
                return;
            }

            const fd = new FormData();
            fd.append('menu', JSON.stringify(this.formData))
            if (this.bgImg) fd.append('background_image', this.bgImg[0]);
            let orderID = parseInt(this.order_id)
            if (this.order_id) fd.append('order_id', orderID)

            this.enuService.editMenu(fd).then(res => {
                if (res.data.is_success) {
                    this.formData = {};
                    this.hideDialog();
                    this.$toast.add({
                        severity: "success",
                        summary: this.$t("common.success"),
                        life: 3000,
                    });
                }
            }).catch(error => {
                this.$toast.add({
                    severity: "error",
                    summary: error,
                    life: 3000,
                });
            });
        },
        onPageLoad(event) {
            //this.pageLazyParams.searchText = event.value;
            //this.getPages(null)
        },
        getPages(data) {
            this.pageLoading = true;
            this.enuService.getAllPagesBySlug(this.pageLazyParams).then(res => {
                this.pages = res.data.pages;
                if (data)
                    this.formData.page_id = data.enu_page_id;
                this.pageLoading = false;
            }).catch(error => {
                this.pageLoading = false;
                this.$toast.add({
                    severity: "error",
                    summary: error,
                    life: 3000,
                });
            });
        },
        hideDialog() {
            this.emitter.emit('addEditMenuDialogHide', true);
            this.selectedMenu = null;
            this.selectedPage = null;
            this.submitted = false;
            this.formData.menu_title_kz = null;
            this.formData.menu_title_ru = null;
            this.formData.menu_title_en = null;
            this.formData.direction_id = null;
            this.formData.is_main = null;
            this.formData.order_id = null;
            this.formData.parent_id = null;
        },
        showAddPage() {
            this.addPageVisible = true;
        },
        validateMenus() {
            let errors = [];
            if (!this.formData.menu_title_kz) {
                errors.push(1)
            }
            if (!this.formData.menu_title_ru) {
                errors.push(1)
            }
            if (!this.formData.menu_title_en) {
                errors.push(1)
            }

            if (this.menuType === 1 && !this.formData.page_id) {
                errors.push(1)
            }
            if (this.menuType === 2 && !this.formData.link) {
                errors.push(1)
            }
            // if (this.menuType === 3 && !this.formData.link) {
            //     errors.push(1)
            // }
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
            return errors.length === 0;
        },
    }
}
</script>

<style lang="scss" scoped>
.field-radiobutton {
    align-items: center;
    display: flex;
    margin-bottom: 1rem;

    label {
        line-height: 1;
        margin-left: 0.5rem;
    }
}

.text-underline {
    text-decoration: underline;
}
</style>
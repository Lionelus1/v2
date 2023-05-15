<template>
    <div class="col-12">
        <h3>{{ $t("web.menuPage") }}</h3>
        <div class="card">
            <Button :label="$t('web.addMenu')" icon="pi pi-plus" class="ml-2" v-on:click="createMenu"/>
        </div>
        <div class="card">
            <TabView>
        <TabPanel :header="$t('web.properties')">
            <TreeTable class="p-treetable-sm" :value="menus" :lazy="true" :loading="loading"
                       @nodeExpand="onExpand" scrollHeight="flex" responsiveLayout="scroll"
                       :resizableColumns="true" columnResizeMode="fit" :paginator="true" :rows="10" :total-records="total" @page="onPage($event)">
                <template #header>
                    <div class="text-right">
                        <div class="p-input-icon-left">
                            <i class="pi pi-search"/>
                            <InputText type="search" v-model="filter.search_text" :placeholder="$t('common.search')"
                                       @search="getMenus(null)"/>
                            <Button icon="pi pi-search" class="ml-1" @click="getMenus(null)"/>
                        </div>
                    </div>
                </template>
                <template #empty> {{ $t('common.noData') }}</template>
                <template #loading> {{ $t('common.loading') }}</template>
                <Column field="menu_title_kz" :header="$t('common.nameIn')" :expander="true" style="min-width:300px">
                    <template #body="{ node }">
                    <span><i class="fa-solid fa-folder"></i>&nbsp;
                      {{ $i18n.locale === 'kz' ? node.menu_title_kz : $i18n.locale === 'ru' ? node.menu_title_ru : node.menu_title_en }}
                        (<a :href="node.url" target="_blank">{{ $t('common.link') }}</a>)
                      <Badge :value="$t('web.isHidden')" v-if="node.hidden"></Badge>
                    </span>
                    </template>
                </Column>
                <Column field="page" :header="$t('web.menuMainPage')">
                    <template #body="{ node }">
                        <a href="javascript:void(0)" @click="viewPage(node)">{{ showPage(node) }}</a>
                        <span>{{ node.page && node.page.is_plugin ? ' (Landing page)' : '' }}</span>
                    </template>
                </Column>
                <Column field="link" :header="$t('common.link')">
                    <template #body="{ node }">
                        <a v-if="node.link" :href="node.link" target="_blank">{{ node.link }}</a>
                    </template>
                </Column>
                <Column field="create_date" :header="$t('faq.createDate')" :sortable="true">
                    <template #body="{ node }">
                        {{ formatDate(node.create_date) }}
                    </template>
                </Column>
                <Column field="actions" header="" class="text-right">
                    <template #body="{ node }">
                        <Button type="button" icon="fa-solid fa-plus" class="p-button-sm mr-2" @click="createMenu(node)"></Button>
                        <Button type="button" icon="fa-solid fa-pen" class="p-button-sm mr-2" @click="editMenu(node)"></Button>
                        <Button type="button" icon="fa-solid fa-trash" class="p-button-sm p-button-danger" @click="deleteConfirm(node)"></Button>
                    </template>
                </Column>
            </TreeTable>
        </TabPanel>
        <TabPanel :header="$t('web.history')">
          <WebLogs/>
        </TabPanel>
      </TabView>
        </div>
    </div>

    <AddMenu v-if="addMenuVisible" :is-visible="addMenuVisible" :all-pages="pages" :all-menus="menus" :current-menu="selectedMenu"
             :menu_id="parentId"></AddMenu>
    <PageView v-if="viewPageVisible" :is-visible="viewPageVisible" :selectedPage="selectedViewMenu"></PageView>
</template>

<script>
import {EnuWebService} from "@/service/enu.web.service";
import AddMenu from "@/components/enuwebsite/AddMenu.vue";
import PageView from "@/components/enuwebsite/PageView.vue";
import {formatDate} from "@/helpers/HelperUtil";
import {webEnuDomain} from "@/config/config";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";

export default {
    name: "EnuMenuList",
    components: {AddMenu, PageView, WebLogs},
    data() {
        return {
            addMenuVisible: false,
            viewPageVisible: false,
            menus: null,
            pages: [],
            submitted: false,
            selectedMenu: null,
            selectedViewMenu: null,
            enuService: new EnuWebService(),
            loading: false,
            total: 0,
            tableName: null,
            parentNode: null,
            filter: {
                search_text: null
            },
            lazyParams: {
                page: 1,
                rows: 10,
                parent_id: null,
            },
            parentId: null
        };
    },
    created() {
        this.getMenus();
        this.getPages();
    },
    mounted() {
        this.emitter.on('addEditMenuDialogHide', data => {
            if (data) this.hideDialog();
        });
        this.emitter.on('pageViewModalClose', data => {
            this.viewPageVisible = data;
        });
    },
    methods: {
        formatDate,
        webDomain: webEnuDomain,
        onExpand(node) {
            this.lazyParams.parent_id = Number(node.menu_id)
            this.parentNode = node
            this.getMenus(node)
        },
        getMenus(parentData) {
            this.loading = true;
            if (parentData == null) {
                this.lazyParams.parent_id = null;
            }
            if (this.filter.search_text) this.lazyParams.filter = this.filter;
            this.enuService.getMenusTree(this.lazyParams).then(res => {
                if (parentData == null) {
                    this.menus = res.data.menus;
                    this.total = res.data.total;
                    this.tableName = res.data.table_name;
                    if (this.menus) {
                        this.menus.map(e => {
                            if (e.path) {
                                e.url = `${webEnuDomain}/${this.$i18n.locale}/page/${e.path.replaceAll("/", "%2F")}`
                            }
                        })
                    }
                } else {
                    parentData.children = res.data.menus;
                    if (parentData.children) {
                        parentData.children.map(e => {
                            if (e.path) {
                                e.url = `${webEnuDomain}/${this.$i18n.locale}/page/${e.path.replaceAll("/", "%2F")}`
                            }
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
        getPages() {
            this.pages = [];
            this.enuService.getAllPages({}).then(res => {
                if (res.data) {
                    this.pages = res.data.pages;
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
        onPage(event) {
            this.lazyParams.page = event.page + 1;
            this.lazyParams.rows = event.rows
            this.getMenus(null);
        },
        createMenu(data) {
            if (data) this.parentId = data.menu_id;
            this.addMenuVisible = true;
        },
        editMenu(data) {
            this.selectedMenu = data;
            this.addMenuVisible = true;
        },
        viewPage(data) {
            if (data.page && data.page.is_landing) {
                this.$router.push({name: 'LandingPageView', params: {id: data.page.enu_page_id}})
            } else {
                this.selectedViewMenu = data.page;
                this.viewPageVisible = true;
            }
        },
        deleteConfirm(node) {
            this.$confirm.require({
                message: this.$t('common.doYouWantDelete'),
                header: this.$t('common.delete'),
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-rounded p-button-success',
                rejectClass: 'p-button-rounded p-button-danger',
                accept: () => {
                    this.onDelete(node.menu_id);
                },
            });
        },
        onDelete(id) {
            this.enuService.deleteMenu(id).then(res => {
                if (res.data && res.data.is_success) {
                    this.$toast.add({severity: "success", summary: "Successfully deleted", life: 3000});
                }
                this.getMenus(this.parentNode || null);
            }).catch(error => {
                this.$toast.add({severity: "error", summary: error, life: 3000});
            });
        },
        showPage(data) {
            let title = ""
            if (data && data.page) {
                title = this.$i18n.locale === 'kz' ? data.page.title_kz : this.$i18n.locale === 'ru' ? data.page.title_ru : data.page.title_en;
            }
            return title;
        },
        hideDialog() {
            this.getMenus(this.parentNode);
            this.addMenuVisible = false;
            this.selectedMenu = null;
        },

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

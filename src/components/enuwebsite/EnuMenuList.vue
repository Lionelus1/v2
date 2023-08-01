<template>
    <div class="col-12">
        <h3>{{ $t("web.menuPage") }}</h3>
        <div class="card">
            <Button :label="$t('web.addMenu')" icon="pi pi-plus" class="ml-2" v-on:click="createMenu" />
        </div>
        <div class="card">
            <TabView>
                <TabPanel :header="$t('web.properties')">
                    <TreeTable class="p-treetable-sm" :value="menus" :lazy="true" :loading="loading" @nodeExpand="onExpand"
                        scrollHeight="flex" responsiveLayout="scroll" :resizableColumns="true" show-gridlines
                        columnResizeMode="fit" :paginator="true" :rows="10" :total-records="total" @page="onPage($event)">
                        <template #header>
                            <div class="text-left"></div>
                            <div class="text-right">
                                <Button type="button" icon="pi pi-search" :label="$t('common.search')"
                                    @click="toggle('global-filter', $event)" aria:haspopup="true"
                                    aria-controls="overlay_panel" class="p-button-info p-1"><i
                                        class="fa-solid fa-filter fa-xl"></i>&nbsp;{{
                                            $t('common.filter')
                                        }}
                                </Button>&nbsp;
                                <OverlayPanel ref="global-filter">
                                    <div v-for="text in menu_radio_options" :key="text" class="flex align-items-center">
                                        <div class="field-radiobutton">
                                            <RadioButton v-model="selectedMenuType" :value="text.value" />
                                            <label :for="text" class="ml-2">{{ text.text }}</label>
                                        </div>
                                    </div>
                                    <div class="p-fluid">
                                        <div class="field">
                                            <br />

                                            <Button icon="pi pi-trash" class="ml-1" @click="clearMenuTypeFilter()"
                                                :label="$t('common.clear')" />
                                        </div>
                                        <div class="field">
                                            <Button icon="pi pi-search" :label="$t('common.search')" class="ml-1"
                                                @click="orderColumn(null)" />
                                        </div>
                                    </div>
                                </OverlayPanel>
                                <div class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText type="search" v-model="filter.search_text" :placeholder="$t('common.search')"
                                        @search="getMenus(null)" />
                                    <Button icon="pi pi-search" class="ml-1" @click="getMenus(null)" />
                                </div>
                            </div>
                        </template>
                        <template #empty> {{ $t('common.noData') }}</template>
                        <template #loading> {{ $t('common.loading') }}</template>
                        <Column field="menu_title_kz" :header="$t('common.nameIn')" :expander="true"
                            style="min-width:300px">
                            <template #body="{ node }">
                                <span><i class="fa-solid fa-folder"></i>&nbsp;
                                    {{ $i18n.locale === 'kz' ? node.menu_title_kz : $i18n.locale === 'ru' ?
                                        node.menu_title_ru : node.menu_title_en }}
                                    (<a :href="node.url" target="_blank">{{ $t('common.link') }}</a>)
                                    <Badge :value="$t('web.isHidden')" v-if="node.hidden"></Badge>
                                </span>
                            </template>
                        </Column>
                        <Column field="page" :header="$t('web.menuMainPage')">
                            <template #body="{ node }">
                                <a href="javascript:void(0)" @click="viewPage(node)">{{ showPage(node) }}</a>
                                <span>{{ node.page && node.page.is_plugin ? ' (Landing page)' : '' }}</span>
                            </template>filter.menu_type.is_main
                        </Column>
                        <Column field="link" :header="$t('common.link')">
                            <template #body="{ node }">
                                <a v-if="node.link" :href="node.link" target="_blank">{{ node.link }}</a>
                            </template>
                        </Column>
                        <Column field="viewCount" :header="$t('web.viewCount')">
                            <template #body="{ node }">
                                <span v-if="node.view_count !== null">{{ node.view_count }} {{ $t('web.viewTimes') }}</span>
                                <span v-else>{{ 0 }} {{ $t('web.viewTimes') }}</span>

                            </template>
                        </Column>
                        <div v-if="showOrderColumn">
                            <Column
                                v-if="filter.menu_type.is_usefull_link || filter.menu_type.is_header || filter.menu_type.is_middle"
                                field="order" :header="$t('web.menuOrder')">
                                <template #body="{ node }">
                                    <span class="p-buttonset">
                                        <Button class="p-button-outlined" icon="pi pi-angle-up"
                                            @click="reOrderMenu(node, true)" />
                                        <Button class="p-button-outlined" icon="pi pi-angle-down"
                                            @click="reOrderMenu(node, false)" />
                                    </span>

                                </template>
                            </Column>
                        </div>

                        <Column field="create_date" :header="$t('faq.createDate')" :sortable="true">
                            <template #body="{ node }">
                                {{ formatDate(node.create_date) }}
                            </template>
                        </Column>
                        <Column field="actions" header="" class="text-right">
                            <template #body="{ node }">
                                <Button type="button" icon="fa-solid fa-plus" class="p-button-sm mr-2"
                                    @click="createMenu(node)"></Button>
                                <Button type="button" icon="fa-solid fa-pen" class="p-button-sm mr-2"
                                    @click="editMenu(node)"></Button>
                                <Button type="button" icon="fa-solid fa-trash" class="p-button-sm p-button-danger"
                                    @click="deleteConfirm(node)"></Button>
                            </template>
                        </Column>
                    </TreeTable>
                </TabPanel>
                <TabPanel :header="$t('web.history')">
                    <WebLogs :TN="TN" :key="TN" />
                </TabPanel>
            </TabView>
        </div>
    </div>
    <AddMenu v-if="addMenuVisible" :is-visible="addMenuVisible" :all-pages="pages"
        :current-menu="selectedMenu" :menu_id="parentId"></AddMenu>
    <PageView v-if="viewPageVisible" :is-visible="viewPageVisible" :selectedPage="selectedViewMenu"></PageView>
</template>

<script>
import { EnuWebService } from "@/service/enu.web.service";
import AddMenu from "@/components/enuwebsite/AddMenu.vue";
import PageView from "@/components/enuwebsite/PageView.vue";
import { formatDate } from "@/helpers/HelperUtil";
import { webEnuDomain } from "@/config/config";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";
import { onMounted, ref } from "vue"


export default {
    name: "EnuMenuList",
    components: { AddMenu, PageView, WebLogs },
    data() {
        return {
            addMenuVisible: false,
            viewPageVisible: false,
            menus: null,
            TN: null,
            pages: [],
            submitted: false,
            selectedMenu: null,
            selectedViewMenu: null,
            enuService: new EnuWebService(),
            loading: false,
            total: 0,
            tableName: null,
            parentNode: null,
            selectedMenuType: null,
            showOrderColumn: false,
            menuList: ref({}),
            menu_radio_options: [
                {
                    text: this.$t('web.mainMenu'),
                    value: 'is_main'
                },
                {
                    text: this.$t('web.headerMenu'),
                    value: 'is_header'
                },
                {
                    text: this.$t('web.middleMenu'),
                    value: 'is_middle'
                },
                {
                    text: this.$t('web.usefulMenu'),
                    value: 'is_usefull_link'
                }
            ],

            filter: {
                search_text: null,
                menu_type: {

                }
            },
            lazyParams: {
                page: 1,
                rows: 10,
                parent_id: null,
                is_child: false
            },
            parentId: null,
            isGlobalFilter: false,
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
        toggle(ref, event) {
            this.$refs[ref].toggle(event);
        },

        reOrderMenu(node, up) {
            const index = this.menus.findIndex(x => x.menu_id === node.menu_id);
            if (up) {
                const current = this.menus[index];
                const prev = this.menus[index - 1];

                let data = {
                    drag_id: current.menu_id,
                    drop_id: prev ? prev.menu_id : null,
                    position: "up",
                };
                this.enuService.orderMenuList(data)
                    .then(res => {
                        if (res.data && res.data.is_success) {
                            this.getMenus();
                        } else {
                            this.toast.add({ severity: "error", summary: this.i18n.t('common.error'), life: 3000 });
                        }
                    })
                    .catch(error => {
                        this.toast.add({ severity: "error", summary: error, life: 3000 });
                    });
            } else {
                const current = this.menus[index];
                let next = this.menus[index + 1];

                let data = {
                    drag_id: current.menu_id,
                    drop_id: next ? next.menu_id : null,
                    position: "down",
                };
                this.enuService.orderMenuList(data)
                    .then(res => {
                        if (res.data && res.data.is_success) {
                            this.getMenus();
                        } else {
                            this.toast.add({ severity: "error", summary: this.i18n.t('common.error'), life: 3000 });
                        }
                    })
                    .catch(error => {
                        this.toast.add({ severity: "error", summary: error, life: 3000 });
                    });
            }
        },
        onExpand(node) {
            this.lazyParams.parent_id = Number(node.menu_id)
            this.lazyParams.is_child = true
            this.parentNode = node
            this.getMenus(node)
        },
        getMenus(parentData) {
            this.loading = true;
            if (parentData == null) {
                this.lazyParams.parent_id = null;
            }
            if (this.filter.search_text) this.lazyParams.filter = this.filter;
            if (this.filter.menu_type) this.lazyParams.filter = this.filter;
            this.enuService.getMenusTree(this.lazyParams).then(res => {
                if (parentData == null) {
                    this.menus = res.data.menus;
                    this.TN = res.data.tn_res;
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
        orderColumn() {
            if (this.selectedMenuType === "is_main") {
                this.filter.menu_type.is_main = true
                this.filter.menu_type.is_header = null
                this.filter.menu_type.is_middle = null
                this.filter.menu_type.is_usefull_link = null
            }
            if (this.selectedMenuType === "is_header") {
                this.filter.menu_type.is_main = null
                this.filter.menu_type.is_header = true
                this.filter.menu_type.is_middle = null
                this.filter.menu_type.is_usefull_link = null
            }
            if (this.selectedMenuType === "is_middle") {
                this.filter.menu_type.is_main = null
                this.filter.menu_type.is_header = null
                this.filter.menu_type.is_middle = true
                this.filter.menu_type.is_usefull_link = null
            }
            if (this.selectedMenuType === "is_usefull_link") {
                this.filter.menu_type.is_main = null
                this.filter.menu_type.is_header = null
                this.filter.menu_type.is_middle = null
                this.filter.menu_type.is_usefull_link = true
            }

            this.getMenus();
            this.showOrderColumn = true;
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
        clearMenuTypeFilter() {
            this.filter.menu_type.is_main = null;
            this.filter.menu_type.is_header = null;
            this.filter.menu_type.is_middle = null;
            this.filter.menu_type.is_usefull_link = null;
            this.selectedMenuType = null;
            this.getMenus();
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
                this.$router.push({ name: 'LandingPageView', params: { id: data.page.enu_page_id } })
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
                    this.$toast.add({ severity: "success", summary: "Successfully deleted", life: 3000 });
                }
                this.getMenus(this.parentNode || null);
            }).catch(error => {
                this.$toast.add({ severity: "error", summary: error, life: 3000 });
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

<template>
    <ConfirmPopup group="deleteResult"></ConfirmPopup>
    <div class="col-12">
        <h3>{{ $t("web.pageLink") }}</h3>
        <div class="card">
            <Button :label="$t('web.addPage')" icon="pi pi-plus" class="ml-2" @click="createPage" />
        </div>

        <div class="card">
            <TabView>
                <TabPanel :header="$t('web.properties')">
                    <DataTable :value="pages" responsiveLayout="scroll" :lazy="true" dataKey="enu_page_id"
                        :loading="loading" :rows="10" :rowHover="true" :paginator="true" :totalRecords="total"
                        @page="onPage" @sort="onSort">
                        <template #header>
                            <div class="text-right">
                                <div class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText type="search" v-model="lazyParams.searchText"
                                        :placeholder="$t('common.search')" @search="getPages" />
                                    <Button icon="pi pi-search" class="ml-1" @click="getPages" />
                                </div>
                            </div>
                        </template>
                        <template #empty>{{ this.$t("common.recordsNotFound") }}</template>
                        <template #loading>{{ this.$t("common.recordsLoading") }}</template>
                        <Column :field="'title_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
                            <template #body="{ data }">
                                {{ $i18n.locale === 'kz' ? data.title_kz : $i18n.locale === 'ru' ? data.title_ru :
                                    data.title_en }}
                            </template>
                        </Column>
                        <Column field="is_landing" header="Landing page" sortable>
                            <template #body="{ data }">
                                {{ data.is_landing ? 'Landing page' : '' }}
                            </template>
                        </Column>
                        <Column field="create_date" :header="$t('faq.createDate')" sortable>
                            <template #body="{ data }">
                                {{ formatDate(data.create_date) }}
                            </template>
                        </Column>
                        <!-- <Column field="faculty_name" :header="$t('web.facultyName')" sortable>
                            <template #body="{ data }">
                                {{ $i18n.locale === 'kz' ? data.faculty_name.faculty_name_kz : $i18n.locale === 'ru' ? data.faculty_name.faculty_name_ru :
                                    data.faculty_name.faculty_name_en }}
                            </template>
                        </Column> -->
                        <Column header="" style="text-align: right;">
                            <template #body="{ data }">
                                <ActionButton :items="initItems" @toggle="toggle(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </TabPanel>
                <TabPanel :header="$t('web.history')" @click="getTableLogs()">
                    <WebLogs :TN="TN" :key="TN" />
                </TabPanel>
            </TabView>

        </div>
    </div>

    <Sidebar v-model:visible="display" position="right" class="p-sidebar-lg " style="overflow-y: scroll;width: 50%;">
        <AddPage></AddPage>
    </Sidebar>
    <PageView v-if="pageView" :is-visible="pageView" :selectedPage="selectedPage"></PageView>
</template>

<script>
import { EnuWebService } from "@/service/enu.web.service";
import PageView from "@/components/enuwebsite/PageView.vue";
import { formatDate } from "@/helpers/HelperUtil";
import { FileService } from "../../../service/file.service";
import { downloadRoute, fileRoute, getHeader, smartEnuApi } from "../../../config/config";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";
import AddPage from "@/components/enuwebsite/pages/AddPage.vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
    name: "EnuPagesList",
    components: {ActionButton, AddPage, PageView, WebLogs },
    data() {
        return {
            pages: [],
            editPage: [],
            enuPageID: null,
            pageTitle: "",
            display: false,
            pageView: false,
            deleteVisible: false,
            pageData: null,
            TN: null,
            addButtonName: this.addPage,
            submitted: false,
            loading: false,
            enuService: new EnuWebService(),
            formValid: [],
            selectedPage: {
                enu_page_id: null,
                title_kz: null,
                title_ru: null,
                title_en: null,
                content_kz: null,
                content_ru: null,
                content_en: null,
            },
            lazyParams: {
                page: 0,
                rows: 10,
                searchText: null,
                sortField: null,
                sortOrder: 0
            },
            total: 0,
            fileService: new FileService(),
            fileList: [],
            actionsNode: null
        }
    },
    created() {
        this.getPages();
    },
    mounted() {
        this.emitter.on('pageViewModalClose', data => {
            this.pageView = data;
        });
        this.emitter.on('pageCreateEditMsg', () => {
            this.$toast.add({severity: "success", summary: this.$t("common.success"), life: 3000});
        })
        this.emitter.on('pageCreated', _ => {
           this.display = false;
           this.getPages();
        });
    },
    methods: {
        formatDate,
        getPages() {
            this.loading = true;
            this.enuService.getAllPages(this.lazyParams).then(res => {
                if (res.data) {
                    this.pages = res.data.pages;
                    this.total = res.data.total;
                    this.TN = res.data.tn_res;
                }
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                this.$toast.add({ severity: "error", summary: error, life: 3000 });
            });
        },
        onPage(event) {
            this.lazyParams.page = event.page
            this.lazyParams.rows = event.rows
            this.getPages();
        },
        onSort(event) {
            this.lazyParams.sortField = event.sortField;
            this.lazyParams.sortOrder = event.sortOrder;
            this.getPages();
        },
        createPage() {
            this.display = true;
        },
        delPage(data) {
            this.$confirm.require({
                message: this.$t('common.doYouWantDelete'),
                header: this.$t('common.delete'),
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-rounded p-button-success',
                rejectClass: 'p-button-rounded p-button-danger',
                accept: () => {
                    this.onDeletePage(data.enu_page_id);
                },
            });
        },
        onDeletePage(id) {
            this.enuService.deletePage(id).then(res => {
                if (res.data !== null) {
                    this.$toast.add({
                        severity: "success",
                        summary: "Successfully deleted",
                        life: 3000,
                    });
                }
                this.getPages();
            }).catch(error => {
                this.$toast.add({ severity: "error", summary: error, life: 3000 });
            });
            this.deleteVisible = false;

        },
        onView(data) {
            if (data.is_landing) {
                this.$router.push({ name: 'LandingPageView', params: { id: data.enu_page_id } })
            } else {
                this.selectedPage = data;
                this.pageView = true;
            }
        },
        onEditPage(data) {
            /*this.addButtonName = this.onSavePage;
            this.display = true;
            this.formData = data;*/
            this.$router.push({name: 'EditPage', params: {id: data.enu_page_id, pageData: data}});
        },
        toggle(node) {
            this.actionsNode = node
        },
    },
    computed: {
        initItems() {
            return [
                {
                    label: this.$t('common.show'),
                    icon: 'fa-solid fa-eye',
                    command: () => {
                        this.onView(this.actionsNode)
                    }
                },
                {
                    label: this.$t('common.edit'),
                    icon: 'fa-solid fa-pen',
                    command: () => {
                        this.onEditPage(this.actionsNode)
                    }
                },
                {
                    label: this.$t('common.delete'),
                    icon: 'fa-solid fa-trash',
                    command: () => {
                        this.delPage(this.actionsNode)
                    }
                },

            ];
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

::v-deep(.ck-editor__editable) {
    height: 320px;
}

.p-fileupload-row {
    display: flex;
    align-items: center;
}</style>
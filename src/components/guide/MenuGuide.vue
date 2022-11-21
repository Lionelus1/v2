<template>
    <Button v-show="role"
            :label="$t('common.add')"
            icon="pi pi-plus"
            class="p-button-success p-mr-2 add_guide"
            @click="createGuide()"
    />
    <TreeTable class="p-treetable-sm" :value="guides" :loading="loading" :lazy="true"
               @nodeExpand="onExpand" @page="onPage"
               selectionMode="single" v-model:selectionKeys="currentNode">
        <Column field="queueName" :expander="true">
        </Column>
        <Column field="responsibles">
            <template #body="slotProps">
                <div>
                    <div v-for="i in slotProps" :key="i">
                        <!--<a @click="navigateToEvent(i)"></a>-->
                        <div @click="navigateToEvent(i)">
                            {{$i18n.locale === 'kz'
                            ? i.name
                            : $i18n.locale === 'ru'
                            ? i.nameRu
                            : i.nameEn}}
                        </div>
                    </div>
                </div>

            </template>
        </Column>
        <Column>
            <template #body="slotProps">
                <div v-show="role">
                    <Button type="button" icon="fa-solid fa-cog"
                            @click="onNodeSelect(slotProps.node),toggle('op', $event)"
                            aria-controls="overlay_panel" class="p-button-link"/>
                    <OverlayPanel ref="op">
                        <div class="overlay_buttons">
                            <Button
                                    icon="pi pi-plus"
                                    v-tooltip.bottom="$t('common.add')"
                                    class="p-button-success"
                                    @click="createGuide(parent)"/>
                            <Button
                                    icon="pi pi-pencil"
                                    v-tooltip.bottom="$t('common.edit')"
                                    class="p-button-warning"
                                    @click="editGuide(parent)"/>
                            <Button
                                    icon="pi pi-trash"
                                    v-tooltip.bottom="$t('common.delete')"
                                    class="p-button-danger"
                                    @click="delGuide(parent)"/>
                        </div>
                    </OverlayPanel>
                </div>
            </template>
        </Column>
    </TreeTable>
    <AddGuide v-if="addViewVisible" :is-visible="addViewVisible" :selected-guide="selectedGuide"/>
    <EditGuide v-if="editViewVisible" :is-visible="editViewVisible" :selected-guide="selectedGuide"/>
</template>

<script>
    import axios from "axios";
    import {findRole, getHeader, smartEnuApi} from "@/config/config";
    import AddGuide from "./AddGuide";
    import EditGuide from "./EditGuide";

    export default {
        name: "MenuGuide",
        components: {AddGuide, EditGuide},
        data() {
            return {
                role: {},
                currentNode: null,
                findRole: findRole,
                selectedGuide: {},
                addViewVisible: false,
                editViewVisible: false,
                expandedKeys: {},
                loading: false,
                lazyParams: {
                    parentId: null,
                },
                guides: [],
                parent: null
            }
        },
        methods: {
            getGuides(parentId, parent) {
                this.lazyParams.parentId = parentId
                this.loading = true
                axios
                    .post(smartEnuApi + "/manual/getManuals", this.lazyParams, {
                        headers: getHeader(),
                    })
                    .then((response) => {
                        if (parentId !== null) {
                            parent.children = response.data.manuals;
                        } else {
                            this.guides = response.data.manuals;
                        }
                        this.guides.map(e => {
                            e.leaf = false;
                        })
                        this.loading = false;
                    })
                    .catch((error) => {
                        if (error.response.status === 401) {
                            this.$store.dispatch("logLout");
                        } else {
                            this.$toast.add({
                                severity: "error",
                                summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
                                life: 3000,
                            });
                        }
                    });
            },
            toggle(ref, event) {
                this.$refs[ref].toggle(event);
            },
            onNodeSelect(node) {
                this.parent = node;
            },
            createGuide(item) {
                this.selectedGuide = item;
                this.addViewVisible = true;
            },
            editGuide(item) {
                this.selectedGuide = item;
                this.editViewVisible = true;
            },
            delGuide(event) {
                console.log('rr', event.manualId)
                this.$confirm.require({
                    message: this.$t('common.doYouWantDelete'),
                    header: this.$t('common.delete'),
                    icon: 'pi pi-info-circle',
                    acceptClass: 'p-button-rounded p-button-success',
                    rejectClass: 'p-button-rounded p-button-danger',
                    accept: () => {
                        this.delete(event);
                    },
                });
            },
            delete(event) {
                //console.log(event)
                axios.post(smartEnuApi + `/manual/delManual/${event.manualId}`, null, {headers: getHeader()})
                    .then(response => {
                        if (response.data.is_success) {
                            this.$toast.add({
                                severity: "success",
                                summary: this.$t('common.success'),
                                life: 3000,
                            });
                            this.getGuides();
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
            navigateToEvent(event) {
                this.$router.push({name: 'MainGuide', params: {id: event.pageLink}});
            },
            onExpand(node) {
                this.getGuides(node.key, node)
            },
            onPage(event) {
                this.lazyParams = event;
                this.getGuides(null, null)
            },
        },
        created() {
            this.role = this.findRole(null, "personal");
            this.getGuides(null, null);
        },
        mounted() {
            this.emitter.on('addViewModalClose', data => {
                this.addViewVisible = data;
                this.getGuides(null, null);
            });
            this.emitter.on('editViewModalClose', data => {
                this.editViewVisible = data;
                this.getGuides(null, null);
            });
        },
    }
</script>

<style lang="scss" scoped>

    .overlay_buttons {
        width: 120px;
        display: flex;
        justify-content: space-between;
    }
</style>

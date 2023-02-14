<template>
    <div v-if="guide">
        <div class="card" v-if="guide.name">
            <div class="title">
                {{$i18n.locale === "kz"
                ? guide.name
                : $i18n.locale === "ru"
                ? guide.nameRu
                : guide.nameEn }}
            </div>
        </div>
        <div class="card">
            <div v-if="role && !editViewVisible">
                <Message v-for="msg of formValid" severity="error" :key="msg">{{
                    msg
                    }}
                </Message>
                <TabView>
                    <TabPanel header="Қазақша">
                        <div class="field">
                            <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
                            <Editor v-model="guide.content"
                                    id="kz-content"
                                    editorStyle="height: 500px"
                            />
                            <small class="p-error" v-show="formValid.content && submitted">
                                {{ $t("smartenu.contentKzInvalid") }}
                            </small>
                        </div>
                    </TabPanel>
                    <TabPanel header="Русский">
                        <div class="field">
                            <label for="ru-content">{{$t("common.contentInRussian")}}</label>
                            <Editor v-model="guide.contentRu"
                                    id="ru-content"
                                    editorStyle="height: 500px"
                            />
                            <small class="p-error" v-show="formValid.contentRu && submitted">
                                {{ $t("smartenu.contentRuInvalid") }}
                            </small>
                        </div>
                    </TabPanel>
                    <TabPanel header="English">
                        <div class="field">
                            <label for="en-content">{{
                                $t("common.contentInEnglish")
                                }}</label>
                            <Editor v-model="guide.contentEn"
                                    id="en-content"
                                    editorStyle="height: 500px"
                            />
                            <small class="p-error" v-show="formValid.contentEn && submitted">
                                {{ $t("smartenu.contentEnInvalid") }}
                            </small>
                        </div>
                    </TabPanel>
                </TabView>
                <Button
                        v-bind:label="$t('common.save')"
                        icon="pi pi-check"
                        class="p-button p-component p-button-success mr-2"
                        @click="insertGuide"
                />
            </div>
            <div style="text-align: center" v-show="!role" v-html=
                    "$i18n.locale === 'kz'
                    ? guide.content
                    : $i18n.locale === 'ru'
                    ? guide.contentRu
                    : guide.contentEn">
            </div>
            <div v-show="notGuide && !guide.name" style="text-align: center">
                <h3>{{$t('guide.notGuide') }}</h3>
            </div>
        </div>
    </div>
    <AddGuide v-if="addViewVisible" :is-visible="addViewVisible" :selected-guide="selectedGuide"/>
    <EditGuide v-if="editViewVisible" :is-visible="editViewVisible" :selected-guide="selectedGuide"/>
</template>

<script>
    import axios from "axios";
    import {findRole} from "../../config/config";
    import {getHeader, smartEnuApi} from "@/config/config";
    import {resizeImages} from "../../helpers/HelperUtil";
    import EditGuide from "./EditGuide";
    import AddGuide from "./AddGuide";
    import {MenuService} from "../../service/menu.service";

    export default {
        name: "MainGuide",
        components: {EditGuide, AddGuide},
        data() {
            return {
                findRole: findRole,
                pageLink: this.$route.params.id,
                guide: null,
                formValid: [],
                role: {},
                notGuide: false,
                layout: 'list',
                loading: false,
                submitted: false,
                addViewVisible: false,
                editViewVisible: false,
                selectedGuide: {},
                menuService: new MenuService(),
                bodyParams: {
                    parentId: null,
                    manualId: null,
                    key: null,
                    pageLink: null,
                    content: null,
                    contentRu: null,
                    contentEn: null,
                    name: null,
                    nameRu: null,
                    nameEn: null,
                },
                parentGuide: null,
                isGlobal: true
            };
        },
        methods: {
            getGuide() {
                this.loading = true
                axios.post(smartEnuApi + "/manual/getContent", {pageLink: this.pageLink}, {headers: getHeader()})
                    .then((response) => {
                        this.guide = response.data;
                        if (this.guide.pageLink === "" && this.findRole(null, "manual_moderator")) {
                            this.addViewVisible = true;
                            this.guide.pageLink = this.pageLink;
                            const data = this.getPath(this.menuService.getGlobalMenu(this.$t), this.pageLink, null);
                            if (data) {
                                if (this.$i18n.locale === 'kz') {
                                    this.guide.name = data.child.label;
                                } else if (this.$i18n.locale === 'ru') {
                                    this.guide.nameRu = data.child.label;
                                } else {
                                    this.guide.nameEn = data.child.label;
                                }
                                if (data.parent)
                                    this.getGuideByPageLink(data.parent.label)
                            }

                            this.selectedGuide = this.guide;

                        }
                        if (this.guide.pageLink === "") {
                            this.notGuide = true;
                        }
                        if (this.guide && this.isGlobal) {
                            this.isGlobal = false;
                            this.emitter.emit("expandParentGuide", this.guide.parentId);
                        }
                        this.loading = false;
                    })
                    .catch((error) => {
                        console.log(error)
                        if (error.response.status === 401) {
                            this.$store.dispatch("logLout");
                        } else {
                            this.$toast.add({
                                severity: "error",
                                summary: this.$t("common.error") + ":\n" + error,
                                life: 3000,
                            });
                        }
                    });
            },
            validateGuides() {
                this.formValid = [];
                if (!this.guide.content) {
                    this.formValid["content"] = true;
                    this.formValid.push(this.$t("smartenu.contentKzInvalid"));
                } else {
                    delete this.formValid["content"];
                }
                if (!this.guide.contentRu) {
                    this.formValid["contentRu"] = true;
                    this.formValid.push(this.$t("smartenu.contentRuInvalid"));
                } else {
                    delete this.formValid["contentRu"];
                }
                if (!this.guide.contentEn) {
                    this.formValid["contentEn"] = true;
                    this.formValid.push(this.$t("smartenu.contentEnInvalid"));
                } else {
                    delete this.formValid["contentEn"];
                }
            },
            insertGuide() {
                this.submitted = true;
                if (!this.validateGuides())
                    if (this.formValid.length > 0) {
                        return;
                    }
                resizeImages(this.guide.content).then(res => {
                    this.guide.content = res
                });
                resizeImages(this.guide.contentRu).then(res => {
                    this.guide.contentRu = res
                });
                resizeImages(this.guide.contentEn).then(res => {
                    this.guide.contentEn = res
                });
                this.bodyParams.parentId = this.guide.parentId
                this.bodyParams.manualId = this.guide.manualId
                this.bodyParams.key = this.guide.key
                this.bodyParams.pageLink = this.guide.pageLink
                this.bodyParams.content = this.guide.content
                this.bodyParams.contentRu = this.guide.contentRu
                this.bodyParams.contentEn = this.guide.contentEn
                this.bodyParams.name = this.guide.name
                this.bodyParams.nameRu = this.guide.nameRu
                this.bodyParams.nameEn = this.guide.nameEn
                axios.post(smartEnuApi + "/manual/save", this.bodyParams, {
                    headers: getHeader(),
                }).then((response) => {
                    if (response.data !== null) {
                        this.$toast.add({
                            severity: "success",
                            summary: this.$t("smartenu.saveSuccess"),
                            life: 3000,
                        });
                        this.getGuide();
                        this.guide = {};
                    }
                })
                    .catch((error) => {
                        this.$toast.add({
                            severity: "error",
                            summary: this.$t("smartenu.saveEventError") + ":\n" + error,
                            life: 3000,
                        });
                    });
            },
            getPath(e, path, parentMenu) {
                try {
                    let resp = {};
                    for (let item of e) {
                        if (item.to && item.to === path) {
                            let isCurrentSingleParent = parentMenu && parentMenu.items ? parentMenu.items.find(r => r.to === item.to) : null;
                            resp.parent = isCurrentSingleParent ? parentMenu : null;
                            resp.child = item;
                            return resp;
                        }
                        if (item.items) {
                            parentMenu = item;
                            let ch = this.getPath(item.items, path, parentMenu)
                            if (ch != null) {
                                return ch;
                            }
                        }
                    }
                    return null
                } catch (e) {
                    console.log(e)
                   /* this.$toast.add({
                        severity: "error",
                        summary: e,
                        life: 3000,
                    });*/
                    return null
                }

            },
            getGuideByPageLink(label) {
                axios.post(smartEnuApi + "/manual/getManuals", {manualSearch: label}, {headers: getHeader()})
                    .then((response) => {
                        if (response.data.manuals && response.data.manuals.length !== 0) {
                            this.parentGuide = response.data.manuals[0];
                            this.guide.parentId = this.parentGuide.manualId;
                        } else {
                            this.insertParentGuide(label)
                        }
                    })
                    .catch((error) => {
                        if (error.response.status === 401) {
                            this.$store.dispatch("logLout");
                        } else {
                            this.$toast.add({
                                severity: "error",
                                summary: this.$t("common.error") + ":\n" + error,
                                life: 3000,
                            });
                        }
                    });
            },
            insertParentGuide(label) {
                /*if (this.selectedGuide) {
                    this.bodyParams.parentId = this.selectedGuide.manualId
                }*/
                let d = {
                    pageLink: this.generateRandomString(10),
                    name: label,
                    nameRu: label,
                    nameEn: label,
                }

                axios.post(smartEnuApi + "/manual/save", d, {
                    headers: getHeader(),
                }).then((response) => {
                    if (response.data !== null) {
                        this.guide.parentId = response.data.manualId;
                    }
                }).catch((error) => {
                    this.$toast.add({
                        severity: "error",
                        summary: this.$t("smartenu.saveEventError") + ":\n" + error,
                        life: 3000,
                    });
                });
            },
            generateRandomString(length) {
                var result = '';
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }

        },
        created() {
            this.getGuide();
            this.role = this.findRole(null, "manual_moderator")
        },
        mounted() {
            this.emitter.on('editViewModalClose', data => {
                this.editViewVisible = false;
                //this.getGuide();
            });
            this.emitter.on('addViewModalClose', data => {
                this.addViewVisible = false;
                //this.getGuide();
            });
        },
        watch: {
            $route(to, from) {
                this.pageLink = to.params.id;
                this.formValid = [];
                this.getGuide();
                this.role = this.findRole(null, "manual_moderator")
            }
        }

    }
</script>

<style scoped>
    .title {
        font-size: 20px;
        font-weight: 500;
    }
</style>

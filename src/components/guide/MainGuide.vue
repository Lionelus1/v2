<template>
    <div v-if="guide">
        <div class="card">
            <div class="title">
                {{$i18n.locale === "kz"
                ? guide.name
                : $i18n.locale === "ru"
                ? guide.nameRu
                : guide.nameEn }}
            </div>
        </div>
        <div class="card">
            <div v-show="role">
                <Message v-for="msg of formValid" severity="error" :key="msg">{{
                    msg
                    }}
                </Message>
                <TabView>
                    <TabPanel header="Қазақша">
                        <div class="p-field">
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
                        <div class="p-field">
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
                        <div class="p-field">
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
                        class="p-button p-component p-button-success p-mr-2"
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
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import {findRole} from "../../config/config";
    import {getHeader, smartEnuApi} from "@/config/config";
    import {resizeImages} from "../../helpers/HelperUtil";

    export default {
        name: "MainGuide",
        data() {
            return {
                findRole: findRole,
                pageLink: this.$route.params.id,
                guide: null,
                formValid: [],
                role: {},
                layout: 'list',
                loading: false,
                submitted: false,
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
                }
            };
        },
        methods: {
            getGuide() {
                this.loading = true
                axios.get(smartEnuApi + `/manual/getContent/${this.pageLink}`, {headers: getHeader()})
                    .then((response) => {
                        this.guide = response.data;
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
                if(!this.validateGuides())
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
            }
        },
        created() {
            this.getGuide();
            this.role = this.findRole(null, "manual_moderator")
        },
        watch: {
            $route(to, from) {
                this.pageLink = to.params.id;
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

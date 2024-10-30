<template>
    <Dialog :header="$t('guide.addGuide')" :closable="false" v-model:visible="addViewVisible" :style="{width: '450px'}"
            class="p-fluid">
        <div class="field">
            <label>{{$t('guide.pathName') }}</label>
            <InputText v-model="bodyParams.pageLink"/>
            <small class="p-error" v-show="!bodyParams.pageLink && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <label>{{$t('guide.guideName') }}</label>
        <div class="field" style="margin: 1.5rem 0 1.5rem 0">
        <span class="p-float-label">
          <InputText id="kz-title" v-model="bodyParams.name"/>
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
        </span>
            <small class="p-error" v-show="!bodyParams.name && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="ru-title" v-model="bodyParams.nameRu"/>
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
        </span>
            <small class="p-error" v-show="!bodyParams.nameRu && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="en-title" v-model="bodyParams.nameEn"/>
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
        </span>
            <small class="p-error" v-show="!bodyParams.nameEn && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeBasic"/>
            <Button @click="insertGuide" :label="$t('common.add')" icon="pi pi-check"
                    class="p-button-rounded p-button-success mr-2"/>
        </template>
    </Dialog>
</template>

<script>
    import api from "@/service/api";
    import {getHeader, smartEnuApi} from "@/config/config";

    export default {
        name: "AddGuide",
        props: ['isVisible', 'selectedGuide'],
        data() {
            return {
                addViewVisible: this.isVisible ?? false,
                formValid: [],
                submitted: false,
                bodyParams: this.selectedGuide ? this.selectedGuide :{
                    parentId: null,
                    pageLink: '',
                    name: '',
                    nameRu: '',
                    nameEn: '',
                },
                lazyParams: {
                    parentId: null,
                },
            }
        },
        methods: {
            insertGuide() {
                this.submitted = true;
                if (this.validateGuides().length > 0) {
                    return;
                }
                /*if (this.selectedGuide) {
                    this.bodyParams.parentId = this.selectedGuide.manualId
                }*/
                api.post("/manual/save", this.bodyParams, {
                    headers: getHeader(),
                }).then((response) => {
                    if (response.data !== null) {
                        this.$toast.add({
                            severity: "success",
                            summary: this.$t("smartenu.saveSuccess"),
                            life: 3000,
                        });
                        this.closeBasic();
                    }
                });
            },
            getGuides(parentId, parent) {
                this.lazyParams.parentId = parentId
                api.post("/manual/getManuals", this.lazyParams, {
                    headers: getHeader()
                }).then((response) => {
                    if (parentId !== null) {
                        parent.children = response.data.manuals;
                        parent.children.map(e => {
                            e.leaf = !e.children;
                            e.label = e.name;
                            delete e.children
                        })
                    } else {
                        this.categories = response.data.manuals;
                        this.categories.map(e => {
                            e.leaf = !e.children;
                            e.label = e.name;
                            delete e.children
                        })
                    }

                    this.loading = false;
                }).catch((error) => {
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
                let valid = [];
                if (!this.bodyParams.pageLink) {
                    valid.push({pageLink: true});
                }
                if (!this.bodyParams.name) {
                    valid.push({name: true});
                }
                if (!this.bodyParams.nameRu) {
                    valid.push({nameRu: true});
                }
                if (!this.bodyParams.nameEn) {
                    valid.push({nameEn: true});
                }
                return valid;
            },
            closeBasic() {
                this.emitter.emit("addViewModalClose", true);
                this.bodyParams = {
                    parentId: null,
                    pageLink: '',
                    name: '',
                    nameRu: '',
                    nameEn: '',
                };

            },
        },
        created() {
            this.getGuides(null, null);
        }
    }
</script>

<style lang="scss" scoped>
    .add_guide {
        margin-bottom: 10px;
    }
</style>

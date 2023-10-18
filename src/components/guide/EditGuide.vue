<template>
    <Dialog :header="$t('guide.editGuide')" :closable="false" v-model:visible="editViewVisible" :style="{width: '450px'}"
            class="p-fluid">
        <div class="field">
            <label>{{$t('guide.pathName') }}</label>
            <InputText v-model="bodyParams.pageLink"/>
            <small class="p-error" v-show="formValid.pageLink && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <label>{{$t('guide.guideName') }}</label>
        <div class="field" style="margin: 1.5rem 0 1.5rem 0">
        <span class="p-float-label">
          <InputText id="kz-title" v-model="bodyParams.name"/>
          <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
        </span>
            <small class="p-error" v-show="formValid.name && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="ru-title" v-model="bodyParams.nameRu"/>
          <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
        </span>
            <small class="p-error" v-show="formValid.nameRu && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field" style="margin-bottom: 1.5rem">
        <span class="p-float-label">
          <InputText id="en-title" v-model="bodyParams.nameEn"/>
          <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
        </span>
            <small class="p-error" v-show="formValid.nameEn && submitted">{{ $t("common.requiredField") }}</small>
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
    import {getHeader, smartEnuApi} from "@/config/config";
    import { ManualService } from "../../service/manual.service";
    export default {
        name: "EditGuide",
        props: ['isVisible', 'selectedGuide'],
        data() {
            return {
                editViewVisible: this.isVisible ?? false,
                formValid: [],
                submitted: false,
                bodyParams: this.selectedGuide ? this.selectedGuide : {
                    parentId: null,
                    pageLink: null,
                    name: null,
                    nameRu: null,
                    nameEn: null,
                },
                lazyParams: {
                    parentId: null,
                },
                manualService: new ManualService()
            }
        },
        methods: {
            async insertGuide() {
                this.submitted = true;
                this.validateGuides();
                if (this.formValid.length > 0) {
                    return;
                }
                this.manualService.manualSave(this.bodyParams).then((response) => {
                    if (response.data !== null) {
                        this.$toast.add({
                            severity: "success",
                            summary: this.$t("smartenu.saveSuccess"),
                            life: 3000,
                        });
                        this.closeBasic();
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
            getGuides(parentId, parent) {
                this.lazyParams.parentId = parentId
                this.manualService.getManuals(this.lazyParams).then((response) => {
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
                })
                .catch((error) => {
                    this.loading = false;
                        this.$toast.add({
                            severity: "error",
                            summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
                            life: 3000,
                        });
                });
            },
            validateGuides() {
                this.formValid = [];
                if (!this.bodyParams.pageLink) {
                    this.formValid["pageLink"] = true;
                } else {
                    delete this.formValid["pageLink"];
                }
                if (!this.bodyParams.name) {
                    this.formValid["name"] = true;
                } else {
                    delete this.formValid["name"];
                }
                if (!this.bodyParams.nameRu) {
                    this.formValid["nameRu"] = true;
                } else {
                    delete this.formValid["nameRu"];
                }
                if (!this.bodyParams.nameEn) {
                    this.formValid["nameEn"] = true;
                } else {
                    delete this.formValid["nameEn"];
                }
            },
            closeBasic() {
                this.emitter.emit("editViewModalClose", true);
                this.bodyParams = null
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

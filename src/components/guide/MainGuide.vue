<template>
        <div class="card">
            <TabView>
                <TabPanel header="Қазақша">
                    <div class="p-field">
                        <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
                        <Editor
                                id="kz-content"
                                editorStyle="height: 320px"
                        />
                        <small
                                class="p-error"
                        >{{ $t("smartenu.contentKzInvalid") }}</small
                        >
                    </div>
                </TabPanel>
                <TabPanel header="Русский">
                    <div class="p-field">
                        <label for="ru-content">{{
                            $t("common.contentInRussian")
                            }}</label>
                        <Editor
                                id="ru-content"
                                editorStyle="height: 320px"
                        />
                        <small
                                class="p-error"
                        >{{ $t("smartenu.contentRuInvalid") }}</small
                        >
                    </div>
                </TabPanel>
                <TabPanel header="English">
                    <div class="p-field">
                        <label for="en-content">{{
                            $t("common.contentInEnglish")
                            }}</label>
                        <Editor
                                id="en-content"
                                editorStyle="height: 320px"
                        />
                        <small
                                class="p-error"
                        >{{ $t("smartenu.contentEnInvalid") }}</small
                        >
                    </div>
                </TabPanel>
            </TabView>
            <Button
                    v-bind:label="$t('common.save')"
                    icon="pi pi-check"
                    class="p-button p-component p-button-success p-mr-2"
            />
        </div>
</template>

<script>
    export default {
        name: "MainGuide"
    }
</script>

<style scoped>

</style>

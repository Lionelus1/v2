<template>
    <Dialog
            v-model:visible="eventViewVisible"
            :closable="false"
            :style="{ width: '1000px' }"
            :modal="true"
            class="p-fluid"
    >
        <Card style="box-shadow: none">
            <template #header>
                <div class="dialog_img">
                    <img
                            :src="selectedEvent.imageUrl"
                            style="width: 100%; height: 100%"
                    />
                </div>
            </template>
            <template #title>
                <div class="card_title">
                    {{
                    $i18n.locale === "kz"
                    ? selectedEvent.titleKz
                    : $i18n.locale === "ru"
                    ? selectedEvent.titleRu
                    : selectedEvent.titleEn
                    }}
                </div>
            </template>
            <template #subtitle>
                {{
                $t("smartenu.dataAndTime", {
                fn: new Date(selectedEvent.eventDate).toLocaleString(),
                })
                }}<br/>
                {{
                $t("smartenu.eventFormatView", {
                fn: selectedEvent.isOnline
                ? $t("common.online")
                : $t("common.offline"),
                })
                }}<br/>
                {{ $t("smartenu.meetingLinkView") }}
                <a
                        v-if="selectedEvent.isOnline"
                        :href="'//' + selectedEvent.eventLink"
                        target="_blank"
                >
                    {{ selectedEvent.eventLink }}
                </a>
                <br/>
                <p v-if="!selectedEvent.isOnline">
                    {{
                    $t("smartenu.meetingLocationView", {
                    fn: selectedEvent.eventLocation,
                    })
                    }}
                </p>
                <!--{{
                $t("smartenu.participantsCategoryView", {
                fn: selectedEvent.participantsCategory
                .map((category) =>
                $i18n.locale === "kz"
                ? category.nameKz
                : $i18n.locale === "ru"
                ? category.nameRu
                : category.nameEn
                )
                .toString()
                .replaceAll(",", ", "),
                })
                }}--><br/>
            </template>
            <template #content>
                <div
                        v-html="
              $i18n.locale === 'kz'
                ? selectedEvent.contentKz
                : $i18n.locale === 'ru'
                ? selectedEvent.contentRu
                : selectedEvent.contentEn
            "
                ></div>
            </template>
            <template #footer>
                <Button
                        v-if="selectedEvent.additionalFile || selectedEvent.additional_file_path"
                        v-bind:label="$t('common.download')"
                        icon="pi pi-download"
                        class="p-button-success p-mb-2"
                        @click="downloadFile(selectedEvent)"
                />
                <div>
                    <Accordion v-if="selectedEvent.participants && selectedEvent.participants.length > 0">
                        <AccordionTab :header="$t('smartenu.eventParticipants')">
                            <li
                                    v-for="participant in selectedEvent.participants"
                                    :key="participant.id"
                            >
                                {{ participant.user.fullName }}
                            </li>
                        </AccordionTab>
                    </Accordion>
                </div>
            </template>
        </Card>
        <template #footer>
            <Button
                    v-bind:label="$t('common.close')"
                    icon="pi pi-times"
                    class="p-button-rounded p-button-danger"
                    @click="eventViewVisible = false"
            />
        </template>
    </Dialog>
</template>

<script>
    export default {
        name: "EventsView",
        props: ['isVisible', 'selectedEvent'],
        data() {
            return {
                eventViewVisible: this.isVisible
            }
        }
    }
</script>

<style scoped>

</style>

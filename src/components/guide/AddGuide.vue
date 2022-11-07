<template>
    <Button
            :label="$t('common.add')"
            icon="pi pi-plus"
            class="p-button-success p-mr-2 add_guide"
            @click="openBasic"
    />
    <Dialog header="Анықтаманы қосу" v-model:visible="showModal" :style="{width: '450px'}" class="p-fluid">
        <div class="p-field">
            <label>Жолдың атауы</label>
            <InputText/>
        </div>
        <div class="p-field">
            <label>Анықтаманың атауы</label>
            <InputText/>
        </div>
        <div class="p-field">
            <label></label>
            <Dropdown v-model="lang" :options="languages" optionLabel="name" optionValue="id" :placeholder="$t('common.select')" />
            <small class="p-error" ></small>
        </div>
        <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeBasic"/>
            <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-rounded p-button-success p-mr-2"/>
        </template>
    </Dialog>
</template>

<script>
    export default {
        name: "AddGuide",
        data() {
            return {
                showModal: false,
                position: 'center',
                work_plan_name: null,
                documentID: null,
                isDocCreated: false,
                isDisabled: true,
                lang: null,
                languages: [
                    {
                        id: 1,
                        name: 'Қазақ'
                    },
                    {
                        id: 2,
                        name: 'Русский'
                    },
                    {
                        id: 3,
                        name: 'English'
                    }
                ],
                submitted: false,
                isOper: false
            }
        },
        methods: {
            openBasic() {
                this.showModal = true;
            },
            closeBasic() {
                this.showModal = false;
            },
        }
    }
</script>

<style lang="scss" scoped>
    .add_guide{
        margin-bottom: 10px;
    }

</style>

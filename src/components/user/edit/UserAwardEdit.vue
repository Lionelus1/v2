<template>
    <div id="carddiv" class="grid">
        <div class="col-12">
            <h3>{{ $t('science.awardsAndHonors') }}</h3>
            <div>
                <Menubar :model="menu" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
            </div>
        </div>

        <div class="col-12 md:col-12 p-fluid">
            <div class="card">
                <div class="grid formgrid">
                    
                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardType">{{ $t('science.typeOfAward') }}</label>
                            <InputText :placeholder="t('science.typeOfAward')" v-model="payload.award_type" id="awardType" />
                            <small class="p-error" v-if="validation.award_type">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>

                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardName">{{ $t('science.reward') }}</label>
                            <InputText :placeholder="t('science.reward')" v-model="payload.award_name" id="awardName" />
                            <small class="p-error" v-if="validation.award_name">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>
                    
                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardYear">{{ $t('hr.id.startDate') }}</label>
                            <PrimeCalendar class="mt-2" :class="{'p-invalid': payload.start_time}" :placeholder="$t('hr.id.startDate')" v-model="payload.start_time" dateFormat="dd.mm.yy"/>
                            <small class="p-error" v-if="validation.start_time">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>
                </div>

                <div class="p-field">
                    <label for="uploadIcon">{{ $t('ncasigner.chooseFile') }}</label>
                    <FileUpload ref="form" :placeholder="t('ncasigner.chooseFile')" :customUpload="true" mode="basic" accept="image/*" :class="{'p-invalid': validation.upload_path}"  @uploader="onIconUpload($event)" :auto="true"  v-bind:chooseLabel="$t('ncasigner.chooseFile')"/>
                    <InlineMessage severity="info" class="mt-2" show v-if="file">
                        {{ $t('ncasigner.chosenFile', {fn: file ? file.name : ""}) }}
                    </InlineMessage>
                    <small class="p-error" v-if="validation.upload_path">{{ $t("common.requiredField") }}</small>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useI18n } from "vue-i18n";
    import { useToast } from "primevue/usetoast";
    import { ref, inject } from "vue";
    import {ScienceService} from "@/service/science.service";

    const { t } = useI18n();
    const toast = useToast();
    const file = ref(null)
    const scienceService = new ScienceService()
    const emitter = inject("emitter");

    const props = defineProps({
      modelValue: {
        type: Object,
        default: () => ({
          id: null,
          award_type: null,
          award_name: null,
          start_time: null,
          upload_path: null
        })
       },
       userID: {
        type: null,
        default: null
       }
    })

    const payload = ref({
        id: props.modelValue.id,
        userID: props.userID,
        award_type: props.modelValue.award_type,
        award_name: props.modelValue.award_name,
        start_time: props.modelValue.start_time,
        upload_path:  props.modelValue.upload_path,
    });

    const validation = ref({
        award_type: false,
        award_name: false,
        year: false,
        upload_path: false
    })  

    const menu= ref([
        {
          label: t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            createAward()
          },
        },
    ])

    const createAward = () => {
        if (!validateForm()) {
            return
        }

        const fd = new FormData();
        fd.append("id", JSON.stringify(payload.value))
        fd.append("idImage", file.value);  
        
        scienceService.addOrUpdateScienceAward(fd).then(res  => {
            toast.add({severity: "success", summary: t('common.success'), life: 3000});
          emitter.emit('award', true)
        }).catch(err => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        })
    };

    const validateForm = () => {
        validation.value.award_type = !payload.value.award_type || payload.value.award_type == ""
        validation.value.award_name = !payload.value.award_name || payload.value.award_name == ""
        validation.value.start_time = !payload.value.start_time || payload.value.start_time == ""
        validation.value.upload_path = !file.value || file.value == ""
        return (
            !validation.value.award_type  &&
            !validation.value.award_name  &&
            !validation.value.start_time  &&
            !validation.value.upload_path  
        )
    }

    const onIconUpload = (event) => {
        file.value = event.files[0];
    };

</script>

<template>
    <div v-if="!loading" id="carddiv" class="grid">
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
                            <Dropdown :options="awardTypes" v-model="payload.award_type" :option-label="'name_' + locale" id="awardType" :placeholder="t('science.typeOfAward')" @change="selectAwardTypes" />                            <small class="p-error" v-if="validation.award_type">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>

                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardName">{{ $t('science.rewardKz') }}</label>
                            <InputText :placeholder="t('science.rewardKz')" v-model="payload.award_name_kz" id="awardName" />
                            <small class="p-error" v-if="validation.award_name_kz">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>

                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardName">{{ $t('science.rewardRu') }}</label>
                            <InputText :placeholder="t('science.rewardRu')" v-model="payload.award_name_ru" id="awardName" />
                            <small class="p-error" v-if="validation.award_name_ru">{{ $t("common.requiredField") }}</small>
                        </div>
                    </div>


                    <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
                        <div class="p-field">
                            <label for="awardName">{{ $t('science.rewardEn') }}</label>
                            <InputText :placeholder="t('science.rewardEn')" v-model="payload.award_name_en" id="awardName" />
                            <small class="p-error" v-if="validation.award_name_en">{{ $t("common.requiredField") }}</small>
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
    import { ref, inject, onMounted } from "vue";
    import {ScienceService} from "@/service/science.service";

    const { t, locale } = useI18n();
    const toast = useToast();
    const file = ref(null)
    const scienceService = new ScienceService()
    const emitter = inject("emitter");

    const props = defineProps({
      modelValue: {
        type: Object,
        default: () => ({
          id: null,
          award_type: {},
          award_name_kz: null,
          award_name_ru: null,
          award_name_en: null,
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
        award_type: (props.modelValue.award_type),
        award_name_kz: props.modelValue.award_name_kz,
        award_name_ru: props.modelValue.award_name_ru,
        award_name_en: props.modelValue.award_name_en,
        start_time: props.modelValue.start_time,
        upload_path:  props.modelValue.upload_path,
    });

    const validation = ref({
        award_type: false,
        award_name_kz: false,
        award_name_ru: false,
        award_name_en: false,
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
          disabled: () => (!payload.value.award_type || payload.value.award_type == "")
          || (!payload.value.award_name_kz || payload.value.award_name_kz == "") 
          || (!payload.value.award_name_ru || payload.value.award_name_ru == "")
          || (!payload.value.award_name_en || payload.value.award_name_en == "")
          || (!payload.value.start_time || payload.value.start_time == "")
        },
    ])

    const loading = ref(false)

    const awardTypes = ref([]) 
    

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
        }).catch(_ => {
        })
    };

    const validateForm = () => {
        validation.value.award_type = !payload.value.award_type || payload.value.award_type == ""
        validation.value.award_name_kz = !payload.value.award_name_kz || payload.value.award_name_kz == ""
        validation.value.award_name_ru = !payload.value.award_name_ru || payload.value.award_name_ru == ""
        validation.value.award_name_en = !payload.value.award_name_en || payload.value.award_name_en == ""

        validation.value.start_time = !payload.value.start_time || payload.value.start_time == ""
        validation.value.upload_path = !file.value || file.value == ""
        return (
            !validation.value.award_type  &&
            !validation.value.award_name  &&
            !validation.value.start_time  &&
            !validation.value.upload_path  
        )
    }

    const selectAwardTypes = () => {
        if (payload.value.award_type) {
            const selectedAwardType = awardTypes.value.find(type => type.id === payload.value.award_type.id);

            if (selectedAwardType) {
                payload.value.award_type = selectedAwardType;
            } else {
              // TODO: Selected award type not found in awardTypes array
            }
        }
    };

    const getAwardTypes = () => {
        loading.value = true;
        scienceService.getAwardTypes().then(res => {
            awardTypes.value = res.data.award_type;

            if (payload.value.award_type) {
                selectAwardTypes(); 
            }else {
                payload.value.award_type = {}
            }

            loading.value = false;
        }).catch(_ => {
            loading.value = false;
        });
    };

    const onIconUpload = (event) => {
        file.value = event.files[0];
    };

    onMounted(() => {
        getAwardTypes()
    })

</script>

<template>
  <div class="col-12">
    <Menubar :model="items" class="m-0 pt-0 pb-0"></Menubar>
  </div>

  <div class="col-12 md:col-12 p-fluid">
    <div class="card">
      <div class="grid formgrid">
        <div class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label for="newPassword">{{t('newPassword')}}</label>
          <InputText @input="handlePasswordChange" id="newPassword" v-model="newPassword" type="password" :placeholder="t('enterNewPassword')" />
          <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
        </div>

        <div class="col-6 mb-2 pb-2 lg:col-6 mb-lg-0">
          <label for="confirmPassword">{{t('passwordConfirmation')}}</label>
          <InputText @input="handlePasswordChange" id="confirmPassword" v-model="confirmPassword" type="password" :placeholder="t('confirmNewPassword')" />
          <small v-if="confirmationError" class="p-error">{{ confirmationError }}</small>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import {ref, defineProps, inject, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import axios from "axios";
import {UserService} from "@/service/user.service"
import {useStore} from "vuex";


const newPassword = ref('');
const confirmPassword = ref('');
const currentPassword = ref('');
const userService = new UserService()
const emitPersonalInformationUpdate = defineEmits(['personal-information-updated']);
const props = defineProps({
  modelValue: {
    type: null,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: true,
  },
  customType: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();
const toast = useToast();

const passwordError = ref('');
const confirmationError = ref('');
const changed = ref(false)

const items = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    disabled: () => !changed.value,
    command: () => { updateUserData() },
  },
]);

const isPasswordValid = (password) => {
  return password && password.length >= 32;
};

const handlePasswordChange = () => {
  passwordError.value = '';
  confirmationError.value = '';

  if (newPassword.value !== confirmPassword.value) {
    confirmationError.value = t('passwordMismatch');
  }

  if (!isPasswordValid(newPassword.value)) {
    passwordError.value = t('passwordTooShort');
  }

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = passwordError.value || t('fieldsEmpty');
  }

  if (passwordError.value || confirmationError.value) {
    changed.value = false
    return;
  }

  changed.value = true
};

const updateUserData = () => {
  const user = props.modelValue;

  if (newPassword.value !== confirmPassword.value) {
    console.log("Пароли не совпадают!");
    return;
  }

  user.password = newPassword.value;

  const req = {
    user: user
  };

  const fd = new FormData();
  fd.append("id", JSON.stringify(req))

  userService.updateUserAccountHandler(fd).then(res => {
      console.log("Пароль успешно обновлен!");

      toast.add({
        severity: 'success',
        summary: t('common.successDone'),
        detail: '',
        life: 3000
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
  }).catch(error => {
    console.log("Ошибка запроса:", error);
  });
};

</script>

<style scoped>
.p-error {
  color: red;
}
.small-button {
  font-size: 14px;
  padding: 6px 12px;
  height: 30px;
  width: auto;
}

.m-0 {
  margin: 0;
}
.pt-0 {
  padding-top: 0;
}
.pb-0 {
  padding-bottom: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.formgrid {
  width: 100%;
}

.col-6 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.InputText {
  padding: 0.5rem;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: all 0.3s ease;
}

.InputText:focus {
  border-color: #007ad9;
  outline: none;
}

.p-error {
  color: red;
  font-size: 12px;
  margin-top: 0.3rem;
  padding-left: 10px;
  font-style: italic;
}

.small {
  font-size: 12px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

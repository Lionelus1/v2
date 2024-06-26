<template>
  <div>
    <DataTable :value="mailingList">
      <Column field="title" :header="$t('mailing.title')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.TemplateName
            }}
          </span>
        </template>
      </Column>
      <Column field="categories" :header="$t('mailing.categories')">
        <template #body="slotProps">
          <span v-if="slotProps.data.Roles">
            {{ slotProps.data.Roles.map(role => role.ru).join(', ') }}
          </span>
          <span v-else>-</span>
        </template>
      </Column>
      <Column field="author" :header="$t('mailing.author')">
        <template #body="slotProps">
          <span>
            {{
              getFullName(slotProps.data.Notification.senderJSON)
            }}
          </span>
        </template>

      </Column>
      <Column field="dateAndTime" :header="$t('mailing.dateAndTIme')">
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.Notification.createdDate
            }}
          </span>
        </template>
      </Column>
      <Column headerStyle="width: 10rem">
        <template #body="{ data }">
          <ActionButton :show-label="true" :items="buttons" @toggle="toggle(data)"/>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import api from "@/service/api";
import { getHeader } from "@/config/config";
import ActionButton from "@/components/ActionButton.vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

const loading = ref(false);
const toast = useToast();
const router = useRouter();
const actionsNode = ref(null);
const getParams = {
  pageNum: 1,
  itemsPerPage: 6,
  statusId: 2,
};
const mailingList = ref([]);
const count = ref(0);

onMounted(() => {
  initMailing();
});

const toggle = (node) => {
  actionsNode.value = node;
};

const getFullName = (senderJSON) => {
  try {
    if (!senderJSON) {
      return t("mailing.unknownSender");
    }
    const senderData = JSON.parse(senderJSON);
    return `${senderData.firstName || ''} ${senderData.lastName || ''} ${senderData.thirdName || ''}`.trim();
  } catch (error) {
    console.error("Error parsing sender JSON:", error);
    return t("mailing.invalidSenderData");
  }
};

const initMailing = () => {
  loading.value = true;
  api
      .post("/mailing/mailingList", getParams, {
        headers: getHeader(),
      })
      .then((res) => {
        if (res.data) {
          mailingList.value = res.data;
          count.value = res.data.NewCount;
        } else {
          console.log('res.data is null');
          mailingList.value = [];
          count.value = 0;
        }
        loading.value = false;
      })
      .catch((err) => {
        console.log(err);
        if (err.response && err.response.status === 401) {
          store.dispatch("logOut");
        }

        toast.add({
          severity: "error",
          detail: t("roleControl.noResult"),
          life: 3000,
        });

        loading.value = false;
      });
};

const editMailing = (data) => {
  router.push({ name: 'EditMailing', params: {
      id: data.Notification.id, description: data.Notification.description, selectedCategories: data.Notification.categoryIds, docTemplateID: data.Notification.templateId,
    } });
};

const deleteMailing = (data) => {
  api
      .post("/mailing/deleteMailingById", { mailingId: data.Notification.id }, {
        headers: getHeader(),
      })
      .then((res) => {
        if (res.data === 'success') {
          toast.add({
            severity: "success",
            detail: t("mailing.deletedSuccessfully"),
            life: 3000,
          });
          initMailing();
        } else {
          toast.add({
            severity: "error",
            detail: t("mailing.deleteFailed"),
            life: 3000,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.add({
          severity: "error",
          detail: t("mailing.deleteFailed"),
          life: 3000,
        });
      });
};

const buttons = computed(() => {
  return [
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pencil',
      command: () => editMailing(actionsNode.value)
    },
    {
      label: t('common.delete'),
      icon: 'fa-solid fa-trash-can',
      disabled: false,
      command: () => deleteMailing(actionsNode.value)
    },
    {
      label: t('User'),
      visible: false,
      icon: 'fa-solid fa-user',
      command: () => {
      }
    },
  ];
});
</script>

<template>
  <div>
    <DataTable :value="mailingList">
      <Column field="title" :header="$t('mailing.title')">
        <template #body="slotProps">
          <span>{{ $i18n.locale === "kz" ? slotProps.data.TemplateNameKz : $i18n.locale === "ru" ? slotProps.data.TemplateNameRu : slotProps.data.TemplateNameEn }}</span>
        </template>
      </Column>
      <Column field="categories" :header="$t('mailing.categories')">
        <template #body="slotProps">
          <span v-if="slotProps.data.Roles">
            {{ slotProps.data.Roles.map(role => $i18n.locale === "kz" ? role.kz : $i18n.locale === "ru" ? role.ru : role.en).join(', ') }}
          </span>
          <span v-else>-</span>
        </template>
      </Column>
<!--      <Column field="categories" :header="$t('mailing.categories')">-->
<!--        <template #body="slotProps">-->
<!--          <span v-for="role in slotProps.data.Roles" :key="role.id">{{ role.ru }}</span>-->
<!--        </template>-->
<!--      </Column>-->
      <Column field="author" :header="$t('mailing.author')">
        <template #body="slotProps">
          <span>{{ getFullName(slotProps.data.Notification.senderJSON) }}</span>
        </template>

      </Column>
      <Column field="dateAndTime" :header="$t('mailing.dateAndTIme')">
        <template #body="slotProps">
          <span>{{ slotProps.data.Notification.updatedDate }}</span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <ActionButton :show-label="true" :items="actions" @toggle="toggle(slotProps)" />
        </template>
      </Column>
    </DataTable>
  </div>

  <MailingView
      v-if="mailingViewVisible && selectedMailing"
      :mailingViewVisible="mailingViewVisible"
      :selectedMailing="selectedMailing"
      @close="closeMailingView"
  />
</template>

<script>
import api from "@/service/api";
import { getHeader } from "@/config/config";
import ActionButton from "@/components/ActionButton.vue";
import MailingView from "@/components/mailing/MailingView.vue";

export default {
  components: { MailingView, ActionButton },
  data() {
    return {
      mailingList: [],
      selectedMailing: null,
      loading: true,
      mailingViewVisible: false,
      getParams: {
        pageNum: 1,
        itemsPerPage: 6,
        statusId: 0,
      },
      actionsNode: null
    };
  },
  methods: {
    getFullName(senderJSON) {
      try {
        if (!senderJSON) {
          return this.$t("mailing.unknownSender");
        }
        const senderData = JSON.parse(senderJSON);
        return `${senderData.firstName || ''} ${senderData.lastName || ''} ${senderData.thirdName || ''}`.trim();
      } catch (error) {
        console.error("Error parsing sender JSON:", error);
        return this.$t("mailing.invalidSenderData");
      }
    },
    initMailing() {
      this.loading = true;
      api
          .post("/mailing/mailingList", this.getParams, { headers: getHeader() })
          .then((res) => {
            this.mailingList = res.data;
            this.count = res.data.NewCount;
            this.loading = false;
          })
          .catch((err) => {
            console.error("Error loading mailing list:", err);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    getMailingByID(mailingId, callback) {
      api
          .post("/mailing/getMailingByID", { mailingId, IsView: true}, { headers: getHeader() })
          .then((response) => {
            callback(null, response.data);
          })
          .catch((error) => {
            console.error("Error fetching mailing by ID:", error);
            callback(error, null);
          });
    },
    toggle(node) {
      if (!node || !node.data || !node.data.Notification) {
        return;
      }

      const mailingId = node.data.Notification.id;

      this.getMailingByID(mailingId, (error, data) => {
        if (error) {
          return;
        }
        this.selectedMailing = data;
        this.mailingViewVisible = true;
      });
    },
    closeMailingView() {
      console.log('Closing view from parent...');  // Лог для проверки
      this.mailingViewVisible = false;
    },
  },
  computed: {
    actions() {
      return [
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          command: () => {
            this.toggle(this.actionsNode); // Используем стрелочную функцию
          },
        },
      ];
    },
  },
  mounted() {
    this.initMailing();
    this.emitter.on('modalClose', data => {
      this.mailingViewVisible = data;
    });
  },
};
</script>

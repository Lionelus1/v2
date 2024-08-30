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
<!--      <Column field="categories" :header="$t('mailing.categories')">-->
<!--        <template #body="slotProps">-->
<!--          <span v-for="role in slotProps.data.Roles" :key="role.id">{{ role.ru }}</span>-->
<!--        </template>-->
<!--      </Column>-->
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
              slotProps.data.Notification.updatedDate
            }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <ActionButton :show-label="true" :items="actions" @toggle="toggle(slotProps)" />
        </template>
      </Column>
    </DataTable>
  </div>


  <MailingView v-if="mailingViewVisible" :mailingViewVisible="mailingViewVisible" :selectedMailing="selectedMailing"/>


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
            this.loading = false;
          })
          .catch((err) => {
            console.error("Error loading mailing list:", err);
            this.loading = false;
          });
    },
    async getMailingByID(mailingId) {
      console.log("Requesting mailing with ID:", mailingId);
      try {
        const response = await api.post("/mailing/getMailingByID", { mailingId }, { headers: getHeader() });
        console.log("Received response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching mailing by ID:", error);
        return null;
      }
    },
    async toggle(node) {
      const mailingId = node.data.Notification.id;
      console.log("Toggling mailing view for ID:", mailingId);
      this.selectedMailing = await this.getMailingByID(mailingId);
      console.log("Selected mailing data:", this.selectedMailing);
      if (this.selectedMailing) {
        this.mailingViewVisible = true;
      }
    },
    mailingView(actionsNode) {
      this.actionsNode = actionsNode;
      this.toggle(actionsNode);
    },
  },
  computed: {
    actions() {
      return [
        {
          label: this.$t('common.show'),
          icon: "fa-solid fa-eye",
          command: () => {
            this.mailingView(this.actionsNode);
          },
        },
      ];
    },
  },
  mounted() {
    this.initMailing();
  },
};
</script>
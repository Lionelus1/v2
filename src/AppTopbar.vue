<template>
	<div class="layout-topbar">
		<button class="p-link layout-menu-button" @click="onMenuToggle">
			<span class="pi pi-bars"></span>
		</button>

		<div class="layout-topbar-icons">
			<!-- <span class="layout-topbar-search">
				<InputText type="text" placeholder="Search" />
				<span class="layout-topbar-search-icon pi pi-search"></span>
			</span>
			<button class="p-link">
				<span class="layout-topbar-item-text">Events</span>
				<span class="layout-topbar-icon pi pi-calendar"></span>
				<span class="layout-topbar-badge">5</span>
			</button>
			<button class="p-link">
				<span class="layout-topbar-item-text">Settings</span>
				<span class="layout-topbar-icon pi pi-cog"></span>
			</button>
			<button class="p-link">
				<span class="layout-topbar-item-text">User</span>
				<span class="layout-topbar-icon pi pi-user"></span>
			</button> -->
			<Dropdown class="p-link" v-model="language" :options="languages" optionLabel="name" @change="changeLanguage" />
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			languages: [
				{	name:	"Қазақ", value: "kz"},
				{	name:	"Русский", value: "ru"},
				{	name:	"English", value: "en"},
			],
			language : null
		}
	},
    methods: {
        onMenuToggle(event) {
            this.$emit('menu-toggle', event);
        },
				changeLanguage() {
					if (this.$i18n.locale !== this.language.value) {
						localStorage.setItem("lang", this.language.value);
						this.$i18n.locale = this.language.value
					}
				},
    },
		created() {
			localStorage.setItem("lang", this.$i18n.locale);
			this.language = this.languages.filter(function(item) {
				return item.value === localStorage.getItem("lang")
			})[0];
		}
}
</script>
<template>
	<div id="layout-config" :class="containerClass">
		<a href="#" class="layout-config-button no-print" id="layout-config-button" @click="toggleConfigurator">
			<i class="pi pi-cog"></i>
		</a>
		<a href="#" class="layout-config-close" @click="hideConfigurator">
			<i class="pi pi-times"></i>
		</a>

		<div class="layout-config-content">
			<div class="vi_card">
				<h5 class="title">{{ $t("visuallyImpaired.fontSize") }} :</h5>
				<div class="btns">
					<button class="vi_btn small" @click="smallFz">A</button>
					<button class="vi_btn middle" @click="middleFz">A</button>
					<button class="vi_btn big" @click="bigFz">A</button>
				</div>
				<h5 class="title">{{ $t("visuallyImpaired.siteColors") }} :</h5>
				<div class="btns">
					<button class="vi_btn black" @click="darkTheme">
						{{
							$i18n.locale === "kz"
									? "T"
									: $i18n.locale === "ru"
											? "Ц"
											: "C"
						}}
					</button>
					<button class="vi_btn blue" @click="blueTheme">
						{{
							$i18n.locale === "kz"
									? "T"
									: $i18n.locale === "ru"
											? "Ц"
											: "C"
						}}
					</button>
					<button class="vi_btn brown" @click="brownTheme">
						{{
							$i18n.locale === "kz"
									? "T"
									: $i18n.locale === "ru"
											? "Ц"
											: "C"
						}}
					</button>
					<button class="vi_btn milky" @click="milkyTheme">
						{{
							$i18n.locale === "kz"
									? "T"
									: $i18n.locale === "ru"
											? "Ц"
											: "C"
						}}
					</button>
				</div>
				<Button class="p-button" @click="hideVi">Қалыпты нұсқа</Button>
			</div>
			<h5 style="margin-top: 0">Input Style</h5>
			<div class="p-formgroup-inline">
				<div class="field-radiobutton">
					<RadioButton id="input_outlined" name="inputstyle" value="outlined" :modelValue="inputStyle" @update:modelValue="changeInputStyle" />
					<label for="input_outlined">Outlined</label>
				</div>
				<div class="field-radiobutton">
					<RadioButton id="input_filled" name="inputstyle" value="filled" :modelValue="inputStyle" @update:modelValue="changeInputStyle" />
					<label for="input_filled">Filled</label>
				</div>
			</div>

			<h5>Ripple Effect</h5>
			<InputSwitch :modelValue="rippleActive" @update:modelValue="changeRipple" />

			<h5>Menu Type</h5>
			<div class="p-formgroup-inline">
				<div class="field-radiobutton">
					<RadioButton id="static" name="layoutMode" value="static" v-model="d_layoutMode" @change="changeLayout($event, 'static')" />
					<label for="static">Static</label>
				</div>
				<div class="field-radiobutton">
					<RadioButton id="overlay" name="layoutMode" value="overlay" v-model="d_layoutMode" @change="changeLayout($event, 'overlay')" />
					<label for="overlay">Overlay</label>
				</div>
			</div>

			<h5>Menu Color</h5>
			<div class="p-formgroup-inline">
				<div class="field-radiobutton">
					<RadioButton id="dark" name="layoutColorMode" value="dark" v-model="d_layoutColorMode" @change="changeLayoutColor($event, 'dark')" />
					<label for="dark">Dark</label>
				</div>
				<div class="field-radiobutton">
					<RadioButton id="light" name="layoutColorMode" value="light" v-model="d_layoutColorMode" @change="changeLayoutColor($event, 'light')" />
					<label for="light">Light</label>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			layoutMode: {
				type: String,
				default: null
			},
			layoutColorMode: {
				type: String,
				default: null
			}
		},
		data() {
			return {
				active: false,
				d_layoutMode: this.layoutMode,
				d_layoutColorMode: this.layoutColorMode,
				userTheme: "default-theme",
			}
		},
		mounted() {
			const initUserTheme = this.getTheme();
			this.setTheme(initUserTheme);
			const initUserFz = this.getFz();
			this.setFz(initUserFz);
			},
		watch: {
			$route() {
				if (this.active) {
					this.active = false;
					this.unbindOutsideClickListener();
				}
			},
			layoutMode(newValue) {
				this.d_layoutMode = newValue;
			},
			layoutColorMode(newValue) {
				this.d_layoutColorMode = newValue;
			}
		},
		outsideClickListener: null,
		methods: {
			darkTheme() {
				this.setTheme("dark-theme");
			},
			blueTheme(){
				this.setTheme("blue-theme");
			},
			brownTheme() {
				this.setTheme("brown-theme");
			},
			milkyTheme() {
				this.setTheme("milky-theme");
			},
			setTheme(theme) {
				localStorage.setItem("user-theme", theme);
				this.userTheme = theme;
				document.documentElement.className = theme;
			},
			getTheme() {
				return localStorage.getItem("user-theme");
			},
			setFz(fontSize) {
				localStorage.setItem("user-font-size", fontSize);
				document.documentElement.id = fontSize;
			},
			getFz() {
				return localStorage.getItem("user-font-size");
			},
			smallFz() {
				this.setFz("fz-small");
			},
			middleFz() {
				this.setFz("fz-middle");
			},
			bigFz() {
				this.setFz("fz-big");
			},
			hideVi() {
				this.setFz("default");
				this.setTheme("default-theme");
			},
			toggleConfigurator(event) {
				this.active = !this.active;
				event.preventDefault();

				if (this.active)
					this.bindOutsideClickListener();
				else
					this.unbindOutsideClickListener();
			},
			hideConfigurator(event) {
				this.active = false;
				this.unbindOutsideClickListener();
				event.preventDefault();
			},
			changeInputStyle(value) {
				this.$primevue.config.inputStyle = value;
			},
			changeRipple(value) {
				this.$primevue.config.ripple = value;
			},
			changeLayout(event, layoutMode) {
				this.$emit('layout-change', layoutMode);
				event.preventDefault();
			},
			changeLayoutColor(event, layoutColor) {
				this.$emit('layout-color-change', layoutColor);
				event.preventDefault();
			},
			bindOutsideClickListener() {
				if (!this.outsideClickListener) {
					this.outsideClickListener = (event) => {
						if (this.active && this.isOutsideClicked(event)) {
							this.active = false;
						}
					};
					document.addEventListener('click', this.outsideClickListener);
				}
			},
			unbindOutsideClickListener() {
				if (this.outsideClickListener) {
					document.removeEventListener('click', this.outsideClickListener);
					this.outsideClickListener = null;
				}
			},
			isOutsideClicked(event) {
				return !(this.$el.isSameNode(event.target) || this.$el.contains(event.target));
			},
		},
		computed: {
			containerClass() {
				return ['layout-config', {'layout-config-active': this.active}];
			},
			rippleActive() {
				return this.$primevue.config.ripple;
			},
			inputStyle() {
				return this.$primevue.config.inputStyle;
			}
		}
	}
</script>
<style lang="scss" scoped>
.vi_card{
	margin-bottom: 10px;
	.btns{
		.vi_btn{
			font-weight: 700;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: transparent;
			margin-right: 10px;
			border: 1px solid #ccc;
			font-size: 16px;
			cursor: pointer;
			margin-bottom: 10px;
		}
		.small {
			font-size: 18px;
			width: 30px;
			height: 30px;
		}

		.middle {
			font-size: 25px;
			width: 35px;
			height: 35px;
		}

		.big {
			font-size: 30px;
		}
		.black{
			background: #000;
			color: #fff;
		}
		.blue{
			background: #9dd1ff;
			color: #195183;
		}
		.brown{
			background: #3b2716;
			color: #a7e44d;
		}
		.milky{
			background: #f7f3d6;
			color: #4d4b43;
		}
	}
}
	@media print
   {    
	   .no-print, .no-print *
	   {
		   display:none !important;
	   }
   }
	@media print
   {    
	   .show-print, .show-print *
	   {
		   display: block !important;
		   width:100% !important;
	   }
   }

</style>
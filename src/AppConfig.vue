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
        <Button class="p-button" @click="hideVi">{{ $t("enuTopicSettings.normalVersion") }}</Button>
      </div>
      <h5 style="margin-top: 0">{{ $t("enuTopicSettings.inputType") }}</h5>
      <div class="p-formgroup-inline">
        <div class="field-radiobutton">
          <RadioButton id="input_outlined" name="inputstyle" value="outlined" :modelValue="inputStyle" @update:modelValue="changeInputStyle"/>
          <label for="input_outlined">{{ $t('enuTopicSettings.inputOutlined') }}</label>
        </div>
        <div class="field-radiobutton">
          <RadioButton id="input_filled" name="inputstyle" value="filled" :modelValue="inputStyle" @update:modelValue="changeInputStyle"/>
          <label for="input_filled">{{ $t('enuTopicSettings.inputFilled') }}</label>
        </div>
      </div>

      <h5>{{ $t("enuTopicSettings.rippleEffect") }}</h5>
      <InputSwitch :modelValue="rippleActive" @update:modelValue="changeRipple"/>

      <!-- <h5>Menu Type</h5>
      <div class="p-formgroup-inline">
        <div class="field-radiobutton">
          <RadioButton id="static" name="layoutMode" value="static" v-model="d_layoutMode" @change="changeLayout('static')" />
          <label for="static">Static</label>
        </div>
        <div class="field-radiobutton">
          <RadioButton id="overlay" name="layoutMode" value="overlay" v-model="d_layoutMode" @change="changeLayout('overlay')" />
          <label for="overlay">Overlay</label>
        </div>
      </div> -->

      <h5>{{ $t("enuTopicSettings.menuColor") }}</h5>
      <div class="p-formgroup-inline">
        <div class="field-radiobutton">
          <RadioButton id="dark" name="layoutColorMode" value="dark" v-model="d_layoutColorMode" @change="changeLayoutColor('dark')"/>
          <label for="dark">{{ $t("enuTopicSettings.menuColorDark") }}</label>
        </div>
        <div class="field-radiobutton">
          <RadioButton id="light" name="layoutColorMode" value="light" v-model="d_layoutColorMode" @change="changeLayoutColor('light')"/>
          <label for="light">{{ $t("enuTopicSettings.menuColorLight") }}</label>
        </div>
      </div>

      <div>
        <Button :label="$t('common.save')" icon="pi pi-check" @click=saveThemeStyles()
                style="margin-top: 10px"/>
      </div>

    </div>
  </div>
</template>

<script>
import {getHeader, smartEnuApi} from "@/config/config";
import api from "@/service/api";
import {AccountService} from "./service/account.service";

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
      d_layoutColorMode: this.layoutColorMode,
      userTheme: "default-theme",
      userFontSize: "default",
      accountService: new AccountService()
    }
  },
  mounted() {
    const initUserTheme = this.getTheme();
    this.setTheme(initUserTheme);
    const initUserFz = this.getFz();
    this.setFz(initUserFz);
    const initInputStyle = this.getInputStyle()
    this.changeInputStyle(initInputStyle)
    const initRippleActive = this.getRippleActive()
    this.changeRipple(initRippleActive)
    const initLayoutColorMode = this.getLayoutColorMode()
    this.changeLayoutColor(initLayoutColorMode)
    this.loadData()
  },
  watch: {
    $route() {
      if (this.active) {
        this.active = false;
        this.unbindOutsideClickListener();
      }
    },
    // layoutMode(newValue) {
    // 	this.d_layoutMode = newValue;
    // },
    layoutColorMode(newValue) {
      this.d_layoutColorMode = newValue;
    }
  },
  outsideClickListener: null,
  methods: {
    darkTheme() {
      this.setTheme("dark-theme");
    },
    blueTheme() {
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
      this.userFontSize = fontSize
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
      this.changeInputStyle('outlined');
      this.changeLayoutColor('dark');
      this.changeRipple(true);
      // this.changeLayout('static');
      // this.saveThemeStyles()

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
      localStorage.setItem("change-input", value);
      this.$primevue.config.inputStyle = value;
    },
    getInputStyle() {
      return localStorage.getItem("change-input")
    },
    changeRipple(value) {
      localStorage.setItem("change-ripple", value);
      this.$primevue.config.ripple = value;
    },
    getRippleActive() {
      return localStorage.getItem("change-ripple",)
    },
    // changeLayout(layoutMode) {
    // 	localStorage.setItem("layout-mode", layoutMode);
    // 	this.$emit('layout-change', layoutMode);

    // },
    // getLayoutMode(){
    // 	return localStorage.getItem("layout-mode")
    // },
    changeLayoutColor(layoutColor) {
      localStorage.setItem("layout-color", layoutColor);
      this.$emit('layout-color-change', layoutColor);
    },
    getLayoutColorMode() {
      return localStorage.getItem("layout-color")
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

    loadData() {
      const userTheme = localStorage.getItem("user-theme");
      const userFontSize = localStorage.getItem("user-font-size");
      const inputStyle = localStorage.getItem("change-input")
      const ripple = localStorage.getItem("change-ripple")
      const layoutModeColor = localStorage.getItem("layout-color")

      const anyValueMissing = [userTheme, userFontSize, inputStyle, ripple, layoutModeColor].some(value => value === null || value === undefined);

      if (anyValueMissing) {
        this.userTheme = userTheme;
        this.userFontSize = userFontSize;
        this.$primevue.config.inputStyle = inputStyle;
        this.$primevue.config.ripple = ripple;
        this.$emit('layout-color-change', layoutModeColor);

      } else {
        this.accountService.getSettings().then((res) => {
          if (res.data && res.data.enu_settings) {
            this.setTheme(res.data.enu_settings.user_theme)
            this.setFz(res.data.enu_settings.user_font_size)
            this.changeInputStyle(res.data.enu_settings.input_style)
            this.changeRipple(res.data.enu_settings.change_ripple)
            // this.changeLayoutColor(res.data.enu_settings.layout_mode)
            this.changeLayoutColor(res.data.enu_settings.layout_color_mode)
          } else {
            this.setFz("default");
            this.setTheme("default-theme");
            this.changeInputStyle('outlined');
            this.changeRipple(true);
            // this.changeLayout('static');
            this.changeLayoutColor('dark')
          }
        }).catch(_ => {
              this.setFz("default");
              this.setTheme("default-theme");
              this.changeInputStyle('outlined');
              this.changeRipple(true);
              // this.changeLayout('static');
              this.changeLayoutColor('dark');
            });
      }
    },

    saveThemeStyles() {
      api.post(smartEnuApi + "/smartenu/settings/insert", {
            theme: this.userTheme,
            font_size: this.userFontSize,
            layout_color: this.d_layoutColorMode,
            input_style: this.$primevue.config.inputStyle,
            change_ripple: Boolean(this.$primevue.config.ripple),
          },
          {
            headers: getHeader()
          }).then((res) => {

      }).catch((err) => {
        this.$toast.add({
          severity: "error",
          detail: this.$t("common.message.saveError"),
          life: 3000,
        });

        this.loading = false;
      });
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
.vi_card {
  margin-bottom: 10px;

  .btns {
    .vi_btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-weight: 700;
      width: 40px !important;
      height: 40px !important;
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
      width: 30px !important;
      height: 30px !important;
    }

    .middle {
      font-size: 25px;
      width: 35px !important;
      height: 35px !important;
    }

    .big {
      font-size: 30px;
    }

    .black {
      background: #000;
      color: #fff;
    }

    .blue {
      background: #9dd1ff;
      color: #195183;
    }

    .brown {
      background: #3b2716;
      color: #a7e44d;
    }

    .milky {
      background: #f7f3d6;
      color: #4d4b43;
    }
  }
}

@media print {
  .no-print, .no-print * {
    display: none !important;
  }
}

@media print {
  .show-print, .show-print * {
    display: block !important;
    width: 100% !important;
  }
}
</style>

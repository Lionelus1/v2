import {createApp} from 'vue';
import router from './router';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Skeleton from "primevue/skeleton";
import Badge from 'primevue/badge'
import BlockUI from 'primevue/blockui';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Chips from 'primevue/chips';
import Chip from 'primevue/chip';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import InlineMessage from 'primevue/inlinemessage';
import Chart from 'primevue/chart';
import Image from 'primevue/image';
import Inplace from 'primevue/inplace';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Listbox from 'primevue/listbox';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import OverlayPanel from 'primevue/overlaypanel';
import Paginator from 'primevue/paginator';
import Panel from 'primevue/panel';
import Password from 'primevue/password';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import RadioButton from 'primevue/radiobutton';
import Ripple from 'primevue/ripple';
import SelectButton from 'primevue/selectbutton';
import Sidebar from 'primevue/sidebar';
import SplitButton from 'primevue/splitbutton';
import TabMenu from 'primevue/tabmenu';
import Timeline from 'primevue/timeline';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Tooltip from 'primevue/tooltip';
import ToggleButton from 'primevue/togglebutton';
import TreeTable from 'primevue/treetable';
import Editor from 'primevue/editor';
import Divider from 'primevue/divider';
import VueClipboard from 'vue3-clipboard'
import TreeSelect from 'primevue/treeselect';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';


import CodeHighlight from './AppCodeHighlight';
import i18n from './locales/index'

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'prismjs/themes/prism-coy.css';
import '@fullcalendar/core/main.min.css';
import '@fullcalendar/daygrid/main.min.css';
import '@fullcalendar/timegrid/main.min.css';
import './assets/layout/layout.scss';
import './assets/layout/flags/flags.css';
import "./assets/styles/dark-theme.scss";
import "./assets/styles/blue-theme.scss";
import "./assets/styles/brown-theme.scss";
import "./assets/styles/milky-theme.scss";
import "./assets/styles/fz-small.scss";
import "./assets/styles/fz-middle.scss";
import "./assets/styles/fz-big.scss";
import mitt from "mitt";
import interceptor from "./service/interceptor";
import VueElementLoading from "vue-element-loading";
import Person from '@/components/contragent/Person.vue';
import Organization from '@/components/contragent/Organization.vue';
import FindUser from "@/helpers/FindUser";
import TinyEditor from "@/components/TinyEditor.vue";


import ConfirmationService from 'primevue/confirmationservice';
import store from "./store/store"

import {dom, library} from "@fortawesome/fontawesome-svg-core"; // fontawesome
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {fas} from '@fortawesome/free-solid-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import WorkPlanEventResult from "./components/work_plan/WorkPlanEventResult";
import TitleBlock from "./components/TitleBlock";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import ActionButton from "@/components/ActionButton.vue";
import AddInfo from "@/components/AddInfo.vue";

import {isMobile} from "@/helpers/HelperUtil";
import {VueReCaptcha} from "vue-recaptcha-v3";

Date.prototype.toJSON = function () {
    const hoursDiff = this.getHours() - this.getTimezoneOffset() / 60;
    this.setHours(hoursDiff);
    return this.toISOString();
};

library.add(fas, far, fab)
dom.watch();
router.beforeEach(function (to, from, next) {
    window.scrollTo(0, 0);
    next();
});
const app = createApp(App);
const emitter = mitt();
app.provide('emitter', emitter);

/* eslint-disable */
app.use(PrimeVue, {
    locale: {
        startsWith: 'Starts with',
        contains: 'Contains',
        notContains: 'Not contains',
        endsWith: 'Ends with',
        equals: 'Equals',
        notEquals: 'Not equals',
        noFilter: 'No Filter',
        lt: 'Less than',
        lte: 'Less than or equal to',
        gt: 'Greater than',
        gte: 'Greater than or equal to',
        dateIs: 'Date is',
        dateIsNot: 'Date is not',
        dateBefore: 'Date is before',
        dateAfter: 'Date is after',
        clear: 'Clear',
        apply: 'Apply',
        matchAll: 'Match All',
        matchAny: 'Match Any',
        addRule: 'Add Rule',
        removeRule: 'Remove Rule',
        accept: 'Yes',
        reject: 'No',
        choose: 'Choose',
        upload: 'Upload',
        cancel: 'Cancel',
        completed: 'Completed',
        pending: 'Pending',
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        chooseYear: 'Choose Year',
        chooseMonth: 'Choose Month',
        chooseDate: 'Choose Date',
        prevDecade: 'Previous Decade',
        nextDecade: 'Next Decade',
        prevYear: 'Previous Year',
        nextYear: 'Next Year',
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',
        prevHour: 'Previous Hour',
        nextHour: 'Next Hour',
        prevMinute: 'Previous Minute',
        nextMinute: 'Next Minute',
        prevSecond: 'Previous Second',
        nextSecond: 'Next Second',
        am: 'am',
        pm: 'pm',
        today: 'Today',
        weekHeader: 'Wk',
        firstDayOfWeek: 0,
        dateFormat: 'mm/dd/yy',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        passwordPrompt: 'Enter a password',
        emptyFilterMessage: 'No results found', // @deprecated Use 'emptySearchMessage' option instead.
        searchMessage: '{0} results are available',
        selectionMessage: '{0} items selected',
        emptySelectionMessage: 'No selected item',
        emptySearchMessage: 'No results found',
        emptyMessage: 'No available options',
        aria: {
            trueLabel: 'True',
            falseLabel: 'False',
            nullLabel: 'Not Selected',
            star: '1 star',
            stars: '{star} stars',
            selectAll: 'All items selected',
            unselectAll: 'All items unselected',
            close: 'Close',
            previous: 'Previous',
            next: 'Next',
            navigation: 'Navigation',
            scrollTop: 'Scroll Top',
            moveTop: 'Move Top',
            moveUp: 'Move Up',
            moveDown: 'Move Down',
            moveBottom: 'Move Bottom',
            moveToTarget: 'Move to Target',
            moveToSource: 'Move to Source',
            moveAllToTarget: 'Move All to Target',
            moveAllToSource: 'Move All to Source',
            pageLabel: '{page}',
            firstPageLabel: 'First Page',
            lastPageLabel: 'Last Page',
            nextPageLabel: 'Next Page',
            prevPageLabel: 'Previous Page',
            rowsPerPageLabel: 'Rows per page',
            previousPageLabel: 'Previous Page',
            jumpToPageDropdownLabel: 'Jump to Page Dropdown',
            jumpToPageInputLabel: 'Jump to Page Input',
            selectRow: 'Row Selected',
            unselectRow: 'Row Unselected',
            expandRow: 'Row Expanded',
            collapseRow: 'Row Collapsed',
            showFilterMenu: 'Show Filter Menu',
            hideFilterMenu: 'Hide Filter Menu',
            filterOperator: 'Filter Operator',
            filterConstraint: 'Filter Constraint',
            editRow: 'Row Edit',
            saveEdit: 'Save Edit',
            cancelEdit: 'Cancel Edit',
            listView: 'List View',
            gridView: 'Grid View',
            slide: 'Slide',
            slideNumber: '{slideNumber}',
            zoomImage: 'Zoom Image',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            rotateRight: 'Rotate Right',
            rotateLeft: 'Rotate Left'
        }
    },
    ripple: true,
    inputStyle: 'outlined'
});

app.config.globalProperties.emitter = emitter;

app.config.globalProperties.$isMobile = isMobile()


app.use(i18n);
app.use(ToastService);
app.use(router);
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
})
app.use(ConfirmationService);
app.use(store)
app.use(VueReCaptcha, {
    siteKey: process.env.VUE_APP_G_RECAPTCHA_SECRET_KEY,
});

app.directive('tooltip', Tooltip);
app.directive('ripple', Ripple);
app.directive('code', CodeHighlight);

app.component('Accordion', Accordion);
app.component('Badge', Badge)
app.component('Person', Person)
app.component('Organization', Organization);
app.component('FindUser', FindUser)
app.component('AccordionTab', AccordionTab);
app.component('BlockUI', BlockUI);
app.component('Button', Button);
app.component('Skeleton', Skeleton);
app.component('PrimeCalendar', Calendar)
app.component('Card', Card);
app.component('Chart', Chart)
app.component('Checkbox', Checkbox);
app.component('Chips', Chips);
app.component('Chip', Chip);
app.component('ColorPicker', ColorPicker);
app.component('Column', Column);
app.component('ConfirmPopup', ConfirmPopup);
app.component('ConfirmDialog', ConfirmDialog);
app.component('DataTable', DataTable);
app.component('DataView', DataView);
app.component('DataViewLayoutOptions', DataViewLayoutOptions);
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('Fieldset', Fieldset);
app.component('FileUpload', FileUpload);
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('Image', Image);
app.component('InlineMessage', InlineMessage);
app.component('Inplace', Inplace);
app.component('InputMask', InputMask);
app.component('InputNumber', InputNumber);
app.component('InputSwitch', InputSwitch);
app.component('InputText', InputText);
app.component('Listbox', Listbox);
app.component('Menu', Menu);
app.component('Menubar', Menubar);
app.component('Message', Message);
app.component('MultiSelect', MultiSelect);
app.component('OverlayPanel', OverlayPanel);
app.component('Paginator', Paginator);
app.component('Panel', Panel);
app.component('Password', Password);
app.component('ProgressBar', ProgressBar);
app.component('ProgressSpinner', ProgressSpinner);
app.component('RadioButton', RadioButton);
app.component('SelectButton', SelectButton);
app.component('Sidebar', Sidebar);
app.component('SplitButton', SplitButton);
app.component('TabMenu', TabMenu);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Tag', Tag)
app.component('Textarea', Textarea);
app.component('Timeline', Timeline)
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('ToggleButton', ToggleButton);
app.component('TreeTable', TreeTable);
app.component('Editor', Editor);
app.component("VueElementLoading", VueElementLoading);
app.component('TreeSelect', TreeSelect);
app.component('Divider', Divider);
app.component('FloatLabel', FloatLabel);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);

app.component('WorkPlanEventResult', WorkPlanEventResult)
app.component('TinyEditor', TinyEditor)
app.component('TitleBlock', TitleBlock)
app.component('ToolbarMenu', ToolbarMenu)
app.component('ActionButton', ActionButton)
app.component('AddInfo', AddInfo)

interceptor(store, app);
app.mount('#app');

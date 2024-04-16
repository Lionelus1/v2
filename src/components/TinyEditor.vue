<template>
    <editor  ref="myEditor" v-model="content" :init="editorOptions" :disabled="readonly"/>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import 'tinymce'
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/code';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/pagebreak';

import contentUiCss from 'tinymce/skins/ui/oxide/content.css';
import "tinymce/skins/ui/oxide/skin.css";

import {uploadSingFile} from "../helpers/HelperUtil";
import {FileService} from "@/service/file.service";
import {downloadRoute, fileRoute, smartEnuApi} from "@/config/config";
import {TinymceCustomUploadPlugin} from "@/service/tinymce.custom.upload.plugin";

export default {
    name: "TinyEditor",
    components: {
        'editor': Editor
    },
    props: {
        value: null,
        customFileUpload: {
            type: Boolean,
            default: false
        },
        contractElements: {
            type: Boolean,
            default: false
        },
        accordion: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number,
            default: 500
        },
        readonly: {
            type: Boolean,
            default: false
        },
        wordformat: {
            type: Boolean,
            default: false
        },
        minWord: {
          type: Number,
          default: 0
        }
    },
    emits: ['onAfterUpload', 'wordCount'],
    data() {
        return {
            showModal: false,
            content: this.value,
            tinyEditorService: new TinymceCustomUploadPlugin(),
            editorApi: "60lj0ro6ojutgtjvqom1a5txsxm2azkl8pftmzhf8ddim86d",
            fileService: new FileService(),
            editorOptions: {
                height: this.height,
                fontsize_formats: "8px 10px 12px 14px 16px 18px 20px 22px 24px 36px 48px",
                menubar: false,
                external_plugins: {
                  'tiny_mce_wiris': `/assets/mathtype-tinymce5/plugin.min.js`,
                },
              draggable_modal: true,
              toolbar_mode: 'wrap',
                allow_script_urls: true,
                remove_script_host: false,
                relative_urls: false,
                valid_elements: "*[*]",
                language_url: this.$i18n.locale === 'en' ? false : `/assets/tinymce-lang/${this.$i18n.locale}.js`,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount pagebreak'
                ],
                toolbar:
                    `undo redo | fontselect fontsizeselect formatselect | ${this.contractElements ? `customSelect` : ''}
                    | bold italic forecolor backcolor |
                    alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | blockquote |
                    tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry |
            removeformat | table | link | image media ${this.customFileUpload ? `fileupload` : ''} | code | pagebreak | ${this.accordion ? `accordion` : ''}`,
                contextmenu: 'link | customUploadContext',
                images_upload_handler: uploadSingFile,
                language: this.$i18n.locale === "kz" ? "kk" : this.$i18n.locale,
                skin: false,
                content_css: false,
                content_style: this.wordformat ? "html{background: #f7f7f7;display: flex; justify-content: center; } " +
                    "body {background: #fff; font-size: 14px; width: 794px; min-height:1120px; padding: 20px}" +
                    ".mce-pagebreak { background: #f7f7f7;border: none; height: 15px; width:900px; margin-left:-50px }" +
                    ".editor_accordion_title {color: #1b78bd; margin-top: 20px} .editor_accordion_title:after {content: '\\02795';float: right;margin-left: 5px;}" +
                    "active:after{ content: \"\\2796\";} .editor_accordion_content{max-height: 0;overflow: hidden;}" +
                    " @media(max-width: 500px){html{display: block; }}" + contentUiCss : contentUiCss + "body {background: #fff; font-size: 14px;}" +
                    `.accordion {
    display: block;
    padding-bottom: 10px;

    .header {
        padding: 0 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #fff;
        color: #1b78bd;
        background: #e9f7ff;
        border-bottom: 1px solid #e7e7e7;
    }

    .body {
        //box-shadow: 0 2px 5px rgba(69, 115, 153, 0.2);
        border: 1px solid #e7e7e7;
        border-top: 0;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transition: opacity 500ms linear, max-height 500ms linear;
        will-change: opacity, max-height;

        &.fade-in {
            padding: 15px 0;
            opacity: 1;
            max-height: fit-content;
            transition: all 500ms linear;
            will-change: opacity, max-height;
        }

        .body-inner {
            padding: 0 15px;
        }

        .link_accordion {
            margin-top: 20px;
            cursor: pointer;
        }
    }
}`,
                setup: editor => {
                    const self = this;
                    this.content = this.value;
                    if (this.minWord !== 0) {
                      editor.on('KeyUp', () => {
                        const wordcount = editor.plugins.wordcount;
                        this.$emit('wordCount', wordcount.body.getWordCount())
                      })

                      editor.on('paste', () => {
                        const wordcount = editor.plugins.wordcount;
                        this.$emit('wordCount', wordcount.body.getWordCount())
                      })
                    }


                    editor.ui.registry.addToggleButton('fileupload', {
                        text: '<i class="fa-solid fa-file-arrow-up" style="font-size: 20px;"></i>',
                        onAction: () => {
                            //this.uploadFile();
                            this.tinyEditorService.openDialog(editor, self)
                        },
                        onSetup: this.tinyEditorService.toggleActiveState(editor)
                    });
                    editor.ui.registry.addMenuButton('customSelect', {
                        text: this.$t('doctemplate.editor.contractElements'),
                        fetch: (callback) => {
                            const items = [
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.ourside'),
                                    onAction: () => onSelectItem('{ourside}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.contragent'),
                                    onAction: () => onSelectItem('{contragent}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.place'),
                                    onAction: () => onSelectItem('{place}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.date'),
                                    onAction: () => onSelectItem('{date}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.period'),
                                    onAction: () => onSelectItem('{period}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.student'),
                                    onAction: () => onSelectItem('{student}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.individualEntrepreneur'),
                                    onAction: () => onSelectItem('{individualEntrepreneur}&nbsp;'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('doctemplate.editor.text'),
                                    onAction: () => onSelectItem('text'),
                                },
                                {
                                    type: 'menuitem',
                                    text: this.$t('common.number'),
                                    onAction: () => onSelectItem('{number}&nbsp;'),
                                },
                            ];
                            callback(items);
                        },
                    });
                    editor.ui.registry.addToggleButton('accordion', {
                    text: '<i title="Accordion" class="fa-regular fa-rectangle-list" style="font-size: 20px;"></i>',
                    onAction: () => {
                      addAccordion('Accordion title', 'Accordion content')
                    },
                    onSetup: this.tinyEditorService.toggleActiveState(editor)
                  });
                  editor.ui.registry.addToggleButton('accordionremove', {
                    text: '<i class="fa-solid fa-trash"></i>',
                    onAction: () => {
                      let node = editor.selection.getNode()
                      let accordionNode = node.closest('.accordion');
                      if (accordionNode) {
                        let confirmDelete = confirm('Delete the accordion?');
                        if (confirmDelete) {
                          accordionNode.remove();
                        }
                      }
                    },
                    onSetup: this.tinyEditorService.toggleActiveState(editor)
                  });
                  editor.ui.registry.addToggleButton('accordiontoggle', {
                    text: '<i class="fa-solid fa-right-left" style="transform: rotate(90deg);"></i>',
                    onAction: () => {
                      let node = editor.selection.getNode()
                      let accordionNode = node.closest('.accordion');
                      if (accordionNode) {
                        let bodyNode = accordionNode.querySelector('.body');
                        if (bodyNode) {
                          if (bodyNode.classList.contains('fade-in')) {
                            bodyNode.classList.remove('fade-in')
                          } else {
                            bodyNode.classList.add('fade-in');
                          }
                        }
                      }
                    },
                    onSetup: this.tinyEditorService.toggleActiveState(editor)
                  });
                  editor.ui.registry.addContextToolbar('accordiontoolbar', {
                    predicate: function (node) {
                      return node.nodeName.toLowerCase() === 'accordion_header' },
                    items: 'accordiontoggle accordionremove',
                    position: 'line',
                    scope: 'node'
                  });
                    const onSelectItem = (value) => {
                        if (value === "text") {
                            this.tinyEditorService.contractElementsDialog(editor, self)
                        } else {
                            const styledText = `<span style="font-weight: bold ;color: blue;font-style: italic;">${value}</span>`;
                            editor.selection.setContent(styledText);
                        }
                        editor.execCommand('removeformat', false, null);
                    };
                  const addAccordion = (value1, value2) => {
                      const styledText = `<div><accordion class="accordion">
                                               <accordion_header class="header">
                                                <div class="main_title">${value1}</div>
                                                <div class="accordion_icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                                        width="24" height="24" viewBox="0 0 24 24">
                                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor" />
                                                    </svg>
                                                </div></accordion_header>
                                                <div class="body"><div class="body-inner">${value2}</div></div>
                                          </accordion></div>`;
                      editor.selection.setContent(styledText);
                    if (styledText){
                    let acc = document.getElementsByClassName("editor_accordion_title");
                    let i;
                    for (i = 0; i < acc.length; i++) {
                      acc[i].addEventListener("click", function() {
                        this.classList.toggle("active");

                        let panel = this.nextElementSibling;
                        if (panel.style.display === "block") {
                          panel.style.display = "none";
                        } else {
                          panel.style.display = "block";
                        }
                      });
                    }}
                  };

                }
            },
            modalText: true,
            displayModal: false,
            agreementDesctiption: "",
        }
    },
    watch: {
        value(newValue) {
            this.content = newValue;
        }
    },
    methods: {
        uploadFile() {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const fd = new FormData();
                fd.append("files[]", file)
                this.fileService.uploadFile(fd).then(res => {
                    let item = res.data[0];
                    window.tinymce.activeEditor.execCommand('mceInsertContent', false, this.generateList(item));
                    this.$emit('onAfterUpload', item);
                }).catch(error => {
                    this.$toast.add({severity: "error", summary: error, life: 3000});
                });

            });
            input.click();
        },
        generateList(file) {
            return `<a href="${smartEnuApi + downloadRoute + file.uuid}">${file.filename}</a>`;
        },
        generateListLink(file, type) {
            let result = ""
            switch (type) {
                case 'view':
                    result = smartEnuApi + fileRoute + file.filepath;
                    break;
                case 'download':
                    result = smartEnuApi + downloadRoute + file.uuid;
                    break;
                default:
                    result = smartEnuApi + fileRoute + file.filepath;
                    break;
            }
            return result;
        },
        insertModal() {},
        closeModal() {
            this.displayModal = false;
        },
    }
}
</script>

<style scoped>
.mce-pagebreak{
    background: #cccccc!important;
}
</style>

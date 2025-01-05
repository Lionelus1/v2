import { createRouter, createWebHashHistory } from 'vue-router';
import Full from './components/Full.vue';
import store from '@/store/store';

function load(component) {
    return () => import(`./components/${component}.vue`)
}

const ifNotAuthenticated = (to, from, next) => {
    if (!store.getters.isAuthenticated) {
        next()
        return
    }
    next('/')
}

const ifAuthenticated = (to, from, next) => {
    if (store.getters.isAuthenticated) {
        next()
        return
    } else {
        store.dispatch("solveAttemptedUrl", to);
        next('/login')
        return
    }
}

const ifMainAdministrator = (to, from, next) => {
    if (store.getters.isAuthenticated) {
        if (store.getters.isMainAdministrator) {
            next()
            return
        } else {
            next('/access')
            return
        }
    } else {
        store.dispatch("solveAttemptedUrl", to);
        next('/login')
        return
    }
}

const ifUserRoles = (to, from, next) => {
    if (store.getters.isAuthenticated) {
        const roles = to.meta.roles;
        if (roles.some(role => store.getters.userRoles.includes(role))) {
            next();
            return;
        } else {
            next('/access');
            return;
        }
    } else {
        store.dispatch("solveAttemptedUrl", to);
        next('/login');
        return;
    }
}


const routes = [
    {
        path: '/login/:sessionID?',
        name: 'Login',
        component: load('Login'),
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/outqr',
        name: 'OutQr',
        component: load('OutQr'),
    },
    {
        path: '/human-resources/public/vacancy/:id',
        name: '/human-resources/public/vacancy',
        component: load('humanResources/vacancy/hr/SingleVacancy'),
    },
    {
        path: '/reception/request',
        name: "receptionRequest",
        component: load('publicReception/Request')
    },
    {
        path: '/document/:uuid',
        name: 'Document',
        component: load('documents/Document'),
    },
    {
        path: '/afterauth',
        name: 'AfterAuth',
        component: load('AfterAuth'),
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: load('Privacy')
    },
    {
        path: '/login',
        redirect: '/login',
        name: '/login',
        component: Full,
        children: [
            {
                path: '/',
                name: 'Welcome',
                component: load('Welcome'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/finance',
                name: 'Finance',
                component: load('finance/Finance'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/normdoc',
                name: '/documents/catalog/normdoc',
                component: load('documents/catalog/NormativeDocuments'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/contracts',
                name: '/documents/catalog/contracts',
                component: load('documents/catalog/Contracts'),
                beforeEnter: ifAuthenticated,
                props: route => ({
                    readonly: route.query.readonly === 'true',
                    showBackButton: route.query.showBackButton === 'true'
                })
            },
            {
                path: '/documents/catalog/educomplex/:docType',
                name: '/documents/catalog/educomplex',
                component: load('documents/catalog/DisciplineEduMetComplex'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/postaccmonrep',
                name: '/documents/catalog/postaccmonrep',
                component: load('documents/catalog/PostAccreditaionMonitoringReport'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/acts',
                name: '/documents/catalog/acts',
                component: load('documents/catalog/Acts'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/acts/status',
                name: '/documents/catalog/acts/status',
                component: load('documents/catalog/StatusActsGPC'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/scienceWorks',
                name: 'ScienceWorks',
                component: load('documents/catalog/ScienceWorks'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/scienceWorksList',
                name: 'ScienceWorksList',
                component: load('documents/catalog/ScienceWorksList'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/templates',
                name: '/documents/templates',
                component: load('documents/catalog/DocumentTemplates'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/contracts/:uuid',
                name: 'ContractsByUUID',
                component: load('documents/ContractV2'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/contracts/:uuid/request',
                name: 'ContractRequest',
                component: load('documents/ContractRequest'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/contracts/:uuid/related',
                name: 'ContractsRelatedDocuments',
                component: load('documents/catalog/RelatedDocuments'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/contracts/:uuid/related/:relatedUUID',
                name: 'RelatedDocument',
                component: load('documents/RelatedDocument'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/scienceWorks/:uuid',
                name: 'ScienceWorksPage',
                component: load('documents/pages/ScienceWorksPage'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/scienceWorksList/:uuid',
                name: 'ScienceWorksListPage',
                component: load('documents/pages/ScienceWorksListPage'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/contracts',
                name: '/documents/contracts',
                component: load('documents/ContractsFirstPage'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/sign/:uuid',
                name: 'DocSignaturesInfo',
                component: load('DocSignaturesInfo'),
            },
            {
                path: '/documents/certificates',
                name: 'certificateJournal',
                component: load('documents/certificates/Journal'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/scientific-works',
                name: 'ScientificWorks',
                component: load('documents/ScientificWorks'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/docrequests',
                name: 'DocumentRequests',
                component: load('references/ReferenceRequests'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/course/organizers',
                name: 'onlinecoursejournal',
                component: load('documents/onlinecourse/Organizers'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/categories-courses',
                name: 'categoriesCourses',
                component: load('documents/onlinecourse/CategoriesCourses'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/course/categories',
                name: 'onlinecoursecategory',
                component: load('documents/onlinecourse/Categories'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/courses/:courseID',
                name: 'onlinecourses',
                component: load('documents/onlinecourse/Courses'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/courses/edit/:fieldId/:courseId',
                name: 'EditCourse',
                component: load('documents/onlinecourse/AddCourse'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/courses/add/:fieldId',
                name: 'AddCourse',
                component: load('documents/onlinecourse/AddCourse'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/catcourses/:categoryID',
                name: 'onlinecoursesCat',
                component: load('documents/onlinecourse/CoursesTable'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/course/:id',
                name: 'onlinecoursedetail',
                component: load('documents/onlinecourse/Course'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/course/:id/:history_id',
                name: 'CourseStudents',
                component: load('documents/onlinecourse/CourseStudents'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/certificate/:uuid',
                name: 'certificate',
                component: load('documents/certificates/Certificate'),
            },
            {
                path: '/educational-programs/:slug',
                name: 'educationalPrograms',
                component: load('documents/onlinecourse/EducationalPrograms'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/educational-programs/bachelor/add/:degreeID',
                name: 'addEducationalPrograms',
                component: load('documents/onlinecourse/AddEducationalProgram'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/reports/sacreports',
                name: 'sacReports',
                component: load('documents/reports/SACReports'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/contragent/banks',
                name: '/contragent/banks',
                component: load('contragent/Banks'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/contragent/organizations',
                name: 'OrganizationList',
                component: load('contragent/v2/OrganizationList'),
                beforeEnter: ifUserRoles,
                meta: { roles: ['student', 'personal'] }
            },
            {
                path: '/contragent/organization/:id?',
                name: 'OrganizationPage',
                component: load('contragent/v2/OrganizationPage'),
                props: true,
                beforeEnter: ifUserRoles,
                meta: { roles: ['student', 'personal'] }
            },
            {
                path: '/user/cv/:uuid',
                name: 'CurriculumVitae',
                component: load('contragent/CurriculumVitae'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/contragent/persons/:type',
                name: 'PersonsList',
                component: load('contragent/v2/PersonsList'),
                beforeEnter: ifUserRoles,
                meta: { roles: ['personal'] }
            },
            {
                path: '/hdfs/hdfsmain',
                name: '/hdfs/hdfsmain',
                component: () => import('./components/hdfs/HdfsMain.vue'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/mailing',
                name: 'MailingTable',
                component: load('mailing/MailingComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'MailingTable',
                        component: load('mailing/MailingTable'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'AddEditMailing',
                        component: load('mailing/AddEditMailing'),
                        beforeEnter: ifAuthenticated,
                    },
                    // {
                    //     path: 'add',
                    //     name: 'AddMailing',
                    //     component: load('mailing/AddEditMailing'),
                    //     beforeEnter: ifAuthenticated,
                    // },
                    {
                        path: '/template',
                        name: 'TemplateEditor2',
                        props: true,
                        component: load('mailing/TemplateEditor'),
                        beforeEnter: ifAuthenticated,
                    },
                ]
            },
            {
                path: '/editMailing/:id',
                name: 'EditMailing',
                component: load('mailing/EditMailing'),
                props: true,
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/deleteMailing/:id',
                name: 'DeleteMailing',
                component: load('mailing/DeleteMailing'),
                props: true,
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/news',
                name: 'NewsComponent',
                component: load('news/NewsComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'NewsTable',
                        component: load('news/NewsTable'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'EditNews',
                        component: load('news/AddEditNews'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'HistoryNews',
                        component: load('news/HistoryNews'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'add',
                        name: 'AddNews',
                        component: load('news/AddEditNews'),
                        beforeEnter: ifAuthenticated,
                    }
                ]
            },
            {
                path: '/newscategories/cattable',
                name: 'CategoriesTable',
                component: load('news/CategoriesTable'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/events',
                name: 'Events',
                component: load('events/Events'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/smartenu/vaccination',
                name: '/smartenu/vaccination',
                component: load('smartenu/vaccination/Vaccination'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/dissertation',
                name: '/dissertation',
                component: load('dissertation/DissertationRouter'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'Main',
                        component: load('dissertation/Dissertation'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'members/:id&:role',
                        name: 'Members',
                        component: load('dissertation/Members'),
                        beforeEnter: ifAuthenticated
                    },
                    {
                        path: 'report/:id',
                        name: 'DissertationReport',
                        component: load('dissertation/DissertationReport'),
                        beforeEnter: ifAuthenticated
                    },
                    {
                        path: 'doctorals',
                        name: 'Doctorals',
                        component: load('dissertation/Doctorals'),
                        beforeEnter: ifAuthenticated
                    }
                ]
            },
            {
                path: '/faq/faqmain',
                name: 'FaqComponent',
                component: load('faq/FaqComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'FaqMain',
                        component: load('faq/FaqMain'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'FaqView',
                        component: load('faq/FaqView'),
                        beforeEnter: ifAuthenticated,
                    }

                ]
            },
            {
                path: '/nca/sign',
                name: '/nca/sign',
                component: load('ncasigner/SignDoc'),

            },
            {
                path: '/nca/find',
                name: '/nca/find',
                component: load('ncasigner/FindDoc'),

            },
            {
                path: '/ncasigner/showdoc/:id',
                name: '/ncasigner/showdoc',
                component: load('ncasigner/ShowDoc'),
            },
            {
                path: '/work-plan',
                name: 'WorkPlanComponent',
                component: load('work_plan/WorkPlanComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'WorkPlan',
                        component: load('work_plan/WorkPlan'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'WorkPlanEvent',
                        component: load('work_plan/WorkPlanEvent'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'reports/:id',
                        name: 'WorkPlanReport',
                        component: load('work_plan/WorkPlanReport'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'report/:id',
                        name: 'WorkPlanReportView',
                        component: load('work_plan/WorkPlanReportView'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'view/:id',
                        name: 'WorkPlanView',
                        component: load('work_plan/WorkPlanView'),
                        beforeEnter: ifAuthenticated
                    },
                ]
            },
            {
                path: '/pdf',
                name: 'PdfContent',
                component: load('work_plan/PdfContent'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/human-resources/career/vacancies',
                name: '/human-resources/career/vacancies',
                component: load('humanResources/vacancy/career/CareerVacancies'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/human-resources/public/vacancies',
                name: '/human-resources/public/vacancies',
                component: load('humanResources/vacancy/hr/HrVacancies'),
            },
            {
                path: '/human-resources/vacancy/:id',
                name: '/human-resources/vacancy',
                component: load('humanResources/vacancy/hr/SingleVacancy'),
            },
            {
                path: '/human-resources/vacancies',
                name: '/human-resources/vacancies',
                component: load('humanResources/vacancy/Vacancies'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/resume',
                name: 'Resume',
                component: load('humanResources/candidate/Resume'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/sign-verify',
                name: 'DocSignatureVerification',
                component: load('DocSignatureVerification'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/cabinet',
                name: 'Cabinet',
                component: load('humanResources/candidate/Cabinet'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/references',
                name: 'References',
                component: load('references/References'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/queue',
                name: '/queue',
                component: load('queue/Queue'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queue/operator/:id/:parentID',
                name: '/queueOperator',
                component: load('queue/Operator'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queueService',
                name: '/queueService',
                component: load('queue/QueueService'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queue/terminal/:id',
                name: '/queueTerminal',
                component: load('queue/Terminal'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queue/tv/:id',
                name: '/queueTv',
                component: load('queue/Tv'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queue/QueueReport/:id',
                name: '/queueReport',
                component: load('queue/QueueReport'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/queue/mode/:id',

                name: '/queueMode',
                component: load('queue/QueueMode'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/queue/qr/:id',
                name: '/queueQR',
                component: load('queue/QueueQR'),
            },
            {
                path: '/reception',
                name: 'reception',
                component: load('publicReception/Journal'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/reception/question/:id',
                name: 'ReceptionQuestion',
                component: load('publicReception/Answer'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/cafedra',
                name: 'Cafedra',
                component: load('documents/Cafedra'),
                beforeEnter: ifAuthenticated,

            },
            {
                path: '/access',
                name: 'access',
                component: () => import('./pages/Access.vue'),
            },
            {
                path: '/course/certificate/templates',
                name: 'CertificateTemplate',
                component: load('documents/certificates/Template'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/telegram',
                name: 'TelegramComponent',
                component: load('telegram/Questions'),
                meta: { roles: ['telegram', 'main_administrator'] },
                beforeEnter: ifUserRoles,
            },
            {
                path: '/showcase',
                name: 'ShowcaseComponent',
                component: load('showcase/Showcase'),
                meta: { roles: ['showcase'] },
                beforeEnter: ifUserRoles,

            },
            {
                path: '/hikvision',
                name: 'HikvisionTemplate',
                component: load('hikvision/Hikvision'),
                meta: { roles: ['personal'] },
                beforeEnter: ifUserRoles,
            },

            {
                path: '/helpdesk/v2',
                name: 'HelpDeskComponent',
                component: load('helpDesk/HelpDeskComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'DeskJournal',
                        component: load('helpDesk/DeskJournal'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'request/:uuid',
                        name: 'Request',
                        component: load('helpDesk/Request'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'create',
                        name: 'CreateCategory',
                        component: load('helpDesk/CreateCategory'),
                        beforeEnter: ifAuthenticated
                    },
                    {
                        path: 'edit/:id',
                        name: 'EditCategories',
                        component: load('helpDesk/EditCategories'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'add',
                        name: 'AddCategories',
                        component: load('helpDesk/EditCategories'),
                        beforeEnter: ifAuthenticated,
                    }
                ]
            },
            {
                path: '/helpdesk',
                name: 'HelpDeskComponent2',
                component: load('helpDesk/v2/HelpDeskComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'DeskJournal2',
                        component: load('helpDesk/v2/DeskJournal'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: '/request/v2/:uuid',
                        name: 'Request2',
                        component: load('helpDesk/v2/Request'),
                        beforeEnter: ifAuthenticated,
                    }
                ]
            },
            {
                path: '/orgControl',
                name: 'OrgControl',
                component: load('roleControl/OrgControl'),
                beforeEnter: ifMainAdministrator,
            },
            {
                path: '/enu/menus',
                name: 'EnuMenuList',
                component: load('enuwebsite/EnuMenuList'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/enu/pages',
                name: 'EnuPagesComponent',
                component: load('enuwebsite/pages/EnuPagesComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'EnuPagesList',
                        component: load('enuwebsite/pages/EnuPagesList'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: ':id',
                        name: 'EditPage',
                        component: load('enuwebsite/pages/EditPage'),
                        beforeEnter: ifAuthenticated,
                    },
                ]
            },
            {
                path: '/enu/page/:id',
                name: 'LandingPageView',
                component: load('enuwebsite/pages/LandingPageView'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/enu/blocks',
                name: 'BlockComponent',
                component: load('enuwebsite/blocks/BlockComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'BlockList',
                        component: load('enuwebsite/blocks/BlockList'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'view/:id',
                        name: 'BlockView',
                        component: load('enuwebsite/blocks/BlockView'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'admission-info',
                        name: 'AdmissionInfoComponent',
                        component: load('enuwebsite/blocks/admission.info/AdmissionInfoComponent'),
                        beforeEnter: ifAuthenticated,
                        children: [
                            {
                                path: '',
                                name: 'AdmissionInfoList',
                                component: load('enuwebsite/blocks/admission.info/AdmissionInfoList'),
                                beforeEnter: ifAuthenticated,
                            },
                            {
                                path: 'categories',
                                name: 'AdmissionInfoCategory',
                                component: load('enuwebsite/blocks/admission.info/AdmissionInfoCategory'),
                                beforeEnter: ifAuthenticated,
                            }
                        ]
                    },
                    {
                        path: 'edu-price',
                        name: 'EduPriceComponent',
                        component: load('enuwebsite/blocks/edu.price/EduPriceComponent'),
                        beforeEnter: ifAuthenticated,
                        children: [
                            {
                                path: '',
                                name: 'EduPriceCategoryList',
                                component: load('enuwebsite/blocks/edu.price/EduPriceCategoryList'),
                                beforeEnter: ifAuthenticated,
                            },
                            {
                                path: 'prices/:id',
                                name: 'EduPriceList',
                                component: load('enuwebsite/blocks/edu.price/EduPriceList'),
                                beforeEnter: ifAuthenticated,
                            }
                        ]
                    },
                    {
                        path: 'edu-score',
                        name: 'EduScoreComponent',
                        component: load('enuwebsite/blocks/edu.score/EduScoreComponent'),
                        beforeEnter: ifAuthenticated,
                        children: [
                            {
                                path: '',
                                name: 'EduScoreCategoryList',
                                component: load('enuwebsite/blocks/edu.score/EduScoreCategoryList'),
                                beforeEnter: ifAuthenticated,
                            },
                            {
                                path: 'scores/:id',
                                name: 'EduScoreList',
                                component: load('enuwebsite/blocks/edu.score/EduScoreList'),
                                beforeEnter: ifAuthenticated,
                            }
                        ]
                    },
                    {
                        path: 'edu-doctoral-score',
                        name: 'EduDoctoralScoreComponent',
                        component: load('enuwebsite/blocks/edu.doctoral.score/EduDoctoralScoreComponent'),
                        beforeEnter: ifAuthenticated,
                        children: [
                            {
                                path: '',
                                name: 'EduDoctoralScoreCategoryList',
                                component: load('enuwebsite/blocks/edu.doctoral.score/EduDoctoralScoreCategoryList'),
                                beforeEnter: ifAuthenticated,
                            },
                            {
                                path: 'drscores/:id',
                                name: 'EduDoctoralScoreList',
                                component: load('enuwebsite/blocks/edu.doctoral.score/EduDoctoralScoreList'),
                                beforeEnter: ifAuthenticated,
                            }
                        ]
                    },
                ]
            },
            {
                path: '/blog',
                name: 'BlogComponent',
                component: load('blog/BlogComponent'),
                beforeEnter: ifAuthenticated,
                children: [
                    {
                        path: '',
                        name: 'BlogList',
                        component: load('blog/BlogList'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'requests/:id',
                        name: 'BlogRequests',
                        component: load('blog/BlogRequests'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'view/:id',
                        name: 'BlogRequestView',
                        component: load('blog/BlogRequestView'),
                        beforeEnter: ifAuthenticated,
                    }
                ]
            },
            {
                path: '/enu/settings',
                name: 'EnuSiteSettings',
                component: load('enuwebsite/EnuSiteSettings'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/enu/faculties',
                name: 'Faculties',
                component: load('enuwebsite/faculties/Faculties'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/orgControl',
                name: 'OrgControl',
                component: load('roleControl/OrgControl'),
                beforeEnter: ifMainAdministrator,
            },
            {
                path: '/approvalList',
                name: 'ApprovalListControl',
                component: load('roleControl/ApprovalListControl'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/qr',
                name: 'QR',
                component: () => import('./components/QrGenerator.vue'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/categories-finances',
                name: 'categoriesFinances',
                component: () => import('./components/CategoriesFinances'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/catfinances/:categoryID',
                name: 'financeCat',
                component: () => import('./components/MyFinances'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/integrations',
                name: 'IntegrationList',
                component: load('integration/IntegrationList'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/integrations/params',
                name: 'IntegrationParams',
                component: load('integration/IntegrationParams'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/service-catalog',
                name: 'ServiceCatalog',
                component: load('service-catalog/ServiceCatalog'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/science/scientists',
                name: 'ScientistsList',
                component: load('science/ScientistsList'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/science/scientists/:id',
                name: 'ScientistsProfile',
                component: load('science/ScientistsProfile'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/demo',
                name: 'demos',
                component: load('DemoTemplate'),
                beforeEnter: ifAuthenticated,
            },
        ]
    },

    {
        path: '/guide',
        name: 'Guide',
        component: load('guide/GuideFull'),
        beforeEnter: ifAuthenticated,
        children: [
            {
                path: ':id',
                name: 'MainGuide',
                component: load('guide/MainGuide'),
                beforeEnter: ifAuthenticated,
            },
        ]
    },
    {
        path: '/queue/qr/:id',
        name: '/queueQR',
        component: load('queue/QueueQR'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


router.beforeEach((to, from, next) => {
    if (to.name === 'Login' && to.params.sessionID) {
        localStorage.setItem('sessionID', to.params.sessionID);
    }
    next();
});


export default router;

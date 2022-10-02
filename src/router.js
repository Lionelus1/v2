import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';
import Full from './components/Full.vue';

function load(component) {
    return () => import(`./components/${component}.vue`)
}

import store from '@/store/store' // your vuex store


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
    }else{
        store.dispatch("solveAttemptedUrl",to);
        next('/login')
        return
    }

}


const routes = [
    {
        path:'/login',
        name:'Login',
        component: load('Login'),
    },
    {
        path:'/outqr',
        name:'OutQr',
        component: load('OutQr'),
    },
    {
        path: '/reception/request',
        name: "receptionRequest",
        component: load('publicReception/Request')
    } ,
    
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
        path: '/',
        redirect:'/login',
        name: '/login',
        component: Full,
        children:[


            // Менің қосқандарым
            {
                path: '/documents/catalog/normdoc',
                name: '/documents/catalog/normdoc',
                component: load('documents/catalog/CatalogNormDoc'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/documents/catalog/educomplex',
                name: '/documents/catalog/educomplex',
                component: load('documents/catalog/EducationalComplex'),
                beforeEnter: ifAuthenticated,
            },
            {

                path: '/documents/doctemplate:',
                name: '/documents/doctemplate',
                component: load('documents/DocTemplate'),
                beforeEnter: ifAuthenticated,
            },
            {

                path: '/documents/contracts',
                name: '/documents/contracts',
                component: load('documents/Contracts'),
                beforeEnter: ifAuthenticated,
            },
            {

                path: '/documents/journal',
                name: '/documents/journal',
                component: load('documents/Journal'),
                beforeEnter: ifAuthenticated,
            },
            {

                path: '/documents/contract/:id',
                name: '/documents/contract',
                component: load('documents/Contract'),
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
                name: 'organizations',
                component: load('contragent/Organizations'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/contragent/persons/:type',
                name: 'persons',
                component: load('contragent/Persons'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/hdfs/hdfsmain',
                name: '/hdfs/hdfsmain',
                component: () => import('./components/hdfs/HdfsMain.vue'),
                beforeEnter: ifAuthenticated,
            },

            {
                path: '/news',
                name: 'NewsTable',
                component: load('news/NewsTable'),
                beforeEnter: ifAuthenticated,
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
                        name: 'WorkPlanEvents',
                        component: load('work_plan/WorkPlanEvents'),
                        beforeEnter: ifAuthenticated,
                    },
                    {
                        path: 'view/:id',
                        name: 'WorkPlanView',
                        component: load('work_plan/WorkPlanView'),
                        beforeEnter: ifAuthenticated
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
                        path: 'result/:id',
                        name: 'WorkPlanEventResult',
                        component: load('work_plan/WorkPlanEventResult'),
                        beforeEnter: ifAuthenticated,
                    }
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
                path: 'sign/:uuid',
                name: 'DocSignaturesInfo',
                component: load('DocSignaturesInfo'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/cabinet',
                name: 'Cabinet',
                component: load('humanResources/candidate/Cabinet'),
                beforeEnter: ifAuthenticated,
            },
            {
                path:'/myref',
                name:'OutQr',
                component: load('smartenu/JobDescription'),
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
            }
                
        ]
    }


];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

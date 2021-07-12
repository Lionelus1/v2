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
    }
    next('/login')
}


const routes = [
    {
        path:'/login',
        name:'Login',
        component: load('Login'),
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/afterauth',
        name: 'AfterAuth',
        component: load('AfterAuth'),
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/',
        redirect:'/smartenu/admin/news/newstable',
        name: '/',
        component: Full,
        children:[


            // Менің қосқандарым
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
                name: '/contragent/organizations',
                component: load('contragent/Organizations'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/contragent/persons/:type',
                name: '/contragent/persons',
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
                path: '/smartenu/admin/news/newstable',
                name: '/smartenu/admin/news/newstable',
                component: load('smartenu/admin/news/NewsTable'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/smartenu/admin/newscategories/cattable',
                name: '/smartenu/admin/newscategories/cattable',
                component: load('smartenu/admin/newscategories/CategoriesTable'),
                beforeEnter: ifAuthenticated,
            },

            {
                path: '/smartenu/admin/events/events',
                name: '/smartenu/admin/events/events',
                component: load('smartenu/admin/events/Events'),
                beforeEnter: ifAuthenticated,
            },
            {
                path: '/smartenu/vaccination',
                name: '/smartenu/vaccination',
                component: load('smartenu/vaccination/Vaccination'),
                beforeEnter: ifAuthenticated,
            },
        ]
    }


];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;

import Enum from "../enum/docstates";

export class MenuService {

    getGlobalMenu($t) {
        return [

          /*   {
               label: $t('common.administration'), icon: 'pi pi-fw pi-shield',
               items: [
                 {
                   label: $t('hr.vacancies'),
                   icon: 'pi pi-fw pi-user-plus',
                   to: '/human-resources/vacancies'
                 },
               ]ß

             },*/
            {
                label: $t('common.documents'), icon: 'pi pi-fw pi-folder',
                items: [
                    {
                        label: $t('contracts.template'), icon: 'pi pi-fw pi-book', to: '/documents/doctemplate',
                        visible: !this.findRole("student")
                    },
                    {label: $t('contracts.title'), icon: 'pi pi-fw pi-copy', to: '/documents/contracts'},
                    {
                        label: $t('smartenu.catalogNormDoc'),
                        icon: 'pi pi-fw pi-folder',
                        to: '/documents/catalog/normdoc'
                    },
                    {
                        label: $t('educomplex.title'), icon: 'pi pi-fw pi-folder', to: '/documents/catalog/educomplex'
                    },
                ]

            },
            {
                label: $t('common.administration'), icon: 'pi pi-fw pi-shield',
                items: [
                    {
                        label: $t('hr.vacancies'),
                        icon: 'pi pi-fw pi-user-plus',
                        to: '/human-resources/vacancies',
                        visible: this.isVacancyRightsValidity()
                    },
                    {
                        label: $t('common.cafedra'),
                        icon: 'pi pi-fw pi-briefcase',
                        to: '/cafedra',
                        visible: this.findRole("dephead") || this.findRole("practice_responsible")
                    },
                ]
            },
            {
                label: $t('common.contragents'), icon: 'pi pi-fw pi-users',
                visible: !this.findRole("student") && (this.getLoginedUser().organization && this.getLoginedUser().organization.id === 1),

                items: [
                    {label: $t('common.organizations'), icon: 'pi pi-fw pi-home', to: '/contragent/organizations'},
                    /*{label: 'Банктер', icon: 'pi pi-fw pi-money-bill', to: '/contragent/banks'},
                    {
                      label: 'Жеке тұлғалар',
                      icon: 'pi pi-fw pi-user',
                      to: '/contragent/persons/' + Enum.PersonType.IndividualEntrepreneur
                    },*/
                    {
                        label: $t('common.personal'),
                        icon: 'pi pi-fw pi-user',
                        to: '/contragent/persons/' + Enum.PersonType.OrganizationMember
                    }
                ]
            },
            /*{
                label: 'HDFS', icon: 'pi pi-fw pi-folder', to: '/hdfs/hdfsmain'
            },*/
            {

                label: $t('smartenu.newsTitle'), icon: 'pi pi-fw pi-users',
                items: [
                    {
                        label: $t('smartenu.categories'),
                        icon: 'pi pi-fw pi-home',
                        to: '/newscategories/cattable'
                    },
                    {label: $t('smartenu.newsList'), icon: 'pi pi-fw pi-money-bill', to: '/news'},
                ]
            },

            {
                label: $t('smartenu.eventsTitle'), icon: 'pi pi-fw pi-folder', to: '/events'
            },


            {
                label: $t('vaccination.title'), icon: 'pi pi-fw pi-check-circle', to: '/smartenu/vaccination'
            },
            /*{
              label:  $t('faq.title'), icon: 'pi pi-fw pi-question-circle', to: '/faq/faqmain'
            },*/
            {
                label: $t('publicReception.title'), icon: 'pi pi-fw pi-question-circle', to: '/reception'
            },
            {
                label: $t('dissertation.title'), icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: $t('dissertation.council.list'),
                        icon: 'pi pi-fw pi-list',
                        to: '/dissertation',
                        visible: this.isDissertationAdmin() || this.findRole("dissertation_council_secretary")
                    },
                    {
                        label: $t('dissertation.doctoralCard'),
                        icon: 'pi pi-fw pi-users',
                        to: '/dissertation/doctorals',
                        visible: this.isRoleGroupMember("dissertation_council") || this.isDissertationAdmin()
                    }
                ]

            },
            {
                label: $t('workPlan.plans'), icon: 'pi pi-fw pi-folder', to: '/work-plan'
            },
            {
                label: $t('common.forStudentsAndGraduates'), icon: 'pi pi-fw pi-users',
                items: [
                    {
                        label: $t('hr.vacancies'),
                        icon: 'pi pi-fw pi-user-plus',
                        to: '/human-resources/career/vacancies'
                    },
                ]
            },
            /*{

                   label: $t('common.forStudentsAndGraduates'), icon: 'pi pi-fw pi-users',
                   items: [
                     {
                       label: $t('hr.vacancies'),
                       icon: 'pi pi-fw pi-user-plus',
                       to: '/human-resources/public/vacancies'
                     },
                   ]
                 },*/

            {
                label: $t('hr.vacancies'),
                icon: 'pi pi-fw pi-user-plus',
                to: '/human-resources/public/vacancies'
            },

            {
                label: $t('queue.title'), icon: 'pi pi-fw pi-users ',
                items: [
                    {
                        label: $t('queue.title'), icon: 'pi pi-fw pi-plus-circle', to: '/queue'
                    },

                    /* {
                      label:  $t('queue.addService'), icon: 'pi pi-fw pi-th-large', to:'/queueCategories'
                     },
                    {
                      label:  $t('queue.secretary'), icon: 'pi pi-fw pi-user-edit', to:'/queueService'
                    },*/

                ]

            },

            {
                label: $t('web.mainMenuTitle'), icon: 'pi pi-fw pi-box ',
                visible: this.findRole('enu_web_admin'),
                items: [
                    {
                        label: $t('web.menuPage'), icon: 'pi pi-fw pi-bars', to: '/enu/menus'
                    },
                    {
                        label: $t('web.pageLink'), icon: 'pi pi-fw pi-external-link', to: '/enu/pages'
                    },
                    {
                        label: $t('web.blocks'), icon: 'fa-solid fa-cube', to: '/enu/blocks'
                    },
                    {
                        label: $t('web.blog'), icon: 'fa-solid fa-message', to: '/blog'
                    }
                ]
            },
        ]
    }

    isDissertationAdmin() {
        return this.findRole('dissertation_chief');
    }

    isVacancyRightsValidity() {
        let role = this.findRole('hr_administrator') ||
            this.findRole('career_administrator') ||
            this.findRole('hr_moderator') ||
            this.findRole('career_moderator') ||
            this.findRole('vacancy_initial_approve') ||
            this.findRole('vacancy_final_approve');
        return role;
    }

    isRoleGroupMember(groupPrefix) {
        let loginedUser = this.getLoginedUser();
        if (!loginedUser.roles) {
            return false;
        }
        for (let i = 0; i < loginedUser.roles.length; i++) {
            if (loginedUser.roles[i].name.includes(groupPrefix)) {
                return true;
            }
        }
        return false;
    }

    getLoginedUser() {
        return JSON.parse(window.localStorage.getItem("loginedUser"));
    }

    findRole(roleName) {
        let loginedUser = this.getLoginedUser();
        if (!loginedUser.roles) {
            return false;
        }
        for (let i = 0; i < loginedUser.roles.length; i++) {
            if (loginedUser.roles[i].name === roleName) {
                return true;
            }
        }
        return false;
    }

}

export default {
    CREATED: {
      Value: "created",
      ID: 1,
    },
    INAPPROVAL: {
      Value: "inapproval",
      ID: 2,
    },
    APPROVED: {
      Value: "approved",
      ID: 3,
    },
    REVISION: {
      Value: "revision",
      ID: 4,
    },
    REJECTED: {
      Value: "rejected",
      ID: 5,
    },

    roles: {
      LegalServiceHead : "legal_service_head"
    },

    DocSourceType : {
        Template: 0,
        FilledDoc: 1,
    },
    ContragentType: {
      Organization : 1,
      Bank: 2,
      Person: 4,
    },
    PersonType: {
      //жеке кәсіпкер
      IndividualEntrepreneur: 1,
      //ұйым мүшесі (қызметкер, студент, магистрант, бастық және т.б.)
      OrganizationMember: 2,
      Student: 3,
    },
    SignRighType : {
      Individual: 'individual', //для физ лиц
      Ceo: 'ceo', //для первого руководителя
      SignRight: 'sign_right', //сотрудник с правом подписи
      FinancialSignRight: 'financial_sign_right', //сотрудник с правом подписи фин документов
      HrWorker: 'hr_worker', //сотрудник отдела кадров
      Internal: 'internal' //внутренний документооборот (все ключи алгоритма ГОСТ)
    },
    EducationLevel: {
      Bachelor: '6B',
      Magister: '7M',
      Residency: '7R',
      Doctorate: '8D',
    },
    FolderType: {
      NormativeDocuments: 0,
      Journals: 1,
    },
}
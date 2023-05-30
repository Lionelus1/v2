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
    SIGNING: {
      Value: "signing",
      ID: 6,
    },
    SIGNED: {
      Value: "signed",
      ID: 7,
    },

    roles: {
      LegalServiceHead : "legal_service_head"
    },

    DefaultApprovalListType: {
      DocTemplate: 0,
      ReadyAgreement: 1,
    },

    DocSourceType : {
      Template: 0,
      FilledDoc: 1,
    },

    DocType : {
      DocTemplate: 1,
      EduComplex: 2,
      WorkPlan: 3,
      Dissertation: 4,
      Contract: 5,
      NormativeDoc: 6,
      CertificateTemplate: 7,
      Certificate: 8,
      RelatedDoc: 9,
      PostAccreditationMonitoringReport: 10,
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
      EduComplex: 2,
      FilledDoc: 3,
    },
}
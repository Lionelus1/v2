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
  REAPPROVAL: {
    Value: "reapproval",
    ID: 8,
  },
  UPDATED: {
    Value: "updated",
    ID: 9,
  },
  ISSUED: {
    Value: "issued",
    ID: 10,
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
    Reference: 11,
    ScienceWorks: 12,
    ScienceWorksList: 13,
    ActCompletedWorks: 14,
    RequestList: 15,
    DT_Request:16
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
    References: 4,
    Accredation: 5,
    RelatedDocumentTemplates: 7,
    Agreement: 8,
  },

  DocumentRequestType: {
    CounterpartyInfoRequest: 'counterparty_info_request',
    ReferenceErrorCorrection: 'reference_error_correction',
    ReferenceInfoRequest: 'reference_info_request',
    ReferenceSalaryRequest: 'reference_salary_request',
    ScienceAdvisorApproval: 'science_advisor_approval',
    AccountantsExecutionRequest: 'accountants_execution_request',
  },

  ScienceWorkType: {
    Article: 'article',
    Monograph: 'monograph',
    ScopusArticle: 'scopus_article',
    PublicationKOKSNVO: 'publication_koksnvo',
    Textbooks: 'textbooks',
    Free: 'free',
  },

  StatusesArray: {
    StatusCreated: {
      id: 'status_created',
      nameRu: "Создан",
      nameKz: "Құрылды",
      nameEn: "Created",
      value: "created"
    },
    StatusInapproval: {
      id: 'status_inapproval',
      nameRu: "На согласовании",
      nameKz: "Келісуде",
      nameEn: "In approval",
      value: "inapproval"
    },
    StatusApproved: {
      id: 'status_approved',
      nameRu: "Согласован",
      nameKz: "Келісілді",
      nameEn: "Approved",
      value: "approved"
    },
    StatusRevision: {
      id: 'status_revision',
      nameRu: "На доработке",
      nameKz: "Түзетуде",
      nameEn: "Revision",
      value: "revision"
    },
    StatusSigning: {
      id: 'status_signing',
      nameKz: "Қол қоюда",
      nameRu: "На подписи",
      nameEn: "Signing",
      value: "signing"
    },
    StatusSigned: {
      id: 'status_signed',
      nameRu: "Подписан",
      nameKz: "Қол қойылды",
      nameEn: "Signed",
      value: "signed"
    },
  },

  CertificatesArray: {
    Individual: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    },
    Internal: {
      namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
      nameru: "Для внутреннего документооборота (ГОСТ)",
      nameen: "For internal document management (GOST)",
      value: "internal"
    },
    Ceo: {
      namekz: "Бірінші басшының сертификаты",
      nameru: "Сертификат первого руководителя",
      nameen: "Certificate of the CEO",
      value: "ceo"
    },
    HrWorker: {
      namekz: "Кадр бөлімі қызметкерінің сертификаты",
      nameru: "Сертификат сотрудника отела кадров",
      nameen: "Certificate of the HR worker",
      value: "hr_worker"
    },
    SignRight: {
      namekz: "Қол қою құқығы бар қызметкер сертификаты",
      nameru: "Сертификат сотрудника с правом подписи",
      nameen: "Certificate of the employee with the right to sign",
      value: "sign_right"
    },
    FinancialSignRight: {
      namekz: "Қаржы құжаттарына қол қою құқығы бар қызметкер сертификаты",
      nameru: "Сертификат сотрудника с правом подписи финансовых документов",
      nameen: "Certificate of the employee with the right to sign financial docs",
      value: "financial_sign_right"
    },
  }
}
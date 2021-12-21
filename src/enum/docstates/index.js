export default {
    CREATED: "created",
    INAPPROVAL: "inapproval",
    APPROVED: "approved",
    REVISION: "revision",
    REJECTED: "rejected",
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
    
    
    EducationLevel: {
      Bachelor: '6B',
      Magister: '7M',
      Residency: '7R',
      Doctorate: '8D',
    },
}
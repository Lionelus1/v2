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
      OrganizationMember: 2
    }
}
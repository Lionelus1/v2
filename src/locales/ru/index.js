export default {
    common: {
        login: "Вход",
        logout: "Выход",
        enterLogin: "Введите ИИН или почту platonus",
        enterPassword: "Введите пароль",
        add : "Добавить",
        edit: "Редактировать",
        delete: "Удалить",
        close: "закрыть",
        name : "Имя",
        created: "Создан",
        createdBy: "автор",
        fullName: "ФИО",
        updated: "Изменен",
        type:   "Тип",
        state: "Статус",
        status: "Статус",
        show: "Просмотр",
        save: "Сохранить",
        download: "Скачать",
        loading: "загрузка",
        toapprove: "На согласование",
        tosign: "На подпись",
        comment: "Комментарий",
        contacts: "Контакты",
        code: "Код",
        filter: "фильтр",
        yes: "Да",
        no: "Нет",
        cancel: "Отмена",
        main: "Основные",
        nameIn: "Наименование",
        nameInQazaq: "Наименование на казахском",
        nameInRussian: "Наименование на русском",
        nameInEnglish: "Наименование на английском",
        contentInQazaq: "Контент на казахском",
        contentInRussian: "Контент на русском",
        contentInEnglish: "Контент на английском",
        number: "Номер",
        userGroup: "Группа пользователей",
        selectGroup: "Выберите группу",
        catalog: "Каталог",
        doc: "Документ",
        newCatalog: "Новый каталог",
        newDoc: "Новый документ",
        description: "Короткое описание",
        records: "Записей",
        recordsLoading: "Список загружается ...",
        recordsNotFound: "Не найдено записей",
        refinf: "Справочная информация",
        registration: "Регистрация",
        search: "Пойск",
        send: "Отправить",
        showingRecordsCount: ' Показаны записи с {first} по {last} из  {totalRecords} ',
        organization: "Организация",
        params: "Параметры",
        person: "Персона",
        personal: "Сотрудник",
        teacher: "ППС",
        student: "Обучающийся",
        doYouWantDelete: "Вы действительно хотите удалить",
        publish: "Опубликовать",
        reject: "Отказать",
        online: "Онлайн",
        offline: "Оффлайн",

        states: {
            created : "создан",
            inapproval : "на согласовании",
            approved: "согласован",
        },
        message: {
            title: {
                downloadError: "Ошибка скачивания",
                uploadError: "Ошибка загрузки",
                saveError: "Ошибка сохранения",
                docCreation: "Добавление нового каталога",
            },
            sendToApprovalError: "Ошибка во время отправления на согласование. Проверьте правильность указанных данных!",
            downloadError: "Ошибка во время скачивания",
            uploadError: "Ошибка во время загрузки",
            saveError: "Ошибка во время сохранения",
            serverError: "Серверная ошибка",
            groupsNotSelected: "Не указали группы",
            catCreateError: "Ошибка во время создания нового каталога",
            qazNameNotfilled: "Не указали наименование на казахском",
            rusNameNotfilled: "Не указали наименование на русском",
            engNameNotfilled: "Не указали наименование на английском",
            codeNotFilled: "Не указали код каталога",
            catSuccesCreated: "Новый каталог успешно добавлен",
            recordNotFound: "Подходящих записей не найдено",
            succesSendToApproval: "Успешно отправлено на соглашение",
            succesRegistered: "Успешно зарегистрировано",
            succesSaved: "Успешно сохранено",
        },
        language: {
            kz: "на казахском",
            ru: "на русском",
            en: "на аанглийском"
        },

    },
    bank: {
        title: "Банки",
        title2: "Банк",
        card: "Карточка",
        swift: "БИК",
        account: "Корреспондентский счет",
        requisite: "Банковские реквизиты",
        accnumber: "Номер счета"

    },
    contact: {
        title: "Контактная информация",
        address: "Юридический адрес",
        postaddress: "Почтовый адрес",
        locality: "Населенный пункт",
        phone: "Телефон",
        email: "Эл.почта",
        bin: "БСН",
        iin: "ИИН",
        mailto: "Написать письмо",
        fname: "Имя",
        lname: "Фамилия",
        sname: "Отчество",
        birthday: "Дата рождения",
        position: "Должность",
        gender: "Пол",
        idcard: {
            requisite: "Реквизиты документа",
            givenorg: "Орган выдачи",
            givendate: "Дата выдачи",
            expire: "Годен до",
        }
    },
    contragent: {
        form: "Форма организации",
        active: "Действующий",
        inactive: "Недействующий",
        resident: "Резидент",
        noneresident: "Не резидент",
        dossier: "Открыть досье",
        organization: "Организации",
        title: "Контрагенты",
    },
    doctemplate: {
        title : "Создание шаблона документа",
        templates: "Шаблоны документов",
        selected: "Выбранный шаблон",
        description: "Короткое описание шаблона",
        newTemplate: "Новый шаблон",
        updateTemplate: "Обновить шаблон",
        saveTemplate: "Сохранить шаблон",
        download: "Скачивание шаблона",
        approvingUsers: "Согласующее лицо (лица)",
        message: {
            notSelected: "Не выбран шаблон",
            downloadError: "Не удалось скачать шаблон",
            textNotFilled: "Не введен текст документа",
            succesUpdated: "Шаблон успешно обновлен",
            descriptionNotFilled: "Не введен короткое описание шаблона",
            succesFilled: "Новый шаблон успено добавлен. Введите текст шаблона",
        },
        editor: {
            contractElements: "Элементы договора",
            contragent: "Контрагент",
            ourside: "Наша сторона",
            number: "Номер",
            period: "Период",
            text: "Текст",
            student: "Обучающийся",
            place: "Место заключения договора",
            date: "Дата заключения договора",
            addElement: "Добавление элемента договора",
            message: {
            }
        },
    },
    contracts : {
        title: "Договоры",
        autogenerate: "Будет сформировано автоматически при подписании или регистрации",
        contract:"Договор",
        documents: "Договорные документы",
        create: "Быстрое создание договоров, соглашений",
        list: "Реестр договоров",
        listdesc: "Список всех договоров, соглашений",
        journal: "Журнал",
        orgdesc: "Организации, с которыми взаимодействуем",
        person: "Физические лица, с которыми взаимодействуем.",
        signer: "Подписывает",
        signing: "Подписание",
        fromtemplate: "Из шаблона",
        fromdoc: "Из готового документа",
        message: {
            created: "Проект договора успешно создан"
        }
    },
    hdfs: {
        title: "Файлы",
        fileName: "Название файла",
        download: "Скачать",
        remove: "Удалить",
        uploadTitle: "Загрузка файлов",
        chooseFile: "Выберите файл",
        uploadBtn: "Загрузить",
        cancelBtn: "Отменить",
        success: "Успешно",
        toastMsg: "Файл загружен",
        fileRemoved: "Файл удален",
        dragMsg: "Перетащите файлы сюда, чтобы загрузить их",
        search: "Поиск",
        noData: "Нет данных",
        loading: "Загрузка...",
    },
    ncasigner: {
        chooseFile: "Выберите файл",
        docIdNotExistMessageForFind: "Для того, чтобы найти страницу подписанного документа по файлу, в имени файла должен присутствовать корректный идентификатор SIGNERAPP. Убедитесть, что в имени вашего файла указан правильный идентификатор SIGNERAPP.",
        docIdNotExistMessageForSign: "Для того, чтобы подписать ранее подписанный документ по файлу, в имени файла должен присутствовать корректный идентификатор SIGNERAPP. Убедитесть, что в имени вашего файла указан правильный идентификатор SIGNERAPP. В противном случее, укажите имя файла без идентификатора SIGNERAPP для создания новой цепочки подписей.",
        reload: "Перезагрузить страницу и попробовать снова",
        fileWithIdNotFound: "Файл с данным идентификатором {dn} не найден в системе SIGNERAPP",
        signedDocPageTitle: "Страница подписанного документа {name}",
        linkForOthersTitle: "Используйте ссылку на страницу подписанного документа для того, чтобы предоставить другим возможность проверять подписи и подписывать этот документ:",
        copy: "Копировать",
        filHasNoIdTitle: "В имени выбранного вами файла отсутствует идентификатор SIGNERAPP",
        fileHasNoIdContent: "Для того, чтобы найти страницу подписанного документа по файлу, в имени файла должен присутствовать идентификатор SIGNERAPP. Попробуйте найти файл следующего формата:",
        IncorrectFileTitle: "Файл с данным именем {dn} не прошел проверку подписи в системе SIGNERAPP",
        IncorrectFileContent: "Данный файл был изменен или был предоствлен другой файл. Пожалуйста, проверте файл.",
        signed: "подписал(а) данный докумен",
        certTemplate: "Шаблон сертификата: ",
        IIN: "ИИН",
        certType: "Тип подписи: ",
        exportCMS: "Экспортировать подпись в файл",
        //
        signNotFoundById: "Не удалось найти подпись по данному ID!",
        //
        successSignTitle: "Файл {dn} успешно подписан!",
        successSignContentFirstRow: "Ваша подпись прошла проверку и была зарегистрирована в SIGNAPP",
        successSignContentSecondRow: "Мы рекомендуем сохранить копию подписанного файла с <b>идентификатором SIGNAPP</b>. В дальнейшем это упростит поиск страницы подписанного документа в сервисе SIGNAPP.",
        saveFileCopyWithId: "Сохранить копию подписанного файла с идентификатором",
        changeNameManually: "Вы так же можете самостоятельно переименовать файл следующим образом:",
        goToDoc: "Перейти к документу",
        successCopy: "Успешно скопировано в буфер обмена!",
        failCopy: "Копирование он удалось",
        findDocTitle: "Поиск документа",
        //
        chosenFile: "Выбранный файл: {fn}",
        //
        find: "Найти",

        signatureListTitle: "Перечень подписей",
        success: {
            header: "Проверки всех зарегистрированных в системе подписей успешно завершены!",
            subHeader: "Это говорит о том, что:",
            firstRow: "все зарегистрированные в системе подписи корректны;",
            secondRow:"подписан был именно тот документ, который был только что предоставлен на проверку, никто не вносил в него изменений.",
            //
            signSuccess: "Документ успешно подписан!"
        },

        verifySignatureTitle: "Проверить подпись под документом",
        verify: "Проверить",
        signDocTitle: "Подписать документ",
        sign: "Подписать",
        chooseDocument: "Выберите документ!",
        failToBase64: "Не удалось преобразовать файл в формат Base64",
        signError: "Ошибка подписи",
        docNotFoundById: "Не удалось найти документ по данному ID!",
        failConnectToNcaLayer: "Не удалось подключиться к NCALayer",
        failToSign: "Не удалось подписать документ!",
        notEnoughRights: "У вас недостаточно прав для подписи документа!",
        failToSendDoc: "Не удалось отправить ID документа на сервер!",

    },
    smartenu: {
        categories: "категории",
        selectCategories: "Выберите категории",
        newsList: "Список новостей",
        newsTitle: "Новости",
        eventsTitle: "Мероприятия",
        newsNotFound: "Новости не найдены",
        eventsNotFound: "Мероприятия не найдены",
        loadingNews: "Загрузка новостей. Пожалуйста, подождите.",
        loadingEvents: "Загрузка мероприятий. Пожалуйста, подождите.",
        newsCategoriesTitle: "Категории новостей",
        createOrEditNewsCategory: "Создание/редактирование категории новостей",
        createOrEditNews: "Создание/редактирование новостей",
        createOrEditEvents: "Создание/редактирование мероприятий",
        chooseCategory: "выберите категорию",
        parent: "родительская категория",
        categoriesNotFound: "Категории не найдены",
        loadingCategories: "Загрузка категорий. Пожалуйста, подождите.",
        saveCategoryError: "Не удалось сохранить категорию",
        loadAllCategoriesError: "Не удалось получить категории",
        delNewsCategoryError: "Не удалось удалить категорию",
        chooseSuperiorCategory: "Выберите вышестоящую категорию",
        saveSuccess: "Успешно сохранено.",
        chooseImage1: "Загрузить рисунок 1",
        chooseImage2: "Загрузить рисунов 2",
        chooseMainImage: "Загрузить основной рисунок",
        chooseAdditionalImage: "Загрузить дополнительный рисунок",
        chooseAdditionalFile: "Загрузить файл",
        delNewsError: "Не удалось удалить новость",
        saveNewsError: "Не удалось сохранить новость",
        loadAllNewsError: "Не удалось получить новости",
        rejectReason: "Причина отказа: {fn}",
        dataAndTime: "Дата и время проведения: {fn}",
        eventFormat: "формат проведения",
        eventFormatView: "Формат проведения: {fn}",
        participantsCategory: "категория участников",
        participantsCategoryView: "Категория участников: {fn}",
        meetingLink: "ссылка видеоконференции",
        meetingLinkView: "Ссылка видеоконференции:",
        meetingLocation: "место проведения мероприятия",
        meetingLocationView: "Место проведения мероприятия: {fn}",
        loadAllEventsError: "Не удалось получить мероприятия",
        delEventError: "Не удалось удалить мероприятие",
        saveEventError: "Не удалось сохранить мероприятие",
        selectMainCategory: "Выберите основную категорию",
        selectMaster: "Выберите курс магистрантов",
        selectBachelor: "Выберите курс бакалавров",
        selectFaculty: "Выберите факультет",
        selectDepartment: "Выберите кафедру",
        eventParticipants: "Участники мероприятия",
        titleKzInvalid: "Название на казахском не заполнено",
        titleRuInvalid: "Название на русском не заполнено",
        titleEnInvalid: "Название на английском не заполнено",
        contentKzInvalid: "Контент на казахском не заполнено",
        contentRuInvalid: "Контент на русском не заполнено",
        contentEnInvalid: "Контент на английском не заполнено",
        image1Invalid: "Картинка не найдена",
        selectedCatInvalid: "Категория не выбрана",
        isOnlineInvalid: "Формат проведения не выбрана",
        eventLinkInvalid: "Ссылка на мероприятие не заполнена",
        eventLocationInvalid: "Адрес мероприятия не заполнена",
        posterImageKk: "Загрузить постер на казахском",
        posterImageRu: "Загрузить постер на русском",
        posterImageEn: "Загрузить постер на английском",
        posterLink: "Ссылка постера",
        addPoster: "Добавить постер",
        posterImageKkInvalid: "Постер на казахском не выбрана",
        posterImageRuInvalid: "Постер на русском не выбрана",
        posterImageEnInvalid: "Постер на английском не выбрана",
    },
    vaccination: {
        title : "Вакцинация",
        list: "Список вакцинированных",
        plannedDate: "Планируемая дата",
        date1: "Дата (1 компонент)",
        date2: "Дата (2 компонент)",
        vaccine: "Вакцина",
        status : {
            firstcomponent: "первый компонент",
            vaccinated: "вакцинирован(а)",
            planned: "планируется",
            rejected: "медотвод",
         }
    },
}
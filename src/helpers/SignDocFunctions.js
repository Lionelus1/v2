import {NCALayerClient} from "ncalayer-js-client"
import {NCALayerClientExtension} from "@/helpers/ncalayer-client-ext";

export async function docToByteArray(document) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(document);
        reader.onload = () => {
            resolve(reader.result);
            console.log(reader)
        }
        reader.onerror = error => reject(error);
    });
}

export function checkIdAvailability(document) {
    let nameAndType = document.name.split('.')
    let nameArray = nameAndType[0].split('-')
    if(nameArray.length > 1){
        for (let key in nameArray) {
            if(nameArray[key].includes('SignerAppId')) {
                return atob(nameArray[key].replace('SignerAppId', ''))
            }
        }
    } else {
        return null
    }
}

export function arrayBufferToB64(arrayBuffer) {
    let binary = ''
    const bytes = new Uint8Array(arrayBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export function identifyOIDs(oid) {
    let message = 'Не найдено'
    switch (oid) {
        case '1.2.398.3.3.4.1.1':
            message = 'Физическое лицо'
            break
        case '1.2.398.3.3.4.1.1.1':
            message = 'Информационная система физического лица'
            break
        case '1.2.398.3.3.4.1.2':
            message = 'Юридическое лицо'
            break
        case'1.2.398.3.3.4.1.2.1':
            message = 'Первый руководитель'
            break
        case '1.2.398.3.3.4.1.2.2':
            message = 'Право подписи'
            break
        case '1.2.398.3.3.4.1.2.3':
            message = 'Право подписи финансовых документов'
            break
        case '1.2.398.3.3.4.1.2.4':
            message = 'Сотрудник отдела кадров'
            break
        case '1.2.398.3.3.4.1.2.5':
            message = 'Сотрудник организации'
            break
        case '1.2.398.3.3.4.1.2.6':
            message = 'Информационная система юридического лица'
            break
        case '1.2.398.3.3.4.2':
            message = 'Полномочия в информационной системе НУЦ РК'
            break
        case '1.2.398.3.3.4.2.1':
            message = 'Администратор НУЦ РК'
            break
        case '1.2.398.3.3.4.2.2':
            message = 'Менеджер НУЦ РК'
            break
        case '1.2.398.3.3.4.2.3':
            message = 'Оператор НУЦ РК'
            break
        case '1.2.398.3.3.4.3':
            message = 'Метод идентификации пользователя'
            break
        case '1.2.398.3.3.4.3.1':
            message = 'Идентификация через оператора ЦОН'
            break
        case '1.2.398.3.3.4.3.2':
            message = 'Удаленная идентификация'
            break
        case '1.2.398.3.3.4.3.2.1':
            message = 'Идентификация Digital-ID'
            break
        case '1.2.398.5.19.1.2.2.1':
            message = 'Информационная система К2'
            break
    }

    return message
}
export async function runNCaLayer(t,toast, document) {
    let NCALaClient = new NCALayerClient();

    try {
      await NCALaClient.connect();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('ncasigner.failConnectToNcaLayer'),
        life: 3000
      });
    }
    try {
      var res = await NCALaClient.createCAdESFromBase64('PKCS12', document, 'SIGNATURE', false)
      return res
    } catch (error) {
        toast.add({severity: 'error', summary: t('ncasigner.failToSign') + error, life: 3000});
    }
}

export async function makeTimestampForSignature(t, toast, signature) {
        let NCALaClient = new NCALayerClientExtension()
        try {
            await NCALaClient.connect();
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: this.$t('ncasigner.failConnectToNcaLayer'),
                life: 3000
            });

        }
        try {
            return await NCALaClient.applyCAdES("PKCS12", "SIGNATURE", signature)
        } catch (error) {
            toast.add({severity: 'error', summary: t('ncasigner.failToSign'), life: 3000});
        }
}

import axios from "axios";
import store from '@/store/store';

export const apiDomain = process.env.VUE_APP_API_DOMAIN
export const signerApi = process.env.VUE_APP_SIGNER_API
export const smartEnuApi = process.env.VUE_APP_SMARTENU_API
export const socketApi = process.env.VUE_APP_SOCKET_API
export const queueApi = process.env.VUE_APP_QUEUE_API
export const serverUrl = process.env.VUE_APP_API_SERVER
export const fileRoute = "/serve?path="
export const downloadRoute = "/download/"

export const webEnuDomain = process.env.VUE_APP_ENU_DOMAIN

export const header  = {
  "Accept": "application/json",
  "Access-Control-Allow-Origin": "*",
  "X-Requested-With": "XMLHttpRequest",
  "Access-Control-Allow-Methods" : "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
}
//export const apiDomain="";

export const loginUrl = apiDomain+"/oauth/token";
export const getHeader = function() {
  const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
  if(tokenData){
    const headers= {
      //'Access-Control-Allow-Credentials':'true',
      'Content-Type': 'application/json',
      'mode': 'no-cors',
      'Authorization':'Bearer ' + tokenData.access_token
    }
    return headers;
  }
  else {
      return null;
  }
}
export const getFileHeader = function() {
  const tokenData = JSON.parse(window.localStorage.getItem("authUser"));

  if(tokenData){
    const headers= {
      'Access-Control-Allow-Credentials':'true',
      'Content-Type': 'multipart/form-data',
      'mode': 'no-cors',
      'Authorization':'Bearer ' + tokenData.access_token
    }
    return headers;
  }
  else {
      return null;
  }
}



export const getXlsHeader = function(){
  const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
  const headers= {
    'Accept': 'application/vnd.openxmlformats-officedocument'
           + '.spreadsheetml.sheet',

    'Authorization':'Bearer ' + tokenData.access_token
  }
  return headers;
}
export const getMultipartHeader = function (){
  const tokenData = JSON.parse(window.localStorage.getItem("authUser"));

  const headers= {
    'Accpet': 'application/json',
    'Content-Type': 'multipart/form-data',
    'Authorization':'Bearer ' + tokenData.access_token
  }
  return headers;

}

export const testFunction= function(){
  //alert("");
  // let u go main test
  //console.log("ene bol busgui chini");
}
//findRole ---
export const findRole = function(user, role) {
  if (user == null) {
    user = store.state.loginedUser;
  }
  if (user.roles)
  for (let i = 0; i < user.roles.length; i++) {
    if (user.roles[i].name === role) {
      return true;
    }
  }
  return false;
}

export const downloadFile = function(filePath) {
  axios
  .post(
    smartEnuApi + "/downloadFile",
    {
      filePath: filePath
    },
    {
      headers: getHeader()
    }
  )
  .then((response) => {
    // const blob = new Blob([response.data], )
    const link = document.createElement("a");
    console.log(response)
    link.href = "data:application/octet-stream;base64," + response.data;
    link.setAttribute("download", filePath);
    link.download = filePath;
    link.click();
    URL.revokeObjectURL(link.href);
  })
  .catch((error) => {
    if (error.response.status == 401) {
      this.$store.dispatch("logLout");
    } else {
      console.error(error)
      // this.$toast.add({
      //   severity: "error",
      //   summary: "downloadFileError:\n" + error,
      //   life: 3000,
      // });
    }
  });
}

export const b64toBlob = function(b64Data, sliceSize=512) {
  const byteCharacters = window.atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: "application/pdf"});
  return URL.createObjectURL(blob);
}





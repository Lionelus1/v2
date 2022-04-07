import mitt from "mitt";
import axios from "axios";

export const apiDomain = "http://localhost:8080";
export const hdfsApi = "http://localhost:8085";
export const signerApi = "https://smart.enu.kz:6990"
//export const signerApi = "http://10.1.1.161:6990"
//export const smartEnuApi = "https://smart.enu.kz:8081"
//export const smartEnuApi = "http://smart.enu.kz:8090"
export const smartEnuApi = "http://localhost:8080"
export const templateApi = "http://localshost:8082"

export const header  = {
  "Accept": "application/json",
  "Access-Control-Allow-Origin": "*",
  "X-Requested-With": "XMLHttpRequest",
  "Access-Control-Allow-Methods" : "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
}
//export const apiDomain="";

export const loginUrl = apiDomain+"/oauth/token";
export const getHeader = function(){
  const tokenData = JSON.parse(window.localStorage.getItem("authUser"));

  if(tokenData){
    const headers= {
      'Access-Control-Allow-Credentials':'true',
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
export const findRole = function(user, role) {
    user = this.$store.state.loginedUser;
    if (!user)
      return false;
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
      this.$toast.add({
        severity: "error",
        summary: "downloadFileError:\n" + error,
        life: 3000,
      });
    }
  });
}





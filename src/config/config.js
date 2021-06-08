import mitt from "mitt";

export const apiDomain = "http://localhost:8080";
export const hdfsApi = "http://localhost:8085";
export const signerApi = "http://localhost:9000"
export const smartEnuApi = "http://localhost:8080"
export const templateApi = "http://localhost:8082"
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



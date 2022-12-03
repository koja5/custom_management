import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DomSanitizer, Title } from "@angular/platform-browser";
import "rxjs/add/operator/map";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HelpService {
  constructor(
    private http: HttpClient,
    private titleService: Title,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  getGridPageSize() {
    const valueToJSON = JSON.parse(localStorage.getItem("pageSize"));
    if (valueToJSON === null) {
      return {};
    }
    return valueToJSON;
  }

  getCountryCode() {
    return localStorage.getItem("accountLanguage");
  }

  setGridPageSize(pageSize: any) {
    localStorage.setItem("pageSize", JSON.stringify(pageSize));
  }

  postApiRequest(method, parametar) {
    return this.http.post(method, parametar).map((res) => res);
  }

  getApiRequest(method, parametars) {
    return this.http
      .get(this.concatenateRequest(method, parametars))
      .map((res) => res);
  }

  concatenateRequest(method, parametars) {
    let values = "";
    for (let i = 0; i < parametars.length; i++) {
      values += parametars[i] + "/";
    }
    if (values) {
      return method + "/" + values;
    } else {
      return method;
    }
  }

  packParametarPost(data, fields) {
    let model;
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        model[fields[i].name] = data[fields[i].path];
      }
      return model;
    } else {
      return {};
    }
  }

  packParametarGet(data, fields) {
    let model = [];
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        model.push(data[fields[i]]);
      }
    }

    return model;
  }

  findValueByField(data, root, field) {
    if (root) {
      return data[root][field];
    } else {
      return data[field];
    }
  }

  getLanguage() {
    return JSON.parse(localStorage.getItem("language"));
  }

  getHeightForGrid() {
    if (window.innerWidth < 992) {
      return window.innerHeight - 71 + "px";
    } else {
      return window.innerHeight - 60 + "px";
    }
  }

  getHeightForGridWithoutPx() {
    return Number(window.innerHeight - 253);
  }

  getMe() {
    return Number(localStorage.getItem("idUser"));
  }

  setMe(id) {
    localStorage.setItem("idUser", id);
  }

  getType() {
    return Number(localStorage.getItem("type"));
  }

  getSuperadmin() {
    return localStorage.getItem("superadmin");
  }

  setTitleForBrowserTab(value) {
    this.titleService.setTitle("ClinicNode - " + value);
  }

  setDefaultBrowserTabTitle() {
    this.titleService.setTitle("Clinic Node - Management System");
  }

  getLinkForPatientFormRegistration() {
    return (
      window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/login/registration/" +
      this.getSuperadmin()
    );
  }

  copyToClipboard(value) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }

  getPdfFile(file: string) {
    console.log(file);
    const body = { filename: file };

    return this.http.post("/api/getPdfFile", body, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "application/json"),
    });
  }

  successToastr(title, text) {
    this.toastr.success(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  errorToastr(title, text) {
    this.toastr.error(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  warningToastr(title, text) {
    this.toastr.warning(title, text, {
      timeOut: 7000,
      positionClass: "toast-bottom-right",
    });
  }

  getFullHostName() {
    return (
      window.location.protocol +
      "://" +
      window.location.hostname.replace("www.", "") +
      ":" +
      window.location.port
    );
  }

  setSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
  }

  getSessionStorage(key) {
    return sessionStorage.getItem(key);
  }

  clearSessionStorage(key) {
    sessionStorage.removeItem(key);
  }

  setLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }

  getLocalStorage(key) {
    return localStorage.getItem(key);
  }

  clearLocalStorage(key) {
    localStorage.removeItem(key);
  }

  convertValue(data, type) {
    switch (type) {
      case "switch" || "checkbox":
        if (data === 1) {
          return true;
        } else {
          return false;
        }
      default:
        return data;
    }
  }

  packValueForParameters(configField, data) {
    for (let i = 0; i < configField.length; i++) {
      configField[i].value = this.convertValue(
        data[0][configField[i].field],
        configField[i].type
      );
    }
    return configField;
  }

  packRequestValueFromParameters(parameters: any) {
    let data = [];
    for (let i = 0; i < parameters.length; i++) {
      switch (parameters[i]) {
        case "superadmin":
          data.push(this.getSuperadmin());
          break;
        case "getMe":
          data.push(this.getMe());
          break;
        default:
          break;
      }
    }
    return data;
  }

  setLanguageForLanding(value: any) {
    localStorage.setItem(
      "language-landing",
      typeof value === "string" ? value : JSON.stringify(value)
    );
  }

  getLanguageForLanding() {
    if (localStorage.getItem("language-landing")) {
      return JSON.parse(
        localStorage.getItem("language-landing")
          ? localStorage.getItem("language-landing")
          : "{}"
      );
    } else {
      return null;
    }
  }

  setSelectionLanguage(value: string) {
    localStorage.setItem("selectionLanguage", value);
  }

  getSelectionLanguage() {
    if (localStorage.getItem("selectionLanguage")) {
      return localStorage.getItem("selectionLanguage");
    } else {
      return null;
    }
  }

  getRealLanguageName(): Observable<any> {
    if (this.getSelectionLanguage()) {
      return <any>this.getSelectionLanguage();
    } else {
      const selectedLanguageCode = this.getSelectionLanguageCode();
      this.getAllLangs().subscribe((data: any) => {
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].similarCode.length; j++) {
            if (data[i].similarCode[j] === selectedLanguageCode) {
              return data[i].name;
            }
          }
        }
      });
    }
  }

  getAllLangs() {
    return this.http.get(
      "../../assets/configuration/languages/choose-lang.json"
    );
  }

  public checkMobileDevice() {
    if (window.innerWidth < 992) {
      return true;
    } else {
      return false;
    }
  }

  setSelectionLanguageCode(value: string) {
    localStorage.setItem("selectionLanguageCode", value);
  }

  getSelectionLanguageCode() {
    if (localStorage.getItem("selectionLanguageCode")) {
      return localStorage.getItem("selectionLanguageCode");
    }
    return null;
  }

  getNameOfFlag() {
    const selectionLanguage = this.getSelectionLanguageCode();
    this.getAllLangs().subscribe((langs: any) => {
      for (let i = 0; i < langs.length; i++) {
        for (let j = 0; j < langs[i].similarCode.length; j++) {
          if (langs[i].similarCode[j] === selectionLanguage) {
            return langs[i].name;
          }
        }
      }
    });
  }

  getLanguageFromFolder(folder: string, language: string) {
    return this.http.get(
      "../assets/configuration/languages/landing/pages/" +
        folder +
        "/" +
        language +
        ".json"
    );
  }

  setUserProfileImagePath(user: any) {
    const TYPED_ARRAY = new Uint8Array(user.img.data);
    const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
    let base64String = btoa(STRING_CHAR);
    let path = this.sanitizer.bypassSecurityTrustUrl(
      "data:image/png;base64," + base64String
    );

    return path;
  }

  multiSelectArrayToString(array): string {
    let semicolonSeparatedString = "";
    if (array) {
      for (let i = 0; i < array.length; i++) {
        semicolonSeparatedString += array[i] + ";";
      }
      semicolonSeparatedString = semicolonSeparatedString.substring(
        0,
        semicolonSeparatedString.length - 1
      );
    }
    return semicolonSeparatedString;
  }

  multiSelectStringToArrayNumber(string): number[] {
    let multiSelectArrayToString;
    if (string.split(";") !== undefined) {
      multiSelectArrayToString = string.split(";").map(Number);
    } else {
      multiSelectArrayToString = Number(string);
    }
    return multiSelectArrayToString;
  }

  multiSelectStringToArrayString(string): string[] {
    let multiSelectArrayToString;
    if (string.split(";") !== undefined) {
      multiSelectArrayToString = string.split(";");
    } else {
      multiSelectArrayToString = string;
    }
    return multiSelectArrayToString;
  }

  prepareDraft(formValues, draftName, draftType) {
    return {
      ...formValues,
      draftName: draftName ? draftName : "",
      place: this.multiSelectArrayToString(formValues.place),
      male: formValues.male ? formValues.male : false,
      female: formValues.female ? formValues.female : false,
      excludeCustomersWithEvents: formValues.excludeCustomersWithEvents ? formValues.excludeCustomersWithEvents : false,
      noEventSinceCheckbox: formValues.noEventSinceCheckbox ? formValues.noEventSinceCheckbox : false,
      noEventSinceDate: formValues.noEventSinceDate ? formValues.noEventSinceDate : "",
      birthdayFrom: formValues.birthdayFrom ? formValues.birthdayFrom : "",
      birthdayTo: formValues.birthdayTo ? formValues.birthdayTo : "",
      profession: formValues.profession ? formValues.profession : "",
      childs: formValues.childs ? formValues.childs : "",
      start: formValues.start ? formValues.start : "",
      end: formValues.end ? formValues.end : "",
      subject: formValues.subject ? formValues.subject : "",
      message: formValues.message ? formValues.message : "",

      category: this.multiSelectArrayToString(formValues.category),
      creator_id: this.multiSelectArrayToString(formValues.creator_id),
      recommendation: this.multiSelectArrayToString(formValues.recommendation),
      relationship: this.multiSelectArrayToString(formValues.relationship),
      social: this.multiSelectArrayToString(formValues.social),
      doctor: this.multiSelectArrayToString(formValues.doctor),
      store: this.multiSelectArrayToString(formValues.store),
      superadmin: this.getSuperadmin(),
      type: draftType,
    };
  }

  removeZeroArrayFromObject(object) {
    const objectKeys = Object.keys(object);
    objectKeys.forEach((key) => {
      if (
        Array.isArray(object[key]) &&
        ((object[key].length === 1 && object[key][0] === 0) ||
          object[key].length === 0)
      ) {
        delete object[key];
      }
    });
    return object;
  }

  convertStringToDate(date: string) {
    const days = date.split("T")[0];
    const hours = date.split("T")[1];

    const day = Number(days.split("-")[2]);
    const month = Number(days.split("-")[1]) - 1;
    const year = Number(days.split("-")[0]);

    return new Date(year, month, day);
  }
}

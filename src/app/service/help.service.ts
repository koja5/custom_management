import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Title } from "@angular/platform-browser";
import "rxjs/add/operator/map";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class HelpService {
  constructor(
    private http: HttpClient,
    private titleService: Title,
    private toastr: ToastrService
  ) {}

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

  getLanguage() {
    return JSON.parse(localStorage.getItem("language"));
  }

  getHeightForGrid() {
    return window.innerHeight - 60 + "px";
  }

  getMe() {
    return Number(localStorage.getItem("idUser"));
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
}

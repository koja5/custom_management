import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";

@Injectable({
  providedIn: "root",
})
export class HelpService {
  constructor(private http: HttpClient) {}

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
    return JSON.parse(localStorage.getItem('language'));
  }

  getHeightForGrid() {
    return window.innerHeight - 80 + 'px';
  }
}

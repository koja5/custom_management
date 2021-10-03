import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getThemeConfig() {
    return this.http
      .get("../assets/configuration/theme-config.json")
      .map((res) => res);
  }

  getLanguageConfig() {
    return this.http
      .get("../assets/configuration/language-config.json")
      .map((res) => res);
  }

  /*getTranslation(language: string) {
    return this.http
      .get("../assets/configuration/translation/" + language + ".json")
      .map((res) => res);
  }*/

  getTranslation() {
    return this.http.get("/api/getTranslation").map((res) => res);
  }

  getTranslationByDemoAccount(demoCode: string) {
    return this.http
      .get("/api/getTranslationByDemoAccount/" + demoCode)
      .map((res) => res);
  }

  getTranslationByCountryCode(countryCode: string) {
    return this.http
      .get("/api/getTranslationByCountryCode/" + countryCode)
      .map((res) => res);
  }

  getTranslationByLanguage(language: string) {
    return this.http
      .get("/api/getTranslationByLanguage/" + language)
      .map((res) => res);
  }

  getAllTranslationByCountryCode(countryCode: string) {
    return this.http
      .get("/api/getAllTranslationByCountryCode/" + countryCode)
      .map((res) => res);
  }

  getGridConfiguration(type) {
    return this.http
      .get("../assets/configuration/grid/" + type + ".json")
      .map((res) => res);
  }

  getGridConfigurationScheme(type) {
    return this.http
      .get("../assets/configuration/scheme/" + type + ".json")
      .map((res) => res);
  }

  createTranslation(data) {
    return this.http.post("/api/createTranslation", data).map((res) => res);
  }

  updateTranslation(data) {
    return this.http.post("/api/updateTranslation", data).map((res) => res);
  }

  getTranslationWithId(id) {
    return this.http.get("/api/getTranslationWithId/" + id).map((res) => res);
  }

  getTemplateAccount() {
    return this.http.get("/api/getTemplateAccount");
  }

  loadTemplateAccount(data) {
    return this.http.post("/api/loadTemplateAccount", data).map((res) => res);
  }

  insertDemoAccountLanguage(data) {
    return this.http
      .post("/api/insertDemoAccountLanguage", data)
      .map((res) => res);
  }
}

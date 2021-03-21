import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MongoService {
  constructor(private http: HttpClient) {}

  includeConfiguration(data) {
    return this.http.post("/api/insertConfiguration", data).map((res) => res);
  }

  updateTheme(data) {
    return this.http.post("/api/updateTheme", data).map((res) => res);
  }

  updateLanguage(data) {
    return this.http.post("/api/updateLanguage", data).map((res) => res);
  }

  setSelectedStore(data) {
    return this.http.post("/api/setSelectedStore", data).map((res) => res);
  }

  setUsersFor(data) {
    return this.http.post("/api/setUsersFor", data).map((res) => res);
  }

  getConfiguration(id) {
    return this.http.get("/api/getConfiguration/" + id).map((res) => res);
  }

  setSettingsForStore(data) {
    return this.http.post("/api/setSettingsForStore", data).map((res) => res);
  }

  getPermissionForPatientNavigation(clinic) {
    return this.http
      .get("/api/getPermissionPatientMenu/" + clinic)
      .map((res) => res);
  }

  createOrUpdatePermissionPatientMenu(data) {
    return this.http
      .post("api/createOrUpdatePermissionPatientMenu", data)
      .map((res) => res);
  }
}

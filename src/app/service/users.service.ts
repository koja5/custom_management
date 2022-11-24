import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(public http: HttpClient) {}

  createUser(data, callback) {
    console.log("Pozivam funkciju signup!");
    console.log(data);
    this.http
      .post("/api/createUser", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  updateUser(data) {
    return this.http.post("/api/updateUser", data).map((res) => res);
  }

  deleteUser(id) {
    return this.http.get("/api/deleteUser/" + id).map((res) => res);
  }

  getUsers(id, callback) {
    return this.http
      .get("/api/getUsers/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getUsersInCompany(id, callback) {
    return this.http
      .get("/api/getUsersInCompany/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getMe(id, callback) {
    return this.http
      .get("/api/getMe/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getCompany(id, callback) {
    return this.http
      .get("/api/getCompany/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  uploadImage(data, callback) {
    console.log(data);
    this.http
      .post("/api/uploadImage", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getUserWithId(id, callback) {
    return this.http
      .get("/api/getUserWithId/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getUserWithIdPromise(id) {
    return this.http.get("/api/getUserWithId/" + id).toPromise();
  }

  getWorkTime() {
    return this.http
      .get("../assets/configuration/workTime.json")
      .map((res) => res);
  }

  setWorkTimeForUser(data) {
    return this.http.post("/api/setWorkTimeForUser", data).map((res) => res);
  }

  getWorkTimeForUser(id) {
    return this.http.get("/api/getWorkTimeForUser/" + id).map((res) => res);
  }

  updateWorkTime(data) {
    return this.http.post("/api/updateWorkTImeForUser", data).map((res) => res);
  }

  deleteWorkTime(data) {
    return this.http.get("/api/deleteWorkTime/" + data);
  }

  getCountAllTasksForUser(id) {
    return this.http
      .get("/api/getCountAllTasksForUser/" + id)
      .map((res) => res);
  }

  getCountAllTasksForUserPerMonth(id) {
    return this.http
      .get("/api/getCountAllTasksForUserPerMonth/" + id)
      .map((res) => res);
  }

  getCountAllTasksForUserPerWeek(id) {
    return this.http
      .get("/api/getCountAllTasksForUserPerWeek/" + id)
      .map((res) => res);
  }

  insertMultiData(data) {
    return this.http.post("/api/insertFromExcel", data).map((res) => res);
  }

  getUsersAllowedOnlineInCompany(id, callback) {
    return this.http
      .get("/api/getUsersAllowedOnlineInCompany/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getCompanyUsers(id, callback) {
    return this.http
      .get("/api/getUsers/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }
}

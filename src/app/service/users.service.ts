import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class UsersService {
  constructor(public http: HttpClient) { }

  createUser(data, callback) {
    console.log("Pozivam funkciju signup!");
    console.log(data);
    this.http
      .post("/api/createUser", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getUsers(id, callback) {
    return this.http
      .get("/api/getUsers/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getMe(id, callback) {
    return this.http
      .get("/api/getMe/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getCompany(id, callback) {
    return this.http
      .get("/api/getCompany/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  uploadImage(data, callback) {
    console.log(data);
    this.http
      .post("/api/uploadImage", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getUserWithId(id, callback) {
    return this.http
      .get("/api/getUserWithId/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getWorkTime() {
    return this.http
      .get("../assets/configuration/workTime.json")
      .map(res => res);
  }

  setWorkTimeForUser(data) {
    return this.http.post('/api/setWorkTimeForUser', data)
      .map(res => res);
  }
  
  getWorkTimeForUser(id) {
    return this.http.get('/api/getWorkTimeForUser/' + id)
      .map(res => res);
  }

}

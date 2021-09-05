import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";
import { CookieService } from "ng2-cookies";
import { throwError, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  public logged: boolean;

  constructor(public http: HttpClient, public cookie: CookieService) {}

  login(data, callback) {
    this.http
      .post("/api/login", data)
      .map((res) => res)
      .subscribe((val) => {
        console.log(val);
        this.logged = val["login"];
        callback(
          val["login"],
          val["notVerified"],
          val["user"],
          val["type"],
          val["id"],
          val["storeId"],
          val["superadmin"],
          val["last_login"]
        );
      });
  }

  signUp(data, callback) {
    console.log("Pozivam funkciju signup!");
    console.log(data);
    this.http
      .post("/api/signUp", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  forgotPassword(data, callback) {
    this.http
      .post("/api/postojikorisnik", data)
      .map((res) => res)
      .subscribe((val) => {
        callback(val["exist"], val["notVerified"]);
      });
  }

  changePass(data, callback) {
    this.http
      .post("/api/korisnik/forgotpasschange", data)
      .map((res) => res)
      .subscribe((val) => {
        callback(val);
      });
  }

  checkCountryLocation(): Observable<any> {
    return this.http.get("http://ip-api.com/json").catch((error: Response) => {
      return throwError(error);
    });
  }

  getTranslationByCountryCode(code) {
    return this.http
      .get("/api/getTranslationByCountryCode/" + code)
      .map((res) => res);
  }

  getDefaultLanguage() {
    return this.http
      .get("/api/getTranslationByCountryCode/US")
      .map((res) => res);
  }
}

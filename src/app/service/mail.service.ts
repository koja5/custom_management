import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/Rx";

@Injectable()
export class MailService {
  constructor(public http: HttpClient) {}

  public sendMail(data, callback) {
    console.log(data);
    const headers = new HttpHeaders();
    console.log("service mail servicee");
    headers.append("Content-Type", "application/json");
    return this.http
      .post("/api/send", data, { headers: headers })
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  public sendCustomerVerificationMail(data: any) {
    return this.http.post("/api/sendCustomerVerificationMail", data);
  }

  public sendForgetMail(data) {
    const headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post("/api/forgotmail", data, { headers: headers })
      .map((res) => res);
  }

  public posaljiMiPoruku(data, callback) {
    this.http
      .post("/api/askQuestion", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  public sendPatientFormRegistration(data) {
    return this.http
      .post("/api/sendPatientFormRegistration", data)
      .map((res) => res);
  }

  public sendInfoToPatientForCreatedAccount(data) {
    return this.http
      .post("/api/sendInfoToPatientForCreatedAccount", data)
      .map((res) => res);
  }

  public sendInfoForApproveReservation(data) {
    return this.http
      .post("/api/sendInfoForApproveReservation", data)
      .map((res) => res);
  }

  public sendInfoForDenyReservation(data) {
    return this.http
      .post("/api/sendInfoForDenyReservation", data)
      .map((res) => res);
  }
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SendSmsService {
  constructor(private http: HttpClient) {}

  sendSMSMessage(data) {
    return this.http.post("/api/sendSMS", data);
  }

  sendCustomSMS(data) {
    return this.http.post("/api/sendCustomSMS", data);
  }

  sendVaucherSMS(data) {
    return this.http.post("/api/sendVaucherSms", data);
  }
}

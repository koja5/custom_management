import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SendEmailService {
  constructor(private http: HttpClient) {}

  sendEmailToPatient(data) {
    return this.http.post("/api/sendEmailToPatient", data);
  }

  sendReminderViaEmailManual(data) {
    return this.http.post("/api/sendReminderViaEmailManual", data);
  }
}

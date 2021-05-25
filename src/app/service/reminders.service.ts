import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class RemindersService {
  constructor(private http: HttpClient) {}

  getReminderSettings(superadmin) {
    return this.http.get("/api/getReminderSettings/" + superadmin);
  }

  setReminderSettings(data) {
    return this.http.post("/api/setReminderSettings", data);
  }
}

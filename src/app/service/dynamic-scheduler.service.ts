import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicSchedulerService {

  constructor(private http: HttpClient) { }


  getSchedulerHeight() {
    return window.innerHeight - 176 + 'px';
  }

  getSchedulerHeightWithoutToolbar() {
    return window.innerHeight - 104 + 'px';
  }

  getHolidayCalendarHeight() {
    return window.innerHeight - 149 + 'px';
  }

  getDefineHolidayHeight() {
    return window.innerHeight - 185 + 'px';
  }

  syncWithGoogleCalendar(userId: string, calendarId: string, publicKey: string): Observable<any> {
    return this.http.post("/api/syncWithGoogleCalendar", {
      userId,
      googleCalendarData: {
        calendarId,
        publicKey
      }
    });
  }
}

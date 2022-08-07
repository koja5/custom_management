import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

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
}

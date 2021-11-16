import { Observable } from 'rxjs';
import { HolidayModel } from './../models/holiday-model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(public httpClient: HttpClient) { }

  public getHolidays(superAdminId: string): Observable<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidays/" + superAdminId).map((res) => res);
  }

  public createHoliday(data, callback): void {
    this.httpClient
      .post("/api/createHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }
}

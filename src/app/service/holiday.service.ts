import { Observable } from 'rxjs';
import { HolidayModel } from './../models/holiday-model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HolidayTemplate } from '../models/holiday-template.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(public httpClient: HttpClient) { }

  public getHolidays(superAdminId: string): Observable<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidays/" + superAdminId).map((res) => res);
  }

  public getHolidaysByTemplate(superAdminId: string, templateId: number): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysByTemplate/" + superAdminId + "/" + templateId).map((res) => res).toPromise();
  }

  public createHoliday(data, callback): void {
    this.httpClient
      .post("/api/createHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public getTemplateByUserId(userId: string) {
    return this.httpClient
      .get<HolidayTemplate>("/api/getTemplateByUserId/" + userId).toPromise();
  }

  public createHolidayTemplateConnection(data, callback): void {
    this.httpClient
      .post("/api/createHolidayTemplate", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public updateHoliday(data, callback): void {
    this.httpClient
      .post("/api/updateHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteHoliday(id, callback): void {
    console.log(id);
    this.httpClient
      .get("/api/deleteHoliday/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteHolidayTemplate(id) {
    return this.httpClient.get("/api/deleteHolidayTemplate/" + id).toPromise();
  }

}

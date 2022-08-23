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

  public getHolidaysByTemplate(templateId: number): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysByTemplate/" + templateId).map((res) => res).toPromise();
  }

  public getHolidaysByTemplates(templateIds): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysByTemplates/" + templateIds).toPromise();
  }

  public getHolidaysForClinic(clinicId): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysForClinic/" + clinicId).toPromise();
  }

  public createHoliday(data, callback): void {
    this.httpClient
      .post("/api/createHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public createStoreTemplateConnection(ids, storeId, callback): void {
    let query = "";
    ids.forEach(id => {
      query += "(" + storeId + "," + id + "),"
    });

    const temp = query.slice(0, -1);
    console.log(query.slice(0, -1));
    this.httpClient
      .post("/api/createStoreTemplateConnection", { query: temp })
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteStoreTemplateConnection(ids, storeId, callback): void {
    let query = "";
    ids.forEach(id => {
      query += id + ","
    });

    const temp = "(" + query.slice(0, -1) + ")";

    console.log(temp);

    this.httpClient
      .post("/api/deleteStoreTemplateConnection", { query: temp, storeId: storeId })
      .map(res => res)
      .subscribe(val => callback(val));
  }


  public getStoreTemplateConnection(storeId) {
    return this.httpClient.get<any[]>("/api/getStoreTemplateConnection/" + storeId).toPromise();
  }

  public updateHoliday(data, callback): void {
    this.httpClient
      .post("/api/updateHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteHoliday(id, callback): void {
    this.httpClient
      .get("/api/deleteHoliday/" + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getHolidayTemplates(): Observable<HolidayTemplate[]> {
    return this.httpClient.get<HolidayTemplate[]>("/api/getHolidayTemplates");
  }

  getHolidayTemplatesPromise(): Promise<HolidayTemplate[]> {
    return this.getHolidayTemplates().toPromise();
  }

  createHolidayTemplate(data) {
    return this.httpClient.post("/api/createHolidayTemplate", data).toPromise();
  }

  updateHolidayTemplate(data) {
    return this.httpClient.post("/api/updateHolidayTemplate", data).toPromise();
  }

  deleteHolidayTemplate(data) {
    return this.httpClient.post("/api/deleteHolidayTemplate/", data).toPromise();
  }

  deleteHolidaysByTemplateId(data) {
    return this.httpClient.post("/api/deleteHolidaysByTemplateId/", data).toPromise();
  }
}

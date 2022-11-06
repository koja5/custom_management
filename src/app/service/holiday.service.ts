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

  public getHolidaysByTemplate(templateId: number): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysByTemplate/" + templateId).map((res) => res).toPromise();
  }

  public getHolidaysByTemplates(templateIds): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysByTemplates/" + templateIds).toPromise();
  }

  public getHolidaysForClinic(superAdminId): Promise<HolidayModel[]> {
    return this.httpClient
      .get<HolidayModel[]>("/api/getHolidaysForClinic/" + superAdminId).toPromise();
  }

  public createHoliday(data, callback): void {
    this.httpClient
      .post("/api/createHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public createStoreTemplateConnection(ids, superAdminId, callback) {
    let query = "";
    ids.forEach(id => {
      query += "(" + superAdminId + "," + id + "),"
    });

    const temp = query.slice(0, -1);
    console.log(query.slice(0, -1));
    return this.httpClient
      .post("/api/createSuperAdminTemplateConnection", { query: temp })
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteStoreTemplateConnection(ids, superAdminId, callback) {
    let query = "";
    ids.forEach(id => {
      query += id + ","
    });

    const temp = "(" + query.slice(0, -1) + ")";

    console.log(temp);

    return this.httpClient
      .post("/api/deleteStoreTemplateConnection", { query: temp, superAdminId: superAdminId })
      .map(res => res)
      .subscribe(val => callback(val));
  }


  public getStoreTemplateConnection(superAdminId) {
    return this.httpClient.get<any[]>("/api/getStoreTemplateConnection/" + superAdminId).toPromise();
  }

  public updateHoliday(data, callback) {
    return this.httpClient
      .post("/api/updateHoliday", data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  public deleteHoliday(id, callback) {
    return this.httpClient
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

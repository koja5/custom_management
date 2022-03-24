import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(public http: HttpClient) { }

  public getInvoicePrefix(superAdminId) {
    return this.http.get<any[]>("/api/getInvoicePrefix/" + superAdminId).toPromise();
  }

  public updateInvoicePrefix(data) {
    return this.http.post("/api/updateInvoicePrefix", data);
  }

  public createInvoicePrefix(data) {
    return this.http.post("/api/createInvoicePrefix", data);
  }
}

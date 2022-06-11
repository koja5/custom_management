import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(public http: HttpClient) { }

  public updateInvoiceID(data) {
    return this.http.post("/api/updateInvoiceID", data);
  }

}

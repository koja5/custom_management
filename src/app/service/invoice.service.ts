import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(public httpClient: HttpClient) { }

  public updateInvoiceID(data) {
    return this.httpClient.post("/api/updateInvoiceID", data).toPromise();
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(public http: HttpClient) { }

  createCustomer(data, callback) {
    console.log('Pozivam funkciju signup!');
    console.log(data);
    this.http.post('/api/createCustomer', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getCustomers(id, callback) {
    return this.http.get('/api/getCustomers/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { callbackify } from 'util';

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

  deleteCustomer(id, callback) {
    return this.http.get('/api/deleteCustomer/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  updateCustomer(data, callback) {
    this.http.post('/api/updateCustomer', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  uploadImage(data, callback) {
    return this.http.post('http:/localhost:3000/api/uploadImage', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  downloadFile(file:String){
    console.log(file);
    var body = {filename:file};

    return this.http.post('/api/download', body,{
        responseType : 'blob',
        headers:new HttpHeaders().append('Content-Type','application/json')
    });
}

  getDocuments(id, callback) {
    return this.http.get('/api/getDocuments/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getCustomerWithId(id) {
    return this.http.get('/api/getCustomerWithId/' + id)
      .map(res => res);
  }
}

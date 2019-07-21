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

  downloadFile(file: string) {
    console.log(file);
    const body = { filename: file };

    return this.http.post('/api/download', body, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
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

  addComplaint(data) {
    return this.http.post('/api/addComplaint', data)
      .map(res => res);
  }

  getComplaintForCustomer(id) {
    return this.http.get('/api/getComplaintForCustomer/' + id)
      .map(res => res);
  }

  addTherapy(data) {
    return this.http.post('/api/addTherapy', data)
      .map(res => res);
  }

  getTherapyForCustomer(id) {
    return this.http.get('/api/getTherapyForCustomer/' + id)
      .map(res => res);
  }

  getCustomerList(type) {
    return this.http.get('/api/get' + type + 'List')
      .map(res => res);
  }

  addBaseDataOne(data) {
    return this.http.post('/api/addBaseDataOne', data)
      .map(res => res);
  }

  getBaseDataOne(id: number) {
    return this.http.get('/api/getBaseDataOne/' + id)
      .map(res => res);
  }

  updateBaseDataOne(data) {
    return this.http.post('/api/updateBaseDataOne', data)
      .map(res => res);
  }

  addBaseDataTwo(data) {
    return this.http.post('/api/addBaseDataTwo', data)
      .map(res => res);
  }

  getBaseDataTwo(id: number) {
    return this.http.get('/api/getBaseDataTwo/' + id)
      .map(res => res);
  }

  updateBaseDataTwo(data) {
    return this.http.post('/api/updateBaseDataTwo', data)
      .map(res => res);
  }

  addPhysicalIllness(data) {
    return this.http.post('/api/addPhysicalIllness', data)
      .map(res => res);
  }

  getPhysicallIllness(id: number) {
    return this.http.get('/api/getPhysicalIllness/' + id)
      .map(res => res);
  }

  updatePhysicalIllness(data) {
    return this.http.post('/api/updatePhysicalIllness', data)
      .map(res => res);
  }
}

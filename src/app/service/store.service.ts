import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private http: HttpClient) { }

  createStore(data, callback) {
    console.log(data);
    this.http.post('/api/createStore', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  editStore(data) {
    console.log(data);
    return this.http.post('/api/updateStore', data)
      .map(res => res);
  }

  deleteStore(id) {
    return this.http.get('/api/deleteStore/' + id)
      .map(res => res);
  }

  getStore(id, callback) {
    return this.http.get('/api/getStore/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }


  getStoreAllowedOnline(id, callback) {
    return this.http.get('/api/getStoreAllowedOnline/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getStoreById(id) {
    return this.http.get('/api/getStoreById/' + id).toPromise();
  }

  getStoreList(ids) {
    return this.http.get<any[]>('/api/getStoreList/' + ids).toPromise();
  }

  insertMultiData(data) {
    return this.http.post('/api/insertFromExcel', data)
      .map(res => res);
  }
}

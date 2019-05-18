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

  getStore(id, callback) {
    return this.http.get('/api/getStore/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }
}

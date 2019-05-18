import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(public http: HttpClient) { }

  createUser(data, callback) {
    console.log('Pozivam funkciju signup!');
    console.log(data);
    this.http.post('/api/createUser', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getUsers(id, callback) {
    return this.http.get('/api/getUsers/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  getMe(id, callback) {
    return this.http.get('/api/getMe/' + id)
      .map(res => res)
      .subscribe(val => callback(val));
  }
}

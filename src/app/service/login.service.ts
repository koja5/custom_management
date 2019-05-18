import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { CookieService } from 'ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public logged: boolean;

  constructor(public http: HttpClient, public cookie: CookieService) { }

  login(data, callback) {
    this.http.post('/api/login', data)
      .map(res => res)
      .subscribe(val => {
        console.log(val);
        this.logged = val['login'];
        callback(val['login'], val['notVerified'], val['user'], val['type'], val['id'], val['companyId']);
      });
  }

  signUp(data, callback) {
    console.log('Pozivam funkciju signup!');
    console.log(data);
    this.http.post('/api/signUp', data)
      .map(res => res)
      .subscribe(val => callback(val));
  }

  forgotPassword(data, callback) {
    console.log('checkaccount...');
    this.http.post('/api/postojikorisnik', data)
      .map(res => res)
      .subscribe(val => {
        callback(val['exist'], val['notVerified']);
      });
  }

  changePass(data, callback) {
    this.http.post('/api/korisnik/forgotpasschange', data)
      .map(res => res)
      .subscribe(val => {
        callback(val);
      });
  }
}

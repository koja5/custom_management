import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

const CREATE_ACTION = 'add';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'delete';

@Injectable({
  providedIn: 'root'
})
export class ParameterItemService extends BehaviorSubject<any[]> {

  private data: any[] = [];

  constructor(private http: HttpClient) {
    super([]);
  }

  getData(type) {
    /*return this.http.get('/api/get' + type)
      .map(res => res);*/

    this.fetch('read', null, type)
      .pipe(
        tap(data => {
          this.data = data;
        })
      )
      .subscribe(data => {
        console.log(data);
        super.next(data);
      });
  }

  getDoctorType() {
    return this.http.get('/api/getDoctorList')
      .map(res => res);
  }

  getTherapy() {
    return this.http.get('/api/getTherapyList')
      .map(res => res);
  }

  getVATTex() {
    return this.http.get('/api/getVATTaxList')
      .map(res => res);
  }

  public addData(data: any, isNew?: boolean, type?: string) {
    const action = isNew ? CREATE_ACTION : UPDATE_ACTION;

    this.reset();

    this.fetch(action, data, type)
      .subscribe(() => this.getData(type), () => this.getData(type));
  }

  public deleteData(data: any, type?: string) {
    this.reset();

    this.fetch(REMOVE_ACTION, data, type)
      .subscribe(() => this.getData(type), () => this.getData(type));
  }

  private fetch(action, data, type): Observable<any[]> {
    if (action === 'read') {
      return this.http.get('/api/get' + type + 'List')
        .pipe(map(res => res as any[]));
    } else if (action === 'add') {
      return this.http.post('/api/add' + type + 'List', data)
        .pipe(map(res => res as any[]));
    } else if (action === 'delete') {
      return this.http.get('/api/delete' + type + 'List/' + data)
        .pipe(map(res => res as any[]));
    } else {
      return this.http.post('/api/update' + type + 'List', data)
        .pipe(map(res => res as any[]));
    }
  }

  private reset() {
    this.data = [];
  }
}

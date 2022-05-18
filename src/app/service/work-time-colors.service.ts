import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WorkTimeColorsService {

  constructor(private http: HttpClient) { }

  createWorkTimeColors(data) {
    return this.http.post('/api/createWorkTimeColors', data)
      .map(res => res);
  }

  updateWorkTimeColors(data) {
    return this.http.post('/api/updateWorkTimeColors', data)
      .map(res => res);
  }

  deleteWorkTimeColors(id) {
    return this.http.get('/api/deleteWorkTimeColors/' + id)
      .map(res => res);
  }

  getWorkTimeColors(superadmin) {
    return this.http.get('/api/getWorkTimeColors/' + superadmin)
      .map(res => res);
  }

  insertFromExcel(data) {
    return this.http.post('/api/insertFromExcel', data)
      .map(res => res);
  }
}

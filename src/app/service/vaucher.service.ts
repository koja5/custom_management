import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VaucherService {

  constructor(private http: HttpClient) { }

  createVaucher(data) {
    return this.http.post('/api/createVaucher', data)
      .map(res => res);
  }

  editVaucher(data) {
    return this.http.post('/api/updateVaucher', data)
      .map(res => res);
  }

  deleteVaucher(id) {
    return this.http.get('/api/deleteVaucher/' + id)
      .map(res => res);
  }

  getVauchers(id) {
    return this.http.get('/api/getVauchers/' + id)
      .map(res => res);
  }

  insertMultiData(data) {
    return this.http.post('/api/insertFromExcel', data)
      .map(res => res);
  }

  getNextVaucherId() {
    return this.http.get('/api/getNextVaucherId')
      .map(res => res);
  }
}

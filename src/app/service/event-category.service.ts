import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventCategoryService {

  constructor(private http: HttpClient) { }

  createEventCategory(data) {
    return this.http.post('/api/createEventCategory', data)
      .map(res => res);
  }

  updateEventCategory(data) {
    return this.http.post('/api/updateEventCategory', data)
      .map(res => res);
  }

  deleteEventCategory(id) {
    return this.http.get('/api/deleteEventCategory/' + id)
      .map(res => res);
  }

  getEventCategory(superadmin) {
    return this.http.get('/api/getEventCategory/' + superadmin)
      .map(res => res);
  }

  insertFromExcel(data) {
    return this.http.post('/api/insertFromExcel', data)
      .map(res => res);
  }
}

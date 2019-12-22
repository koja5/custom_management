import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MongoService {

  constructor(private http: HttpClient) { }

  includeConfiguration(data) {
    return this.http.post('/api/insertConfiguration', data)
      .map(res => res);
  }

  getConfigurationForUser(user_id) {
    return this.http.get('/api/getConfigurationForUser/' + user_id)
      .map(res => res);
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  constructor(private http: HttpClient) { }
  
  getEmailDrafts(superadmin) {
    return this.http.get("/api/getEmailDrafts/" + superadmin);
  }

  createEmailDraft(data) {
    return this.http.post("/api/createEmailDraft", data);
  }

  editEmailDraft(data) {
    return this.http.post("/api/updateEmailDraft", data);
  }

  deleteEmailDraft(data) {
    return this.http.post("/api/deleteEmailDraft", data);
  }

  getSmsDrafts(superadmin) {
    return this.http.get("/api/getSmsDrafts/" + superadmin);
  }

  createSmsDraft(data) {
    return this.http.post("/api/createSmsDraft", data);
  }

  editSmsDraft(data) {
    return this.http.post("/api/updateSmsDraft", data);
  }

  deleteSmsDraft(data) {
    return this.http.post("/api/deleteSmsDraft", data);
  }

}

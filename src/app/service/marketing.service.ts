import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  constructor(private http: HttpClient) { }
  
  getDrafts(superadmin, draftType) {
    return this.http.get("/api/getDrafts/" + superadmin + "/" + draftType);
  }

  createDraft(data) {
    return this.http.post("/api/createDraft", data);
  }

  editDraft(data) {
    return this.http.post("/api/editDraft", data);
  }

  deleteDraft(data) {
    return this.http.post("/api/deleteDraft", data);
  }
}

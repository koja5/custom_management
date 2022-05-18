import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";

@Injectable({
  providedIn: "root",
})
export class CustomGridService {
  constructor(private http: HttpClient) {}

  deleteTranslation(id) {
    return this.http.get("/api/deleteTranslation/" + id).map((res) => res);
  }
}

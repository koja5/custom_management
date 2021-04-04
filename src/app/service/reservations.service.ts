import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ReservationsService {
  constructor(private http: HttpClient) {}

  callApiPost(api, data) {
    return this.http.post(api, data);
  }
}

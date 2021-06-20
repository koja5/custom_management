import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";
@Injectable({
  providedIn: "root",
})
export class SystemLogsService {
  constructor(private http: HttpClient) {}

  getSystemError(name) {
    return this.http.get("./assets/" + name + ".log");
  }
}

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LicenceService {
  constructor(private httpClient: HttpClient) {}

  getStatusLicence(superadmin: string) {
    return this.httpClient.get("/api/getLicenceForUser/" + superadmin).map((res) => res);;
  }

  getAllLicence() {
    return this.httpClient.get("/api/getAllLicences/").map((res) => res);;
  }
}

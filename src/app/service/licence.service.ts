import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LicenceService {
  constructor(private httpClient: HttpClient) {}

  getStatusLicence(superadmin: string) {
    return this.httpClient
      .get("/api/getLicenceForUser/" + superadmin)
      .map((res) => res);
  }

  getAllLicence() {
    return this.httpClient.get("/api/getAllLicences/").map((res) => res);
  }

  getSMSCountPerUser(id) {
    return this.httpClient
      .get("/api/getSMSCountPerUser/" + id)
      .map((res) => res);
  }

  getInvoiceForLicence(id) {
    return this.httpClient
      .get("/api/getInvoiceForLicence/" + id)
      .map((res) => res);
  }

  getAllPaidLicenseForUser(id: string) {
    return this.httpClient
      .get("/api/getAllPaidLicenseForUser/" + id)
      .map((res) => res);
  }
}

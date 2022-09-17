import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  makePayment(stripeToken: any): Observable<any> {
    const url = "http://localhost:5000/api/payment/checkout/";

    return this.http.post("/api/payment/checkout/", { token: stripeToken });
  }
}

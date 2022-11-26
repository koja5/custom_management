import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-payment-success",
  templateUrl: "./payment-success.component.html",
  styleUrls: ["./payment-success.component.scss"],
})
export class PaymentSuccessComponent implements OnInit {
  public language: any;

  constructor(private helpService: HelpService, private router: Router) {}

  ngOnInit() {
    this.language = this.helpService.getLanguageForLanding();
  }

  backToLanding() {
    this.router.navigate(["/dashboard/home/licence"]);
  }
}

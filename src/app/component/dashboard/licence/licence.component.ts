import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Modal } from "ngx-modal";
import {
  Elements,
  Element as StripeElement,
  ElementsOptions,
  StripeService,
} from "ngx-stripe";
import { ReqeustDemoAccount } from "src/app/models/request-demo-account";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { LicenceService } from "src/app/service/licence.service";

@Component({
  selector: "app-licence",
  templateUrl: "./licence.component.html",
  styleUrls: ["./licence.component.scss"],
})
export class LicenceComponent implements OnInit {
  @ViewChild("paymentForm") paymentForm: Modal;
  public language: any;
  public licence: any;
  public diffDate: number;
  elements: Elements;
  card: StripeElement;
  elementsOptions: ElementsOptions = {
    locale: "en",
  };
  public data = new ReqeustDemoAccount();

  constructor(
    private helpService: HelpService,
    private licenceService: LicenceService,
    private stripeService: StripeService,
    private callApi: DynamicService,
    private router: Router
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.getLicence();
  }

  getLicence() {
    this.licenceService
      .getStatusLicence(this.helpService.getSuperadmin())
      .subscribe((data: any) => {
        if (data && data.length) {
          this.licence = data[0];
          this.licence.price = 49;
          this.diffDate = this.calculateDiff(this.licence.expiration_date);
        }
      });
  }

  calculateDiff(data) {
    let date = new Date(data);
    let currentDate = new Date();

    let days = Math.floor(
      (date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24
    );
    return days;
  }

  openPaymentForm() {
    this.paymentForm.open();
    setTimeout(() => {
      this.stripeService
        .elements(this.elementsOptions)
        .subscribe((elements) => {
          this.elements = elements;
          if (!this.card) {
            this.card = this.elements.create("card", {
              iconStyle: "solid",
              style: {
                base: {
                  iconColor: "#666EE8",
                  color: "#31325F",
                  lineHeight: "40px",
                  fontWeight: 300,
                  fontFamily: '"Helverica Neue", Helvetica, sans-serif',
                  fontSize: "18px",
                  "::placeholder": {
                    color: "#CFD7E8",
                  },
                },
              },
            });
            this.card.mount("#card-element");
          }
        });
    }, 100);
  }

  submitPayment() {
    this.data.price = this.licence.price * this.data.expired;
    this.stripeService
      .createToken(this.card, {
        name: this.data.firstname + " " + this.data.lastname,
      })
      .subscribe(
        (result) => {
          if (result.token) {
            const date = this.helpService.convertStringToDate(
              this.licence.expiration_date
            );
            this.data["token"] = result.token;
            this.data["licenceId"] = this.licence.id;
            this.data["superadminId"] = this.helpService.getSuperadmin();
            this.data["expiration_date"] = date.setMonth(
              date.getMonth() + Number(this.data.expired)
            );
            this.callApi
              .callApiPost("/api/payment/create-payment", this.data)
              .subscribe(
                (res) => {
                  if (res["success"]) {
                    this.router.navigate(["payment-success"]);
                  } else {
                    this.helpService.errorToastr(
                      this.language.paymentError,
                      ""
                    );
                  }
                },
                (error) => {
                  this.helpService.errorToastr(this.language.paymentError, "");
                }
              );
          }
        },
        (error) => {
          this.helpService.errorToastr(this.language.paymentError, "");
        }
      );
  }

  checkRequiredFields() {
    if (
      !this.data.firstname ||
      !this.data.lastname ||
      !this.data.email ||
      !this.data.phone ||
      !this.data.expired
    ) {
      return true;
    } else {
      return false;
    }
  }
}

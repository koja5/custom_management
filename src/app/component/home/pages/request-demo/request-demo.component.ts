import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { ReqeustDemoAccount } from "src/app/models/request-demo-account";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import {
  Elements,
  Element as StripeElement,
  ElementsOptions,
  StripeService,
} from "ngx-stripe";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-request-demo",
  templateUrl: "./request-demo.component.html",
  styleUrls: ["./request-demo.component.scss"],
})
export class RequestDemoComponent implements OnInit {
  @ViewChild("paymentForm") paymentForm: Modal;
  public language: any;
  public data = new ReqeustDemoAccount();
  public required = false;
  public success = false;
  public package: string;
  public showDialog = false;
  elements: Elements;
  card: StripeElement;
  elementsOptions: ElementsOptions = {
    locale: "en",
  };

  constructor(
    private callApi: DynamicService,
    private helpService: HelpService,
    private stripeService: StripeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.language = this.helpService.getLanguageForLanding();
    this.package = this.route.snapshot.paramMap.get("package");
    this.getPriceForPackage();
    // this.initializePaymentCard();
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }

  initializePaymentCard() {
    this.stripeService.elements(this.elementsOptions).subscribe((elements) => {
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
  }

  // this method use for directly payment
  submitPayment() {
    this.stripeService
      .createToken(this.card, { name: this.data.name })
      .subscribe(
        (result) => {
          if (result.token) {
            this.data["token"] = result.token;
            this.callApi
              .callApiPost("/api/payment/create-payment", this.data)
              .subscribe((res) => {
                if (res["success"]) {
                  this.router.navigate(["payment-success"]);
                } else {
                  this.helpService.errorToastr(this.language.paymentError, "");
                }
              });
          }
        },
        (error) => {
          this.helpService.errorToastr(this.language.paymentError, "");
        }
      );
  }

  checkRequiredFields() {
    this.required = false;
    this.success = false;
    if (
      !this.data.name ||
      !this.data.email ||
      !this.data.phone ||
      !this.data.nameOfCompany ||
      !this.data.countOfEmployees
    ) {
      this.required = true;
    }
    return this.required;
  }

  openPaymentForm() {
    if (!this.checkRequiredFields()) {
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
      }, 20);
    }
  }

  sendRequestForDemoAccount() {
    this.callApi
      .callApiPost("/api/sendReqestForDemoAccountFull", this.data)
      .subscribe((data) => {
        if (data) {
          this.success = true;
          this.data = new ReqeustDemoAccount();
        }
      });
  }

  selectPackage(event) {
    this.data.price = event;
    this.getNameOfPackage(event);
  }

  getPriceForPackage() {
    if (this.package) {
      for (let i = 0; i < this.language.priceTable.header.length; i++) {
        if (
          this.language.priceTable.header[i].nameOfPackageTitle === this.package
        ) {
          this.data.price = this.language.priceTable.header[i].price;
        }
      }
    }
  }

  getNameOfPackage(price) {
    for (let i = 0; i < this.language.priceTable.header.length; i++) {
      if (this.language.priceTable.header[i].price === price) {
        this.package = this.language.priceTable.header[i].nameOfPackageTitle;
      }
    }
  }
}

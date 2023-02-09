import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ng2-cookies";
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
import { StorageService } from "src/app/service/storage.service";

@Component({
  selector: "app-licence",
  templateUrl: "./licence.component.html",
  styleUrls: ["./licence.component.scss"],
})
export class LicenceComponent implements OnInit {
  @ViewChild("paymentForm") paymentForm: Modal;
  @ViewChild("paymentSMSForm") paymentSMSForm: Modal;
  @ViewChild("paidLicense") paidLicense: Modal;
  @ViewChild("previewLicence") previewLicence: Modal;
  public language: any;
  public licence: any;
  public sms: any;
  public currentLicence: any;
  public diffDate: number;
  elements: Elements;
  card: StripeElement;
  elementsOptions: ElementsOptions = {
    locale: "en",
  };
  public data = new ReqeustDemoAccount();
  public allLicences: any;
  public updateLicence = false;
  public paySms: number;
  public checkUrl: any;
  public agreeValue = false;
  public licences: any;
  public itemLicence: any;
  public user: any;

  constructor(
    private helpService: HelpService,
    private licenceService: LicenceService,
    private stripeService: StripeService,
    private callApi: DynamicService,
    private router: Router,
    private cookie: CookieService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.getLicence();
    this.getSMSCountPerUser();
    this.checkUrl = this.router.url;
    console.log(this.checkUrl);
  }

  getLicence() {
    this.licenceService
      .getStatusLicence(this.helpService.getSuperadmin())
      .subscribe((data: any) => {
        if (data && data.length) {
          this.licence = data[0];
          this.currentLicence = JSON.parse(JSON.stringify(this.licence));
          this.diffDate = this.calculateDiff(this.licence.expiration_date);
        } else {
          this.licence = {
            name: "demo",
            price: 0.0,
            expiration_date: new Date(),
          };
          this.currentLicence = JSON.parse(JSON.stringify(this.licence));
          this.diffDate = -1;
        }
      });
  }

  getSMSCountPerUser() {
    this.licenceService
      .getSMSCountPerUser(this.helpService.getSuperadmin())
      .subscribe((data: any) => {
        if (data && data.length) {
          this.sms = data[0];
        } else {
          this.sms = 0;
        }
      });
  }

  calculateDiff(data) {
    let date = new Date(data);
    let currentDate = new Date();

    let days = Math.floor(
      (date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24
    );
    if (days < 0) {
      days = -1;
    }
    return days;
  }

  openPaymentForm() {
    this.card = null;
    this.updateLicence = false;
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
    this.callApi
      .callApiGet("/api/getMe", this.helpService.getMe())
      .subscribe((data: any) => {
        if (data && data.length > 0) {
          this.setUserData(data[0]);
        }
      });
  }

  setUserData(data: any) {
    this.data.firstname = data.firstname ? data.firstname : "";
    this.data.lastname = data.lastname ? data.lastname : "";
    this.data.email = data.email ? data.email : "";
    this.data.phone = data.mobile
      ? data.mobile
      : data.telephone
      ? data.telephone
      : "";
  }

  openPaymentSMSForm() {
    this.card = null;
    this.updateLicence = false;
    this.paymentSMSForm.open();
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

  getLicences() {
    this.updateLicence = true;
    this.licenceService.getAllLicence().subscribe((data) => {
      this.allLicences = data;
    });
  }

  submitPayment() {
    this.data.price = Number(
      (this.licence.price * this.data.expired).toFixed(2)
    );
    this.stripeService
      .createToken(this.card, {
        name:
          this.data.firstname +
          " " +
          this.data.lastname +
          " - " +
          this.helpService.getSuperadmin(),
      })
      .subscribe(
        (result) => {
          if (result.token) {
            this.licence.expiration_date = this.currentLicence.expiration_date;
            const date = this.helpService.convertStringToDate(
              this.licence.expiration_date
            );
            this.data["name"] = this.data.firstname + " " + this.data.lastname;
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
                  if (res["status"]) {
                    // const successPayment = {
                    //   name: this.data["name"],
                    //   price: this.data["price"],
                    //   email: this.data["email"],
                    //   expiration_date: this.data["expiration_date"],
                    // };
                    const successPayment = this.packDateForSendLicenseMail(
                      res["payment_id"]
                    );
                    this.callApi
                      .callApiPost(
                        "/api/sendInfoForLicencePaymentSuccess",
                        successPayment
                      )
                      .subscribe((res) => {});
                    this.router.navigate([
                      "payment-success/" + res["payment_id"],
                    ]);
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

  packDateForSendLicenseMail(paidId) {
    return {
      licensePaidId: paidId,
      licenseInvoice: this.language.licenseInvoice,
      licenseCompany: this.language.licenseCompany,
      licenseCompanyName: this.language.licenseCompanyName,
      licenseCompanyAddress: this.language.licenseCompanyAddress,
      licenseZipCode: this.language.licenseZipCode,
      licenseCity: this.language.licenseCity,
      licenseCompanyUID: this.language.licenseCompanyUID,
      licenseCompanyFN: this.language.licenseCompanyFN,
      licenseInvoiceNumber: this.language.licenseInvoiceNumber,
      licenseInvoicePrefix: this.language.licenseInvoicePrefix,
      invoiceDate: this.language.invoiceDate,
      date: new Date(),
      licensePayer: this.language.licensePayer,
      payerName: this.data.name,
      payerEmail: this.data.email,
      payerPhone: this.data.phone,
      licencePaymentDate: this.language.licencePaymentDate,
      licenceName: this.language.licenceName,
      licencePrice: this.language.licencePrice,
      licenseMonth: this.language.licenseMonth,
      licenseNetoPrice: this.language.licenseNetoPrice,
      licenseFee: this.language.licenseFee,
      licenseBrutoPrice: this.language.licenseBrutoPrice,
      licenceExpiredDate: this.language.licenceExpiredDate,
      datePaid: new Date(),
      name: this.language[this.licence.name]
        ? this.language[this.licence.name]
        : this.licence.name,
      price: this.licence.price,
      expired: this.data["expired"],
      feeValue: this.language.feeValue,
      expirationDate: this.data["expiration_date"],
      numberOfMonth: this.data["expired"],
      paymentType: this.language.paymentType,
      licenseCompanyPhone: this.language.licenseCompanyPhone,
      licenseCompanyEmail: this.language.licenseCompanyEmail,
    };
  }

  submitSMSPayment() {
    this.stripeService
      .createToken(this.card, {
        name:
          this.data.firstname +
          " " +
          this.data.lastname +
          " - " +
          this.helpService.getSuperadmin(),
      })
      .subscribe(
        (result) => {
          if (result.token) {
            let data = {};
            data["token"] = result.token;
            data["price"] = this.getSumForSMS();
            data["smsCount"] = this.sms.count + this.paySms;
            data["superadminId"] = this.helpService.getSuperadmin();

            this.callApi.callApiPost("/api/payment/buy-sms", data).subscribe(
              (res) => {
                if (res["success"]) {
                  this.sms.count += this.paySms;
                  const successPayment = {
                    name: this.data.firstname + " " + this.data.lastname,
                    price: data["price"],
                    email: this.data["email"],
                    smsCount: this.sms.count,
                  };
                  this.callApi
                    .callApiPost(
                      "/api/sendInfoForSMSPaymentSuccess",
                      successPayment
                    )
                    .subscribe((res) => {});
                  this.helpService.successToastr(
                    this.language.paymentSuccess,
                    ""
                  );
                } else {
                  this.helpService.errorToastr(this.language.paymentError, "");
                }
              },
              (error) => {
                this.helpService.errorToastr(this.language.paymentError, "");
              }
            );
          }
        },
        (error) => {
          console.log(error);
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
      !this.data.expired ||
      !this.licence
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkRequiredSMSFields() {
    if (
      !this.data.firstname ||
      !this.data.lastname ||
      !this.data.email ||
      !this.data.phone
    ) {
      return true;
    } else {
      return false;
    }
  }

  getSum() {
    const sum = Number(this.data.expired) * Number(this.licence.price);
    return sum.toFixed(2);
  }

  getSumForSMS() {
    const sum = Number(this.paySms) * Number(this.language.smsPrice);
    return sum.toFixed(2);
  }

  changeLicence(event) {
    console.log(event);
    this.licence = this.allLicences[event];
  }

  logout() {
    this.cookie.deleteAll("/");
    sessionStorage.clear();
    localStorage.removeItem("idUser");
    localStorage.removeItem("themeColors");
    this.cookie.deleteAll("/dashboard/home");
    setTimeout(() => {
      this.router.navigate(["login"]);
    }, 50);
  }

  showPaidLicense() {
    this.licenceService
      .getAllPaidLicenseForUser(this.helpService.getSuperadmin())
      .subscribe((data) => {
        this.licences = data;
      });
    this.paidLicense.open();
  }

  showItemLicence(item) {
    this.itemLicence = item;
    this.previewLicence.open();
  }

  convertToDate(date) {
    return new Date(date);
  }

  calculateNetoPrice(price, numberOfMonth) {
    return (
      (Number(this.calculateBrutoPrice(price, numberOfMonth)) /
        (100 + Number(this.language.feeValue))) *
      100
    ).toFixed(2);
  }

  calculateBrutoPrice(price, numberOfMonth) {
    return (Number(price) * numberOfMonth).toFixed(2);
  }
}

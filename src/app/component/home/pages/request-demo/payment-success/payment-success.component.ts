import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Modal } from "ngx-modal";
import { HelpService } from "src/app/service/help.service";
import { LicenceService } from "src/app/service/licence.service";

@Component({
  selector: "app-payment-success",
  templateUrl: "./payment-success.component.html",
  styleUrls: ["./payment-success.component.scss"],
})
export class PaymentSuccessComponent implements OnInit {
  @ViewChild("paidLicense") paidLicense: Modal;
  public language: any;
  public license: any;

  constructor(
    private helpService: HelpService,
    private router: Router,
    private route: ActivatedRoute,
    private licenceService: LicenceService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  backToLanding() {
    this.router.navigate(["/dashboard/home/licence"]);
  }

  previewInvoice() {
    this.licenceService
      .getInvoiceForLicence(this.route.snapshot.params.id)
      .subscribe((data: any) => {
        if (data && data.length > 0) {
          console.log(data);
          this.license = data[0];
          this.paidLicense.open();
        }
      });
  }
}

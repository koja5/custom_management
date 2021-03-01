import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomerModel } from "src/app/models/customer-model";
import { CustomersService } from "src/app/service/customers.service";
import { HelpService } from "src/app/service/help.service";
import { CodeStatus } from "../../enum/code-status";

@Component({
  selector: "app-registration-patient",
  templateUrl: "./registration-patient.component.html",
  styleUrls: ["./registration-patient.component.scss"],
})
export class RegistrationPatientComponent implements OnInit {
  public data = new CustomerModel();
  public id: string;
  public errorMessage: any;
  public language: any;
  public codeStatus = CodeStatus;

  constructor(
    private service: CustomersService,
    private route: ActivatedRoute,
    private helpService: HelpService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params.clinic;
    this.data.email = this.route.snapshot.params.email;
    this.language = this.helpService.getLanguage();
  }

  submitForm() {
    this.errorMessage = false;
    this.data.storeId = this.id;
    if (this.data.password === this.data.confirmPassword) {
      this.service
        .createCustomerFromPatientForm(this.data)
        .subscribe((data) => {
          if(data['success']) {
            this.router.navigate(['template/created-account-successed']);
          } else {
            if(data['info'] === this.codeStatus.AlreadyExists) {
              this.errorMessage = this.language.accountExists;
            }
          }
        });
    } else {
      this.errorMessage = this.language.passwordsIsNotEqual;
    }
  }
}

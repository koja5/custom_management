import { InvoiceService } from './../../../../service/invoice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicFormsComponent } from 'src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component';
import { DynamicService } from 'src/app/service/dynamic.service';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-invoice-prefix',
  templateUrl: './invoice-prefix.component.html',
  styleUrls: ['./invoice-prefix.component.scss']
})
export class InvoicePrefixComponent implements OnInit {

  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;

  public path = "parameters";
  public file = "invoice-prefix";
  public loading = true;
  public type: number;
  public id: number;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public configField: any;
  public language: any;

  constructor(
    private helpService: HelpService,
    private dynamicService: DynamicService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.initialization();
  }

  initialization() {
    this.id = this.helpService.getMe();

    this.dynamicService
      .getConfiguration(this.path, this.file)
      .subscribe((config) => {
        this.configField = config;
        this.getData(this.id);
      });
  }

  getData(id) {
    this.invoiceService.getInvoicePrefix(id).then((data) => {
      this.data = data;
      if (data && data["length"] > 0) {
        this.packValue(data);
      }
      this.loading = false;
    });
  }

  packValue(data) {
    for (let i = 0; i < this.configField.length; i++) {
      this.configField[i].value = this.helpService.convertValue(
        data[0][this.configField[i].field],
        this.configField[i].type
      );
    }
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData["superAdminId"] = this.helpService.getMe();

      // console.log(this.changeData);
      if (this.data && this.data.length) {
        this.invoiceService
          .updateInvoicePrefix(this.changeData)
          .subscribe((data) => {
            if (data) {
              this.helpService.successToastr(
                this.language.successExecutedActionTitle,
                this.language.successExecutedActionText
              );
            } else {
              this.helpService.errorToastr(
                this.language.errorExecutedActionTitle,
                this.language.errorExecutedActionText
              );
            }
          });
      } else {
        this.data = [this.changeData];
        this.invoiceService
          .createInvoicePrefix(this.changeData)
          .subscribe((data) => {
            if (data) {
              this.helpService.successToastr(
                this.language.successExecutedActionTitle,
                this.language.successExecutedActionText
              );
            } else {
              this.helpService.errorToastr(
                this.language.errorExecutedActionTitle,
                this.language.errorExecutedActionText
              );
            }
          });
      }
    }
    this.showDialog = false;
  }

}

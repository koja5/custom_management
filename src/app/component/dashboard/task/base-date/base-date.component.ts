import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { RouterModule, Routes, Router, ActivatedRoute } from "@angular/router";
import { CustomersService } from "../../../../service/customers.service";
import { MessageService } from "../../../../service/message.service";
import { Modal } from "ngx-modal";
import { FileUploader } from "ng2-file-upload";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

@Component({
  selector: "app-base-date",
  templateUrl: "./base-date.component.html",
  styleUrls: ["./base-date.component.scss"]
})
export class BaseDateComponent implements OnInit {
  @ViewChild("customer") customer: Modal;
  @ViewChild("upload") upload: Modal;
  @Input() type;
  @Input() data;
  @Input() date;
  @Input() doctor;
  public maleImg = "../../../../../assets/images/users/male-patient.png";
  public femaleImg = "../../../../../assets/images/users/female-patient.png";
  public dialogOpened = false;
  public uploader: FileUploader;
  public documents: any;
  public language: any;
  // public url = 'http://localhost:3000/upload';
  public url = 'http://www.app-production.eu:3000/upload';

  constructor(
    public router: ActivatedRoute,
    public service: CustomersService,
    public message: MessageService
  ) {}

  ngOnInit() {
    console.log(this.data);
    this.uploader = new FileUploader({
      url: this.url,
      additionalParameter: { comments: this.data.id }
    });
    this.service.getDocuments(this.data.id, val => {
      console.log(val);
      this.documents = val;
    });

    this.language = JSON.parse(localStorage.getItem("language"))["user"];
  }

  public close(component) {
    this[component + "Opened"] = false;
  }

  open(component) {
    this[component + "Opened"] = true;
  }

  action(event) {
    console.log(event);
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteCustomer(this.data.id, val => {
        console.log(val);
        this.message.sendDeleteCustomer();
        this.dialogOpened = false;
      });
    } else {
      this.dialogOpened = false;
    }
  }

  editCustomer() {
    this.date.birthday = new Date(this.date.birthday);
    this.customer.open();
  }

  updateCustomer(customer) {
    console.log(this.data);
    console.log(customer);
    this.service.updateCustomer(this.data, val => {
      console.log(val);
      if (val.success) {
        Swal.fire(
          {
            title: this.language.successUpdateTitle,
            text: this.language.successUpdateText
              .toString()
              .replace("{content}", this.data.shortname),
            timer: 3000,
            type: 'success',
            onClose: () => {
              this.customer.close()
            }
          }
        );
      }
    });
  }

  downloadFile(filename: string) {
    console.log(filename);
    this.service
      .downloadFile(filename)
      .subscribe(data => saveAs(data, filename), error => console.error(error));
  }

  previewDocument(document) {
    console.log(document);
  }

  backToGrid() {
    this.message.sendBackToCustomerGrid();
  }
}

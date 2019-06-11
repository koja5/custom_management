import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { CustomersService } from '../../../../service/customers.service';
import { MessageService } from '../../../../service/message.service';
import { Modal } from 'ngx-modal';
import { FileUploader } from 'ng2-file-upload';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-base-date',
  templateUrl: './base-date.component.html',
  styleUrls: ['./base-date.component.scss']
})
export class BaseDateComponent implements OnInit {

  @ViewChild('customer') customer: Modal;
  @ViewChild('upload') upload: Modal;
  @Input() type;
  @Input() data;
  @Input() date;
  @Input() doctor;
  private maleImg = '../../../../../assets/images/users/male-patient.png';
  private femaleImg = '../../../../../assets/images/users/female-patient.png';
  public dialogOpened = false;
  public uploader: FileUploader;
  public documents: any;

  constructor(private router: ActivatedRoute, private service: CustomersService, private message: MessageService) { }

  ngOnInit() {
    console.log(this.data);
    this.uploader = new FileUploader({url:'http://localhost:3000/upload', additionalParameter: {comments: this.data.id }});
    this.service.getDocuments(this.data.id, (val) => {
      console.log(val);
      this.documents = val;
    })
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  open(component) {
    this[component + 'Opened'] = true;
  }

  action(event) {
    console.log(event);
    if(event === 'yes') {
      console.log(this.data);
      this.service.deleteCustomer(this.data.id, (val) => {
        console.log(val);        
        this.message.sendDeleteCustomer();
        this.dialogOpened = false;
      })
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
    this.service.updateCustomer(this.data, (val) => {
      console.log(val);
    });
  }

  downloadFile(filename: string) {
      console.log(filename);
      this.service.downloadFile(filename).subscribe(
        data => saveAs(data, filename),
        error => console.error(error)
    );
  }

  previewDocument(document) {
    console.log(document);
  }

  backToGrid() {
    this.message.sendBackToCustomerGrid();
  }

}

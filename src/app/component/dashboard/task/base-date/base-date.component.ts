import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { CustomersService } from '../../../../service/customers.service';
import { MessageService } from '../../../../service/message.service';
import { Modal } from 'ngx-modal';
import { FileUploader } from 'ng2-file-upload';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { ComplaintTherapyModel } from '../../../../models/complaint-therapy-model';
import { UsersService } from '../../../../service/users.service';
import { formatDate } from '@telerik/kendo-intl';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-base-date',
  templateUrl: './base-date.component.html',
  styleUrls: ['./base-date.component.scss']
})
export class BaseDateComponent implements OnInit {
  @ViewChild('customer') customer: Modal;
  @ViewChild('upload') upload: Modal;
  @ViewChild('complaint') complaint: Modal;
  @ViewChild('therapy') therapy: Modal;
  @Input() type;
  @Input() data;
  @Input() date;
  @Input() doctor;
  public maleImg = '../../../../../assets/images/users/male-patient.png';
  public femaleImg = '../../../../../assets/images/users/female-patient.png';
  public dialogOpened = false;
  public uploader: FileUploader;
  public documents: any;
  public language: any;
  // public url = 'http://localhost:3000/upload';
  public url = 'http://www.app-production.eu:3000/upload';
  public complaintValue: any;
  public complaintData = new ComplaintTherapyModel();
  public gridComplaint: any;
  public therapyValue: any;
  public gridTherapy: any;
  public stateValue: any;
  public loadingGrid: any;

  constructor(
    public router: ActivatedRoute,
    public service: CustomersService,
    public message: MessageService,
    public usersService: UsersService
  ) {}

  ngOnInit() {
    console.log(this.data);
    this.uploader = new FileUploader({
      url: this.url,
      additionalParameter: { comments: this.data.id }
    });

    this.language = JSON.parse(localStorage.getItem('language'))['user'];

    this.getDocument();
    this.getComplaint();
    this.getTherapy();
  }

  getComplaint() {
    this['loadingGridComplaint'] = true;
    this.service.getComplaintForCustomer(this.data.id).subscribe(data => {
      this.gridComplaint = this.formatingData(data);
      this['loadingGridComplaint'] = false;
    });
  }

  getTherapy() {
    this['loadingGridTherapy'] = true;
    this.service.getTherapyForCustomer(this.data.id).subscribe(data => {
      this.gridTherapy = this.formatingData(data);
      this['loadingGridTherapy'] = false;
      console.log(this.gridTherapy);
    });
  }

  getDocument() {
    this['loadingGridDocument'] = true;
    this.service.getDocuments(this.data.id, val => {
      console.log(val);
      this.documents = val;
      this['loadingGridDocument'] = false;
    });
  }

  formatingData(data) {
    console.log(data);
    const datePipe = new DatePipe('en-US');
    for (let i = 0; i < data['length']; i++) {
      data[i].date = datePipe.transform(data[i].date, 'dd/MM/yyyy');
    }
    return data;
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  open(component) {
    this[component + 'Opened'] = true;
  }

  action(event) {
    console.log(event);
    if (event === 'yes') {
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
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateText
            .toString()
            .replace('{content}', this.data.shortname),
          timer: 3000,
          type: 'success',
          onClose: () => {
            this.customer.close();
          }
        });
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

  openComplaintModal() {
    this.complaintData = new ComplaintTherapyModel();
    this.complaintData.complaint = null;
    this.complaintValue = JSON.parse(localStorage.getItem('language'))[
      'complaint'
    ];
    this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];
    this.complaint.open();
  }

  openTherapyModal() {
    this.complaintData = new ComplaintTherapyModel();
    this.complaintValue = JSON.parse(localStorage.getItem('language'))[
      'complaint'
    ];
    this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];
    this.stateValue = JSON.parse(localStorage.getItem('language'))['state'];
    this.therapy.open();
  }

  selectComplaint(event) {
    console.log(event);
    this.complaintData.complaint = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.complaint += element + ';';
    });
  }

  selectTherapies(event) {
    console.log(event);
    this.complaintData.therapies = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.therapies += element + ';';
    });
  }

  selectedState(event) {
    this.complaintData.state = event;
  }

  addComplaint(complaint) {
    console.log(this.data.id);
    console.log(this.complaintData);
    this.complaintData.customer_id = this.data.id;
    this.complaintData.date = new Date();
    if (localStorage.getItem('username') === null) {
      this.usersService.getMe(localStorage.getItem('idUser'), val => {
        console.log(val);
        localStorage.setItem('username', val[0]['shortname']);
        this.complaintData.employee_name = 'Dr. ' + val[0]['shortname'];
        this.service.addComplaint(this.complaintData).subscribe(data => {
          if (data) {
            this.getComplaint();
            this.complaint.close();
          }
        });
      });
    } else {
      this.complaintData.employee_name = localStorage.getItem('username');
      this.service.addComplaint(this.complaintData).subscribe(data => {
        if (data) {
          this.getComplaint();
          this.complaint.close();
        }
      });
    }
  }

  addTherapy(therapy) {
    this.complaintData.customer_id = this.data.id;
    this.complaintData.date = new Date();
    console.log(this.complaintData);
    this.service.addTherapy(this.complaintData).subscribe(data => {
      if (data) {
        this.getTherapy();
        this.therapy.close();
      }
    });
  }
}

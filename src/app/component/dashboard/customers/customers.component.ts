import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { CustomersService } from '../../../service/customers.service';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import { UploadEvent, SelectEvent } from '@progress/kendo-angular-upload';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import { MessageService } from '../../../service/message.service';
import { CustomerModel } from '../../../models/customer-model';

const newLocal = 'data';
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  @ViewChild('customer') customer: Modal;
  public data = new CustomerModel();
  public unamePattern = '^[a-z0-9_-]{8,15}$';
  public userType = ['Employee', 'Manager', 'Admin'];
  public gridData: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 5,
    filter: null
  };
  public storeLocation: any;
  public language: any;
  public selectedUser: any;
  public imagePath = 'defaultUser';
  public loading = true;
  uploadSaveUrl = 'http://localhost:3000/api/uploadImage'; // should represent an actual API endpoint
  uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
  constructor(public service: CustomersService, public storeService: StoreService, public message: MessageService) { }

  ngOnInit() {

    this.getCustomers();

    if (localStorage.getItem('language') !== null) {
      this.language = JSON.parse(localStorage.getItem('language')).grid;
      console.log(this.language);
    }

    this.message.getDeleteCustomer().subscribe(
      mess => {
        this.getCustomers();
        this.selectedUser = undefined;
      }
    );

    this.message.getBackToCustomerGrid().subscribe(
      mess => {
        this.selectedUser = undefined;
      }
    );
  }

  getCustomers() {
    this.service.getCustomers(localStorage.getItem('storeId'), (val) => {
      console.log(val);
      if (val !== null) {
        this.gridData = process(val, this.state);
        this.currentLoadData = this.gridData.data;
        this.loading = false;
      } else {
        this.gridData[newLocal] = [];
        this.loading = false;
      }
    });
  }

  newUser() {
    this.storeService.getStore(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.storeLocation = val;
    });
    this.initializeParams();
    this.customer.open();
  }

  initializeParams() {
    this.data = {
      firstname: '',
      lastname: '',
      gender: '',
      street: '',
      streetnumber: '',
      city: '',
      telephone: '',
      mobile: '',
      birthday: '',
      storeId: ''
    };
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem('storeId');
    this.service.createCustomer(this.data, (val) => {
      console.log(val);
      this.data.id = val.id;
      this.gridData.data.push(this.data);
      this.customer.close();
      // form.reset();
    });

  }

  selectionChange(event) {
    console.log(event);

  }

  selectionChangeStore(event) {
    console.log(event);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    console.log(this.currentLoadData);
    this.gridData = process(this.currentLoadData, this.state);
    this.gridData.total = this.gridData.data.length;
    console.log(this.state);
    console.log(this.gridData);
  }

  protected pageChange({ skip, take }: PageChangeEvent): void {
    this.state.skip = skip;
    this.state.take = take;
    this.loadProducts();
  }

  public loadProducts(): void {
    this.gridData = {
      data: this.currentLoadData.slice(this.state.skip, this.state.skip + this.state.take),
      total: this.currentLoadData.length
    };

    console.log(this.gridData);
  }

  previewUser(selectedUser) {
    console.log(selectedUser);
    this.selectedUser = selectedUser;
  }

  uploadEventHandler(e: UploadEvent) {
    console.log(e);
  }

}

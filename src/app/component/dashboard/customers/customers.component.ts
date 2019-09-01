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
import Swal from 'sweetalert2';
import * as GC from '@grapecity/spread-sheets';
import * as Excel from '@grapecity/spread-excelio';
import { WindowModule } from '@progress/kendo-angular-dialog';

const newLocal = 'data';
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  public customer = false;
  public data = new CustomerModel();
  public unamePattern = '^[a-z0-9_-]{8,15}$';
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  public userType = ['Employee', 'Manager', 'Admin'];
  public gridData: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null
  };
  public storeLocation: any;
  public language: any;
  public selectedUser: any;
  public imagePath = 'defaultUser';
  public loading = true;
  // public uploadSaveUrl = 'http://localhost:3000/api/uploadImage'; // should represent an actual API endpoint
  public uploadSaveUrl = 'http://www.app-production.eu:3000/uploadImage';
  public uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
  private spread: GC.Spread.Sheets.Workbook;
  private excelIO;
  public customerDialogOpened = false;
  constructor(public service: CustomersService, public storeService: StoreService, public message: MessageService) {
    this.excelIO = new Excel.IO();
  }

  ngOnInit() {

    this.getCustomers();

    if (localStorage.getItem('language') !== null) {
      this.language = JSON.parse(localStorage.getItem('language')).grid;
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
        this.currentLoadData = val;
        this.gridData = process(val, this.state);
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
    this.customer = true;
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
      if (val.success) {
        this.data.id = val.id;
        this.gridData.data.push(this.data);
        this.customer = false;
        // form.reset();
        Swal.fire({
          title: 'Successfull!',
          text: 'New customer is successfull added!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'New customer is not added!',
          timer: 3000,
          type: 'error'
        });
      }
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

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadProducts();
  }

  loadProducts(): void {
    this.gridData = {
      data: this.currentLoadData.slice(
        this.state.skip,
        this.state.skip + this.state.take
      ),
      total: this.currentLoadData.length
    };
  }

  previewUser(selectedUser) {
    console.log(selectedUser);
    this.selectedUser = selectedUser;
  }

  uploadEventHandler(e: UploadEvent) {
    console.log(e);
  }

  action(event) {
    console.log(event);
    if (event === 'yes') {
      this.customerDialogOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe(
          data => {
            if (data) {
              Swal.fire({
                title: 'Successfull!',
                text: 'New customer is successfull added',
                timer: 3000,
                type: 'success'
              });
              this.getCustomers();
            }
          }
        );
      }, 50);
    } else {
      this.customerDialogOpened = false;
    }
  }

  onFileChange(args) {
    const self = this;
    const file = args.srcElement && args.srcElement.files && args.srcElement.files[0];
    this.customerDialogOpened = true;
    if (file) {
      self.excelIO.open(file, (json) => {
        console.log(json);
        this.gridData = null;
        setTimeout(() => {
          this.gridData = this.xlsxToJson(json);
        }, 50);
      }, (error) => {
        alert('load fail');
      });
    }
  }

  xlsxToJson(data) {
    const sheets = data.sheets.Sheet1.data.dataTable;
    const rowCount = data.sheets.Sheet1.rows.length;
    const columnCount = data.sheets.Sheet1.columnCount;
    console.log(sheets, rowCount, columnCount);
    const objectArray = [];
    const columns = [];
    const dataArray = [];


    for (let i = 0; i < columnCount; i++) {
      columns.push(sheets[0][i].value);
    }

    for (let i = 1; i < rowCount; i++) {
      const object = {};
      for (let j = 0; j < columnCount; j++) {
        object[sheets[0][j].value] = sheets[i][j].value;
      }
      objectArray.push(object);
      dataArray.push(objectArray[i - 1]);
    }
    const allData = {
      table: 'customers',
      columns: columns,
      data: dataArray
    };
    return allData;
  }

  closeCustomer() {
    this.customer = false;
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import { StoreModel } from 'src/app/models/store-model';
import Swal from 'sweetalert2';
import * as GC from '@grapecity/spread-sheets';
import * as Excel from '@grapecity/spread-excelio';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {
  public store = false;
  public storeEdit = false;
  public data = new StoreModel();
  public currentLoadData: any;
  public gridData: any;
  public dialogOpened = false;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null
  };
  public idUser: string;
  public loading = true;
  public language: any;
  public start_work: Date;
  public end_work: Date;
  public time_duration: string;
  private spread: GC.Spread.Sheets.Workbook;
  private excelIO;
  public excelOpened = false;

  constructor(public service: StoreService) {
    this.excelIO = new Excel.IO();
  }

  ngOnInit() {
    this.idUser = localStorage.getItem('idUser');
    this.language = JSON.parse(localStorage.getItem('language'))['store'];
    this.getStore();
  }

  getStore() {
    this.service.getStore(this.idUser, val => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      this.loading = false;
    });
  }

  newStore() {
    this.initialParams();
    this.store = true;
  }

  initialParams() {
    this.data = {
      storename: '',
      street: '',
      zipcode: '',
      place: '',
      telephone: '',
      mobile: '',
      comment: '',
      start_work: '',
      end_work: '',
      time_duration: '',
      superadmin: this.idUser
    };
  }

  createStore(form) {
    this.data.start_work = this.start_work.toString();
    this.data.end_work = this.end_work.toString()
    this.service.createStore(this.data, val => {
      if (val.success) {
        console.log(val);
        this.data.id = val.id;
        this.gridData.data.push(this.data);
        this.store = false;
        Swal.fire({
          title: this.language.successful,
          text: this.language[val.info],
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: this.language.error,
          text: this.language[val.info],
          timer: 3000,
          type: 'error'
        });
      }
    });
  }

  updateStore(store) {
    this.data.start_work = this.start_work.toString();
    this.data.end_work = this.end_work.toString();
    this.service.editStore(this.data).subscribe(data => {
      console.log(data);
      if (data) {
        this.getStore();
        Swal.fire({
          title: 'Successfull update',
          text: 'Store data is successfull update!',
          timer: 3000,
          type: 'success'
        });
        this.storeEdit = false;
      } else {
        Swal.fire({
          title: 'Error update',
          text: 'Store data is not successfull update!',
          timer: 3000,
          type: 'error'
        });
      }
    });
  }

  deleteStore(store) { }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
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

    console.log(this.gridData);
  }

  editStore(store) {
    console.log(store);
    this.data = store;
    this.start_work = new Date(this.data.start_work);
    this.end_work = new Date(this.data.end_work);
    this.storeEdit = true;
  }

  storeEditClose() {
    this.storeEdit = false;
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  open(component, id) {
    this[component + 'Opened'] = true;
    this.data.id = id;
  }

  action(event) {
    console.log(event);
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteStore(this.data.id).subscribe(data => {
        console.log(data);
        if (data) {
          this.state = {
            skip: 0,
            take: 10
          };
          Swal.fire({
            title: 'Successfull!',
            text: 'Successfull delete store',
            timer: 3000,
            type: 'success'
          });
          this.getStore();
        }
        this.dialogOpened = false;
      });
    } else {
      this.dialogOpened = false;
    }
  }

  excelAction(event) {
    console.log(event);
    if (event === 'yes') {
      this.excelOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe(
          data => {
            if (data) {
              Swal.fire({
                title: 'Successfull!',
                text: 'New stores is successfull added',
                timer: 3000,
                type: 'success'
              });
              this.getStore();
            }
          }
        );
      }, 50);
    } else {
      this.excelOpened = false;
    }
  }

  onFileChange(args) {
    const self = this;
    const file = args.srcElement && args.srcElement.files && args.srcElement.files[0];
    this.excelOpened = true;
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
    const rowCount = data.sheets.Sheet1.rowCount;
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
      table: 'store',
      columns: columns,
      data: dataArray
    };
    return allData;
  }
}

import { Component, OnInit, HostListener } from '@angular/core';
import { VaucherModel } from 'src/app/models/vaucher-model';
import { process, State } from '@progress/kendo-data-query';
import {
  RowArgs,
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import { VaucherService } from 'src/app/service/vaucher.service';
import Swal from 'sweetalert2';
import { UploadEvent } from '@progress/kendo-angular-upload';
import { MessageService } from '../../../service/message.service';
import * as XLSX from 'ts-xlsx';
import { CustomersService } from 'src/app/service/customers.service';

@Component({
  selector: 'app-vaucher',
  templateUrl: './vaucher.component.html',
  styleUrls: ['./vaucher.component.scss']
})
export class VaucherComponent implements OnInit {
  public vaucher = false;
  public data = new VaucherModel();
  public unamePattern = '^[a-z0-9_-]{8,15}$';
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
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
  public uploadSaveUrl = 'http://78.47.206.131:8081/uploadImage';
  public uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
  // private spread: GC.Spread.Sheets.Workbook;
  // private excelIO;
  public vaucherDialogOpened = false;
  public fileValue: any;
  public theme: string;
  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  private arrayBuffer: any;
  public operationMode: any;
  public customerUsers: any;
  public customerUser: any;
  public dialog = false;
  public dateConst: any;
  public dateredeemedConst: any;
  public id: number;
  public height: any;

  constructor(
    private service: VaucherService,
    private customer: CustomersService,
    private message: MessageService
  ) {}

  ngOnInit() {
    
    this.height = window.innerHeight - 110;
    this.height += 'px'; 
    this.id = Number(localStorage.getItem('idUser'));
    this.getVauchers();
    this.getCustomer();

    if (localStorage.getItem('language') !== null) {
      this.language = JSON.parse(localStorage.getItem('language')).vaucher;
    }

    if (localStorage.getItem('theme') !== null) {
      this.theme = localStorage.getItem('theme');
    }

    /*this.message.getDeleteVaucher().subscribe(mess => {
      this.getVauchers();
      this.selectedUser = undefined;
    });

    this.message.getBackToVaucherGrid().subscribe(mess => {
      this.selectedUser = undefined;
      // this.changeTheme(this.theme);
    });*/

    this.message.getTheme().subscribe(mess => {
      // this.changeTheme(mess);
      this.theme = mess;
    });
  }

  getVauchers() {
    this['loadingGridVaucher'] = true;
    this.service.getVauchers(localStorage.getItem('idUser')).subscribe(date => {
      if (date !== null) {
        console.log(date);
        this.currentLoadData = date;
        this.gridData = process(this.currentLoadData, this.state);
        this['loadingGridVaucher'] = false;
      } else {
        this.gridData = [];
        this.loading = false;
        this['loadingGridVaucher'] = false;
      }
      this.loading = false;
      // this.changeTheme(this.theme);
    });
  }

  newVaucher() {
    this.operationMode = 'add';
    this.initializeParams();
    // this.changeTheme(this.theme);
    this.vaucher = true;
  }

  initializeParams() {
    this.data = {
      id_voucher: null,
      date: '',
      amount: null,
      date_redeemed: '',
      customer: null,
      customer_name: '',
      comment: ''
    };
    this.dateConst = '';
    this.dateredeemedConst = '';
    this.customerUser = null;
  }

  createVaucher(form) {
    console.log(this.data);
    this.data.superadmin = localStorage.getItem('idUser');
    if(this.customerUser !== null) {
    this.data.customer = this.customerUser.id;
    this.data.customer_name =
      this.customerUser.firstname + ' ' + this.customerUser.lastname;
    }
    this.data.date = this.dateConst.toString();
    this.data.date_redeemed = this.dateredeemedConst.toString();
    this.service.createVaucher(this.data).subscribe(data => {
      if (data['success']) {
        this.data.id = data['id'];
        /*this.gridData = {
          data: this.currentLoadData.slice(
            this.currentLoadData.length - this.state.take,
            this.state.skip + this.state.take
          ),
          total: this.currentLoadData.length
        };*/
        this.currentLoadData.push(this.data);
        this.vaucher = false;
        this.getVauchers();
        // form.reset();
        Swal.fire({
          title: 'Successfull!',
          text: 'New vaucher is successfull added!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'New vaucher is not added!',
          timer: 3000,
          type: 'error'
        });
      }
    });
  }

  deleteVaucher(event) {
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteVaucher(this.data.id).subscribe(data => {
        console.log(data);
        if (data) {
          this.getVauchers();
        }
      });
    }
    this.dialog = false;
  }

  editForm(data) {
    // this.changeTheme(this.theme);
    this.data = data;
    this.convertValue(data);
    this.operationMode = 'edit';
    this.vaucher = true;
  }

  editVaucher(store) {
    this.data.customer = this.customerUser.id;
    if (this.customerUser.firstname !== undefined && this.customerUser.lastname !== undefined) {
      this.data.customer_name = this.customerUser.firstname + ' ' + this.customerUser.lastname;
    }
    this.data.date = this.dateConst.toString();
    this.data.date_redeemed = this.dateredeemedConst.toString();
    this.service.editVaucher(this.data).subscribe(data => {
      console.log(data);
      if (data) {
        this.getVauchers();
        Swal.fire({
          title: 'Successfull update',
          text: 'Store data is successfull update!',
          timer: 3000,
          type: 'success'
        });
        this.vaucher = false;
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

  convertValue(data) {
    this.dateConst = new Date(data.date);
    this.dateredeemedConst = new Date(data.date_redeemed);
    this.data.amount = Number(data.amount);
    this.customerUser = this.getSelectedCustomerUser(data.customer);
  }

  getSelectedCustomerUser(id) {
    for(let i = 0; i < this.customerUsers.length; i++) {
      if(this.customerUsers[i].id == id) {
        return this.customerUsers[i];
      }
    }
    return null;
  }

  selectionChange(event) {
    console.log(event);
  }

  selectionChangeStore(event) {
    console.log(event);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
    if (this.state.filter.filters.length === 0) {
      this.gridData.total = this.currentLoadData.length;
    }
    // this.changeTheme(this.theme);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadProducts();
  }

  loadProducts(): void {
    this.gridData = {
      data: this.gridData.slice(
        this.state.skip,
        this.state.skip + this.state.take
      )
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
      this.vaucherDialogOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe(data => {
          if (data) {
            Swal.fire({
              title: 'Successfull!',
              text: 'New vaucher is successfull added',
              timer: 3000,
              type: 'success'
            });
            this.getVauchers();
          }
        });
      }, 50);
    } else {
      this.vaucherDialogOpened = false;
      this.getVauchers();
    }
  }

  onFileChange(args) {
    /*console.log(args);
    const self = this;
    const file =
      args.srcElement && args.srcElement.files && args.srcElement.files[0];
    this.vaucherDialogOpened = true;
    if (file) {
      self.excelIO.open(
        file,
        json => {
          console.log(json);
          this.gridData = null;
          setTimeout(() => {
            this.gridData = this.xlsxToJson(json);
            this.fileValue = null;
          }, 50);
        },
        error => {
          alert('load fail');
        }
      );
    }*/

    this.vaucherDialogOpened = true;
    let fileReader = new FileReader();
    fileReader.onload = e => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join('');
      var workbook = XLSX.read(bstr, { type: 'binary' });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet, { raw: false }));
      setTimeout(() => {
        if (XLSX.utils.sheet_to_json(worksheet, { raw: true }).length > 0) {
          this.gridData = this.xlsxToJson(
            XLSX.utils.sheet_to_json(worksheet, { raw: true })
          );
          this.fileValue = null;
        }
      }, 50);
    };
    fileReader.readAsArrayBuffer(args.target.files[0]);
  }

  xlsxToJson(data) {
    const rowCount = data.length;
    const objectArray = [];
    const columns = Object.keys(data[0]);
    const columnCount = columns.length;
    const dataArray = [];

    for (let i = 0; i < rowCount; i++) {
      const object = {};
      for (let j = 0; j < columnCount; j++) {
        console.log(data[i][columns[j]]);
        object[columns[j]] = data[i][columns[j]];
      }
      objectArray.push(object);
      dataArray.push(objectArray[i]);
    }
    const allData = {
      table: 'vaucher',
      columns: columns,
      data: dataArray
    };
    return allData;
  }

  closeVaucher() {
    this.vaucher = false;
  }

  getTranslate(title: string) {
    if (title === 'add') {
      return this.language.addVaucher;
    } else if (title === 'edit') {
      return this.language.updateVaucher;
    }
  }

  getCustomer() {
    this.customer.getCustomers(localStorage.getItem('superadmin'), val => {
      console.log(val);
      this.customerUsers = val;
      this.loading = false;
    });
  }

  open(component, id) {
    this.dialog = true;
    this.data.id = id;
    // this.changeTheme(this.theme);
  }

  changeTheme(theme: string) {
    setTimeout(() => {
      if (localStorage.getItem('allThemes') !== undefined) {
        const allThemes = JSON.parse(localStorage.getItem('allThemes'));
        console.log(allThemes);
        let items = document.querySelectorAll('.k-dialog-titlebar');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const themeName = allThemes[j]['name'];
            console.log(clas);
            clas.remove('k-dialog-titlebar-' + themeName);
            clas.add('k-dialog-titlebar-' + theme);
          }
        }

        items = document.querySelectorAll('.k-header');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('gridHeader-' + element);

            clas.add('gridHeader-' + this.theme);
          }
        }
        items = document.querySelectorAll('.k-pager-numbers');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('k-pager-numbers-' + element);
            clas.add('k-pager-numbers-' + this.theme);
          }
        }

        items = document.querySelectorAll('.k-select');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('k-select-' + element);
            clas.add('k-select-' + this.theme);
          }
        }

        items = document.querySelectorAll('.k-grid-table');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('k-grid-table-' + element);
            clas.add('k-grid-table-' + this.theme);
          }
        }
        items = document.querySelectorAll('.k-grid-header');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('k-grid-header-' + element);
            clas.add('k-grid-header-' + this.theme);
          }
        }
        items = document.querySelectorAll('.k-pager-wrap');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('k-pager-wrap-' + element);
            clas.add('k-pager-wrap-' + this.theme);
          }
        }

        items = document.querySelectorAll('.k-button');
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]['name'];
            clas.remove('inputTheme-' + element);
            clas.add('inputTheme-' + this.theme);
          }
        }
      }
    }, 50);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(window.innerHeight);
    this.height = window.innerHeight - 110;
    this.height += 'px';
  }
}

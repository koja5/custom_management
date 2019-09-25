import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { UsersService } from '../../../service/users.service';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { StandardUrlSerializer } from '../../../standardUrlSerializer';
import { UrlTree, Router, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { throttleTime } from 'rxjs/operators';
import { UserModel } from '../../../models/user-model';
import Swal from 'sweetalert2';
import * as GC from '@grapecity/spread-sheets';
import * as Excel from '@grapecity/spread-excelio';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public user = false;
  public data = new UserModel();
  public userType = ['Employee', 'Manager', 'Admin'];
  public gridData: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null
  };
  public hideShow = 'password';
  public hideShowEye = 'fa-eye-slash';
  public storeLocation: any;
  public sort: SortDescriptor[] = [
    {
      field: 'id',
      dir: 'asc'
    }
  ];
  public unamePattern = '^[a-z0-9_-]{8,15}$';
  public passwordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#])[A-Za-z\d$@$!%*?&].{8,}';
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  public loading = true;
  private spread: GC.Spread.Sheets.Workbook;
  private excelIO;
  public excelOpened = false;
  public language: any;
  public fileValue: any;
  public theme: string;
  
  constructor(
    public service: UsersService,
    public storeService: StoreService,
    public url: StandardUrlSerializer,
    public router: Router
  ) {
    this.excelIO = new Excel.IO();
  }

  ngOnInit() {
    this.getUser();
    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }
    this.changeTheme(this.theme);
    this.language = JSON.parse(localStorage.getItem('language'))['user'];
  }

  getUser() {
    this.service.getUsers(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      this.loading = false;
    });
  }

  newUser() {
    this.initializeParams();
    this.storeService.getStore(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.storeLocation = val;
    });
    this.changeTheme(this.theme);
    this.user = true;
  }

  initializeParams() {
    this.data.firstname = '';
    this.data.lastname = '';
    this.data.street = '';
    this.data.zipcode = '';
    this.data.place = '';
    this.data.telephone = '';
    this.data.mobile = '';
    this.data.birthday = '';
    this.data.incompanysince = '';
    this.data.active = 0;
  }

  createUser(form) {
    console.log(this.data);
    this.data.birthday = this.data.birthday.toString();
    this.data.incompanysince = this.data.incompanysince.toString();
    this.service.createUser(this.data, val => {
      if (val.success) {
        console.log(val);
        this.gridData.data.push(this.data);
        this.user = false;
        Swal.fire({
          title: 'Successfull!',
          text: 'New user is successfull added!',
          timer: 3000,
          type: 'success'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'New user is not added!',
          timer: 3000,
          type: 'error'
        });
      }
      // form.reset();
    });
  }

  selectionChange(event) {
    console.log(event);
    if (event === 'Employee') {
      this.data.type = '3';
    } else if (event === 'Manager') {
      this.data.type = '2';
    } else if (event === 'Admin') {
      this.data.type = '1';
    } else {
      this.data.type = event;
    }
  }

  selectionChangeStore(event) {
    console.log(event);
    if (event !== undefined) {
      this.data.storeId = event.id;
    } else {
      this.data.storeId = event;
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadProducts();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortChangeData();
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

  public close(component) {
    this[component + 'Opened'] = false;
  }

  sortChangeData() {
    this.currentLoadData = orderBy(this.currentLoadData, this.sort);
  }

  hideShowPassword() {
    if (this.hideShow === 'password') {
      this.hideShow = 'text';
      this.hideShowEye = 'fa-eye';
    } else {
      this.hideShow = 'password';
      this.hideShowEye = 'fa-eye-slash';
    }
  }

  serializeUrl(root, queryParams) {
    const three = new UrlTree();
    three.root = root;
    three.queryParams = queryParams;
    console.log(three);

    console.log(this.url.serialize(three));
  }

  routing(id) {
    // this.router.navigate(['user-details'], {queryParams: id});
    const tree = new UrlTree();
    const url = new UrlSegment('/dashboard/user-details', id);
    tree.root = new UrlSegmentGroup([url], null);
    console.log(tree);
    return tree;
    console.log(this.url.serialize(tree));
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
                text: 'New users is successfull added',
                timer: 3000,
                type: 'success'
              });
              this.getUser();
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
          this.fileValue = null;
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
      table: 'users',
      columns: columns,
      data: dataArray
    };
    return allData;
  }

  changeTheme(theme: string) {
    setTimeout(() => {
      if (localStorage.getItem("allThemes") !== undefined) {
        const allThemes = JSON.parse(localStorage.getItem("allThemes"));
        console.log(allThemes);
        let items = document.querySelectorAll(".k-dialog-titlebar");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const themeName = allThemes[j]["name"];
            console.log(clas);
            clas.remove("k-dialog-titlebar-" + themeName);
            clas.add("k-dialog-titlebar-" + theme);
          }
        }
      }
    }, 50);
  }
}

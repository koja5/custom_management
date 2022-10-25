import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { Modal } from "ngx-modal";
import { UsersService } from "../../../service/users.service";
import { StoreService } from "../../../service/store.service";
import { process, State, GroupDescriptor } from "@progress/kendo-data-query";
import {
  DataStateChangeEvent,
  GridComponent,
  PageChangeEvent,
  RowArgs,
} from "@progress/kendo-angular-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { UrlTree, Router } from "@angular/router";
import { UserModel } from "../../../models/user-model";
import Swal from "sweetalert2";
// import * as GC from '@grapecity/spread-sheets';
// import * as Excel from '@grapecity/spread-excelio';
import * as XLSX from "ts-xlsx";
import { MessageService } from "src/app/service/message.service";
import { HelpService } from "src/app/service/help.service";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { checkIfInputValid, checkIsValidDate } from "../../../shared/utils";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  @ViewChild("user") user: Modal;
  @ViewChild('grid') grid;

  public allPages: boolean;
  private _allData: ExcelExportData;

  public data = new UserModel();
  public userType = ["Employee", "Manager", "Admin", "Read only scheduler"];
  public gridData: any;
  public gridView: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
  };
  public hideShow = "password";
  public hideShowEye = "fa-eye-slash";
  public storeLocation: any;
  public sort: SortDescriptor[] = [
    {
      field: "id",
      dir: "asc",
    },
  ];
  // public unamePattern = "^[a-z0-9_-]{8,15}$";
  public passwordPattern =
    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#])[A-Za-zd$@$!%*?&].{8,}";
  public emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
  public loading = true;
  // private spread: GC.Spread.Sheets.Workbook;
  // private excelIO;
  public excelOpened = false;
  public language: any;
  public fileValue: any;
  public theme: string;
  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  private arrayBuffer: any;
  private icon: string = "cog";
  private settings: Array<any> = [
    {
      text: "My Profile",
    },
    {
      text: "Friend Requests",
    },
    {
      text: "Account Settings",
    },
    {
      text: "Support",
    },
    {
      text: "Log Out",
    },
  ];
  public height: any;
  public searchFilter: any;
  public selectedUserType: any;
  public selectedStoreId: any;
  public pageSize = 5;
  public pageable = {
    pageSizes: true,
    previousNext: true,
  };
  showDialog: boolean = false;
  isFormDirty: boolean = false;
  currentUrl: string;
  savePage: any = {};
  checkIfInputValid = checkIfInputValid;
  checkIsValidDate = checkIsValidDate;

  public showColumnPicker = false;
  public columns: string[] = ["Username", "Email address", "Firstname", "Lastname", "Street", "Active"];
  public hiddenColumns: string[] = [];

  constructor(
    private service: UsersService,
    private storeService: StoreService,
    private router: Router,
    private message: MessageService,
    private helpService: HelpService,
  ) {
    // this.excelIO = new Excel.IO();
    this.allData = this.allData.bind(this);
  }


  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.getUser();
    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }
    this.changeTheme(this.theme);
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.users);

    this.message.getTheme().subscribe((mess) => {
      this.changeTheme(mess);
      this.theme = mess;
    });
    this.currentUrl = this.router.url;

    this.setPagination();
  }

  setPagination() {
    this.savePage = this.helpService.getGridPageSize();
    if (
      (this.savePage && this.savePage[this.currentUrl]) ||
      this.savePage[this.currentUrl + "Take"]
    ) {
      this.state.skip = this.savePage[this.currentUrl];
      this.state.take = this.savePage[this.currentUrl + "Take"];
    }
  }

  getUser() {
    this.service.getUsers(localStorage.getItem("superadmin"), (val) => {
      console.log(val);
      this.currentLoadData = val;
      if (this.currentLoadData.length < this.state.skip) {
        this.state.skip = 0;
      }
      this.gridData = {
        data: val,
      };
      this.gridView = process(val, this.state);
      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, this.state).data,
      }
      this.changeTheme(this.theme);
      this.loading = false;
    });
  }

  receiveConfirm(event: boolean): void {
    if (event) {
      this.user.close();
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }

  confirmClose(): void {
    this.user.modalRoot.nativeElement.focus();
    if (this.isFormDirty) {
      this.showDialog = true;
    } else {
      this.user.close()
      this.showDialog = false;
      this.isFormDirty = false
    }
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  newUser() {
    this.initializeParams();
    this.storeService.getStore(localStorage.getItem("superadmin"), (val) => {
      console.log(val);
      this.storeLocation = val;
    });
    this.changeTheme(this.theme);
    this.user.closeOnEscape = false;
    this.user.closeOnOutsideClick = false;
    this.user.hideCloseButton = true;
    this.user.open();
  }

  initializeParams() {
    this.data.firstname = "";
    this.data.lastname = "";
    this.data.street = "";
    this.data.zipcode = "";
    this.data.place = "";
    this.data.telephone = "";
    this.data.mobile = "";
    this.data.birthday = "";
    this.data.incompanysince = "";
    this.data.superadmin = localStorage.getItem("superadmin");
    this.data.active = 0;
  }

  createUser(form) {
    console.log(this.data);
    this.data.birthday = this.data.birthday.toString();
    this.data.incompanysince = this.data.incompanysince.toString();
    this.service.createUser(this.data, (val) => {
      if (val.success) {
        console.log(val);
        this.gridData.data.push(this.data);
        this.gridView.data.push(this.data);
        this.user.close();
        Swal.fire({
          title: "Successfull!",
          text: "New user is successfull added!",
          timer: 3000,
          type: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "New user is not added!",
          timer: 3000,
          type: "error",
        });
      }
      // form.reset();
    });
  }

  selectionChange(event) {
    this.selectedUserType = event;
    if (event === "Employee") {
      this.data.type = "3";
    } else if (event === "Manager") {
      this.data.type = "2";
    } else if (event === "Admin") {
      this.data.type = "1";
    } else if (event === "Read only scheduler") {
      this.data.type = "6";
    } else {
      this.data.type = event;
    }
  }

  selectionChangeStore(event) {
    this.selectedStoreId = event;
    if (event !== undefined) {
      this.data.storeId = event.id;
    } else {
      this.data.storeId = event;
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
    if (this.state.filter.filters.length === 0) {
      this.gridData.total = this.currentLoadData.length;
    }
    this.changeTheme(this.theme);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.loadProducts();

    this.savePage[this.currentUrl] = event.skip;
    this.savePage[this.currentUrl + 'Take'] = event.take;
    this.helpService.setGridPageSize(this.savePage);
  }

  loadProducts(): void {
    this.gridView = process(this.gridData.data, this.state);
  }

  public close(component) {
    this[component + "Opened"] = false;
  }

  hideShowPassword() {
    if (this.hideShow === "password") {
      this.hideShow = "text";
      this.hideShowEye = "fa-eye";
    } else {
      this.hideShow = "password";
      this.hideShowEye = "fa-eye-slash";
    }
  }

  serializeUrl(root, queryParams) {
    const three = new UrlTree();
    three.root = root;
    three.queryParams = queryParams;
    console.log(three);
  }

  /*routing(id) {
    // this.router.navigate(['user-details'], {queryParams: id});
    const tree = new UrlTree();
    const url = new UrlSegment("/dashboard/user-details", id);
    tree.root = new UrlSegmentGroup([url], null);
    console.log(tree);
    return tree;
    console.log(this.url.serialize(tree));
  }*/

  excelAction(event) {
    console.log(event);
    if (event === "yes") {
      this.excelOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe((data) => {
          if (data) {
            Swal.fire({
              title: "Successfull!",
              text: "New users is successfull added",
              timer: 3000,
              type: "success",
            });
            this.getUser();
          }
        });
      }, 50);
    } else {
      this.excelOpened = false;
      this.getUser();
    }
  }

  onFileChange(args) {
    /* const self = this;
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
       });*/

    this.excelOpened = true;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet, { raw: false }));
      setTimeout(() => {
        if (XLSX.utils.sheet_to_json(worksheet, { raw: true }).length > 0) {
          this.gridData = this.xlsxToJson(
            XLSX.utils.sheet_to_json(worksheet, { raw: true })
          );
          this.fileValue = null;
          this.gridView = this.gridData;
        }
      }, 50);
    };
    fileReader.readAsArrayBuffer(args.target.files[0]);
  }

  exportPDF(value: boolean): void {
    this.allPages = value;

    setTimeout(() => {
      this.grid.saveAsPDF();
    }, 0);
  }

  exportToExcel(grid: GridComponent, allPages: boolean) {
    this.setDataForExcelExport(allPages);

    setTimeout(() => {
      grid.saveAsExcel();
    }, 0);
  }

  public setDataForExcelExport(allPages: boolean): void {
    console.log('allPages ', allPages);

    if (allPages) {
      var myState: State = {
        skip: 0,
        take: this.gridData.total,
      };

      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, myState).data,
      }
    } else {
      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, this.state).data,
      }
    }
  }

  public allData(): ExcelExportData {
    return this._allData;
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
      table: "users",
      columns: columns,
      data: dataArray,
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

        items = document.querySelectorAll(".k-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("gridHeader-" + element);

            clas.add("gridHeader-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-numbers");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-numbers-" + element);
            clas.add("k-pager-numbers-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-select");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-select-" + element);
            clas.add("k-select-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-grid-table");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-table-" + element);
            clas.add("k-grid-table-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-grid-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-header-" + element);
            clas.add("k-grid-header-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-wrap");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-wrap-" + element);
            clas.add("k-pager-wrap-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-button");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("inputTheme-" + element);
            clas.add("inputTheme-" + this.theme);
          }
        }
      }
    }, 50);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.helpService.getHeightForGrid();
  }

  public onFilter(inputValue: string): void {
    this.searchFilter = inputValue;
    this.state.skip = 0;
    this.gridData = process(this.currentLoadData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "shortname",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "email",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "firstname",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "lastname",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "street",
            operator: "contains",
            value: inputValue,
          },
        ],
      },
    });
    this.gridView = process(this.gridData.data, this.state);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.gridView = process(this.gridData.data, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData.data, this.state);
  }

  public generateLink(link, param) {
    this.router.navigate([link, param]);
  }

  public isHidden(columnName: string): boolean {
    return this.hiddenColumns.indexOf(columnName) > -1;
  }

  public onOutputHiddenColumns(columns) {
    this.hiddenColumns = columns;
  }
}

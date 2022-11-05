import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { VaucherModel } from "src/app/models/vaucher-model";
import {
  process,
  State,
  GroupDescriptor,
  SortDescriptor,
} from "@progress/kendo-data-query";
import {
  RowArgs,
  DataStateChangeEvent,
  PageChangeEvent,
  GridComponent,
} from "@progress/kendo-angular-grid";
import { VaucherService } from "src/app/service/vaucher.service";
import Swal from "sweetalert2";
import { UploadEvent } from "@progress/kendo-angular-upload";
import { MessageService } from "../../../service/message.service";
import * as XLSX from "ts-xlsx";
import { CustomersService } from "src/app/service/customers.service";
import { UsersService } from "src/app/service/users.service";
import { HelpService } from "src/app/service/help.service";
import { Modal } from "ngx-modal";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { Router } from "@angular/router";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { SendSmsService } from "src/app/service/send-sms.service";
import { checkIfInputValid } from "../../../shared/utils";
import { PDFService } from "./../../../service/pdf.service";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
import { StoreService } from "src/app/service/store.service";
import { AccountService } from "src/app/service/account.service";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-vaucher",
  templateUrl: "./vaucher.component.html",
  styleUrls: ["./vaucher.component.scss"],
})
export class VaucherComponent implements OnInit {
  @ViewChild("vaucher") vaucher: Modal;
  @ViewChild("grid") grid;

  public allPages: boolean;
  private _allData: ExcelExportData;
  toSendEmail: boolean = false;
  toSendSms: boolean = false;

  public data = new VaucherModel();
  public unamePattern = "^[a-z0-9_-]{8,15}$";
  public emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
  public userType = ["Employee", "Manager", "Admin"];
  public gridData: any;
  public gridView: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
  };
  public storeLocation: any;
  public language: any;
  public selectedUser: any;
  public imagePath = "defaultUser";
  public loading = true;
  // public uploadSaveUrl = 'http://localhost:3000/api/uploadImage'; // should represent an actual API endpoint
  public uploadSaveUrl = "http://116.203.85.82:8080/uploadImage";
  public uploadRemoveUrl = "removeUrl"; // should represent an actual API endpoint
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
  public customerBuysUsers = [];
  public customerConsumersUsers = [];
  public customerUserBuys: any;
  public customerUserConsumer: any;
  public dialog = false;
  public dateConst: any;
  public dateredeemedConst: any;
  public id: number;
  public users: any;
  public user: any;
  public height: any;
  public searchFilter: any;
  public customerBuysLoading = false;
  public customerConsumersLoading = false;
  public pageSize = 5;
  public pageable = {
    pageSizes: true,
    previousNext: true,
  };
  showDialog: boolean = false;
  isFormDirty: boolean = false;
  savePage: any = {};
  currentUrl: string;
  checkIfInputValid = checkIfInputValid;
  selectedVaucher: any;
  selectedClinic: any;
  vaucherUser: any = 0;
  canExportPdf: boolean = false;

  public showColumnPicker = false;
  public columns: string[] = [
    "ID",
    "Date",
    "Amount",
    "Date redeemed",
    "Customer buys",
    "Customer consumer",
    "User",
    "Comment",
  ];
  public hiddenColumns: string[] = [];

  constructor(
    private service: VaucherService,
    private customer: CustomersService,
    private message: MessageService,
    private userService: UsersService,
    private helpService: HelpService,
    private router: Router,
    private packLanguage: PackLanguageService,
    private sendSMS: SendSmsService,
    private pdfService: PDFService,
    private accountService: AccountService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.id = Number(localStorage.getItem("idUser"));
    this.getVauchers();
    this.getUsers();
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.vaucher);

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }

    /*this.message.getDeleteVaucher().subscribe(mess => {
      this.getVauchers();
      this.selectedUser = undefined;
    });

    this.message.getBackToVaucherGrid().subscribe(mess => {
      this.selectedUser = undefined;
      this.changeTheme(this.theme);
    });*/

    this.message.getTheme().subscribe((mess) => {
      this.changeTheme(mess);
      this.theme = mess;
    });

    this.currentUrl = this.router.url;

    this.setPagination();

    this.vaucher.closeOnEscape = false;
    this.vaucher.closeOnOutsideClick = false;
    this.vaucher.hideCloseButton = true;
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

  getClinic(superadminId: any) {
    this.accountService.getSuperadmin(superadminId).subscribe((res) => {
      this.selectedClinic = res[0];
    });
  }

  getUser(userId: number) {
    this.accountService.getCustomerWithId(userId).subscribe((res) => {
      if(res[0]) {
        this.vaucherUser = res[0];
      }
    });
  }

  getVauchers() {
    this["loadingGridVaucher"] = true;
    this.service
      .getVauchers(this.helpService.getSuperadmin())
      .subscribe((data: []) => {
        if (data !== null) {
          this.currentLoadData = data.sort(function (a, b) {
            return b["id"] - a["id"];
          });
          if (this.currentLoadData.length < this.state.skip) {
            console.log("?");
            this.state.skip = 0;
          }
          this.gridData = {
            data: data,
          };
          this._allData = <ExcelExportData>{
            data: process(this.currentLoadData, this.state).data,
          };
          this.gridView = process(data, this.state);
          this["loadingGridVaucher"] = false;
        } else {
          this.gridData = [];
          this.gridView = this.gridData;
          this.loading = false;
          this["loadingGridVaucher"] = false;
        }
        this.loading = false;
        this.changeTheme(this.theme);
      });
  }

  receiveConfirm(event: boolean): void {
    if (event) {
      this.vaucher.close();
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }

  confirmClose(): void {
    this.vaucher.modalRoot.nativeElement.focus();
    if (this.isFormDirty) {
      this.showDialog = true;
    } else {
      this.vaucher.close();
      this.showDialog = false;
      this.isFormDirty = false;
    }
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  newVaucher() {
    this.canExportPdf = false;
    this.operationMode = "add";
    this.initializeParams();
    this.getNextVaucherId();
    this.changeTheme(this.theme);
    this.vaucher.open();
  }

  initializeParams() {
    this.data = {
      date: new Date().toString(),
      amount: null,
      date_redeemed: "",
      customer: null,
      customer_name: "",
      user: null,
      user_name: "",
      comment: "",
    };
    this.dateConst = new Date();
    this.dateredeemedConst = "";
    this.customerUserBuys = null;
    this.customerUserConsumer = null;
    this.user = null;
    // this.selectedUser = null;
  }

  getNextVaucherId() {
    this.service.getNextVaucherId().subscribe((data) => {
      this.data.id = data.toString();
    });
  }

  sendVaucherSmsData(vaucherData: any) {
    this.userService.getUserWithIdPromise(this.data.user).then((dataSms) => {
      dataSms[0]["countryCode"] = this.helpService.getCountryCode();
      dataSms[0][
        "message"
      ] = `${this.language.introductoryMessageForCreatedVaucher} \n \n${this.language.amount}: ${vaucherData.amount} \n \n${this.language.date_redeemed}: ${vaucherData.date_redeemed} \n \n${this.language.comment}: ${vaucherData.comment} \n \n${this.language.customerBuys}: ${vaucherData.customer_name} \n \n${this.language.customerConsumer}: ${vaucherData.customer_consumer_name}`;

      this.sendSMS.sendVaucherSMS(dataSms[0]).subscribe();
    });
  }

  createVaucher(form) {
    this.data.superadmin = localStorage.getItem("idUser");
    if (this.customerUserBuys !== null) {
      this.data.customer = this.customerUserBuys.id;
      this.data.customer_name =
        this.customerUserBuys.firstname + " " + this.customerUserBuys.lastname;
    }
    if (this.customerUserConsumer !== null) {
      this.data.customer_consumer = this.customerUserConsumer.id;
      this.data.customer_consumer_name =
        this.customerUserConsumer.firstname +
        " " +
        this.customerUserConsumer.lastname;
    }
    if (this.user !== null) {
      this.data.user = this.user.id;
      this.data.user_name = this.user.shortname;
    }
    this.data.date = this.dateConst.toString();
    this.data.date_redeemed = this.dateredeemedConst.toString();
    this.data["language"] = this.packLanguage.getLanguageForMailingVaucher();
    this.data["toSendEmail"] = this.toSendEmail;

    if (this.toSendSms) {
      this.sendVaucherSmsData(this.data);
    }

    this.service.createVaucher(this.data).subscribe((data) => {
      if (data["success"]) {
        this.data.id = data["id"];
        /*this.gridData = {
          data: this.currentLoadData.slice(
            this.currentLoadData.length - this.state.take,
            this.state.skip + this.state.take
          ),
          total: this.currentLoadData.length
        };*/
        this.currentLoadData.push(this.data);
        this.vaucher.close();
        this.getVauchers();
        // form.reset();
        Swal.fire({
          title: "Successfull!",
          text: "New vaucher is successfull added!",
          timer: 3000,
          type: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "New vaucher is not added!",
          timer: 3000,
          type: "error",
        });
      }
    });
  }

  deleteVaucher(event) {
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteVaucher(this.data.id).subscribe((data) => {
        console.log(data);
        if (data) {
          this.getVauchers();
        }
      });
    }
    this.dialog = false;
  }

  editForm(data) {
    this.canExportPdf = true;
    this.changeTheme(this.theme);
    this.data = data;
    console.log(data);
    this.convertValue(data);
    this.operationMode = "edit";
    this.vaucher.open();
    this.selectedVaucher = data;
    this.getClinic(this.selectedVaucher.superadmin);
    this.getUser(this.selectedVaucher.customer);
  }

  editVaucher(store) {
    console.log(this.customerUserBuys);
    if (this.customerUserBuys !== null && this.customerUserBuys !== undefined) {
      this.data.customer = this.customerUserBuys.id;
      this.data.customer_name =
        this.customerUserBuys.firstname + " " + this.customerUserBuys.lastname;
    }
    if (
      this.customerUserConsumer !== null &&
      this.customerUserConsumer !== undefined
    ) {
      this.data.customer_consumer = this.customerUserConsumer.id;
      this.data.customer_consumer_name =
        this.customerUserConsumer.firstname +
        " " +
        this.customerUserConsumer.lastname;
    }
    this.data.date = this.dateConst.toString();
    this.data.date_redeemed = this.dateredeemedConst.toString();
    this.data["language"] = this.packLanguage.getLanguageForMailingVaucher();
    this.data["toSendEmail"] = this.toSendEmail;
    this.data["toSendSms"] = this.toSendSms;

    this.service.editVaucher(this.data).subscribe((data) => {
      console.log(data);
      if (data) {
        this.getVauchers();
        Swal.fire({
          title: "Successfull update",
          text: "Store data is successfull update!",
          timer: 3000,
          type: "success",
        });
        this.vaucher.close();
      } else {
        Swal.fire({
          title: "Error update",
          text: "Store data is not successfull update!",
          timer: 3000,
          type: "error",
        });
      }
    });
  }

  convertValue(data) {
    this.dateConst = new Date(data.date);
    if (data.date_redeemed !== "") {
      this.dateredeemedConst = new Date(data.date_redeemed);
    } else {
      this.dateredeemedConst = "";
    }
    this.data.amount = Number(data.amount);
    this.customer.getInfoCustomer(data.customer).subscribe((data) => {
      if (data !== null) {
        this.customerBuysUsers.push(data[0]);
        this.customerUserBuys = data[0];
      }
    });
    this.customer.getInfoCustomer(data.customer_consumer).subscribe((data) => {
      if (data !== null) {
        this.customerConsumersUsers.push(data[0]);
        this.customerUserConsumer = data[0];
      }
    });
    this.user = this.getSelectedUser(data.user);
  }

  downloadPDF(): void {
    const docDefinition = this.setupPDF();

    pdfMake.createPdf(docDefinition).download();
  }

  printPDF(): void {
    const docDefinition = this.setupPDF();

    pdfMake.createPdf(docDefinition).print();
  }

  setupPDF() {
    let docDefinition = this.pdfService.createVaucherPDF(
      this.language,
      this.selectedVaucher,
      this.selectedClinic,
      this.vaucherUser
    );
    return docDefinition;
  }

  getSelectedUser(id) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == id) {
        return this.users[i];
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
    this.changeTheme(this.theme);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.loadProducts();

    this.savePage[this.currentUrl] = event.skip;
    this.savePage[this.currentUrl + "Take"] = event.take;
    this.helpService.setGridPageSize(this.savePage);
  }

  loadProducts(): void {
    this.gridView = process(this.gridData.data, this.state);
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
    if (event === "yes") {
      this.vaucherDialogOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe((data) => {
          if (data) {
            Swal.fire({
              title: "Successfull!",
              text: "New vaucher is successfull added",
              timer: 3000,
              type: "success",
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
        }
      );
    }*/

    this.vaucherDialogOpened = true;
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
    console.log("allPages ", allPages);

    if (allPages) {
      var myState: State = {
        skip: 0,
        take: this.gridData.total,
      };

      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, myState).data,
      };
    } else {
      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, this.state).data,
      };
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
      table: "vaucher",
      columns: columns,
      data: dataArray,
    };
    return allData;
  }

  closeVaucher() {
    this.vaucher.close();
  }

  getTranslate(title: string) {
    if (title === "add") {
      return this.language.addVaucher;
    } else if (title === "edit") {
      return this.language.updateVaucher;
    }
  }

  getUsers() {
    this.userService.getUsers(localStorage.getItem("superadmin"), (val) => {
      console.log(val);
      this.users = val;
      this.loading = false;
    });
  }

  open(component, id) {
    this.dialog = true;
    this.data.id = id;
    this.changeTheme(this.theme);
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
    console.log(window.innerHeight);
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
            field: "amount",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "customer_name",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "customer_consumer_name",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "user_name",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "comment",
            operator: "contains",
            value: inputValue,
          },
        ],
      },
    });
    this.gridView = process(this.gridData.data, this.state);
  }

  searchCustomerBuys(event) {
    console.log(event);
    if (event !== "" && event.length > 2) {
      this.customerBuysLoading = true;
      const searchFilter = {
        superadmin: localStorage.getItem("superadmin"),
        filter: event,
      };
      this.customer.searchCustomer(searchFilter).subscribe((val: []) => {
        console.log(val);
        this.customerBuysUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerBuysLoading = false;
      });
    } else {
      this.customerBuysUsers = [];
    }
  }

  searchCustomerConsumers(event) {
    console.log(event);
    if (event !== "" && event.length > 2) {
      this.customerConsumersLoading = true;
      const searchFilter = {
        superadmin: localStorage.getItem("superadmin"),
        filter: event,
      };
      this.customer.searchCustomer(searchFilter).subscribe((val: []) => {
        console.log(val);
        this.customerConsumersUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerConsumersLoading = false;
      });
    } else {
      this.customerConsumersUsers = [];
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.gridView = process(this.gridData.data, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData.data, this.state);
  }

  public isHidden(columnName: string): boolean {
    return this.hiddenColumns.indexOf(columnName) > -1;
  }

  public onOutputHiddenColumns(columns) {
    this.hiddenColumns = columns;
  }
}

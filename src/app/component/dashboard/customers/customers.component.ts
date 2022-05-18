import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { Modal } from "ngx-modal";
import { CustomersService } from "../../../service/customers.service";
import { StoreService } from "../../../service/store.service";
import {
  process,
  State,
  GroupDescriptor,
  SortDescriptor,
} from "@progress/kendo-data-query";
import { UploadEvent, SelectEvent } from "@progress/kendo-angular-upload";
import {
  DataStateChangeEvent,
  PageChangeEvent,
  RowArgs,
  DataBindingDirective,
} from "@progress/kendo-angular-grid";
import { MessageService } from "../../../service/message.service";
import { CustomerModel } from "../../../models/customer-model";
import Swal from "sweetalert2";
// import * as GC from "@grapecity/spread-sheets";
// import * as Excel from "@grapecity/spread-excelio";
import { WindowModule } from "@progress/kendo-angular-dialog";
import * as XLSX from "ts-xlsx";
import { HelpService } from "src/app/service/help.service";
import { MailService } from "src/app/service/mail.service";
import { PackLanguageService } from "src/app/service/pack-language.service";

const newLocal = "data";
@Component({
  selector: "app-customers",
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.scss"],
})
export class CustomersComponent implements OnInit {
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild('customer') customer: Modal;
  @ViewChild('patientFormRegistrationDialog') patientFormRegistrationDialog: Modal;
  public data = new CustomerModel();
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
  public groups: GroupDescriptor[] = [];
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
  public customerDialogOpened = false;
  public fileValue: any;
  public theme: string;
  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  private arrayBuffer: any;
  public height: any;
  public searchFilter: any;
  public pageSize = 5;
  public pageable = {
    pageSizes: true,
    previousNext: true,
  };
  public patientMail: string;

  constructor(
    private service: CustomersService,
    private storeService: StoreService,
    private message: MessageService,
    private helpService: HelpService,
    private mailService: MailService,
    private packLanguage: PackLanguageService
  ) {
    // this.excelIO = new Excel.IO();
  }

  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.data.gender = "male";
    this.getCustomers();

    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }

    this.message.getDeleteCustomer().subscribe((mess) => {
      this.getCustomers();
      this.selectedUser = undefined;
    });

    this.message.getBackToCustomerGrid().subscribe((mess) => {
      this.selectedUser = undefined;
      this.changeTheme(this.theme);
    });

    this.message.getTheme().subscribe((mess) => {
      this.changeTheme(mess);
      this.theme = mess;
    });
    this.helpService.setTitleForBrowserTab(this.language.customer);
  }

  getCustomers() {
    this.service.getCustomers(localStorage.getItem("superadmin"), (val) => {
      console.log(val);
      if (val !== null) {
        this.currentLoadData = val;
        this.gridData = {
          data: val,
        };
        this.gridView = process(val, this.state);
        this.loading = false;
      } else {
        this.gridData[newLocal] = [];
        this.gridView = this.gridData;
        this.loading = false;
      }
      this.changeTheme(this.theme);
    });
  }

  newUser() {
    this.storeService.getStore(localStorage.getItem("idUser"), (val) => {
      console.log(val);
      this.storeLocation = val;
    });
    this.initializeParams();
    this.changeTheme(this.theme);
    this.customer.open();
  }

  initializeParams() {
    this.data = {
      firstname: "",
      lastname: "",
      gender: "",
      street: "",
      streetnumber: "",
      city: "",
      telephone: "",
      mobile: "",
      birthday: "",
      storeId: "",
      attention: "",
      physicalComplaint: "",
      isConfirm: false,
      language: null
    };
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem("superadmin");
    this.service.createCustomer(this.data, (val) => {
      if (val.success) {
        this.data.id = val.id;
        /*this.gridData = {
          data: this.currentLoadData.slice(
            this.currentLoadData.length - this.state.take,
            this.state.skip + this.state.take
          ),
          total: this.currentLoadData.length
        };*/
        this.getCustomers();
        this.currentLoadData.push(this.data);
        this.customer.close();
        // form.reset();
        Swal.fire({
          title: "Successfull!",
          text: "New customer is successfull added!",
          timer: 3000,
          type: "success",
        });
        this.data.password = val.password;
        this.data.language = this.packLanguage.getLanguageForCreatedPatientAccount();
        this.mailService
          .sendInfoToPatientForCreatedAccount(this.data)
          .subscribe((data) => {
            console.log(data);
          });
      } else {
        Swal.fire({
          title: "Error",
          text: "New customer is not added!",
          timer: 3000,
          type: "error",
        });
      }
    });
  }

  onChange(event) {
    this.data.birthday = event;
  }

  selectionChange(event) {
    console.log(event);
  }

  selectionChangeStore(event) {
    console.log(event);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridView = process(this.currentLoadData, this.state);
    if (this.state.filter !== null && this.state.filter.filters.length === 0) {
      this.gridView.total = this.currentLoadData.length;
    }
    this.changeTheme(this.theme);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.loadProducts();
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
      this.customerDialogOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe((data) => {
          if (data) {
            Swal.fire({
              title: "Successfull!",
              text: "New customer is successfull added",
              timer: 3000,
              type: "success",
            });
            this.getCustomers();
          }
        });
      }, 50);
    } else {
      this.customerDialogOpened = false;
      this.getCustomers();
    }
  }

  onFileChange(args) {
    /*console.log(args);
    const self = this;
    const file =
      args.srcElement && args.srcElement.files && args.srcElement.files[0];
    this.customerDialogOpened = true;
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

    this.customerDialogOpened = true;
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
      table: "customers",
      columns: columns,
      data: dataArray,
    };
    return allData;
  }

  closeCustomer() {
    this.customer.close();
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
            field: "gender",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "street",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "streetnumber",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "city",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "telephone",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "mobile",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "email",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "attention",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "physicalComplaint",
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

  copyPatientLinkToClipboard() {
    this.helpService.copyToClipboard(
      this.helpService.getLinkForPatientFormRegistration()
    );
    this.helpService.successToastr(this.language.successCopiedFormLink, "");
  }

  openPatientFormRegistrationDialog() {
    this.patientFormRegistrationDialog.open();
  }

  sendPatientFormLinkToMail() {
    const data = {
      email: this.patientMail,
      link: this.helpService.getLinkForPatientFormRegistration(),
      language: this.packLanguage.getLanguageForPatientRegistrationForm()
    };
    this.patientFormRegistrationDialog.close();
    this.mailService.sendPatientFormRegistration(data).subscribe((data) => {
      console.log(data);
      if(data) {
        this.helpService.successToastr(this.language.successSendFormToMail, "");
      } else {
        this.helpService.errorToastr(this.language.errorSendFormToMail, "");
      }
    });
  }
}

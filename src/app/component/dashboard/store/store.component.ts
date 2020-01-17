import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { Modal } from "ngx-modal";
import { StoreService } from "../../../service/store.service";
import { process, State } from "@progress/kendo-data-query";
import {
  DataStateChangeEvent,
  PageChangeEvent,
  RowArgs
} from "@progress/kendo-angular-grid";
import { StoreModel } from "src/app/models/store-model";
import Swal from "sweetalert2";
// import * as GC from '@grapecity/spread-sheets';
// import * as Excel from '@grapecity/spread-excelio';
import * as XLSX from "ts-xlsx";
import { MessageService } from 'src/app/service/message.service';
import ProgressBar from '@badrap/bar-of-progress';

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"]
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
  // private spread: GC.Spread.Sheets.Workbook;
  // private excelIO;
  public excelOpened = false;
  public fileValue: any;
  public theme: string;
  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  private arrayBuffer: any;
  public loadingGrid = false;
  public progress = new ProgressBar(
    {
      size: 4,
      color: "#29e",
      className: "bar-of-progress",
      delay: 80
    }
  );
  public height: any;

  constructor(public service: StoreService, public message: MessageService) {
    // this.excelIO = new Excel.IO();
  }

  ngOnInit() {
    this.height = window.innerHeight - 191;
    this.height += 'px'; 
    this.idUser = localStorage.getItem("superadmin");
    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }
    this.language = JSON.parse(localStorage.getItem("language"))["store"];
    this.getStore();

    this.message.getTheme().subscribe(mess => {
      // this.changeTheme(mess);
      this.theme = mess;
    });
  }

  getStore() {
    this.progress.start();
    this.service.getStore(this.idUser, val => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      // this.changeTheme(this.theme);
       this.progress.finish();
    });
  }

  newStore() {
    this.initialParams();
    // this.changeTheme(this.theme);
    this.store = true;
  }

  initialParams() {
    this.data = {
      storename: "",
      street: "",
      zipcode: "",
      place: "",
      telephone: "",
      mobile: "",
      comment: "",
      start_work: "",
      end_work: "",
      time_duration: "",
      superadmin: this.idUser
    };
  }

  createStore(form) {
    this.data.start_work = this.start_work.toString();
    this.data.end_work = this.end_work.toString();
    this.service.createStore(this.data, val => {
      if (val.success) {
        console.log(val);
        this.data.id = val.id;
        this.currentLoadData.push(this.data);
        this.gridData.total = this.currentLoadData.length;
        this.getStore();
        this.store = false;
        Swal.fire({
          title: this.language.successful,
          text: this.language[val.info],
          timer: 3000,
          type: "success"
        });
      } else {
        this.store = false;
        Swal.fire({
          title: this.language.error,
          text: this.language[val.info],
          timer: 3000,
          type: "error"
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
          title: "Successfull update",
          text: "Store data is successfull update!",
          timer: 3000,
          type: "success"
        });
        this.storeEdit = false;
      } else {
        Swal.fire({
          title: "Error update",
          text: "Store data is not successfull update!",
          timer: 3000,
          type: "error"
        });
      }
    });
  }

  deleteStore(store) {}

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
    if (
      this.state.filter !== undefined &&
      this.state.filter.filters.length === 0
    ) {
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
    // this.changeTheme(this.theme);
  }

  storeEditClose() {
    this.storeEdit = false;
  }

  public close(component) {
    this[component + "Opened"] = false;
  }

  open(component, id) {
    this[component + "Opened"] = true;
    this.data.id = id;
    // this.changeTheme(this.theme);
  }

  action(event) {
    console.log(event);
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteStore(this.data.id).subscribe(data => {
        console.log(data);
        if (data) {
          this.state = {
            skip: 0,
            take: 10
          };
          Swal.fire({
            title: "Successfull!",
            text: "Successfull delete store",
            timer: 3000,
            type: "success"
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
    if (event === "yes") {
      this.excelOpened = false;
      setTimeout(() => {
        this.service.insertMultiData(this.gridData).subscribe(data => {
          if (data) {
            Swal.fire({
              title: "Successfull!",
              text: "New stores is successfull added",
              timer: 3000,
              type: "success"
            });
            this.getStore();
          }
        });
      }, 50);
    } else {
      this.excelOpened = false;
      this.getStore();
    }
  }

  onFileChange(args) {
    /*const self = this;
    const file = args.srcElement && args.srcElement.files && args.srcElement.files[0];
    this.excelOpened = true;
    if (file) {
      self.excelIO.open(file, (json) => {
        console.log(json);
        this.gridData = null;
        setTimeout(() => {
          this.gridData = this.xlsxToJson(json);
          args = null;
          this.excelOpened = false;
        }, 50);
      }, (error) => {
        alert('load fail');
      });
    }*/

    this.excelOpened = true;
    let fileReader = new FileReader();
    fileReader.onload = e => {
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
    // columns.push('superadmin');
    for (let i = 0; i < rowCount; i++) {
      const object = {};
      for (let j = 0; j < columnCount; j++) {
        console.log(data[i][columns[j]]);
        object[columns[j]] = data[i][columns[j]];
      }
      object["superadmin"] = localStorage.getItem("superadmin");
      objectArray.push(object);
      dataArray.push(objectArray[i]);
    }
    const allData = {
      table: "store",
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(window.innerHeight);
    this.height = window.innerHeight - 191;
    this.height += 'px';
  }
}

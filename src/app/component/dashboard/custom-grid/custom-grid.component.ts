import {
  Component,
  OnInit,
  HostListener,
  Input,
  ViewChild,
} from "@angular/core";
import {
  process,
  State,
  GroupDescriptor,
  SortDescriptor,
} from "@progress/kendo-data-query";
import { UploadEvent } from "@progress/kendo-angular-upload";
import {
  DataStateChangeEvent,
  GridComponent,
  PageChangeEvent,
} from "@progress/kendo-angular-grid";
import * as XLSX from "ts-xlsx";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { CustomGridService } from "src/app/service/custom-grid.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-custom-grid",
  templateUrl: "./custom-grid.component.html",
  styleUrls: ["./custom-grid.component.scss"],
})
export class CustomGridComponent implements OnInit {
  @Input() data: any;
  @Input() gridConfiguration: any;
  @ViewChild('grid') grid;

  public allPages: boolean;
  private _allData: ExcelExportData;

  public currentLoadData: any;
  public height: any;
  public language: any;
  public theme: string;
  public salutationItem: any;
  public gridView: any;
  public relationshipItem: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
  };
  public pageSize = 5;
  public customerDialogOpened = false;
  private arrayBuffer: any;
  public gridData: any;
  public fileValue: any;
  public customer = false;
  public id: any;
  public searchFilter: any;
  public method: any;
  public index: number;
  public dialogDelete = false;

  constructor(
    private router: Router,
    private service: CustomGridService,
    private helpService: HelpService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    console.log(this.data);
    this.currentLoadData = this.data;
    this.height = this.helpService.getHeightForGrid();

    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }

    this.initialize();
    this.getLanguageItems();
  }

  getLanguageItems() {
    if (this.language.fieldSalutationItem !== undefined) {
      this.salutationItem = this.language.fieldSalutationItem;
    } else {
      this.salutationItem = [];
    }

    if (this.language.fieldRelationshipStatusItem !== undefined) {
      this.relationshipItem = this.language.fieldRelationshipStatusItem;
    } else {
      this.relationshipItem = [];
    }
  }

  initialize() {
    this.gridView = process(this.currentLoadData, this.state);
    this._allData = <ExcelExportData>{
      data: process(this.currentLoadData, this.state).data,
    }
    this.gridData = {
      data: this.data
    }
  }

  selectionChange(event) {
    console.log(event);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridView = process(this.currentLoadData, this.state);
    if (this.state.filter !== null && this.state.filter.filters.length === 0) {
      this.gridView.total = this.currentLoadData.length;
    }
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.loadProducts();
  }

  loadProducts(): void {
    this.gridView = process(this.data, this.state);
  }

  uploadEventHandler(e: UploadEvent) {
    console.log(e);
  }

  action(event) { }

  onFileChange(args) {
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
      table: "customers",
      columns: columns,
      data: dataArray,
    };
    return allData;
  }

  closeCustomer() {
    this.customer = false;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.helpService.getHeightForGrid();
  }

  public onFilter(inputValue: string): void {
    this.searchFilter = inputValue;
    this.state.skip = 0;
    let filterItemList = this.makeFilterItems(inputValue);
    console.log(filterItemList);
    this.gridData = process(this.currentLoadData, {
      filter: {
        logic: "or",
        filters: filterItemList,
      },
    });
    this.gridView = process(this.gridData.data, this.state);
  }

  public makeFilterItems(inputValue) {
    let filterItemsList = [];
    for (let i = 0; i < this.gridConfiguration.columns.length; i++) {
      if (
        this.gridConfiguration.columns[i].field !== undefined &&
        this.gridConfiguration.columns[i].field !== "active"
      ) {
        const filterItem = {
          field: this.gridConfiguration.columns[i].field,
          operator: "contains",
          value: inputValue,
        };
        filterItemsList.push(filterItem);
      }
    }
    return filterItemsList;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.gridView = process(this.data, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.data, this.state);
  }

  public generateLink(link, param) {
    this.router.navigate([link, param]);
  }

  public openDialogDelete(id, method, index) {
    this.id = id;
    this.method = method;
    this.index = index;
    this.dialogDelete = true;
  }

  public dialogDeleteAction(answer) {
    if (answer === "yes") {
      this.service[this.method](this.id).subscribe((data) => {
        console.log(data);
        if (data) {
          console.log(this.index);
          this.gridView.data.splice(this.index - this.state.take, 1);
          this.gridView.total -= 1;
        }
      });
    }
    this.dialogDelete = false;
  }
}

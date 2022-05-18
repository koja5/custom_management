import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import {
  process,
  State,
  GroupDescriptor,
  SortDescriptor,
} from "@progress/kendo-data-query";
import { WorkTimeColorsService } from "../../../../service/work-time-colors.service";
import { WorkTimeModel } from "src/app/models/work-time-model";
import { ServiceHelperService } from "src/app/service/service-helper.service";
import { ToastrService } from "ngx-toastr";
import { GradientSettings } from "@progress/kendo-angular-inputs";
import { Modal } from "ngx-modal";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-event-category",
  templateUrl: "./work-time-colors.component.html",
  styleUrls: ["./work-time-colors.component.scss"],
})
export class WorkTimeColorsComponent implements OnInit {
  @ViewChild("workTimeColorsModal") workTimeColorsModal: Modal;
  public height: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc",
      },
    ],
  };
  public searchFilter: any;
  public pageSize = 5;
  public pageable = {
    pageSizes: true,
    previousNext: true,
  };
  public currentLoadData: any;
  public data = new WorkTimeModel();
  public gridData: any;
  public gridView: any;
  public language: any;
  public deleteModal = false;
  public operationMode = "add";
  public loading = true;
  public settings: GradientSettings = {
    opacity: false,
  };
  public importExcel = false;
  public fileValue: any;
  public theme: string;

  constructor(
    private service: WorkTimeColorsService,
    private serviceHelper: ServiceHelperService,
    private toastr: ToastrService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.language = JSON.parse(localStorage.getItem("language"));

    this.getWorkTimeColors();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.helpService.getHeightForGrid();
  }

  getWorkTimeColors() {
    this.service
      .getWorkTimeColors(localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        this.currentLoadData = data;
        this.gridView = process(data, this.state);
        this.loading = false;
      });
  }

  public onFilter(inputValue: string): void {
    this.searchFilter = inputValue;
    this.state.skip = 0;
    this.gridData = process(this.currentLoadData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "sequence",
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
    this.gridView = process(this.currentLoadData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.currentLoadData, this.state);
  }

  addNewModal() {
    this.workTimeColorsModal.open();
    this.data = new WorkTimeModel();
    this.operationMode = "add";
    this.data.color = "rgb(102, 115, 252)";
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.gridView = process(this.currentLoadData, this.state);
  }

  getTranslate(operationMode) {
    return this.serviceHelper.getTranslate(operationMode, this.language);
  }

  createWorkTimeColors(event) {
    this.data.superadmin = localStorage.getItem("superadmin");
    this.service.createWorkTimeColors(this.data).subscribe((data) => {
      if (data) {
        this.getWorkTimeColors();
        this.workTimeColorsModal.close();
        /*Swal.fire({
            title: "Successfull!",
            text: "New complaint is successfull added!",
            timer: 3000,
            type: "success"
          });*/
        this.toastr.success(
          this.language.successTitle,
          this.language.successTextAdd,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      } else {
        this.toastr.error(
          this.language.errorTitle,
          this.language.errorTextAdd,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }

  editWorkTimeColors(event) {
    this.data = event;
    this.operationMode = "edit";
    this.workTimeColorsModal.open();
  }

  updateWorkTimeColors(event) {
    this.service.updateWorkTimeColors(this.data).subscribe((data) => {
      if (data) {
        this.getWorkTimeColors();
        this.workTimeColorsModal.close();
        /*Swal.fire({
            title: "Successfull!",
            text: "New complaint is successfull added!",
            timer: 3000,
            type: "success"
          });*/
        this.toastr.success(
          this.language.successTitle,
          this.language.successTextEdit,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      } else {
        this.toastr.error(
          this.language.errorTitle,
          this.language.errorTextEdit,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }

  deleteWorkTimeColors(id) {
    this.data.id = id;
    this.deleteModal = true;
  }

  action(event) {
    console.log(event);
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteWorkTimeColors(this.data.id).subscribe((data) => {
        console.log(data);
        if (data) {
          this.state.skip = 0;
          this.toastr.success(
            this.language.successTitle,
            this.language.successTextDelete,
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
          this.getWorkTimeColors();
        }
        this.deleteModal = false;
      });
    } else {
      this.deleteModal = false;
    }
  }

  onFileChange(args) {
    /*this.customerDialogOpened = true;
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
          this.gridView = this.gridData;
        }
      }, 50);
    };
    fileReader.readAsArrayBuffer(args.target.files[0]);*/
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
}

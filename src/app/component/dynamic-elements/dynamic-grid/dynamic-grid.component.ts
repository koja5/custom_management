import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import {
  DialogEditEventArgs,
  EditSettingsModel,
  SaveEventArgs,
  ToolbarItems,
} from "@syncfusion/ej2-angular-grids";
import { DynamicService } from "src/app/service/dynamic.service";
import { DynamicFormsComponent } from "../dynamic-forms/dynamic-forms.component";
import { FieldConfig } from "../dynamic-forms/models/field-config";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { HelpService } from "src/app/service/help.service";
import { MessageService } from "src/app/service/message.service";
import { QueryCellInfoEventArgs } from "@syncfusion/ej2-angular-grids";
import { Tooltip } from "@syncfusion/ej2-popups";
import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { SystemLogsService } from "src/app/service/system-logs.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-dynamic-grid",
  templateUrl: "./dynamic-grid.component.html",
  styleUrls: ["./dynamic-grid.component.scss"],
})
export class DynamicGridComponent implements OnInit {
  @Input() path: string;
  @Input() name: string;
  @Output() actionEmitter = new EventEmitter<any>();
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  @ViewChild("orderForm") public orderForm: FormGroup;
  @ViewChild("editSettingsTemplate") editSettingsTemplate: DialogComponent;
  public targetElement: HTMLElement;
  @ViewChild("grid") public grid: GridComponent;
  @ViewChild("container") public container: ElementRef;

  public config: any;
  public toolbar: ToolbarItems[];
  public editSettings: EditSettingsModel;
  public data: any;
  public dataForm: any;
  public orderData: IOrderModel;
  public typeOfModification = "add";
  public operations: any;
  public sortSettings = [
    {
      field: "id",
      direction: "Descending",
    },
  ];
  public configField: FieldConfig[];
  public index: number;
  public height: number;
  public language: any;
  savePage: any = {};
  currentUrl: string;
  isFormDirty = false;
  showDialog = false;
  currentDialog: any;

  constructor(
    private service: DynamicService,
    private helpService: HelpService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.savePage = this.helpService.getGridPageSize();
    this.initialization();
    this.checkMessageService();
    this.getConfiguration();
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: "Dialog",
    };
    this.toolbar = ["Add", "Edit", "Delete"];
    this.container.nativeElement.style.height =
      this.helpService.getHeightForGrid();
    this.height = this.helpService.getHeightForGridWithoutPx();
    this.helpService.setDefaultBrowserTabTitle();

    this.currentUrl = this.router.url;
  }

  ngAfterViewInit() {}

  initialization() {
    this.service.getConfiguration(this.path, this.name).subscribe((data) => {
      this.config = data;
      if(this.savePage[this.currentUrl]) {
        this.config.paging.settings.currentPage = this.savePage[this.currentUrl];
      }
      if (data["localData"]) {
        this.getLocalData(data["localData"]);
      } else {
        this.callApi(data["request"]);
      }
    });
  }

  getConfiguration() {
    this.language = this.helpService.getLanguage();
  }

  checkMessageService() {
    this.messageService.getRefreshDynamicGrid().subscribe((data) => {
      this.grid.sortSettings = this.config.sorting.initialSorting;
      (this.grid.dataSource as object[]).splice(this.index, 1);
      setTimeout(() => {
        this.grid.refresh();
      }, 100);
    });
  }

  getLocalData(data) {
    this.service.getLocalData(data["path"]).subscribe((data) => {
      this.data = data;
    });
  }

  callApi(data) {
    setTimeout(() => {
      this.grid.showSpinner();
    }, 20);

    if (data.type === "POST") {
      this.callApiPost(data.api, data.body);
    } else {
      this.callApiGet(data.api, data.parameters);
    }
  }

  callApiPost(api, body) {
    this.service.callApiPost(api, body).subscribe((data) => {
      this.grid.hideSpinner();
    });
  }

  callApiGet(api, parameters) {
    this.service
      .callApiGet(api, this.packParametersConfig(parameters))
      .subscribe((data) => {
        this.data = data;
        this.grid.hideSpinner();
      });
  }

  packParametersConfig(parameters) {
    for (let i = 0; i < parameters.length; i++) {
      if (parameters[i] === "getMe") {
        parameters[i] = this.helpService.getMe();
      } else if (parameters[i] === "superadmin") {
        parameters[i] = this.helpService.getSuperadmin();
      }
    }
    return parameters;
  }

  actionBegin(args: any): void {
    if(args.currentPage) {
      this.savePage[this.currentUrl] = args.currentPage;
      this.helpService.setGridPageSize(this.savePage);
    }
    /*if (args.requestType === "beginEdit" || args.requestType === "add") {
      this.orderData = Object.assign({}, args.rowData);
    }
    if (args.requestType === "save") {
      if (this.orderForm.valid) {
        args.data = this.orderData;
      } else {
        args.cancel = true;
      }
    }*/
    /*if (args.requestType === "beginEdit" || args.requestType === "add") { 
        // set buttons here.... 
        args.dialog.buttons = [ ];
      } */
  }

  setDirtyForm(event: boolean): void {
    this.isFormDirty = event;
  }

  receiveConfirm(event: boolean) {
    if(event) {
      this.isFormDirty = false;
      this.currentDialog.close();
    }
    this.showDialog = false;
  }

  actionComplete(args: DialogEditEventArgs): void {
    if (args.requestType === "beginEdit" || args.requestType === "add") {
      args.dialog.showCloseIcon = false;
      this.currentDialog = args.dialog;

      const elWrapper = document.createElement('div');
    
      const elHeader = document.createElement('div');
      elHeader.setAttribute('id', 'dialog-header-text');
      elHeader.textContent = "Details of " + args.primaryKeyValue[0];

      const elCloseButton = document.createElement('button');
      elCloseButton.setAttribute('id', 'close-button-id');
      elCloseButton.setAttribute('class', 'close');

      const elCloseButtonSpan = document.createElement('span');
      elCloseButtonSpan.setAttribute('aria-hidden', 'true');
      elCloseButtonSpan.style.fontSize = '25px';
      elCloseButtonSpan.innerHTML = '&times;';
      
      elCloseButton.appendChild(elCloseButtonSpan);
      elCloseButton.style.position = 'absolute';
      elCloseButton.style.right = '20px';
      elCloseButton.style.top = '11px';

      elWrapper.appendChild(elHeader);
      elWrapper.appendChild(elCloseButton);

      args.dialog.header = elWrapper;

      elCloseButtonSpan.addEventListener('click', () => {
        if(this.isFormDirty) {
          this.showDialog = true;
        }else {
          args.dialog.close();
          this.isFormDirty = false;
        }
      })

      args.dialog.buttons = [];
      setTimeout(() => {
        this.setValue(this.config.configField, args.rowData);
      }, 50);
    }

    if (args.requestType === "delete") {
      this.deleteData(args["data"][0]);
    }
    
    this.typeOfModification = args.requestType;
    this.operations = args;
  
    /*
      setTimeout(() => {
        let previousValid = this.form.valid;
        this.form.changes.subscribe(() => {
          if (this.form.valid !== previousValid) {
            previousValid = this.form.valid;
            this.form.setDisabled("submit", !previousValid);
          }
        });

        this.form.setDisabled("submit", true);
        this.form.setValue("storename", "Todd Motto");
      }, 100);*/
    /*if (args.requestType === "beginEdit" || args.requestType === "add") { 
        // set buttons here.... 
        args.dialog.buttons = [ ];
      } */
  }
  submitEmitter(event) {
    if (this.typeOfModification === "add") {
      // this.service
      //   .callApiPost(this.config.editSettingsRequest.add, event)
      //   .subscribe((data) => {});

      this.callServerMethod(this.config.editSettingsRequest.add, event);
    } else if (this.typeOfModification === "beginEdit") {
      // this.service
      //   .callApiPost(this.config.editSettingsRequest.edit, event)
      //   .subscribe((data) => {});

      this.callServerMethod(this.config.editSettingsRequest.edit, event);
    }

    this.operations.dialog.close();
    this.initialization();
    this.isFormDirty = false;
  }

  deleteData(event) {
    this.callServerMethod(this.config.editSettingsRequest.delete, event);
  }

  callServerMethod(request, data) {
    data = this.packAdditionalData(request.parameters, data);
    if (request.type === "POST") {
      this.service.callApiPost(request.api, data).subscribe((response) => {
        if (response === true || response["success"] === true) {
          if (response["message"]) {
            this.helpService.successToastr("", response["message"]);
          } else if (response["messageLanguageField"]) {
            this.helpService.successToastr(
              "",
              this.language[response["messageLanguageField"]]
            );
          } else {
            this.helpService.successToastr(
              this.language.successExecutedActionTitle,
              this.language.successExecutedActionText
            );
          }
        } else {
          if (response["message"]) {
            this.helpService.errorToastr("", response["message"]);
          } else if (response["messageLanguageField"]) {
            this.helpService.errorToastr(
              "",
              this.language[response["messageLanguageField"]]
            );
          } else {
            this.helpService.errorToastr(
              this.language.errorExecutedActionTitle,
              this.language.errorExecutedActionText
            );
          }
        }
      });
    } else {
      this.service.callApiGet(request.api, data).subscribe((data) => {});
    }
  }

  packAdditionalData(parameters: any, data: any) {
    if (parameters && parameters.length > 0) {
      for (let i = 0; i < parameters.length; i++) {
        switch (parameters[i]) {
          case "superadmin":
            data["superadmin"] = this.helpService.getSuperadmin();
            break;
          default:
            break;
        }
      }
    }
    return data;
  }

  previewDocument(filename: string) {
    this.helpService.getPdfFile(filename).subscribe((data) => {
      let file = new Blob([data], { type: "application/pdf" });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }

  setValue(fields, values) {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i]["type"] === "multiselect" && values[fields[i]["name"]]) {
        this.form.setValue(
          fields[i]["name"],
          values[fields[i]["name"]].split(",").map(Number)
        );
      } else if (
        fields[i]["type"] === "checkbox" &&
        values[fields[i]["name"]]
      ) {
        this.form.setValue(
          fields[i]["name"],
          values[fields[i]["name"]] ? true : false
        );
      } else {
        this.form.setValue(fields[i]["name"], values[fields[i]["name"]]);
      }
    }
  }

  /* tooltip */
  tooltip(args: QueryCellInfoEventArgs) {
    const tooltip: Tooltip = new Tooltip(
      {
        content: args.data[args.column.field],
      },
      args.cell as HTMLTableCellElement
    );
  }
  /* tooltip END */

  action(data, mode, item) {
    this.index =
      Number(data.index) +
      (this.grid.pageSettings.currentPage - 1) *
        this.grid.pageSettings.pageSize;
    const actions = {
      data: data,
      mode: mode,
      request: item.request,
      id: item.id ? item.id : null,
    };
    this.actionEmitter.emit(actions);
  }

  clickHandler(args: ClickEventArgs): void {
    const target: HTMLElement = (
      args.originalEvent.target as HTMLElement
    ).closest("button"); // find clicked button
    if (target.id === "collapse") {
      // collapse all expanded grouped row
      this.grid.groupModule.collapseAll();
    } else if (target.id === "refresh") {
      this.refreshGrid();
    } else if (args.item["properties"]["prefixIcon"] === "e-pdfexport") {
      this.grid.pdfExport();
    } else if (args.item["properties"]["prefixIcon"] === "e-excelexport") {
      this.grid.excelExport();
    } else if (args.item.id === "Grid+csvexport") {
      this.grid.csvExport();
    }
  }

  refreshGrid() {
    this.ngOnInit();
  }
}

export interface IOrderModel {
  OrderID?: number;
  CustomerID?: string;
  ShipCity?: string;
  OrderDate?: Date;
  Freight?: number;
  ShipCountry?: string;
  ShipAddress?: string;
}

import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
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
import { QueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { Tooltip } from '@syncfusion/ej2-popups';

@Component({
  selector: "app-dynamic-grid",
  templateUrl: "./dynamic-grid.component.html",
  styleUrls: ["./dynamic-grid.component.scss"],
})
export class DynamicGridComponent implements OnInit {
  @Input() path: string;
  @Input() name: string;
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  @ViewChild("orderForm") public orderForm: FormGroup;
  @ViewChild("editSettingsTemplate") editSettingsTemplate: DialogComponent;
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

  constructor(
    private service: DynamicService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    this.initialization();
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      showDeleteConfirmDialog: true,
      mode: "Dialog",
    };
    this.toolbar = ["Add", "Edit", "Delete"];
    this.container.nativeElement.style.height = this.helpService.getHeightForGrid();
    this.helpService.setDefaultBrowserTabTitle();
  }

  ngAfterViewInit() {}

  initialization() {
    this.service.getConfiguration(this.path, this.name).subscribe((data) => {
      this.config = data;
      this.callApi(data["request"]);
    });
  }

  callApi(data) {
    if (data.type === "POST") {
      this.callApiPost(data.api, data.body);
    } else {
      this.callApiGet(data.api, data.parameters);
    }
  }

  callApiPost(api, body) {
    this.service.callApiPost(api, body).subscribe((data) => {});
  }

  callApiGet(api, parameters) {
    this.service.callApiGet(api, parameters).subscribe((data) => {
      this.data = data;
    });
  }

  actionBegin(args: SaveEventArgs): void {
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

  actionComplete(args: DialogEditEventArgs): void {
    if (args.requestType === "beginEdit" || args.requestType === "add") {
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
      this.service.callApiPost("/api/createToDo", event).subscribe((data) => {
      });
    } else if (this.typeOfModification === "beginEdit") {
      this.service.callApiPost("/api/updateToDo", event).subscribe((data) => {
      });
    }

    this.operations.dialog.close();
    this.initialization();
  }

  deleteData(event) {
    this.service.callApiGet("/api/deleteTodo", event.id).subscribe((data) => {
    });
  }

  setValue(fields, values) {
    for (let i = 0; i < fields.length; i++) {
      this.form.setValue(fields[i]["name"], values[fields[i]["name"]]);
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

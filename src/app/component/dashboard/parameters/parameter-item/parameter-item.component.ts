import { Component, OnInit, Input, Inject, HostListener } from "@angular/core";
import { State, process } from "@progress/kendo-data-query";
import { FormGroup, FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { GridDataResult, RowArgs } from "@progress/kendo-angular-grid";
import { map } from "rxjs/operators";
import { ParameterItemService } from "../../../../service/parameter-item.service";
import {
  DataStateChangeEvent,
  PageChangeEvent
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { MessageService } from "src/app/service/message.service";

@Component({
  selector: "app-parameter-item",
  templateUrl: "./parameter-item.component.html",
  styleUrls: ["./parameter-item.component.scss"]
})
export class ParameterItemComponent implements OnInit {
  @Input() type: string;
  public view: Observable<GridDataResult>;
  public gridState: State = {
    sort: [
      {
        field: "sequence",
        dir: "asc"
      }
    ],
    skip: 0,
    take: 10
  };
  public sort: SortDescriptor[] = [
    {
      field: "sequence",
      dir: "asc"
    }
  ];
  public formGroup: FormGroup;
  public loading = false;
  public genderList = ["male", "female"];
  public doctorTypeList: any;
  public selectedGender: string;
  public selectedDoctorType: string;
  public selectedVAT: string;
  public editedRowIndex: number;
  public currentLoadData: any;
  public therapyList: any;
  public selectedTherapy: any;
  public theme: string;
  public vatTexList: any;
  public firstVatTexList: any;
  public net_price_value: number;
  public editButton = [];
  public height: any;

  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  /*public sort: SortDescriptor[] = [{
    field: 'sequence',
    dir: 'asc'
  }];*/

  constructor(
    private service: ParameterItemService,
    public message: MessageService
  ) {}

  public ngOnInit(): void {
    this.height = window.innerHeight - 303;
    this.height += 'px';
    this.editedRowIndex=-1;
    console.log(this.type);
    // this.editButton[41]=true;
    if (this.type === "Doctors") {
      this.service.getDoctorType().subscribe(data => {
        this.doctorTypeList = data;
      });
    }

    if (this.type === "Therapies") {
      this.service.getTherapy().subscribe(data => {
        this.therapyList = data;
      });
    }

    if (this.type === "Therapy") {
      this.service.getVATTex().subscribe((data: []) => {
        this.vatTexList = data.sort(function(a, b) {
          return a["sequence"] - b["sequence"];
        });
        this.firstVatTexList= this.vatTexList;
      });
     
    }

    this.view = this.service.pipe(
      map(data => {
        this.currentLoadData = data;
        return process(data, this.gridState);
      })
    );

    this.service.getData(this.type);
    console.log(this.view);

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }

    this.message.getTheme().subscribe(mess => {
      this.changeTheme(mess);
      this.theme = mess;
    });

    setTimeout(() => {
      this.changeTheme(this.theme);
    }, 350);
    // this.view = this.service.getData(this.type);
  }

  public onStateChange(state: State) {
    this.gridState = state;
    console.log(state);

    // this.editService.read();
  }

  public addHandler({ sender }) {
    this.closeEditor(sender);
    if (this.type === "Doctors") {
      this.formGroup = new FormGroup({
        firstname: new FormControl(),
        lastname: new FormControl(),
        street: new FormControl(),
        street_number: new FormControl(),
        zip_code: new FormControl(),
        city: new FormControl(),
        telephone: new FormControl(),
        email: new FormControl()
      });
    } else if (this.type === "Therapy") {
      this.formGroup = new FormGroup({
        id: new FormControl(),
        title: new FormControl(),
        sequence: new FormControl(),
        unit: new FormControl(),
        description: new FormControl(),
        art_nr: new FormControl(),
        net_price: new FormControl(),
        gross_price: new FormControl(),
        category: new FormControl()
      });
    } else {
      this.formGroup = new FormGroup({
        title: new FormControl(),
        sequence: new FormControl()
      });
    }

    sender.addRow(this.formGroup);
    this.refreshData();
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    console.log(dataItem);

    if (this.type === "Doctors") {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        firstname: new FormControl(dataItem.firstname),
        lastname: new FormControl(dataItem.lastname),
        street: new FormControl(dataItem.street),
        street_number: new FormControl(dataItem.street_number),
        zip_code: new FormControl(dataItem.zip_code),
        city: new FormControl(dataItem.city),
        telephone: new FormControl(dataItem.telephone),
        email: new FormControl(dataItem.email)
      });
      this.selectedDoctorType = dataItem.doctor_type;
      this.selectedGender = dataItem.gender;
    } else if (this.type === "Therapy") {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        title: new FormControl(dataItem.title),
        sequence: new FormControl(dataItem.sequence),
        unit: new FormControl(dataItem.unit),
        description: new FormControl(dataItem.description),
        art_nr: new FormControl(dataItem.art_nr),
        net_price: new FormControl(dataItem.net_price),
        gross_price: new FormControl(dataItem.gross_price),
        category: new FormControl(dataItem.category)
      });
      this.selectedVAT = dataItem.vat;
      
    } else {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        title: new FormControl(dataItem.title),
        sequence: new FormControl(dataItem.sequence)
      });
    }

    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
    this.refreshData();
  }


  public cancelHandler({ sender, rowIndex }) {
    this.editedRowIndex=-1;
    this.vatTexList= this.firstVatTexList;
    this.closeEditor(sender, rowIndex);
    this.refreshData();
    this.changeTheme(this.theme);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    console.log(formGroup);
    this.editedRowIndex=-1;
    const product = formGroup.value;
    console.log(product);
    if (this.type === "Therapy") {
      const sortedData = {
        data: orderBy(this.currentLoadData, this.sort),
        total: this.currentLoadData.length
      };
      if (
        rowIndex !== -1 && sortedData.data[rowIndex]["net_price"] !== formGroup.value.net_price && sortedData.data[rowIndex]['vat'] !== formGroup.value.vat
      ) {
        formGroup.value.gross_price = (
          Number(formGroup.value.net_price) *
          (1 + this.getTaxValue(sortedData.data[rowIndex]["vat"]) / 100)).toFixed(2);
      } else if (
        rowIndex !== -1 && sortedData.data[rowIndex]["gross_price"] !== formGroup.value.gross_price && sortedData.data[rowIndex]['vat'] !== formGroup.value.vat
      ) {
        formGroup.value.net_price = (
          Number(formGroup.value.gross_price) *
          (1 - this.getTaxValue(sortedData.data[rowIndex]["vat"]) / 100)).toFixed(2);
      }
    }
    product.gender = this.selectedGender;
    product.doctor_type = this.selectedDoctorType;
    product.therapy_id = this.selectedTherapy;
    product.vat = this.selectedVAT;

    this.service.addData(product, isNew, this.type);

    sender.closeRow(rowIndex);
    this.refreshData();
  }

  public removeHandler({ dataItem }) {
    console.log(dataItem);
    this.service.deleteData(dataItem.id, this.type);
    this.refreshData();
  }

  refreshData() {
    this.view = this.service.pipe(
      map(data => {
        this.currentLoadData = data;
        return process(data, this.gridState);
      })
    );

    this.service.getData(this.type);
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  selectionGender(event) {
    console.log(event);
    this.selectedGender = event;
  }

  selectionDoctorType(event) {
    this.selectedDoctorType = event.id;
  }

  selectionTherapy(event) {
    console.log(event);
    this.selectedTherapy = event.id;
  }

  selectionVAT(event, rowIndex) {
    console.log(this.view);
    /*const allData = process(this.currentLoadData, this.gridState);
    this.view.source['data'] = allData.data;
    this.view.source['data'].length = allData.total;*/
    if (event !== undefined) {
      this.selectedVAT = event;
      if (
        this.formGroup !== undefined &&
        this.formGroup.value.net_price !== "" &&
        this.formGroup.value.net_price !== undefined &&
        this.formGroup.value.net_price !== null
      ) {
        const procent = 1 + this.getTaxValue(event) / 100;
        // this.formGroup.value.gross_price = Number(this.formGroup.value.net_price) * procent;
        // this.setViewValue(this.formGroup.value.id, this.formGroup.value.gross_price, 'gross_price');
        this.formGroup.controls["gross_price"].setValue(
          Number(this.formGroup.value.net_price) * procent
        );
      } else if (
        this.formGroup !== undefined &&
        this.formGroup.value.gross_price !== "" &&
        this.formGroup.value.gross_price !== undefined &&
        this.formGroup.value.gross_price !== null
      ) {
        const procent = 1 - this.getTaxValue(event) / 100;
        this.formGroup.controls["net_price"].setValue(
          Number(this.formGroup.value.gross_price) * procent
        );
      }
      this.formGroup.value.vat = event;
    } else {
      this.selectedVAT = "-1";
    }
  }

  getTaxValue(id) {
    for (let i = 0; i < this.vatTexList.length; i++) {
      if (this.vatTexList[i].id === id) {
        return Number(this.vatTexList[i].title);
      }
    }
    return 0;
  }

  setViewValue(id, value, field) {
    for (let i = 0; i < this.view.source["data"].length; i++) {
      if (this.view.source["data"][i].id === id) {
        this.view.source["data"][i][field] = value;
        break;
      }
    }
  }

  pageChange(event: PageChangeEvent): void {
    this.gridState.skip = event.skip;
    this.loadProducts();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.gridState.sort = sort;
    this.sortChangeData();
  }

  loadProducts(): void {
    this.view = this.service.pipe(
      map(data => {
        return process(this.currentLoadData, this.gridState);
      })
    );
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.gridState = state;
    this.view = this.service.pipe(
      map(data => process(this.currentLoadData, this.gridState))
    );
  }

  sortChangeData() {
    this.currentLoadData = orderBy(this.currentLoadData, this.gridState.sort);
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
    }, 150);
    }

  NetPriceChange(event) {
    console.log(event);
  }

  cellClick(event) {
    console.log(event);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(window.innerHeight);
    this.height = window.innerHeight - 303;
    this.height += 'px';
  }
}


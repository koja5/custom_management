import { Component, OnInit, Input, Inject } from '@angular/core';
import { State, process } from '@progress/kendo-data-query';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridDataResult, RowArgs } from '@progress/kendo-angular-grid';
import { map } from 'rxjs/operators';
import { ParameterItemService } from '../../../../service/parameter-item.service';
import { DataStateChangeEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { MessageService } from 'src/app/service/message.service';

@Component({
  selector: 'app-parameter-item',
  templateUrl: './parameter-item.component.html',
  styleUrls: ['./parameter-item.component.scss']
})
export class ParameterItemComponent implements OnInit {

  @Input() type: string;

  public view: Observable<GridDataResult>;
  public gridState: State = {
    sort: [{
      field: 'sequence',
      dir: 'asc'
    }],
    skip: 0,
    take: 10
  };
  public formGroup: FormGroup;
  public loading = false;
  public genderList = ['male', 'female'];
  public doctorTypeList: any;
  public selectedGender: string;
  public selectedDoctorType: string;
  private editedRowIndex: number;
  public currentLoadData: any;
  public therapyList: any;
  public selectedTherapy: any;
  public theme: string;
  private mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.index);
  }
  /*public sort: SortDescriptor[] = [{
    field: 'sequence',
    dir: 'asc'
  }];*/

  constructor(private service: ParameterItemService, public message: MessageService) { }

  public ngOnInit(): void {

    if (this.type === 'Doctors') {
      this.service.getDoctorType().subscribe(
        data => {
          this.doctorTypeList = data;
        }
      );
    }

    if (this.type === 'Therapies') {
      this.service.getTherapy().subscribe(
        data => {
          this.therapyList = data;
        }
      );
    }

    this.view = this.service.pipe(map(data => {
      this.currentLoadData = data;
      return process(data, this.gridState);
    }));

    this.service.getData(this.type);
    console.log(this.view);

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    } 

    this.message.getTheme().subscribe(mess => {
      this.changeTheme(mess);
      this.theme = mess;
    });
    
    this.changeTheme(this.theme);

    // this.view = this.service.getData(this.type);
  }

  public onStateChange(state: State) {
    this.gridState = state;

    // this.editService.read();
  }

  public addHandler({ sender }) {
    this.closeEditor(sender);

    if (this.type === 'Doctors') {
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
    } /*else if (this.type === 'Therapies') {
      this.formGroup = new FormGroup({
        sequence: new FormControl()
      });
    }*/ else {
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
    if (this.type === 'Doctors') {
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

    } /*else if (this.type === 'Therapies') {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        sequence: new FormControl(dataItem.sequence)
      });
      this.selectedTherapy = dataItem.therapy_id;
    }*/ else {
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
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    console.log(formGroup);
    const product = formGroup.value;
    console.log(this.selectedDoctorType);
    product.gender = this.selectedGender;
    product.doctor_type = this.selectedDoctorType;
    product.therapy_id = this.selectedTherapy;
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
    this.view = this.service.pipe(map(data => {
      this.currentLoadData = data;
      return process(data, this.gridState);
    }));

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

  pageChange(event: PageChangeEvent): void {
    this.gridState.skip = event.skip;
    this.loadProducts();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.gridState.sort = sort;
    this.sortChangeData();
  }

  loadProducts(): void {
    this.view = this.service.pipe(map(data => {
      return process(this.currentLoadData, this.gridState);
    }));
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.gridState = state;
    this.view = this.service.pipe(map(data => process(this.currentLoadData, this.gridState)));
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

        /*items = document.querySelectorAll(".k-button");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("inputTheme-" + element);
            clas.add("inputTheme-" + this.theme);
          }
        }*/
      }
    }, 150);
  }
}

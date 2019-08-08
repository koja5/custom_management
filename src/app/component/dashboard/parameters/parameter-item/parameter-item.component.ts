import { Component, OnInit, Input, Inject } from '@angular/core';
import { State, process } from '@progress/kendo-data-query';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { map } from 'rxjs/operators';
import { ParameterItemService } from '../../../../service/parameter-item.service';
import { DataStateChangeEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

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
      field: 'id',
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

  constructor(private service: ParameterItemService) {
  }

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
      )
    }

    this.view = this.service.pipe(map(data => {
      this.currentLoadData = data;
      return process(data, this.gridState);
    }));

    this.service.getData(this.type);
    console.log(this.view);
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
    } else if (this.type === 'Therapies') {
      this.formGroup = new FormGroup({
        sequence: new FormControl()
      });
    } else {
      this.formGroup = new FormGroup({
        title: new FormControl(),
        sequence: new FormControl()
      });
    }

    sender.addRow(this.formGroup);
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

    } else if (this.type === 'Therapies') {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        therapy_id: new FormControl(dataItem.therapy_id),
        sequence: new FormControl(dataItem.sequence)
      });
      this.selectedTherapy = dataItem.therapy_id;
    } else {
      this.formGroup = new FormGroup({
        id: new FormControl(dataItem.id),
        title: new FormControl(dataItem.title),
        sequence: new FormControl(dataItem.sequence)
      });
    }

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
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
  }

  public removeHandler({ dataItem }) {
    console.log(dataItem);
    this.service.deleteData(dataItem.id, this.type);
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
    this.currentLoadData = {
      data: orderBy(this.currentLoadData, this.gridState.sort),
      total: this.currentLoadData.length
    };
  }
}

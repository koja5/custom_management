import { Component, OnInit, Input, Inject } from '@angular/core';
import { State, process } from '@progress/kendo-data-query';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { map } from 'rxjs/operators';
import { ParameterItemService } from '../../../../service/parameter-item.service';

@Component({
  selector: 'app-parameter-item',
  templateUrl: './parameter-item.component.html',
  styleUrls: ['./parameter-item.component.scss']
})
export class ParameterItemComponent implements OnInit {

  @Input() type: string;

  public view: Observable<GridDataResult>;
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10
  };
  public formGroup: FormGroup;
  public loading = false;

  private editedRowIndex: number;

  constructor(private service: ParameterItemService) {
  }

  public ngOnInit(): void {
    this.view = this.service.pipe(map(data => process(data, this.gridState)));

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

    this.formGroup = new FormGroup({
      title: new FormControl(),
      sequence: new FormControl()
    });

    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    console.log(dataItem);
    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id),
      title: new FormControl(dataItem.title),
      sequence: new FormControl(dataItem.sequence)
    });

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    console.log(formGroup);
    const product = formGroup.value;

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
}

import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-column-chooser',
  templateUrl: './column-chooser.component.html',
  styleUrls: ['./column-chooser.component.scss']
})
export class ColumnChooserComponent implements OnInit {
  @Input() columns: string[];
  @Input() isKendoGrid: boolean;
  @Input() type: string;
  @Input() isApplicationParameters = false;
  @Output() outputHiddenColumns = new EventEmitter<string[]>();

  hiddenColumns: string[] = [];
  showColumnPicker = false;
  public language: any;

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showColumnPicker = false;
  }

  constructor() { }

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.getHiddenColumns();
    this.outputHiddenColumns.emit(this.hiddenColumns);
  }

  public isHidden(columnName: string): boolean {
    return this.hiddenColumns.indexOf(columnName) > -1;
  }

  public isDisabled(columnName: string): boolean {
    return (
      this.columns.length - this.hiddenColumns.length === 1 &&
      !this.isHidden(columnName)
    );
  }

  public hideColumn(columnName: string): void {
    const hiddenColumns = this.hiddenColumns;

    if (!this.isHidden(columnName)) {
      hiddenColumns.push(columnName);
    } else {
      hiddenColumns.splice(hiddenColumns.indexOf(columnName), 1);
    }
    localStorage.setItem('hiddenColumns' + this.type, JSON.stringify(this.hiddenColumns));
    this.outputHiddenColumns.emit(this.hiddenColumns);
  }

  public onShowColumnsPicker() {
    this.showColumnPicker = !this.showColumnPicker;
  }

  private getHiddenColumns() {
    const hiddenColumns = JSON.parse(localStorage.getItem('hiddenColumns' + this.type));
    if (hiddenColumns) {
      this.hiddenColumns = hiddenColumns;
    }
  }

}

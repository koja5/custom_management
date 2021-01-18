import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  GridModule,
  EditService,
  ToolbarService,
  SortService,
  FilterService,
  PageService,
  GroupService,
  ResizeService
} from "@syncfusion/ej2-angular-grids";

// components
import { DynamicGridComponent } from "./dynamic-grid/dynamic-grid.component";
import { DynamicFormsComponent } from "./dynamic-forms/dynamic-forms.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DynamicFieldsDirective } from './dynamic-forms/dynamic-fields/dynamic-fields.directive';
import { TextboxComponent } from './dynamic-forms/dynamic-fields/textbox/textbox.component';
import { TextareaComponent } from './dynamic-forms/dynamic-fields/textarea/textarea.component';
import { DatepickerComponent } from './dynamic-forms/dynamic-fields/datepicker/datepicker.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonComponent } from './dynamic-forms/dynamic-fields/button/button.component';
import { DropdownComponent } from "./dynamic-forms/dynamic-fields/dropdown/dropdown.component";
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DynamicFormsModule } from "./dynamic-forms/dynamic-forms.module";
import { DynamicSchedulerComponent } from './dynamic-scheduler/dynamic-scheduler.component';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownListAllModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarAllModule, ContextMenuAllModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonAllModule, CheckBoxAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerAllModule, TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { NumericTextBoxAllModule, TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { ScheduleAllModule, RecurrenceEditorAllModule } from '@syncfusion/ej2-angular-schedule';
import { ComboBoxModule, DropDownsModule, MultiSelectModule } from "@progress/kendo-angular-dropdowns";

@NgModule({
  declarations: [DynamicGridComponent, DynamicFormsComponent, DynamicSchedulerComponent],
  exports: [DynamicGridComponent],
  imports: [
    CommonModule,
    GridModule,
    FormsModule,
    TextBoxModule,
    DropDownListModule,
    ReactiveFormsModule,
    DatePickerModule,
    DialogModule,
    DynamicFormsModule,
    MaskedTextBoxModule,
    UploaderAllModule,
    ScheduleAllModule, 
    RecurrenceEditorAllModule, 
    NumericTextBoxAllModule, 
    TextBoxAllModule, 
    DatePickerAllModule, 
    TimePickerAllModule, 
    DateTimePickerAllModule, 
    CheckBoxAllModule, 
    ToolbarAllModule, 
    DropDownListAllModule, 
    ContextMenuAllModule, 
    MaskedTextBoxModule, 
    UploaderAllModule, 
    MultiSelectAllModule, 
    TreeViewModule, 
    ButtonAllModule, 
    DropDownButtonAllModule,
    SwitchModule,
    DropDownsModule,
    ComboBoxModule,
    MultiSelectModule
  ],
  providers: [EditService, ToolbarService, SortService, FilterService, PageService, GroupService, ResizeService],
  entryComponents: [TextboxComponent, TextareaComponent, DatepickerComponent, ButtonComponent, DropdownComponent]
})
export class DymanicElementsModule { }

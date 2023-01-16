import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { MessageService } from "src/app/service/message.service";

import { FieldConfig } from "./models/field-config";

@Component({
  exportAs: "dynamicForm",
  selector: "app-dynamic-forms",
  templateUrl: "./dynamic-forms.component.html",
  styleUrls: ["./dynamic-forms.component.scss"],
})
export class DynamicFormsComponent implements OnInit, OnChanges {
  @Input()
  config: FieldConfig[] = [];

  @Input()
  showDialogExit: boolean = false;

  @Input()
  isFormDirty = false;

  @Output()
  isFormDirtyChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  showDialogExitChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  receiveConfirmExitResponse: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  isDataSaved: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  emitValue: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;

  get controls() {
    return this.config.filter(({ type }) => type !== "button");
  }
  get changes() {
    return this.form.valueChanges;
  }
  get valid() {
    return this.form.valid;
  }
  get value() {
    return this.form.value;
  }
  language: any;

  constructor(private fb: FormBuilder, private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.form = this.createGroup();
    this.onChanges();
  }

  getIsFormDirty() {
    this.isFormDirty = this.form.dirty;
    this.isFormDirtyChange.emit(this.form.dirty);
  }

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      this.getIsFormDirty();
      this.sendValue();
    });
    if (this.form.get("noEventSinceCheckbox")) {
      this.form.get("noEventSinceCheckbox").valueChanges.subscribe((val) => {
        this.mapCondition(val);
      });
    }
  }

  sendValue(): void {
    this.emitValue.emit(this.value);
  }

  receiveConfirmExit(event: boolean): void {
    if (event) {
      this.isFormDirty = false;
      this.isFormDirtyChange.emit(false);
    }
    this.showDialogExit = false;
    this.showDialogExitChange.emit(false);
    this.isDataSaved.emit(event);
  }

  ngOnChanges() {
    if (this.form) {
      const controls = Object.keys(this.form.controls);
      const configControls = this.controls.map((item) => item.name);

      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => this.form.removeControl(control));

      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.config.find((control) => control.name === name);
          this.form.addControl(name, this.createControl(config));
        });
    }
  }

  createGroup() {
    const group = this.fb.group({});
    this.controls.forEach((control) =>
      group.addControl(control.name, this.createControl(control))
    );
    return group;
  }

  createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.fb.control({ disabled, value }, validation);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form.invalid) {
      this.helpService.errorToastr(
        this.language.allRequiredFieldsMustBeFilledOut,
        ""
      );
      return;
    }
    this.submit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? "disable" : "enable";
      this.form.controls[name][method]();
      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  private mapCondition(noEventSinceCheckboxVal) {
    let field = this.config.find((x) => x.name === "noEventSinceDate");
    let control = this.form.get(field.name);
    if (field.condition) {
      if (noEventSinceCheckboxVal) {
        field.condition.value = true;
        // control.setValidators(Validators.required);
      } else {
        field.condition.value = false;
        // control.clearValidators();
      }
      control.updateValueAndValidity();
    }
  }

  setValue(name: string, value: any) {
    if (this.form.controls[name]) {
      this.form.controls[name].setValue(value, { emitEvent: true });
    }
  }
}

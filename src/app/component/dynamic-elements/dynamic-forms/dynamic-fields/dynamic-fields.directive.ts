import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';


import { Field } from '../models/field';
import { FieldConfig } from '../models/field-config';
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DropdownComponent } from "./dropdown/dropdown.component";
import { MultiselectComponent } from './multiselect/multiselect.component';
import { NumericComponent } from './numeric/numeric.component';
import { RadioComponent } from './radio/radio.component';
import { SwitchComponent } from './switch/switch.component';
import { TextareaComponent } from './textarea/textarea.component';
import { TextboxComponent } from './textbox/textbox.component';


const components: {[type: string]: Type<Field>} = {
  textbox: TextboxComponent,
  password: TextboxComponent,
  textarea: TextareaComponent,
  dropdown: DropdownComponent,
  datepicker: DatepickerComponent,
  button: ButtonComponent,
  radio: RadioComponent,
  checkbox: CheckboxComponent,
  switch: SwitchComponent,
  multiselect: MultiselectComponent,
  numeric: NumericComponent
};

@Directive({
  selector: '[dynamicField]'
})
export class DynamicFieldsDirective implements Field, OnChanges, OnInit {
  @Input()
  config: FieldConfig;

  @Input()
  group: FormGroup;

  @Input()
  data: any;

  component: ComponentRef<Field>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) {}

  ngOnChanges() {
    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

  ngOnInit() {
    if (!components[this.config.type]) {
      const supportedTypes = Object.keys(components).join(', ');
      throw new Error(
        `Trying to use an unsupported type (${this.config.type}).
        Supported types: ${supportedTypes}`
      );
    }
    const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
    this.component = this.container.createComponent(component);
    this.component.instance.config = this.config;
    this.component.instance.group = this.group;
  }
}
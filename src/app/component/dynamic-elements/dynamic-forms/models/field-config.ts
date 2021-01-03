import { ValidatorFn } from "@angular/forms";
import { Request } from "./complex-properties/request";
import { DropDown } from "./specific-property/dropdown";

export interface FieldConfig {
  label?: string;
  class?: string;
  width?: string;
  field?: any;
  disabled?: boolean;
  readonly?: boolean;
  floatLabel?: string;
  name: string;
  options?: string[];
  placeholder?: string;
  type: string;
  validation?: ValidatorFn[];
  value?: any;
  multiline?: boolean;
  request?: Request;
  data?: any;
  fieldConfig?: DropDown;
  positionClass?: string;
}

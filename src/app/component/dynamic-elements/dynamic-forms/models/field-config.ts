import { ValidatorFn } from "@angular/forms";
import { Request } from "./complex-properties/request";
import { DropDown } from "./specific-property/dropdown";

export interface FieldConfig {
  label?: string;
  class?: string;
  width?: string;
  field?: any;
  format?: string;
  disabled?: boolean;
  readonly?: boolean;
  floatLabel?: string;
  name: string;
  options?: string[];
  placeholder?: string;
  type: string;
  subtype?: string;
  validation?: ValidatorFn[];
  value?: any;
  multiline?: boolean;
  request?: Request;
  required?: boolean;
  data?: any;
  dataArray?: any[];
  fieldConfig?: DropDown;
  positionClass?: string;
  onLabel?: string;
  offLabel?: string;
  allowCustom?: boolean;
  condition?: {
    fieldName: string;
    value?: any;
  }
}

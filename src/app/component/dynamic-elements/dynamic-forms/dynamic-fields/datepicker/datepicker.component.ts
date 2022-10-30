import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HelpService } from 'src/app/service/help.service';
import { FieldConfig } from '../../models/field-config';
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;
  public language: any;
  checkIfInputValid = checkIfInputValid;

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

}

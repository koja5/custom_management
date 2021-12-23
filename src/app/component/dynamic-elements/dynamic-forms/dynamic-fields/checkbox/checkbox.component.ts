import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HelpService } from 'src/app/service/help.service';
import { FieldConfig } from '../../models/field-config';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;

  public language: any;
  
  constructor(private helpService: HelpService) { }

  ngOnInit() {
    if(this.config.value || this.config.value === 1) {
      this.config.value = true;
    } else {
      this.config.value = false;
    }
    this.language = this.helpService.getLanguage();
  }

}

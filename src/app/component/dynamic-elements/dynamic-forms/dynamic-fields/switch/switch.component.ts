import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HelpService } from 'src/app/service/help.service';
import { FieldConfig } from '../../models/field-config';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;

  public language: any;

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    console.log(this.config);
    this.language = this.helpService.getLanguage();
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HelpService } from 'src/app/service/help.service';
import { FieldConfig } from '../../models/field-config';

@Component({
  selector: 'app-numeric',
  templateUrl: './numeric.component.html',
  styleUrls: ['./numeric.component.scss']
})
export class NumericComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;
  public language: any;
  
  constructor(private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

}

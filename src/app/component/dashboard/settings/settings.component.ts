import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public language: any;

  constructor(public location: Location, private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.settings);
  }

  backToGrid() {
    this.location.back();
  }

}

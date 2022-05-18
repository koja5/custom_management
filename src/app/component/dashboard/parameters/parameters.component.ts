import { Component, OnInit } from '@angular/core';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {

  public currentTab = 'complaint';
  public language: any;

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    console.log(window.location.pathname.split('/'));
    this.currentTab = window.location.pathname.split('/')[3];
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.parameters);
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

}

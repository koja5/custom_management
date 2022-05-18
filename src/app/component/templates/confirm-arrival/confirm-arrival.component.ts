import { Component, OnInit } from '@angular/core';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-confirm-arrival',
  templateUrl: './confirm-arrival.component.html',
  styleUrls: ['./confirm-arrival.component.scss']
})
export class ConfirmArrivalComponent implements OnInit {

  public language: any;

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

}

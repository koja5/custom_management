import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-account',
  templateUrl: './template-account.component.html',
  styleUrls: ['./template-account.component.scss']
})
export class TemplateAccountComponent implements OnInit {

  public path = 'grid';
  public name = 'template-account';

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-document',
  templateUrl: './my-document.component.html',
  styleUrls: ['./my-document.component.scss']
})
export class MyDocumentComponent implements OnInit {

  public path = 'grid';
  public name = 'my-document';

  constructor() { }

  ngOnInit() {
  }

}

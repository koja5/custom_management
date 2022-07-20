import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html',
  styleUrls: ['./home-footer.component.scss'],
})
export class HomeFooterComponent implements OnInit {
  @Input() color?: string;

  constructor() {}

  ngOnInit(): void {}
}

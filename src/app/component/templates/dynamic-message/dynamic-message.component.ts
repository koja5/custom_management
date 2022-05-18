import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dynamic-message',
  templateUrl: './dynamic-message.component.html',
  styleUrls: ['./dynamic-message.component.scss']
})
export class DynamicMessageComponent implements OnInit {

  @Input() text1: string;
  @Input() text2: string;
  @Input() text3: string;
  @Input() href: string;
  @Input() link: string;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClick(href) {
    this.router.navigate([href]);
  }

}

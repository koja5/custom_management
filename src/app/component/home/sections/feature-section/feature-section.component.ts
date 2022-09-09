import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.scss'],
})
export class FeatureSectionComponent implements OnInit {
  @Input() language: any;

  constructor() {}

  ngOnInit(): void {}
}

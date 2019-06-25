import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent implements OnInit {

  public url: SafeResourceUrl;
  public root = 'http://localhost:4200/';
  public pdfSrc: string | ArrayBuffer;
  @Input() link;

  constructor(public sanitizer: DomSanitizer, public route: ActivatedRoute) { 
  }

  ngOnInit() {
    this.pdfSrc = './assets/'
    this.pdfSrc += this.route.snapshot.params.id;
  }

}

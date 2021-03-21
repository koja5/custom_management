import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-dynamic-confirm-dialog',
  templateUrl: './dynamic-confirm-dialog.component.html',
  styleUrls: ['./dynamic-confirm-dialog.component.scss']
})
export class DynamicConfirmDialogComponent implements OnInit {

  @Input() showDialog: boolean;
  @Input() title: string;
  @Input() question: string;
  @Output() sendEmitter = new EventEmitter<string>();
  public language: any;

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  confirm(answer) {
    this.showDialog = answer;
    this.sendEmitter.emit(answer);
  }

}

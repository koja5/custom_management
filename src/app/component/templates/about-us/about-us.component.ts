import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  public language: any;
  constructor(
    private helpService: HelpService,
    private dialogRef: MatDialogRef<AboutUsComponent>,
  ) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  public onClose() {
    this.dialogRef.close();
  }
}

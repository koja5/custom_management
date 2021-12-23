import { Component, OnInit } from "@angular/core";
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: "app-impressum",
  templateUrl: "./impressum.component.html",
  styleUrls: ["./impressum.component.scss"],
})
export class ImpressumComponent implements OnInit {
  public language: any;
  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }
}

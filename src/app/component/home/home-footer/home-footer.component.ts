import { Component, Input, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-home-footer",
  templateUrl: "./home-footer.component.html",
  styleUrls: ["./home-footer.component.scss"],
})
export class HomeFooterComponent implements OnInit {
  @Input() color?: string;
  @Input() language: any;
  public year: number;

  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    this.year = new Date().getFullYear();
  }
}

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.scss"],
})
export class PriceComponent implements OnInit {
  public language: any;
  public prices = [
    {
      count: "0 - 50",
      price: "40",
    },
    {
      count: "51 - 100",
      price: "65",
    },
    {
      count: "101 - 200",
      price: "110",
    },
    {
      count: "201 - 350",
      price: "170",
    },
    {
      count: "351 - 500",
      price: "210",
    },
    {
      count: "500 - ~",
      price: "240",
    },
  ];
  public selectedPackage = 0;

  constructor(private helpService: HelpService, private router: Router) {}

  ngOnInit(): void {
    this.language = this.helpService.getLanguageForLanding();
  }

  selectPackage(index: number) {
    this.selectedPackage = index;
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }

  getStarted(name, price) {
    this.router.navigate(["/request-demo/" + name]);
  }
}

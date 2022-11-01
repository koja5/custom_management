import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrls: ["./not-found.component.scss"],
})
export class NotFoundComponent implements OnInit {
  public language: any;

  constructor(private helpService: HelpService, private router: Router) {}

  ngOnInit() {
    this.language = this.helpService.getLanguageForLanding();
  }

  backButton() {
    this.router.navigate(["../"]);
  }
}

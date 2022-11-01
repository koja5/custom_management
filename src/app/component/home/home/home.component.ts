import {
  Component,
  HostListener,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  public navigationScroll = "";
  public navigationMobile = "";

  constructor() {}

  ngOnInit(): void {}

  @HostListener("window:scroll", ["$event"])
  onScroll(event: any) {
    if (window.pageYOffset > 0) {
      this.navigationScroll = "affix";
    } else {
      this.navigationScroll = "";
    }
  }

  canvasNavigationMobile() {
    if (this.navigationMobile === "") {
      this.navigationMobile = "show";
    } else {
      this.navigationMobile = "";
    }
  }
}

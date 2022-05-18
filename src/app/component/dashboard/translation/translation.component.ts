import { Component, OnInit, HostListener } from '@angular/core';
import { DashboardService } from 'src/app/service/dashboard.service';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent implements OnInit {
  public gridConfiguration: any;
  public data: any;
  public height: any;
  public language: any;

  constructor(private dashboardService: DashboardService, private helpService: HelpService) { }

  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.translation);
    this.initialization();
  }

  initialization() {
    this.dashboardService.getGridConfiguration('translation').subscribe(data => {
      this.gridConfiguration = data;
    });

    this.dashboardService.getTranslation().subscribe(
      data => {
        console.log(data);
        this.data = data;
      }
    );
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.helpService.getHeightForGrid();
  }

}

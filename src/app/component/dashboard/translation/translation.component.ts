import { Component, OnInit, HostListener } from '@angular/core';
import { DashboardService } from 'src/app/service/dashboard.service';

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent implements OnInit {
  public gridConfiguration: any;
  public data: any;
  public height: any;

  constructor(private service: DashboardService) {}

  ngOnInit() {
    this.height = window.innerHeight - 81;
    this.height += "px";
    this.initialization();
  }

  initialization() {
    this.service.getGridConfiguration('translation').subscribe(data => {
      this.gridConfiguration = data;
    });

    this.service.getTranslation().subscribe(
      data => {
        console.log(data);
        this.data = data;
      }
    );
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = window.innerHeight - 81;
    this.height += "px";
  }

}

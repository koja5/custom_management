import { Component, OnInit } from "@angular/core";
import { TranslationModel } from "src/app/models/translation-model";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DashboardService } from 'src/app/service/dashboard.service';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-edit",
  templateUrl: "./edit-translation.component.html",
  styleUrls: ["./edit-translation.component.scss"]
})
export class EditTranslationComponent implements OnInit {
  public schema: any;
  public data = new TranslationModel();
  public id: any;
  public loading = true;
  public language: any;
  toExpand: boolean = false;

  constructor(
    private service: DashboardService,
    public route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.language = JSON.parse(localStorage.getItem("language"));
    this.initialization();
  }
  
  initialization() {
    
    if(this.toExpand) {
      this.service.getGridConfigurationScheme("translation").subscribe((data: any) => {
        data.layout.map((el: any) => {
          el.expanded = true;
        })
        this.schema = data;
        this.loading = false;
      });
  
    }else {
      this.service.getGridConfigurationScheme("translation").subscribe((data: any) => {
        this.schema = data;
        this.loading = false;
      });
    }
    
    if (this.id !== "create") {
      this.service.getTranslationWithId(this.id).subscribe(data => {
        this.data = data;
        this.loading = false;
      });
    }
  }

  expandAll(): void {
    this.toExpand = !this.toExpand
    this.initialization();
  }

  saveConfiguration(event) {
    this.data.config = event;
    console.log(this.data);
    if (this.id === "create") {
      this.service.createTranslation(this.data).subscribe(data => {
        console.log(data);
        if (data) {
          this.toastr.success(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText, {
            timeOut: 7000,
            positionClass: "toast-bottom-right"
          });
        } else {
          this.toastr.error(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText, {
            timeOut: 7000,
            positionClass: "toast-bottom-right"
          });
        }
      });
    } else {
      this.service.updateTranslation(this.data).subscribe(data => {
        console.log(data);
        if (data) {
          this.toastr.success(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText, {
            timeOut: 7000,
            positionClass: "toast-bottom-right"
          });
        } else {
          this.toastr.error(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText, {
            timeOut: 7000,
            positionClass: "toast-bottom-right"
          });
        }
      });
    }
  }

  back() {
    this.router.navigate(["/dashboard/home/translation"]);
  }
}

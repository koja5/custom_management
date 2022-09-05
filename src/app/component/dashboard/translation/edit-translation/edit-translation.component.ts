import { Component, OnInit } from "@angular/core";
import { TranslationModel } from "src/app/models/translation-model";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DashboardService } from "src/app/service/dashboard.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit-translation.component.html",
  styleUrls: ["./edit-translation.component.scss"],
})
export class EditTranslationComponent implements OnInit {
  public schema: any;
  public data = new TranslationModel();
  public id: any;
  public loading = true;
  public language: any;

  constructor(
    private service: DashboardService,
    public route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.language = JSON.parse(localStorage.getItem("language"));
    this.getData();
    this.initialization();
  }

  isEmpty(obj) {
    for(var prop in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return JSON.stringify(obj) === JSON.stringify({});
  }

  formChanged(event) {
    let flag = this.isEmpty(event)
    if(!flag) {
      this.data.config = event;
    } 
  }

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  searchSchema(event: any): void {
    let indexToExpand = [];

    if (event.length > 0) {
      let layout: any = this.schema.layout;
      let layoutItems: any = [];
      let items = {};
      let inputValue = event.replace(/\s/g, '').toLowerCase();
      let inputValueCamelCase = this.camelize(event)

      layout.map((el: any) => {
        layoutItems.push(el.items);
      });

      layoutItems.map((el: any, index: number) => {
        let currentLayoutItem = [];
        el.map((currentEl: any) => {
          currentLayoutItem.push(currentEl.items);
        });
        items[index] = currentLayoutItem;
      });

      Object.keys(items).forEach((key, index) => {
        items[key].map((currentEl: any) => {
          currentEl.map((currentItems: any) => {
            if (currentItems.key && currentItems.key.toLowerCase().includes(inputValue)) {
              indexToExpand.push(index);
            }
          });
        });
      });
      this.initialization(indexToExpand);
    }else {
      this.initialization();
    }
  }

  initialization(indexToExpand?: Array<number>) {
    if (indexToExpand && indexToExpand.length > 0) {
      this.service
        .getGridConfigurationScheme("translation")
        .subscribe((data: any) => {
          indexToExpand.map((el) => {
            data.layout[el].expanded = true;
          });
          this.schema = data;
          this.loading = false;
        });
    } else {
      this.service
        .getGridConfigurationScheme("translation")
        .subscribe((data: any) => {
          this.schema = data;
          this.loading = false;
        });
    }
  }

  getData() {
    if (this.id !== "create") {
      this.service.getTranslationWithId(this.id).subscribe((data) => {
        this.data = data;
        this.loading = false;
      });
    }
  }

  saveConfiguration(event) {
    this.data.config = event;
    if (this.id === "create") {
      this.service.createTranslation(this.data).subscribe((data) => {
        if (data) {
          this.toastr.success(
            this.language.adminSuccessCreateTitle,
            this.language.adminSuccessCreateText,
            {
              timeOut: 7000,
              positionClass: "toast-bottom-right",
            }
          );
        } else {
          this.toastr.error(
            this.language.adminErrorCreateTitle,
            this.language.adminErrorCreateText,
            {
              timeOut: 7000,
              positionClass: "toast-bottom-right",
            }
          );
        }
      });
    } else {
      this.service.updateTranslation(this.data).subscribe((data) => {
        if (data) {
          this.toastr.success(
            this.language.adminSuccessUpdateTitle,
            this.language.adminSuccessUpdateText,
            {
              timeOut: 7000,
              positionClass: "toast-bottom-right",
            }
          );
        } else {
          this.toastr.error(
            this.language.adminErrorUpdateTitle,
            this.language.adminErrorUpdateText,
            {
              timeOut: 7000,
              positionClass: "toast-bottom-right",
            }
          );
        }
      });
    }
  }

  back() {
    this.router.navigate(["/dashboard/home/translation"]);
  }
}

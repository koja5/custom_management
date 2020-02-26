import { Component, OnInit } from "@angular/core";
import { process, State, GroupDescriptor, SortDescriptor } from "@progress/kendo-data-query";
import { EventCategoryService } from '../../../../service/event-category.service';
import { EventCategoryModel } from 'src/app/models/event-category-model';
import { ServiceHelperService } from 'src/app/service/service-helper.service';
import { ToastrService } from "ngx-toastr";
import { GradientSettings } from '@progress/kendo-angular-inputs';

@Component({
  selector: "app-event-category",
  templateUrl: "./event-category.component.html",
  styleUrls: ["./event-category.component.scss"]
})
export class EventCategoryComponent implements OnInit {
  public height: any;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc"
      }
    ]
  };
  public searchFilter: any;
  public pageSize = 5;
  public pageable = {
    pageSizes: true,
    previousNext: true
  };
  public currentLoadData: any;
  public data = new EventCategoryModel();
  public gridData: any;
  public gridView: any;
  public language: any;
  public eventCategoryModal = false;
  public deleteModal = false;
  public operationMode = 'add';
  public loading = true;
  public settings: GradientSettings = {
    opacity: false
  }

  constructor(private service: EventCategoryService, private serviceHelper: ServiceHelperService, private toastr: ToastrService) { }

  ngOnInit() {
    this.height = window.innerHeight - 138;
    this.height += "px";

    this.language = JSON.parse(localStorage.getItem("language")).grid;

    this.getEventCategory();
  }

  getEventCategory() {
    this.service.getEventCategory().subscribe(
      (data: []) => {
        this.currentLoadData = data;
        this.gridView = process(data, this.state);
        this.loading = false;
      }
    )
  }

  public onFilter(inputValue: string): void {
    this.searchFilter = inputValue;
    this.state.skip = 0;
    this.gridData = process(this.currentLoadData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "category",
            operator: "contains",
            value: inputValue
          },
          {
            field: "sequence",
            operator: "contains",
            value: inputValue
          },
          {
            field: "comment",
            operator: "contains",
            value: inputValue
          }
        ]
      }
    });
    this.gridView = process(this.gridData.data, this.state);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.gridView = process(this.gridData.data, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData.data, this.state);
  }

  addNewModal() {
    this.eventCategoryModal = true;
    this.data = new EventCategoryModel();
    this.operationMode = 'add';
    this.data.color = 'rgb(102, 115, 252)';
  }

  getTranslate(operationMode) {
    return this.serviceHelper.getTranslate(operationMode, this.language);
  }

  createEventCategory(event) {
    this.service.createEventCategory(this.data).subscribe(
      data => {
        if (data) {
          this.getEventCategory();
          this.eventCategoryModal = false;
          /*Swal.fire({
            title: "Successfull!",
            text: "New complaint is successfull added!",
            timer: 3000,
            type: "success"
          });*/
          this.toastr.success(
            "Successfull!",
            "New complaint is successfull added!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        } else {
          this.toastr.error(
            "Error!",
            "New complaint is not added!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        }
      }
    )
  }

  editEventCategory(event) {
    this.data = event;
    this.operationMode = 'edit';
    this.eventCategoryModal = true;
  }

  updateEventCategory(event) {
    this.service.updateEventCategory(this.data).subscribe(
      data => {
        if (data) {
          this.getEventCategory();
          this.eventCategoryModal = false;
          /*Swal.fire({
            title: "Successfull!",
            text: "New complaint is successfull added!",
            timer: 3000,
            type: "success"
          });*/
          this.toastr.success(
            "Successfull!",
            "New complaint is successfull added!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        } else {
          this.toastr.error(
            "Error!",
            "New complaint is not added!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        }
      }
    )
  }

  deleteEventCategory(id) {
    this.data.id = id;
    this.deleteModal = true;
  }

  action(event) {
    console.log(event);
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteEventCategory(this.data.id).subscribe(data => {
        console.log(data);
        if (data) {
          this.state.skip = 0;
          this.toastr.success(
            "Successfull!",
            "Deleted item successfull!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
          this.getEventCategory();
        }
        this.deleteModal = false;
      });
    } else {
      this.deleteModal = false;
    }
  }
}

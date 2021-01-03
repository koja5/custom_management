import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Field } from "../../models/field";
import { FieldConfig } from "../../models/field-config";

@Component({
  selector: "app-text-box",
  templateUrl: "./textbox.component.html",
  styleUrls: ["./textbox.component.scss"],
})
export class TextboxComponent implements OnInit, Field {
  constructor() {}
  config: FieldConfig;
  group: FormGroup;

  ngOnInit() {}
}

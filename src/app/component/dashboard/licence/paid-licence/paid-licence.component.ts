import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { HelpService } from "src/app/service/help.service";
import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";

@Component({
  selector: "app-paid-licence",
  templateUrl: "./paid-licence.component.html",
  styleUrls: ["./paid-licence.component.scss"],
})
export class PaidLicenceComponent implements OnInit {
  @Input() license: any;
  @ViewChild('licensePdf') licensePdf: ElementRef;
  public language: any;

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  generatePDF() {
    const doc = new jsPDF();

    const pdfTable = this.licensePdf.nativeElement;

    var html = htmlToPdfmake(pdfTable.innerHTML);

    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).open();
  }
}

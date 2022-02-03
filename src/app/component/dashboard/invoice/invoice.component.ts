import { PDFService } from './../../../service/pdf.service';
import { AccountService } from 'src/app/service/account.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { CustomerModel } from 'src/app/models/customer-model';
import { CustomersService } from 'src/app/service/customers.service';
import { DateRangeService } from '@progress/kendo-angular-dateinputs';
import { DynamicSchedulerService } from 'src/app/service/dynamic-scheduler.service';
import { FormGroup } from '@angular/forms';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { HelpService } from 'src/app/service/help.service';
import { MessageService } from 'src/app/service/message.service';
import { SortDescriptor, State, process } from '@progress/kendo-data-query';
import { StoreService } from 'src/app/service/store.service';
import { TaskService } from 'src/app/service/task.service';
import { UserModel } from 'src/app/models/user-model';
import { UserType } from '../../enum/user-type';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";

@Component({
  selector: 'app-invoice',
  providers: [DateRangeService],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  @HostListener("window:resize", ["$event"])
  onResize() {

    if (this.displayToolbar) {
      this.height = this.dynamicSchedulerService.getSchedulerHeight();
    }
    else {
      this.height = this.dynamicSchedulerService.getSchedulerHeightWithoutToolbar();
    }
  }



  loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
  }


  public complaintValue: any;
  public currentLoadData: any[] = [];
  public customerLoading = false;
  public customerUser;
  public customerUsers = [];
  public data = new UserModel();
  public displayToolbar = false;
  public formGroup: FormGroup;
  public gridViewData: GridDataResult;
  public height: any;
  public id: number;
  public language: any;
  public languageUser: any;
  public loading = false;
  public mySelection: any = [];
  public pageSize = 10;
  public range = { start: null, end: null };
  public selected = "#cac6c3";
  public selectedComplaint: any;
  public selectedItemIDs = [];
  public selectedTherapies: any;
  public selectedUser: any;
  public skip = 0;
  public startWork = "08:00";
  public stateValue: any;
  public step = 0;
  public store;
  public superadmin: string;
  public therapyValue: any;
  public type: any;
  public userType = UserType;
  public state: State = {
    skip: 0,
    take: 10,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc",
      },
    ],
  };

  public get noDataSelected(): boolean {
    return !this.customerUser;
  }

  constructor(
    private accountService: AccountService,
    private dynamicSchedulerService: DynamicSchedulerService,
    private helpService: HelpService,
    private customerService: CustomersService,
    private messageService: MessageService,
    private storeService: StoreService,
    private taskService: TaskService,
    private pdfService: PDFService) { }

  ngOnInit() {
    this.initializationConfig();
    this.initializationData();

    this.helpService.setDefaultBrowserTabTitle();
    this.height = this.dynamicSchedulerService.getHolidayCalendarHeight();
  }

  reloadNewCustomer() {
    this.customerUsers = null;
    setTimeout(() => {
      this.customerService.getCustomers(this.superadmin, (val) => {
        this.customerUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
        this.loading = false;
      });
    }, 100);
  }

  searchCustomer(event) {
    if (event !== "" && event.length > 2) {
      this.customerLoading = true;
      const searchFilter = {
        superadmin: this.superadmin,
        filter: event,
      };
      this.customerService.searchCustomer(searchFilter).subscribe((val: []) => {
        this.customerUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerLoading = false;
      });
    } else {
      this.customerUsers = [];
    }
  }

  onValueChange(event) {
    if (event !== undefined) {
      this.customerUser = event;
      this.getComplaintAndTherapyForCustomer(event.id);
    }
  }

  getComplaintAndTherapyForCustomer(id) {
    this.customerService.getTherapyForCustomer(id).subscribe((data) => {
      if (data["length"] !== 0) {
        const i = data["length"] - 1;
        this.selectedComplaint = this.stringToArray(data[i]["complaint"]);
        this.selectedTherapies = this.stringToArray(data[i]["therapies"]);
      }
    });
  }

  stringToArray(data) {
    let array = [];
    const dataArray = data.split(";");
    if (dataArray.length > 0) {
      for (let i = 0; i < dataArray.length; i++) {
        array.push(Number(dataArray[i]));
      }
    } else {
      array.push(Number(data));
    }
    return array;
  }


  public showFilterPanel(): void {
    this.displayToolbar = !this.displayToolbar;
  }

  public initializationData(): void {
    this.type = this.helpService.getType();
    this.id = this.helpService.getMe();
    this.superadmin = this.helpService.getSuperadmin();

    this.checkIfPatientUser();
    this.getParameters();

  }

  public checkIfPatientUser(): void {
    if (this.type === this.userType.patient) {
      this.accountService.getCustomerWithId(this.id).subscribe((data) => {
        if (data["length"]) {
          this.customerUser = data[0];
        }
      });
    }
  }

  public initializationConfig(): void {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
      this.languageUser = JSON.parse(localStorage.getItem("language"));
    } else {
      this.messageService.getLanguage().subscribe(() => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
          console.log(this.language);
        }, 10);
      });
    }
  }

  public getDataForMassiveInvoice(): void {
    const patientId = this.customerUser.id;

    this.taskService
      .getDataForMassiveInvoice(patientId, this.type)
      .then((data) => {
        console.log('getDataForMassiveInvoice : ', data);

        this.currentLoadData = [];

        if (this.range.start && this.range.end) {
          data.forEach(element => {

            const startDate = this.range.start.getTime();
            const endDate = this.range.end.getTime();
            const start = element.start;
            const end = element.end;

            element.start = new Date(start);
            element.end = new Date(end);

            if (element.start.getTime() >= startDate && element.end.getTime() <= endDate) {
              this.currentLoadData.push(element);
            }
          });
        } else {
          this.currentLoadData = data;
        }

        console.log(this.currentLoadData);

        this.storeService.getStoreById(this.currentLoadData[0].storeId).then(data => {
          console.log(data);
          this.store = data[0];
        });

        this.gridViewData = process(this.currentLoadData, this.state);
        this.loading = false;
      });

  }

  getParameters() {
    this.customerService
      .getParameters("Complaint", this.superadmin)
      .subscribe((data: []) => {
        this.complaintValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.customerService.getParameters("Therapy", this.superadmin).subscribe((data: []) => {
      this.therapyValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });
  }

  public pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.gridViewData = process(this.currentLoadData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridViewData = process(this.currentLoadData, this.state);
  }

  public filter(): void {
    if (this.noDataSelected) {
      return;
    }

    this.getDataForMassiveInvoice();
    this.displayToolbar = false;
  }


  public downloadPDF(): void {
    const docDefinition = this.setupPDF();

    // pass file name
    pdfMake.createPdf(docDefinition)
      .download(this.customerUser["firstname"] + this.customerUser["lastname"]);
  }

  get isPDFEnabled(): boolean {
    return this.selectedItemIDs.length > 0;
  }

  public printPDF(): void {
    // console.log(this.mySelection);

    const docDefinition = this.setupPDF();
    pdfMake.createPdf(docDefinition).print();
  }

  setSelectedItem(dataItem) {
    console.log(dataItem);
    if (this.selectedItemIDs.indexOf(dataItem.id) === -1) {
      this.selectedItemIDs.push(dataItem.id)
    }
    else {
      let index: number = this.selectedItemIDs.indexOf(dataItem.id);
      if (index !== -1) {
        this.selectedItemIDs.splice(index, 1);
      }
    }
    console.log('selectedItemIds:', this.selectedItemIDs);
  }

  checked(event): void {
    console.log(event);
  }

  createItemsTable(therapies) {
    const arr = [
      // Table Header
      [
        {
          text: this.language.invoiceItem,
          style: "itemsHeader",
        },
        {
          text: this.language.date,
          style: ["itemsHeader", "center"],
        },
        {
          text: this.language.invoiceNetPrice,
          style: ["itemsHeader", "center"],
        },
        {
          text: this.language.invoiceGrossPrice,
          style: ["itemsHeader", "center"],
        },
      ],
    ];

    therapies.forEach((therapy) => {
      console.log(therapy)
      const obj = [
        {
          text: therapy.description
            ? therapy.title + "\n" + therapy.description
            : therapy.title,
          style: "itemTitle",
        },
        {
          text: therapy.date,
          style: "itemNumber",
        },
        {
          text: therapy.net_price,
          style: "itemNumber",
        },
        {
          text: therapy.gross_price,
          style: "itemNumber",
        },
      ];

      arr.push(obj);
    });

    return arr;
  }

  private setupPDF() {

    const netPrices = [];
    const grossPrices = [];
    const therapies = [];

    let selectedTherapies = [];

    this.currentLoadData.forEach(element => {

      if (this.selectedItemIDs.indexOf(element.id) === -1) {
        return;
      }

      selectedTherapies = [];
      console.log(element.therapies);
      if (element.therapies) {
        selectedTherapies = element.therapies.indexOf(';') != -1 ? element.therapies.split(';') : selectedTherapies.push(element.therapies);

      }

      if (selectedTherapies.length > 0) {
        selectedTherapies.forEach((id) => {
          const temp = this.therapyValue.find((therapy) => therapy.id == id);
          console.log(temp);
          if (temp) {
            netPrices.push(parseFloat(temp["net_price"]));
            grossPrices.push(parseFloat(temp["gross_price"]));
            temp.date = element.date;
            therapies.push(temp);
          }
        });
      }

    });

    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = grossPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const tax = (total - subtotal).toFixed(2);

    let docDefinition = {
      content: [
        // Header
        {
          columns: [
            [
              {
                text: this.language.invoiceTitle,
                style: "invoiceTitle",
                width: "*",
              }
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: this.language.invoiceBillingTitleFrom,
              style: "invoiceBillingTitleLeft",
            },
            {
              text: this.language.invoiceBillingTitleTo,
              style: "invoiceBillingTitleRight",
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text: this.store.storename,
              style: "invoiceBillingDetailsLeft",
            },
            {
              text: this.customerUser["shortname"],
              style: "invoiceBillingDetailsRight",
            },
          ],
        },
        // Billing Address Title
        {
          columns: [
            {
              text: this.language.invoiceAddress,
              style: "invoiceBillingAddressTitleLeft",
            },
            {
              text: this.language.invoiceAddress,
              style: "invoiceBillingAddressTitleRight",
            },
          ],
        },
        // Billing Address
        {
          columns: [
            {
              text:
                this.store.street +
                "\n " +
                this.store.place +
                " " +
                this.store.zipcode +
                "\n" +
                this.store.telephone,
              style: "invoiceBillingAddressLeft",
            },
            {
              text:
                this.customerUser["street"] +
                " " +
                this.customerUser["streetnumber"] +
                "\n" +
                this.customerUser["city"] +
                "\n" +
                this.customerUser["telephone"] +
                "\n",
              style: "invoiceBillingAddressRight",
            },
          ],
        },
        // Line breaks
        "\n\n",
        // Items
        {
          layout: {
            // code from lightHorizontalLines:
            hLineWidth: function (i, node) {
              if (i === 0 || i === node.table.body.length) {
                return 0;
              }
              return i === node.table.headerRows ? 2 : 1;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i) {
              return i === 1 ? "black" : "#aaa";
            },
            paddingLeft: function (i) {
              return i === 0 ? 0 : 8;
            },
            paddingRight: function (i, node) {
              return i === node.table.widths.length - 1 ? 0 : 8;
            },
            // code for zebra style:
            fillColor: function (i) {
              return i % 2 === 0 ? "#CCCCCC" : null;
            },
          },
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],

            body: this.createItemsTable(therapies),
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ["*", 80],

            body: [
              // Total
              [
                {
                  text: this.language.invoiceSubtotal,
                  style: "itemsFooterSubTitle",
                },
                {
                  text: subtotal + "€",
                  style: "itemsFooterSubValue",
                },
              ],
              [
                {
                  text: this.language.invoiceTax,
                  style: "itemsFooterSubTitle",
                },
                {
                  text: tax + "€",
                  style: "itemsFooterSubValue",
                },
              ],
              [
                {
                  text: this.language.invoiceTotal,
                  style: "itemsFooterTotalTitle",
                },
                {
                  text: total + "€",
                  style: "itemsFooterTotalValue",
                },
              ],
            ],
          }, // table
          layout: "lightHorizontalLines",
        },
        {
          text: 'NOTES',
          style: 'notesTitle'
        },
        {
          text: "Der Betrag enthält MwSt. \n \n Betrag dankend erhalten \n \n",
          style: 'notesText'
        },
        {
          text: "\n \n",
          style: 'notesText'
        },
        {
          text: "Datum, Ort \n" + new Date().toLocaleDateString() + ", " + this.store.storename,
          style: 'notesTextBold'
        }
      ],
      styles: this.pdfService.getStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };

    return docDefinition;
  }

  downloadWord(): void {
    console.log('downloadWord');
    const that = this;
    this.loadFile("http://127.0.0.1:8887/Invoice_template.docx",
      // loadFile("http://app-production.eu:8080/assets/Invoice_template.docx", //CORS
      function (
        error,
        content
      ) {
        if (error) {
          throw error;
        }
        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.setData({
          invoice_title: that.language.invoiceTitle,
          invoice_number: that.language.invoiceSubTitle,
          invoice_id: 1,//that.complaintData["id"],
          invoice_generated_date: new Date().toDateString(),
          billing_from_title: that.language.invoiceBillingTitleFrom,
          billing_to_title: that.language.invoiceBillingTitleTo,
          clinic_name: that.store.storename,
          customer_name: that.customerUser.lastname + " " + that.customerUser.firstname,
          clinic_street: that.store.street,
          customer_street: that.customerUser.street + " " + that.customerUser.streenumber,
          clinic_city: that.store.zipcode + " " + that.store.place,
          customer_city: that.customerUser.zipcode + " " + that.customerUser.city,
          clinic_telephone: that.store.telephone,
          clinic_email: that.store.email,
        });
        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
          this.replaceErrors();
          // console.log(JSON.stringify({ error: error }, replaceErrors));

          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
              .map(function (error) {
                return error.properties.explanation;
              })
              .join("\n");
            console.log("errorMessages", errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }
        const out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });
        // Output the document using Data-URI
        saveAs(out, "output.docx");
      }
    );
  }

  replaceErrors(value) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function (
        error,
        key
      ) {
        error[key] = value[key];
        return error;
      },
        {});
    }
    return value;
  }

}
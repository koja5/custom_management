import { InvoiceService } from './../../../service/invoice.service';
import { ParameterItemService } from "src/app/service/parameter-item.service";
import { Component, HostListener, OnInit } from "@angular/core";
import { CustomerModel } from "src/app/models/customer-model";
import { CustomersService } from "src/app/service/customers.service";
import { DateRangeService } from "@progress/kendo-angular-dateinputs";
import { FormGroup } from "@angular/forms";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { HelpService } from "src/app/service/help.service";
import { MessageService } from "src/app/service/message.service";
import { PDFService } from "./../../../service/pdf.service";
import { saveAs } from "file-saver";
import { SortDescriptor, State, process } from "@progress/kendo-data-query";
import { StoreModel } from "src/app/models/store-model";
import { StoreService } from "src/app/service/store.service";
import { TaskService } from "src/app/service/task.service";
import { UserModel } from "src/app/models/user-model";
import { UserType } from "../../enum/user-type";
import Docxtemplater from "docxtemplater";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { DashboardService } from "src/app/service/dashboard.service";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-invoice",
  providers: [DateRangeService],
  templateUrl: "./invoice.component.html",
  styleUrls: ["./invoice.component.scss"],
})
export class InvoiceComponent implements OnInit {
  isDateSet: boolean;
  superadminProfile: any;
  selectedInvoiceLanguage: any;

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.displayToolbar) {
      this.height = 75;
    } else {
      this.height = 95;
    }
  }

  private invoiceID: number;
  private height: number;
  public currentLoadData: any[] = [];
  public customerLoading = false;
  public customerUser: CustomerModel;
  public customerUsers: CustomerModel[] = [];
  public data = new UserModel();
  public displayToolbar = true;
  public formGroup: FormGroup;
  public gridViewData: GridDataResult;
  public isAllChecked = false;
  public language: any;
  public loading = false;
  public loggedInUserId: number;
  public range = { start: null, end: null };
  public selectedItemIDs = [];
  public selectedTherapies: any;
  public store: StoreModel;
  public superadmin: string;
  public therapyValue: any;
  public type: UserType;
  public userType = UserType;
  public vatTaxList;
  public isPriceIncluded: boolean = true;
  public languageList;
  public invoiceLanguage;
  public invoicePrefix: string;

  public pageSize = 10;
  public state: State = {
    skip: 0,
    take: this.pageSize,
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

  public get isWordOrPDFEnabled(): boolean {
    return this.selectedItemIDs.length > 0;
  }

  public get gridHeight(): number {
    if (this.displayToolbar) {
      this.height = 75;
    } else {
      this.height = 95;
    }

    return this.height;
  }
  constructor(
    private helpService: HelpService,
    private customerService: CustomersService,
    private messageService: MessageService,
    private storeService: StoreService,
    private taskService: TaskService,
    private parameterItemService: ParameterItemService,
    private pdfService: PDFService,
    private dashboardService: DashboardService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.initializationConfig();
    this.initializationData();

    this.helpService.setDefaultBrowserTabTitle();
    this.invoiceID = Math.ceil(Math.random() * 10000);
  }

  public initializationConfig(): void {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
      this.invoiceLanguage = this.language;
    } else {
      this.messageService.getLanguage().subscribe(() => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
        }, 10);
      });
    }
  }

  public initializationData(): void {
    this.type = this.helpService.getType();
    this.loggedInUserId = this.helpService.getMe();
    this.superadmin = this.helpService.getSuperadmin();

    this.getParameters();

    this.dashboardService.getTranslation().subscribe(
      data => {
        console.log(data);
        this.languageList = [];

        data.forEach(elem => {
          this.languageList.push({
            'text': elem.language,
            'value': elem.config
          })
        });
      }
    );

    this.invoiceService.getInvoicePrefix(this.superadmin).then(data => {
      console.log(data);
      if (data && data.length) {
        this.invoicePrefix = data[0].prefix;
      }
    });
  }

  valueChange(event) {
    this.invoiceLanguage = event.value;
    this.selectedInvoiceLanguage = event;
  }

  public getParameters(): void {
    this.customerService
      .getParameters("Therapy", this.superadmin)
      .subscribe((data: []) => {
        this.therapyValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.parameterItemService.getVATTex(this.superadmin).subscribe((data: []) => {
      this.vatTaxList = data;
    });
  }

  public searchCustomer(event): void {
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

  public onValueChange(event: CustomerModel): void {
    if (event !== undefined) {
      this.customerUser = event;
    }
  }

  public selectAll(): void {
    this.isAllChecked = !this.isAllChecked;
    this.selectedItemIDs = [];

    if (this.isAllChecked) {
      this.selectedItemIDs = this.currentLoadData.map((elem) => elem.taskId);
    }

    this.currentLoadData.forEach((elem) => {
      elem.checked = this.isAllChecked;
    });
  }

  public setSelectedItem(dataItem): void {
    if (dataItem.checked) {
      let index: number = this.selectedItemIDs.indexOf(dataItem.taskId);
      if (index !== -1) {
        this.selectedItemIDs.splice(index, 1);
      }
    } else {
      this.selectedItemIDs.push(dataItem.taskId);
    }

    dataItem.checked = !dataItem.checked;
    this.currentLoadData.every((elem) => elem.checked === true)
      ? (this.isAllChecked = true)
      : (this.isAllChecked = false);
  }

  public showFilterPanel(): void {
    this.displayToolbar = !this.displayToolbar;
  }

  public openFilterPanel(): void {
    if (!this.displayToolbar) {
      this.displayToolbar = true;
    }
  }

  public getDataForMassiveInvoice(): void {
    const patientId = this.customerUser.id;
    this.loading = true;
    this.isAllChecked = false;

    this.taskService.getDataForMassiveInvoice(patientId).then((data) => {
      console.log('getDataForMassiveInvoice : ', data);
      this.currentLoadData = [];

      if (this.range.start && this.range.end) {
        data.forEach((element) => {
          const startDate = this.range.start.getTime();
          const endDate = this.range.end.getTime();
          const start = element.start;
          const end = element.end;

          element.start = new Date(start);
          element.end = new Date(end);

          element.checked = false;

          if (
            element.start.getTime() >= startDate &&
            element.end.getTime() <= endDate
          ) {
            this.currentLoadData.push(element);
          }
        });
      } else {
        data.forEach((elem) => {
          elem.checked = false;
        });
        this.currentLoadData = data;
      }

      if (this.currentLoadData.length > 0) {
        this.storeService
          .getStoreById(this.currentLoadData[0].storeId)
          .then((data) => {
            // console.log(data);
            this.store = data[0];
          });

        this.parameterItemService.getSuperadminProfile(this.superadmin).subscribe((data) => {
          this.superadminProfile = data[0];

          console.log(data);
        });
      }

      this.gridViewData = process(this.currentLoadData, this.state);
      this.loading = false;
    });
  }

  public get isCheckBoxDisabled(): boolean {
    return this.currentLoadData.length === 0 || this.loading;
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

    this.state = {
      skip: 0,
      take: this.pageSize,
      filter: null,
      sort: [
        {
          field: "sequence",
          dir: "asc",
        },
      ],
    };

    this.getDataForMassiveInvoice();
  }

  public downloadPDF(): void {
    const docDefinition = this.setupPDF();

    // pass file name
    pdfMake
      .createPdf(docDefinition)
      .download(this.customerUser["firstname"] + this.customerUser["lastname"]);
  }

  public printPDF(): void {
    const docDefinition = this.setupPDF();
    pdfMake.createPdf(docDefinition).print();
  }

  private setupPDF() {
    const dotSign = " • ";
    const data = this.getTherapyAndPricesData();


    const therapies = data.therapies;
    const netPrices = data.netPrices.filter(num => !isNaN(parseFloat(num)));
    const brutoPrices = data.brutoPrices.filter(num => !isNaN(parseFloat(num)));

    let vatValues = brutoPrices.map(function (item, index) {
      // In this case item correspond to currentValue of array a, 
      // using index to get value from array b
      return item - netPrices[index];
    });

    const vat = vatValues.reduce((a, b) => a + b, 0).toFixed(2);
    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    let docDefinition = {
      content: [
        // Header
        {
          columns: [
            [
              {
                text: this.invoiceLanguage.invoiceTitle,
                style: "invoiceTitle",
                width: "*",
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: this.invoiceLanguage.invoiceSubTitle,
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: this.invoicePrefix ? this.invoicePrefix + this.invoiceID : this.invoiceID,
                        style: "invoiceSubValue",
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: this.invoiceLanguage.dateTitle,
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: this.currentDateFormatted,
                        style: "invoiceSubValue",
                        width: 130,
                      },
                    ],
                  },

                  {
                    columns: [
                      {
                        text: "\n",
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: "\n",
                        style: "invoiceSubValue",
                        width: "*",
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: this.invoiceLanguage.invoiceBillingTitleFrom + "\n \n",
              style: "invoiceBillingTitleLeft",
            },
            {
              text: this.invoiceLanguage.invoiceBillingTitleTo + "\n \n",
              style: "invoiceBillingTitleRight",
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text: this.store.companyname ? this.store.companyname : this.store.storename,
              style: "invoiceBillingDetailsLeft",
            },
            {
              text: this.customerUser.lastname + this.customerUser.firstname,
              style: "invoiceBillingDetailsRight",
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
                  this.store.zipcode +
                  " " +
                  this.store.place +
                  "\n" +
                  this.language.vat + this.store.vatcode ? this.store.vatcode : this.superadminProfile.vatcode,
              style: "invoiceBillingAddressLeft",
            },
            {
              text:
                this.customerUser["street"] +
                "\n" +
                this.customerUser["streetnumber"] +
                " " +
                this.customerUser["city"] +
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
              if (i === 0) {
                return 0;
              }
              return i === node.table.headerRows ? 2 : 1;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i) {
              return "black";
            },
            paddingLeft: function (i) {
              return i === 0 ? 0 : 8;
            },
            paddingRight: function (i, node) {
              return i === node.table.widths.length - 1 ? 0 : 8;
            },
            // // code for zebra style:
            // fillColor: function (i) {
            //   return i % 2 === 0 ? "#CCCCCC" : null;
            // },
          },
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ["*", "*", "auto", "auto", "auto"],

            body: this.pdfService.createItemsTable(therapies, this.isPriceIncluded),
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // Line break
        "\n",
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ["63%", "auto", "auto", "auto"],

            body: [
              // Total
              [
                {
                  text: "",
                },
                {
                  text: this.isPriceIncluded ?
                    (netPrices.length === 0 ? this.invoiceLanguage.noDataAvailable : (this.invoiceLanguage.euroSign + " " + subtotal)) : '',
                  style: "itemsFooterSubValue",
                },
                {
                  text: this.isPriceIncluded ?
                    (netPrices.length === 0 ? this.invoiceLanguage.noDataAvailable : (this.invoiceLanguage.euroSign + " " + vat)) : '',
                  style: "itemsFooterVATValue",
                },
                {
                  text: this.isPriceIncluded ?
                    (brutoPrices.length === 0 ? this.invoiceLanguage.noDataAvailable : (this.invoiceLanguage.euroSign + " " + total)) : '',
                  style: "itemsFooterTotalValue",
                },
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },
        // {
        //   text: this.invoiceLanguage.notesTitle,
        //   style: 'notesTitle'
        // },
        {
          text: this.invoiceLanguage.notesText,
          style: 'notesTextBold'
        },
        // {
        //   text: "\n \n",
        //   style: 'notesText'
        // },
        // {
        //   text: this.invoiceLanguage.notesDate + new Date().toLocaleDateString() + ", " + this.store.storename,
        //   style: 'notesTextBold'
        // }
      ],
      footer: {
        columns: [
          {
            text:
              (this.store.companyname ? this.store.companyname : this.store.storename) +
              dotSign +
              this.store.street +
              dotSign +
              this.store.zipcode +
              " " +
              this.store.place +
              "\n" +
              this.store.telephone +
              dotSign +
              this.store.email,
            style: "documentFooter",
          },
        ],
      },
      styles: this.pdfService.getStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };

    return docDefinition;
  }

  private getTherapyAndPricesData() {
    const therapies = [];
    const netPrices = [];
    const brutoPrices = [];
    let selectedTherapies = [];
    let bruto = 0;

    this.currentLoadData.forEach((element) => {
      if (this.selectedItemIDs.indexOf(element.taskId) === -1) {
        return;
      }

      selectedTherapies = [];
      this.isDateSet = false;

      if (element.therapies) {
        selectedTherapies =
          element.therapies.indexOf(";") != -1
            ? element.therapies.split(";")
            : [element.therapies];

        selectedTherapies = selectedTherapies.filter((elem) => elem != "");
      }

      if (selectedTherapies.length > 0) {
        for (let i = 0; i < selectedTherapies.length; i++) {
          const id = selectedTherapies[i];
          const therapy = this.therapyValue.find((therapy) => therapy.id == id);

          // console.log(therapy)
          if (therapy) {
            const vatDefinition = this.vatTaxList.find(
              (elem) => elem.id === therapy.vat
            );
            // console.log(vatDefinition);

            therapy.date = element.date;

            const isNaNPrice = isNaN(parseFloat(therapy.net_price));

            if (isNaNPrice) {
              console.log('Net price not a number: ', therapy.net_price);
            }

            netPrices.push(parseFloat(therapy.net_price));


            const isNaNBrutoPrice = isNaN(parseFloat(therapy.gross_price));

            if (isNaNBrutoPrice) {
              console.log('Bruto price not a number: ', therapy.gross_price);
            }

            brutoPrices.push(parseFloat(therapy.gross_price));

            // if (vatDefinition) {
            //   bruto =
            //     parseFloat(therapy.net_price) *
            //     (1 + Number(vatDefinition.title) / 100);
            // } else {
            //   bruto = parseFloat(therapy.net_price) * (1 + 20 / 100);
            // }
            // brutoPrices.push(bruto);

            const shouldSetDate =
              (selectedTherapies.length > 1 && i == 0) ||
              selectedTherapies.length === 1 ||
              !this.isDateSet;

            therapies.push({
              title: therapy.printOnInvoice ? therapy.titleOnInvoice : therapy.title,
              description: therapy.description ? therapy.description : '',
              date: shouldSetDate ? this.formatDate(therapy.date) : '',
              net_price: this.isPriceIncluded ? (isNaNPrice ? this.invoiceLanguage.noDataAvailable : this.invoiceLanguage.euroSign + ' ' + parseFloat(therapy.net_price).toFixed(2)) : '',
              vat: this.isPriceIncluded ? (vatDefinition ? vatDefinition.title : 20) : '',
              gross_price: this.isPriceIncluded ? (isNaNBrutoPrice ? this.invoiceLanguage.noDataAvailable : this.invoiceLanguage.euroSign + ' ' + parseFloat(therapy.gross_price).toFixed(2)) : ''
            });
          }
        }
      }
    });

    return {
      therapies: therapies,
      netPrices: netPrices,
      brutoPrices: brutoPrices,
    };
  }

  private formatDate(value) {
    this.isDateSet = true;
    let date: string;

    if (value.indexOf('/') != -1) {
      date = value.split('/')[0];

    } else if (value.indexOf(' ') != -1) {
      date = value.split(' ')[0];
    }

    // console.log(date);
    return this.reverseString(date.trim());
  }

  private reverseString(str) {
    // Step 1. Use the split() method to return a new array
    var splitString;
    if (str.indexOf('.') != -1) {
      splitString = str.split(".");
    } else if (str.indexOf('-') != -1) {
      splitString = str.split("-");
    } else if (str.indexOf('/') != -1) {
      splitString = str.split("/");
    }

    console.log(splitString);

    // Step 2. Use the reverse() method to reverse the new created array
    // var reverseArray = splitString.reverse();
    // console.log(reverseArray)

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = splitString.join(".");
    // console.log(joinArray)

    //Step 4. Return the reversed string
    return joinArray;
  }

  public downloadWord(): void {
    const componentRef = this;

    const data = this.getTherapyAndPricesData();

    let vatValues = [];
    const therapies = data.therapies;
    const netPrices = data.netPrices.filter(num => !isNaN(parseFloat(num)));
    const brutoPrices = data.brutoPrices.filter(num => !isNaN(parseFloat(num)));

    vatValues = brutoPrices.map(function (item, index) {
      // In this case item correspond to currentValue of array a, 
      // using index to get value from array b
      return item - netPrices[index];
    });

    const vat = vatValues.reduce((a, b) => a + b, 0).toFixed(2);
    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    const link =
      window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/assets/Invoice_template.docx";

    // const link = "http://127.0.0.1:8887/Invoice_template.docx";
    this.loadFile(link,
      function (error, content) {
        if (error) {
          throw error;
        }

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: function () {
            return "";
          },
        });

        doc.setData({
          invoice_title: componentRef.invoiceLanguage.invoiceTitle,
          invoice_number: componentRef.invoiceLanguage.invoiceSubTitle,
          invoice_id: componentRef.invoiceID,
          invoice_generated_date: componentRef.currentDateFormatted,
          billing_from_title: componentRef.invoiceLanguage.invoiceBillingTitleFrom,
          billing_to_title: componentRef.invoiceLanguage.invoiceBillingTitleTo,
          clinic_name: componentRef.store.companyname ? componentRef.store.companyname : componentRef.store.storename,
          customer_lastname: componentRef.customerUser.lastname,
          customer_firstname: componentRef.customerUser.firstname,
          clinic_street: componentRef.store.street,
          customer_street: componentRef.customerUser.street,
          customer_streetnumber: componentRef.customerUser.streetnumber,
          clinic_zipcode: componentRef.store.zipcode,
          clinic_city: componentRef.store.place,
          customer_city: componentRef.customerUser.city,
          clinic_telephone: componentRef.store.telephone,
          clinic_email: componentRef.store.email,
          subtotal_title: componentRef.invoiceLanguage.invoiceSubtotal,
          total_title: componentRef.invoiceLanguage.invoiceTotal,
          products: therapies,
          subtotal_price: componentRef.isPriceIncluded ?
            (netPrices.length === 0 ? componentRef.invoiceLanguage.noDataAvailable : (componentRef.invoiceLanguage.euroSign + " " + subtotal)) : '',
          total_price: componentRef.isPriceIncluded ?
            (brutoPrices.length === 0 ? componentRef.invoiceLanguage.noDataAvailable : (componentRef.invoiceLanguage.euroSign + " " + total)) : '',
          item_date: componentRef.invoiceLanguage.date,
          item_title: componentRef.invoiceLanguage.invoiceItem,
          netto_price_title: componentRef.isPriceIncluded ? componentRef.invoiceLanguage.invoiceNetPrice : '',
          vat: componentRef.isPriceIncluded ? componentRef.invoiceLanguage.vat + " (%)" : '',
          vat_title: componentRef.invoiceLanguage.vat,
          vat_code: componentRef.store.vatcode ? componentRef.store.vatcode : componentRef.superadminProfile.vatcode,
          vat_price: componentRef.isPriceIncluded ? vat : '',
          gross_price_title: componentRef.isPriceIncluded ? componentRef.invoiceLanguage.invoiceGrossPrice : '',
          date_title: componentRef.invoiceLanguage.dateTitle,
          price_title: componentRef.invoiceLanguage.invoiceNetPrice,
          // notes_title: componentRef.invoiceLanguage,
          notes_text: componentRef.invoiceLanguage.notesText
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
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        // Output the document using Data-URI

        const filename =
          componentRef.customerUser.lastname +
          componentRef.customerUser.firstname +
          ".docx";
        saveAs(out, filename);
      }
    );
  }

  replaceErrors(value) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function (error, key) {
        error[key] = value[key];
        return error;
      }, {});
    }
    return value;
  }

  private loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
  }

  private get currentDateFormatted(): string {
    // return new Date().toLocaleString().replace(/(.*)\D\d+/, "$1");

    const date = new Date().toLocaleDateString('en-GB');

    return this.reverseString(date);
  }
}

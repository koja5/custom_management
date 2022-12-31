import { InvoiceService } from "./../../../service/invoice.service";
import { ParameterItemService } from "src/app/service/parameter-item.service";
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CustomerModel } from "src/app/models/customer-model";
import { CustomersService } from "src/app/service/customers.service";
import { DateRangeService } from "@progress/kendo-angular-dateinputs";
import { FormGroup } from "@angular/forms";
import { GridComponent, GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
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
import { LoadingScreenService } from "src/app/shared/loading-screen/loading-screen.service";
import { DateService } from "src/app/service/date.service";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

  @ViewChild("filterToolbar") filterToolbar: ElementRef<HTMLElement>;
  @ViewChild("contentWrapper") contentElement: ElementRef<HTMLElement>;
  invoiceStore = null;
  allStores: any[];
  gridData: any;
  allInvoiceData: any[];

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    if (this.displayToolbar) {
      this.height = 75;
    } else {
      this.height = 95;
    }
  }

  private invoiceID: number;
  private changedInvoiceID: number;
  public invoiceNumber:number;
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
  public superadminID: string;
  public therapyValue: any;
  public type: UserType;
  public userType = UserType;
  public vatTaxList;
  public isPriceIncluded: boolean = true;
  public languageList;
  public storeList;
  public selectedStoreInfo;
  public invoiceLanguage;
  public invoicePrefix: string;
  currentUrl: string;
  savePage = {};
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

  public get tableHeight(): number {
    let height =
      100 -
      (100 * this.filterToolbar.nativeElement.clientHeight) /
      this.contentElement.nativeElement.clientHeight;

    return height;
  }

  constructor(
    private helpService: HelpService,
    private customerService: CustomersService,
    private messageService: MessageService,
    private storeService: StoreService,
    private taskService: TaskService,
    private parameterItemService: ParameterItemService,
    private pdfService: PDFService,
    private httpClient: HttpClient,
    private loadingScreenService: LoadingScreenService,
    private dateService: DateService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.initializationConfig();
    this.initializationData();

    this.helpService.setDefaultBrowserTabTitle();

    this.savePage = this.helpService.getGridPageSize();
    if(this.savePage && this.savePage[this.currentUrl] || this.savePage[this.currentUrl + 'Take']) {
      this.state.skip = this.savePage[this.currentUrl];
      this.state.take = this.savePage[this.currentUrl + 'Take'];
    }
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

    this.superadminID = this.helpService.getSuperadmin();
    this.parameterItemService
      .getSuperadminProfile(this.superadminID)
      .subscribe((data) => {
        this.superadminProfile = data[0];
        this.invoicePrefix = this.superadminProfile.invoicePrefix;
        this.invoiceID = this.superadminProfile.invoiceID;
        this.changedInvoiceID = this.superadminProfile.invoiceID;
        this.invoiceNumber = this.superadminProfile.invoiceID;
      });

    this.getParameters();

    this.httpClient.get<any[]>("/api/getTranslationWithoutConfig")
    .subscribe((data) => {
      this.languageList = [];
      data.forEach((elem) => {
        this.languageList.push({
          text: elem.language,
          value: elem.config,
        });
      });
    });
  }

  valueChange(event) {
    this.invoiceLanguage = event.value;
    this.selectedInvoiceLanguage = event;
  }

  storeValueChange(event) {
    this.invoiceStore = this.allStores.find((elem) => elem.id === event);
    console.log("this.invoiceStore ", this.invoiceStore);
    this.selectedStoreInfo = event;
  }

  public getParameters(): void {
    this.customerService
      .getParameters("Therapy", this.superadminID)
      .subscribe((data: []) => {
        this.therapyValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.parameterItemService
      .getVATTex(this.superadminID)
      .subscribe((data: []) => {
        this.vatTaxList = data;
      });
  }

  public searchCustomer(event): void {
    if (event !== "" && event.length > 2) {
      this.customerLoading = true;

      const searchFilter = {
        superadmin: this.superadminID,
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
      console.log("getDataForMassiveInvoice : ", data);
      this.currentLoadData = [];
      this.allInvoiceData = [];

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
            this.allInvoiceData.push(element);
          }
        });
      } else {
        data.forEach((elem) => {
          elem.checked = false;
        });
        this.currentLoadData = data;
        this.allInvoiceData = data;
      }

      if (this.currentLoadData.length > 0) {
        this.storeService
          .getStoreById(this.currentLoadData[0].storeId)
          .then((data) => {
            // console.log(data);
            this.store = data[0];
          });

        const storeIds = this.currentLoadData.map((elem) => elem.storeId);
        const unique = (x, i, a) => a.indexOf(x) == i;
        const uniqueStoreIds = storeIds.filter(unique);

        console.log("unique ", uniqueStoreIds);

        this.storeService.getStoreList(uniqueStoreIds).then((data) => {
          this.allStores = data;
          this.storeList = [];

          data.forEach((elem) => {
            this.storeList.push({
              text: elem.storename,
              value: elem.id,
            });
          });

          console.log("storeList ", this.storeList);
        });
      }

      this.gridViewData = process(this.currentLoadData, this.state);
      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, this.state).data,
      }
      this.gridData = {
        data: this.currentLoadData,
      };

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

    this.savePage[this.currentUrl] = event.skip;
    this.savePage[this.currentUrl + 'Take'] = event.take;
    this.helpService.setGridPageSize(this.savePage);
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

    this.updateInvoiceID();
  }

  public printPDF(): void {
    const docDefinition = this.setupPDF();
    pdfMake.createPdf(docDefinition).print();

    this.updateInvoiceID();
  }

  private updateInvoiceID(): void {
    if (this.invoiceID !== this.changedInvoiceID) {
      const data = {
        superAdminId: this.superadminID,
        id: this.changedInvoiceID,
      };
      console.log("updateInvoiceID");

      this.invoiceService.updateInvoiceID(data);
    }
  }

  private setupPDF() {

    let invoiceNumberToUse;

    if(this.invoiceNumber !== this.invoiceID){
      invoiceNumberToUse = this.invoiceNumber;
    }else{

      if (this.invoiceID === this.changedInvoiceID) {
        invoiceNumberToUse = this.invoiceID;
        this.changedInvoiceID++;
      }
    }

    const therapyPricesData = this.getTherapyAndPricesData();

    const store =
      this.invoiceStore !== undefined && this.invoiceStore !== null
        ? this.invoiceStore
        : this.store;

    const invoicePrefixID = this.invoicePrefix + "-" + invoiceNumberToUse;

    let docDefinition = this.pdfService.getPDFDefinition(
      this.superadminProfile,
      store,
      this.customerUser,
      therapyPricesData,
      this.isPriceIncluded,
      invoicePrefixID,
      this.invoiceLanguage
    );

    return docDefinition;
  }

  private getTherapyAndPricesData() {
    const therapies = [];
    const netPrices = [];
    const brutoPrices = [];
    let selectedTherapies = [];

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
              console.log("Net price not a number: ", therapy.net_price);
            }

            netPrices.push(parseFloat(therapy.net_price));

            const isNaNBrutoPrice = isNaN(parseFloat(therapy.gross_price));

            if (isNaNBrutoPrice) {
              console.log("Bruto price not a number: ", therapy.gross_price);
            }

            brutoPrices.push(parseFloat(therapy.gross_price));

            const shouldSetDate =
              (selectedTherapies.length > 1 && i == 0) ||
              selectedTherapies.length === 1 ||
              !this.isDateSet;

            // console.log(shouldSetDate + ' should set date');

            if (therapy.printOnInvoice) {
              therapies.push({
                title:
                  therapy.titleOnInvoice && therapy.titleOnInvoice.trim() !== ""
                    ? therapy.titleOnInvoice
                    : therapy.title,
                date: shouldSetDate ? this.formatDate(therapy.date) : "",
                net_price: this.isPriceIncluded
                  ? isNaNPrice
                    ? this.invoiceLanguage.noDataAvailable
                    : this.invoiceLanguage.euroSign +
                    " " +
                    parseFloat(therapy.net_price).toFixed(2)
                  : "",
                vat: this.isPriceIncluded
                  ? vatDefinition
                    ? vatDefinition.title
                    : 20
                  : "",
                gross_price: this.isPriceIncluded
                  ? isNaNBrutoPrice
                    ? this.invoiceLanguage.noDataAvailable
                    : this.invoiceLanguage.euroSign +
                    " " +
                    parseFloat(therapy.gross_price).toFixed(2)
                  : "",
              });
            }
          }
        }
      }
    });

    console.log(therapies);
    return {
      therapies: therapies,
      netPrices: netPrices,
      brutoPrices: brutoPrices,
    };
  }

  private formatDate(value) {
    this.isDateSet = true;

    return this.dateService.formatDate(value);
  }

  public downloadWord(): void {
    const componentRef = this;

    let invoiceNumberToUse;
    if(this.invoiceNumber !== this.invoiceID){
      invoiceNumberToUse = this.invoiceNumber;
    } else {
      if (this.invoiceID === this.changedInvoiceID) {
        invoiceNumberToUse = this.invoiceID;
        this.changedInvoiceID++;
      }
    }

    const data = this.getTherapyAndPricesData();

    let vatValues = [];
    const therapies = data.therapies;
    const netPrices = data.netPrices.filter((num) => !isNaN(parseFloat(num)));
    const brutoPrices = data.brutoPrices.filter(
      (num) => !isNaN(parseFloat(num))
    );

    vatValues = brutoPrices.map(function (item, index) {
      // In this case item correspond to currentValue of array a,
      // using index to get value from array b
      return item - netPrices[index];
    });

    const vat = vatValues.reduce((a, b) => a + b, 0).toFixed(2);
    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    //THIS ONE SHOULD BE ACTIVE
    const link =
      window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/assets/Invoice_template.docx";

    // LOCAL PURPOSE TESTING
    // const link = "http://127.0.0.1:8887/Invoice_template.docx";
    this.loadFile(link, function (error, content) {
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

      const store =
        componentRef.invoiceStore !== undefined && componentRef.invoiceStore !== null
          ? componentRef.invoiceStore
          : componentRef.store;

      const invoicePrefixID = this.invoicePrefix + "-" + invoiceNumberToUse;

      doc.setData({
        invoice_title: componentRef.invoiceLanguage.invoiceTitle,
        invoice_number: componentRef.invoiceLanguage.invoiceSubTitle,
        invoice_prefix: invoicePrefixID,
        invoice_id: componentRef.invoiceID,
        invoice_generated_date: componentRef.currentDateFormatted,
        billing_from_title:
          componentRef.invoiceLanguage.invoiceBillingTitleFrom,
        billing_to_title: componentRef.invoiceLanguage.invoiceBillingTitleTo,
        clinic_name: store.companyname ? store.companyname : componentRef.superadminProfile.shortname,
        customer_lastname: componentRef.customerUser.lastname,
        customer_firstname: componentRef.customerUser.firstname,
        clinic_street: store.street,
        customer_street: componentRef.customerUser.street,
        customer_streetnumber: componentRef.customerUser.streetnumber,
        clinic_zipcode: store.zipcode,
        clinic_city: store.place,
        customer_city: componentRef.customerUser.city,
        clinic_telephone: store.telephone,
        clinic_email: store.email,
        subtotal_title: componentRef.invoiceLanguage.invoiceSubtotal,
        total_title: componentRef.invoiceLanguage.invoiceTotal,
        products: therapies,
        subtotal_price: componentRef.isPriceIncluded
          ? netPrices.length === 0
            ? componentRef.invoiceLanguage.noDataAvailable
            : componentRef.invoiceLanguage.euroSign + " " + subtotal
          : "",
        total_price: componentRef.isPriceIncluded
          ? brutoPrices.length === 0
            ? componentRef.invoiceLanguage.noDataAvailable
            : componentRef.invoiceLanguage.euroSign + " " + total
          : "",
        item_date: componentRef.invoiceLanguage.date,
        item_title: componentRef.invoiceLanguage.invoiceItem,
        netto_price_title: componentRef.isPriceIncluded
          ? componentRef.invoiceLanguage.invoiceNetPrice
          : "",
        vat_percentage_title: componentRef.isPriceIncluded ? componentRef.invoiceLanguage.vatPercentageTitle : "",
        vat_identification_number: componentRef.invoiceLanguage.vatIdentificationNumber,
        vat_code: store.vatcode
          ? store.vatcode
          : componentRef.superadminProfile.vatcode,
        vat_price: componentRef.isPriceIncluded ? vat : "",
        gross_price_title: componentRef.isPriceIncluded
          ? componentRef.invoiceLanguage.invoiceGrossPrice
          : "",
        date_title: componentRef.invoiceLanguage.dateTitle,
        price_title: componentRef.invoiceLanguage.invoiceNetPrice,
        // notes_title: componentRef.invoiceLanguage,
        notes_text: componentRef.invoiceLanguage.notesText,
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

      componentRef.loadingScreenService.stopLoading();

      componentRef.updateInvoiceID();
    });
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
    this.loadingScreenService.startLoading();

    return PizZipUtils.getBinaryContent(url, callback);
  }

  private get currentDateFormatted(): string {
    return this.dateService.currentDateFormatted;
  }


  exportPDF(value: boolean): void {
    this.allPages = value;

    setTimeout(() => {
      this.grid.saveAsPDF();
    }, 0);
  }

  exportToExcel(grid: GridComponent, allPages: boolean) {
    this.setDataForExcelExport(allPages);

    setTimeout(() => {
      grid.saveAsExcel();
    }, 0);
  }

  public setDataForExcelExport(allPages: boolean): void {
    console.log('allPages ', allPages);

    if (allPages) {
      var myState: State = {
        skip: 0,
        take: this.gridData.total,
      };

      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, myState).data,
      }
    } else {
      this._allData = <ExcelExportData>{
        data: process(this.currentLoadData, this.state).data,
      }
    }
  }

  public allData(): ExcelExportData {
    return this._allData;
  }

  private _allData: ExcelExportData;
  @ViewChild('grid') grid;
  public allPages: boolean;
}

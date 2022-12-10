import { Injectable } from "@angular/core";
import { DateService } from "./date.service";
import { MessageService } from "./message.service";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: "root",
})
export class PDFService {
  private dotSign = " • ";

  public language: any;

  constructor(
    private messageService: MessageService,
    private dateService: DateService
  ) {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
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

  createVaucherPDF(language: any, vaucher: any, clinic: any, customer: any) {
    let definition = {
      header: {
        columns: [
          {
            text: "Datum:" + " " + this.dateService.currentDateFormatted,
            style: "documentHeaderRight",
            width: "*",
          },
        ],
      },
      content: [
        {
          columns: [
            [
              {
                text: "\n" + language.vaucher,
                style: "vaucherTitle",
                width: "*",
              },
              {
                columns: [
                  {
                    text: "\n",
                    style: "vaucherSubTitle",
                    width: "*",
                  },
                  {
                    text: "\n",
                    style: "vaucherSubValue",
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: language.mailClinic + "\n \n",
                    style: "vaucherTitleLeft",
                  },
                  {
                    text: language.customer + "\n \n",
                    style: "vaucherTitleRight",
                  },
                ],
              },
              {
                columns: [
                  {
                    text:
                      clinic.shortname +
                      "\n" +
                      clinic.street +
                      "\n" +
                      clinic.zipcode +
                      " " +
                      clinic.place,
                    style: "vaucherAddressLeft",
                  },
                  {
                    text:
                      vaucher.customer_consumer_name +
                      "\n" +
                      (customer ? customer.street : "") +
                      "\n" +
                      (customer
                        ? (customer.zipcode
                            ? customer.zipcode
                            : customer.streetnumber) +
                          " " +
                          (customer.place ? customer.place : customer.city)
                        : "") +
                      "\n",
                    style: "vaucherAddressRight",
                  },
                ],
              },
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
                },
                table: {
                  // headers are automatically repeated if the table spans over multiple pages
                  // you can declare how many rows should be treated as headers
                  headerRows: 1,
                  widths: ["20%", "20%", "20%", "20%", "20%"],

                  body: this.createItemsTableVaucher(language, vaucher),
                }, // table
                //  layout: 'lightHorizontalLines'
              },
            ],
          ],
        },
      ],
      styles: this.getVaucherStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };
    return definition;
  }

  getPDFDefinition(
    superadminProfile,
    store,
    customerUser,
    therapyPricesData,
    isPriceIncluded,
    invoicePrefixID,
    selectedLanguage?
  ) {
    const invoiceLanguage = selectedLanguage ? selectedLanguage : this.language;

    const therapies = therapyPricesData.therapies;
    const netPrices = therapyPricesData.netPrices.filter(
      (num) => !isNaN(parseFloat(num))
    );
    const brutoPrices = therapyPricesData.brutoPrices.filter(
      (num) => !isNaN(parseFloat(num))
    );

    // console.log(therapies);

    let vatPrices = brutoPrices.map(function (item, index) {
      // In this case item correspond to currentValue of array a,
      // using index to get value from array b
      return item - netPrices[index];
    });

    const vat = vatPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    const billingAddress =
      store.street +
      "\n " +
      store.zipcode +
      " " +
      store.place +
      "\n" +
      invoiceLanguage.vatIdentificationNumber +
      " ";

    let definition = {
      header: {
        columns: [
          {
            text: invoiceLanguage.invoiceSubTitle + " " + invoicePrefixID,
            style: "documentHeaderLeft",
            width: "*",
          },
          {
            text:
              invoiceLanguage.dateTitle +
              " " +
              this.dateService.currentDateFormatted,
            style: "documentHeaderRight",
            width: "*",
          },
        ],
      },
      content: [
        // Title headers
        {
          columns: [
            [
              {
                text: "\n" + invoiceLanguage.invoiceTitle,
                style: "invoiceTitle",
                width: "*",
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
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: invoiceLanguage.invoiceBillingTitleFrom + "\n \n",
              style: "invoiceBillingTitleLeft",
            },
            {
              text: invoiceLanguage.invoiceBillingTitleTo + "\n \n",
              style: "invoiceBillingTitleRight",
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text: store.companyname ? store.companyname : superadminProfile.shortname,
              style: "invoiceBillingDetailsLeft",
            },
            {
              text:
                customerUser.lastname.trim() +
                " " +
                customerUser.firstname.trim(),
              style: "invoiceBillingDetailsRight",
            },
          ],
        },
        // Billing Address
        {
          columns: [
            {
              text: store.vatcode
                ? billingAddress + store.vatcode
                : billingAddress + superadminProfile.vatcode,
              style: "invoiceBillingAddressLeft",
            },
            {
              text:
                customerUser["street"] +
                "\n" +
                customerUser["streetnumber"] +
                " " +
                customerUser["city"] +
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
          },
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ["20%", "20%", "20%", "20%", "20%"],

            body: this.createItemsTable(therapies, isPriceIncluded),
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // Line break
        "\n",
        // TOTAL
        {
          columns: [
            {
              text: "",
              width: "20%",
            },
            {
              text: "",
              width: "20%",
            },
            {
              text: isPriceIncluded
                ? netPrices.length === 0
                  ? invoiceLanguage.noDataAvailable
                  : invoiceLanguage.euroSign + " " + subtotal
                : "",
              style: "itemsFooterSubValue",
              width: "20%",
            },
            {
              text: isPriceIncluded
                ? vatPrices.length === 0
                  ? invoiceLanguage.noDataAvailable
                  : invoiceLanguage.euroSign + " " + vat
                : "",
              style: "itemsFooterVATValue",
              width: "20%",
            },
            {
              text: isPriceIncluded
                ? brutoPrices.length === 0
                  ? invoiceLanguage.noDataAvailable
                  : invoiceLanguage.euroSign + " " + total
                : "",
              style: "itemsFooterTotalValue",
              width: "20%",
            },
          ],
        },
        {
          text: invoiceLanguage.notesTitle,
          style: "notesTextBold",
        },
        {
          text: invoiceLanguage.notesText,
          style: "notesText",
        },
      ],
      footer: {
        columns: [
          {
            text:
              store.storename +
              " " +
              superadminProfile.shortname +
              this.dotSign +
              store.street +
              this.dotSign +
              store.zipcode +
              " " +
              store.place +
              "\n" +
              store.telephone +
              this.dotSign +
              store.email,
            style: "documentFooter",
          },
        ],
      },
      styles: this.getStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };

    return definition;
  }

  getStyles() {
    return {
      // Document Header
      documentHeaderLeft: {
        fontSize: 11,
        // margin: [left, top, right, bottom]
        margin: [45, 25, 0, 0],
        alignment: "left",
        color: "gray",
      },
      documentHeaderRight: {
        fontSize: 11,
        margin: [0, 25, 45, 0],
        alignment: "right",
        color: "gray",
      },
      // Document Footer
      documentFooter: {
        fontSize: 11,
        alignment: "center",
        color: "gray",
      },
      // Invoice Title
      invoiceTitle: {
        fontSize: 28,
        bold: false,
        underline: true,
        alignment: "left",
        margin: [0, 0, 0, 15],
      },
      // Invoice Details
      invoiceSubTitle: {
        fontSize: 12,
        alignment: "right",
      },
      invoiceSubValue: {
        fontSize: 12,
        alignment: "right",
      },
      // Billing Headers
      invoiceBillingTitleLeft: {
        fontSize: 14,
        bold: true,
        alignment: "left",
        margin: [0, 20, 0, 5],
      },

      // Billing Headers
      invoiceBillingTitleRight: {
        fontSize: 14,
        bold: true,
        alignment: "right",
        margin: [0, 20, 0, 5],
      },
      // Billing Details
      invoiceBillingDetailsLeft: {
        alignment: "left",
      },
      invoiceBillingDetailsRight: {
        alignment: "right",
      },
      invoiceBillingAddressLeft: {
        alignment: "left",
      },
      invoiceBillingAddressRight: {
        alignment: "right",
      },
      // Items Header
      itemsHeader: {
        margin: [0, 5, 0, 5],
        bold: true,
      },
      // Item Title
      itemTitle: {
        bold: false,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 11,
      },
      itemDate: {
        margin: [0, 5, 0, 5],
        alignment: "left",
      },
      itemNumber: {
        margin: [0, 5, 0, 5],
        alignment: "center",
      },
      itemGrossPrice: {
        margin: [0, 5, 0, 5],
        alignment: "center",
      },
      itemTotal: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "center",
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "right",
      },
      itemsFooterSubValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 16,
        alignment: "right",
      },

      itemsFooterVATValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      notesTitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 50, 0, 3],
      },
      notesText: {
        fontSize: 12,
      },
      notesTextBold: {
        fontSize: 12,
        bold: true,
      },
      center: {
        alignment: "center",
      },
    };
  }

  getVaucherStyles() {
    return {
      // Document Header
      documentHeaderLeft: {
        fontSize: 11,
        // margin: [left, top, right, bottom]
        margin: [45, 25, 0, 0],
        alignment: "left",
        color: "gray",
      },
      documentHeaderRight: {
        fontSize: 11,
        margin: [0, 25, 45, 0],
        alignment: "right",
        color: "gray",
      },
      // Document Footer
      documentFooter: {
        fontSize: 11,
        alignment: "center",
        color: "gray",
      },
      // vaucher Title
      vaucherTitle: {
        fontSize: 28,
        bold: false,
        underline: true,
        alignment: "left",
        margin: [0, 0, 0, 15],
      },
      // vaucher Details
      vaucherSubTitle: {
        fontSize: 12,
        alignment: "right",
      },
      vaucherSubValue: {
        fontSize: 12,
        alignment: "right",
      },
      // vaucher Headers
      vaucherTitleLeft: {
        fontSize: 14,
        bold: true,
        alignment: "left",
        margin: [0, 20, 0, 5],
      },

      // vaucher Headers
      vaucherTitleRight: {
        fontSize: 14,
        bold: true,
        alignment: "right",
        margin: [0, 20, 0, 5],
      },
      // vaucher Details
      vaucherDetailsLeft: {
        alignment: "left",
      },
      vaucherDetailsRight: {
        alignment: "right",
      },
      vaucherAddressLeft: {
        alignment: "left",
      },
      vaucherAddressRight: {
        alignment: "right",
      },
      // Items Header
      itemsHeader: {
        margin: [0, 5, 0, 5],
        bold: true,
      },
      // Item Title
      itemTitle: {
        bold: false,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 11,
      },
      itemDate: {
        margin: [0, 5, 0, 5],
        alignment: "left",
      },
      itemNumber: {
        margin: [0, 5, 0, 5],
        alignment: "center",
      },
      itemGrossPrice: {
        margin: [0, 5, 0, 5],
        alignment: "center",
      },
      itemTotal: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "center",
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "right",
      },
      itemsFooterSubValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 16,
        alignment: "right",
      },

      itemsFooterVATValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 13,
        alignment: "center",
      },
      notesTitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 50, 0, 3],
      },
      notesText: {
        fontSize: 12,
      },
      notesTextBold: {
        fontSize: 12,
        bold: true,
      },
      center: {
        alignment: "center",
      },
    };
  }

  public createItemsTableVaucher(language, vaucher) {
    let date = new Date(vaucher.date).toISOString();
    let dateRedeemed;
    if (vaucher.date_redeemed) {
      dateRedeemed = new Date(vaucher.date_redeemed).toISOString();
    }

    const arr = [
      // Table Header
      [
        {
          text: "Datum",
          style: ["itemsHeader", "left"],
        },
        {
          text: language.amount,
          style: "itemsHeader",
        },
        {
          text: language.date_redeemed,
          style: ["itemsHeader", "center"],
        },
        {
          text: language.vaucherPurchasedBy,
          style: ["itemsHeader", "center"],
        },
        {
          text: language.vaucherRedeemedBy,
          style: ["itemsHeader", "center"],
        },
        // {
        //   text: 'user',
        //   style: "itemsHeader",
        // },
        // {
        //   text: 'remark',
        //   style: ["itemsHeader", "center"],
        // }
      ],
    ];

    let obj = [
      {
        text: this.dateService.formatDate(date),
        style: "itemDate",
      },
      {
        text: vaucher.amount,
        style: "itemDate",
      },
      {
        text: dateRedeemed ? this.dateService.formatDate(dateRedeemed) : "",
        style: "itemDate",
      },
      {
        text: vaucher.user_name,
        style: "itemDate",
      },
      {
        text: vaucher.customer_consumer_name,
        style: "itemDate",
      },
    ];
    arr.push(obj);
    return arr;
  }

  public createItemsTable(therapies, isPriceIncluded = true) {
    const arr = [
      // Table Header
      [
        {
          text: this.language.date,
          style: ["itemsHeader", "left"],
        },
        {
          text: this.language.invoiceItem,
          style: "itemsHeader",
        },
        {
          text: isPriceIncluded ? this.language.invoiceNetPrice : "",
          style: ["itemsHeader", "center"],
        },
        {
          text: isPriceIncluded ? this.language.vatPercentageTitle : "",
          style: ["itemsHeader", "center"],
        },
        {
          text: isPriceIncluded ? this.language.invoiceGrossPrice : "",
          style: ["itemsHeader", "center"],
        },
      ],
    ];

    therapies.forEach((therapy) => {
      const obj = [
        {
          text: therapy.date,
          style: "itemDate",
        },
        {
          text: therapy.title,
          style: "itemTitle",
        },
        {
          text: isPriceIncluded ? therapy.net_price : "",
          style: "itemNumber",
        },
        {
          text: isPriceIncluded ? therapy.vat : "",
          style: "itemNumber",
        },
        {
          text: isPriceIncluded ? therapy.gross_price : "",
          style: "itemGrossPrice",
        },
      ];

      arr.push(obj);
    });

    return arr;
  }
}

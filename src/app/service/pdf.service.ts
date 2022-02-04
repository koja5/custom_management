import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class PDFService {
  public language: any;

  constructor(private messageService: MessageService) {
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

  getStyles() {
    return {
      // Document Header
      documentHeaderLeft: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      documentHeaderCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentHeaderRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Document Footer
      documentFooter: {
        fontSize: 11,
        alignment: "center",
        color: 'gray'
      },
      documentFooterLeft: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      documentFooterCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentFooterRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "right",
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
      invoiceBillingAddressTitleLeft: {
        margin: [0, 7, 0, 3],
        bold: true,
        alignment: "left",
      },
      invoiceBillingAddressTitleRight: {
        margin: [0, 7, 0, 3],
        bold: true,
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
        alignment: "left",
      },
      itemNumber: {
        margin: [0, 5, 0, 5],
        alignment: "center",
      },
      itemGrossPrice: {
        alignment: "right",
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
        alignment: "right",
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 16,
        alignment: "right",
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 16,
        alignment: "right",
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
        bold: true
      },
      center: {
        alignment: "center",
      },
    };
  }

  public createItemsTable(therapies) {
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
          text: this.language.invoiceNetPrice,
          style: ["itemsHeader", "center"],
        },
        {
          text: this.language.vat + " (%)",
          style: ["itemsHeader", "center"],
        },
        {
          text: this.language.invoiceGrossPrice,
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
          text: therapy.description
            ? therapy.title + "\n" + therapy.description
            : therapy.title,
          style: "itemTitle",
        },
        {
          text: this.language.euroSign + " " + therapy.net_price,
          style: "itemNumber",
        },
        {
          text: therapy.vat,
          style: "itemNumber",
        },
        {
          text: this.language.euroSign + " " + therapy.gross_price,
          style: "itemGrossPrice"
        }
      ];

      arr.push(obj);
    });

    return arr;
  }
}

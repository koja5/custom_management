import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  constructor() { }

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
        fontSize: 22,
        bold: true,
        alignment: "right",
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
        bold: true,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 11,
      },
      itemNumber: {
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
        alignment: "right",
      },
      itemsFooterSubValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "center",
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "right",
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
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
        bold: true
      },
      center: {
        alignment: "center",
      },
    };
  }
}

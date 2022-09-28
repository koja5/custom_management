import { Component, OnInit } from "@angular/core";
import {
  Elements,
  Element as StripeElement,
  ElementsOptions,
  StripeService,
} from "ngx-stripe";
import { PaymentService } from "src/app/service/payment.service";

@Component({
  selector: "app-dynamic-payment-form",
  templateUrl: "./dynamic-payment-form.component.html",
  styleUrls: ["./dynamic-payment-form.component.scss"],
})
export class DynamicPaymentFormComponent implements OnInit {
  paymentHandler: any = null;

  success: boolean = false;

  failure: boolean = false;
  elements: Elements;
  card: StripeElement;

  elementsOptions: ElementsOptions = {
    locale: "en",
  };

  constructor(
    private checkout: PaymentService,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    // this.intialScript();
    setTimeout(() => {
      this.stripeService
        .elements(this.elementsOptions)
        .subscribe((elements) => {
          this.elements = elements;
          if (!this.card) {
            this.card = this.elements.create("card", {
              iconStyle: "solid",
              style: {
                base: {
                  iconColor: "#666EE8",
                  color: "#31325F",
                  lineHeight: "40px",
                  fontWeight: 300,
                  fontFamily: '"Helverica Neue", Helvetica, sans-serif',
                  fontSize: "18px",
                  "::placeholder": {
                    color: "#CFD7E8",
                  },
                },
              },
            });
            this.card.mount("#card-element");
          }
        });
    }, 20);
  }

  makePayment(amount: number) {
    const paymentHandler = (<any>window).StripeCheckout.configure({
      key: "pk_test_51LhYhHL4uVudLiXA5WwSojoMtx6m0rOM7fufOkPllausovqA0BhBJ0Id0ROuRb336IVLZMjshamhIIOlT1hFOAAS00zH00KnIN",
      locale: "auto",
      token: function (stripeToken: any) {
        console.log(stripeToken);
        paymentstripe(stripeToken);
      },
    });

    const paymentstripe = (stripeToken: any) => {
      this.checkout.makePayment(stripeToken).subscribe((data: any) => {
        console.log(data);
        if (data.data === "success") {
          this.success = true;
        } else {
          this.failure = true;
        }
      });
    };

    paymentHandler.open({
      name: "Coding Shiksha",
      description: "This is a sample pdf file",
      amount: amount * 100,
    });
  }

  intialScript() {
    if (!window.document.getElementById("stripe-script")) {
      const script = window.document.createElement("script");
      script.id = "stripe-script";
      script.type = "text/javascript";
      script.src = "../../../../assets/js/checkout.js";
      window.document.body.appendChild(script);
    }
  }

  invokeStripe() {
    if (!window.document.getElementById("stripe-script")) {
      const script = window.document.createElement("script");
      script.id = "stripe-script";
      script.type = "text/javascript";
      script.src = "https://checkout.stripe.com/checkout.js";
      script.onload = () => {
        this.paymentHandler = (<any>window).StripeCheckout.configure({
          key: "pk_test_51LhYhHL4uVudLiXA5WwSojoMtx6m0rOM7fufOkPllausovqA0BhBJ0Id0ROuRb336IVLZMjshamhIIOlT1hFOAAS00zH00KnIN",
          locale: "auto",
          token: function (stripeToken: any) {
            console.log(stripeToken);
          },
        });
      };

      window.document.body.appendChild(script);
    }
  }
}

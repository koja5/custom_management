import { Injectable } from "@angular/core";
import { HelpService } from "./help.service";

@Injectable({
  providedIn: "root",
})
export class PackLanguageService {
  constructor(private helpService: HelpService) {}

  dynamicPackLanguage(fields: Array<string>) {
    const language = this.helpService.getLanguage();
    const returnVal = {};

    fields.forEach((el: string) => {
      returnVal[el] = language[el];
    });
    return returnVal;
  }

  getLanguageForPatientRegistrationForm() {
    const language = this.helpService.getLanguage();
    return {
      subjectFormRegistration: language.subjectFormRegistration,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForPatientRegistrationForm:
        language.introductoryMessageForPatientRegistrationForm,
      openForm: language.openForm,
    };
  }

  getLanguageForCreatedPatientAccount() {
    const language = this.helpService.getLanguage();
    return {
      subjectCreatedPatientForm: language.subjectCreatedPatientForm,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForCreatedPatientAccount:
        language.introductoryMessageForCreatedPatientAccount,
      linkForLogin: language.linkForLogin,
      emailForLogin: language.emailForLogin,
      passwordForLogin: language.passwordForLogin,
    };
  }

  getLanguageForConfirmArrival() {
    const language = this.helpService.getLanguage();
    return {
      subjectConfirmArrival: language.subjectConfirmArrival,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForConfirmArrival:
        language.introductoryMessageForConfirmArrival,
      dateMessage: language.dateMessage,
      timeMessage: language.timeMessage,
      therapyMessage: language.therapyMessage,
      doctorMessage: language.doctorMessage,
      storeLocation: language.storeLocation,
      finalMessageForConfirmArrival: language.finalMessageForConfirmArrival,
      confirmArrivalButtonText: language.confirmArrivalButtonText,
    };
  }

  getLanguageForForgotMail() {
    const language = this.helpService.getLanguage();
    return {
      subjectForgotMail: language.subjectForgotMail,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForForgotMail:
        language.introductoryMessageForForgotMail,
      forgotMailButtonText: language.forgotMailButtonText,
    };
  }

  getLanguageForConfirmMail() {
    const language = this.helpService.getLanguage();
    return {
      subjectConfirmMail: language.subjectConfirmMail,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForConfirmMail:
        language.introductoryMessageForConfirmMail,
      confirmMailButtonText: language.confirmMailButtonText,
    };
  }

  getLanguageForInfoForApproveReservation() {
    const language = this.helpService.getLanguage();
    return {
      subjectApproveReservation: language.subjectApproveReservation,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForApproveReservation:
        language.introductoryMessageForApproveReservation,
      dateTime: language.dateMessage,
      timeMessage: language.timeMessage,
    };
  }

  getLanguageForInfoForDenyReservation() {
    const language = this.helpService.getLanguage();
    return {
      subjectDenyReservation: language.subjectDenyReservation,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForDenyReservation:
        language.introductoryMessageForDenyReservation,
        dateMessage: language.dateMessage,
      timeMessage: language.timeMessage,
    };
  }

  getLanguageForSendReminderViaEmail() {
    const language = this.helpService.getLanguage();
    return {
      subjectForReminderReservation: language.subjectForReminderReservation,
      initialGreeting: language.initialGreeting,
      dateMessage: language.dateMessage,
      timeMessage: language.timeMessage,
      therapyMessage: language.therapyMessage,
      doctorMessage: language.doctorMessage,
      storeLocation: language.storeLocation,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForReminderReservation:
        language.introductoryMessageForReminderReservation,
    };
  }

  getLanguageForMailingVaucher() {
    const language = this.helpService.getLanguage();
    return {
      subjectCreatedVaucher: language.subjectCreatedVaucher,
      subjectFormRegistration: language.subjectFormRegistration,
      initialGreeting: language.initialGreeting,
      finalGreeting: language.finalGreeting,
      signature: language.signature,
      thanksForUsing: language.thanksForUsing,
      websiteLink: language.websiteLink,
      ifYouHaveQuestion: language.ifYouHaveQuestion,
      emailAddress: language.emailAddress,
      notReply: language.notReply,
      copyRight: language.copyRight,
      introductoryMessageForCreatedVaucher:
        language.introductoryMessageForCreatedVaucher,
      openForm: language.openForm,
      linkForLogin: language.linkForLogin,
      emailForLogin: language.emailForLogin,
      passwordForLogin: language.passwordForLogin,
      amount: language.amount,
      date_redeemed: language.date_redeemed,
      customerBuys: language.customerBuys,
      customerConsumer: language.customerConsumer,
      user: language.user,
      comment: language.comment,
    };
  }
}

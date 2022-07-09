import { Component, ViewEncapsulation, Inject, ViewChild, OnInit } from '@angular/core';
import { HelpTopicModel } from 'src/app/models/help-topic-model';
import { FaqService } from 'src/app/service/faq.service';
import { Modal } from 'ngx-modal';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  @ViewChild("helpTopicModal") helpTopicModal: Modal;

  public language: any;
  public topics: HelpTopicModel[] = [];
  public topic = new HelpTopicModel();

  public operationMode = 'add';
  
  overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };

  constructor(private service: FaqService,
    private toastrService: ToastrService) {}

  ngOnInit() {  
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    this.loadTopics();
  }

  loadTopics(){
    this.service.getFaqTopics().subscribe((data)=>{
      this.topics=data
    });
  }
  
  addNewModal() {
    this.helpTopicModal.open();
    this.topic = new HelpTopicModel();
    this.topic.name = "";
    this.operationMode = 'add';
    // this.data.language = "";
  }  

  openEditTemplateModal(event): void {
    this.topic = event;
    this.operationMode = 'edit';
    this.helpTopicModal.open();
  }

  closeHelpTopicModal(): void {
    this.helpTopicModal.close();
  }

  createHelpTopic(): void{
    this.service.createFaqTopic(this.topic).then(result=>{
      this.loadTopics();
      this.closeHelpTopicModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateHelpTopic(){
    this.service.updateFaqTopic(this.topic).then(result=>{
      this.closeHelpTopicModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteHelpTopic(topic){
    this.service.deleteFaqTopic(topic).then(result=>{
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
        this.loadTopics();
      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, { timeOut: 7000, positionClass: "toast-bottom-right" });
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }
}

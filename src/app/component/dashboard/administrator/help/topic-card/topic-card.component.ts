import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelpTopicModel } from 'src/app/models/help-topic-model';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-topic-card',
  templateUrl: './topic-card.component.html',
  styleUrls: ['./topic-card.component.scss']
})
export class TopicCardComponent implements OnInit {
  @Input() topic: HelpTopicModel;
  @Output() editEmmiter = new EventEmitter<any>();
  @Output() deleteEmmiter = new EventEmitter<any>();

  public userSuperAdmin=false;

  constructor(private router: Router,
    private helpService: HelpService) { }

  ngOnInit() {
    this.userSuperAdmin = this.helpService.getMe()==4 && this.helpService.getType()==0;
  }

  public generateLink(link) {
    this.router.navigate([link, this.topic.id]);
  }

  public editHelpTopic(){
    this.editEmmiter.emit(this.topic);
  }

  public deleteHelpTopic(){
    this.deleteEmmiter.emit(this.topic);
  }

  public getIconClass(icon){
    return "fa "+icon;
  }
}
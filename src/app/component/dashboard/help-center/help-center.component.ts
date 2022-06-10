
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RichTextEditorComponent, ToolbarService, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
import { HtmlEditorService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { isNullOrUndefined as isNOU } from '@syncfusion/ej2-base';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService]
})
export class HelpCenterComponent implements OnInit {
    ngOnInit(): void {
        this.rteObj = new RichTextEditorComponent;
        this.rteObj.value = ''
    }
    
    @ViewChild('blogRTE')
    public rteObj: any;
    
    @ViewChild('rteSubmit')
    public buttonEle: any;
    
    @ViewChild('rteCancel')
    public cancelEle: any;
    
    public cancelClick = (): void => {
        this.rteObj.refresh();
        this.rteObj.value = '';
    }

    public submitClick = (): void => {
        let empCount = 0;
        const answerElement: HTMLElement = this.rteObj.contentModule.getEditPanel() as HTMLElement; 
        const comment: string = answerElement.innerHTML;
        const empList: string[] = ['emp1', 'emp2', 'emp3'];
        const nameListList: string[] = ['Anne Dodsworth', 'Janet Leverling', 'Laura Callahan'];
        if (comment !== null && comment.trim() !== '' && (answerElement.innerText.trim() !== '' ||
        !isNOU(answerElement))) {
            const answer: HTMLElement = document.querySelector('.answer') as HTMLElement;
            const cloneAnswer: HTMLElement = answer.cloneNode(true) as HTMLElement;
            const authorName: HTMLElement = cloneAnswer.querySelector('.authorname') as HTMLElement;
            const logo: HTMLElement = cloneAnswer.querySelector('.logos') as HTMLElement;
            logo.classList.remove('logos');
            if (empCount < 3) {
                logo.classList.add(empList[empCount]);
                authorName.innerHTML = nameListList[empCount];
                empCount++;
            } else {
                logo.classList.add('logo');
                authorName.innerHTML = 'User';
            }
            const timeZone: HTMLElement = cloneAnswer.querySelector('.detailsAnswer') as HTMLElement;
            const day: string = this.getMonthName(new Date().getMonth()) + ' ' + new Date().getDate();
            let hr: string = new Date().getHours() + ':' + new Date().getMinutes();
            if (new Date().getHours() > 12) {
                hr = hr + ' PM';
            } else {
                hr = hr + ' AM';
            }
            timeZone.innerHTML = 'Answered on ' + day + ', ' + new Date().getFullYear() + ' ' + hr;
            const postContent: HTMLElement = cloneAnswer.querySelector('.posting') as HTMLElement;
            postContent.innerHTML = comment;
            const postElement: HTMLElement = document.querySelector('.answerSection') as HTMLElement;
            postElement.appendChild(cloneAnswer);
            const countEle: HTMLElement = document.querySelector('.answerCount') as HTMLElement;
            let count: number = parseInt(countEle.innerHTML);
            count = count + 1;
            countEle.innerHTML = count.toString() + ' Answers';
            this.rteObj.refresh();
            this.rteObj.value = '';
        }
    }
    
    public getMonthName(index: number): string {
        const month: string[] = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return month[index];
    }
}
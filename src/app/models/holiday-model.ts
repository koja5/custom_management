export class HolidayModel {
    id: number;
    Subject: string;
    StartTime: Date;
    EndTime: Date;
    templateId: number;
    clinicId: number;

    constructor() {
        this.Subject = '';
        this.StartTime = new Date();
        this.EndTime = new Date();
        this.templateId = undefined;
        this.clinicId = undefined;

    }
}

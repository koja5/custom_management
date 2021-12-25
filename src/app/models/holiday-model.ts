export class HolidayModel {
    id: number;
    Subject: string;
    StartTime: Date;
    EndTime: Date;
    category: string;
    superAdminId: string;

    constructor(superAdminId: string) {
        this.id = 1;
        this.Subject = '';
        this.category = 'holiday';
        this.StartTime = new Date();
        this.EndTime = new Date();
        this.superAdminId = superAdminId;
    }
}

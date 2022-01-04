export class HolidayModel {
    id: number;
    Subject: string;
    StartTime: Date;
    EndTime: Date;
    category: string;
    userId: string;

    constructor(superAdminId: string) {
        this.Subject = '';
        this.category = 'holiday';
        this.StartTime = new Date();
        this.EndTime = new Date();
        this.userId = superAdminId;
    }
}

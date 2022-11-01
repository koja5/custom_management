import { Observable, Subject } from "rxjs";

export interface FormGuardData {
    isDataSaved$: Subject<boolean>;
    isFormDirty: boolean;
    openConfirmModal();
}
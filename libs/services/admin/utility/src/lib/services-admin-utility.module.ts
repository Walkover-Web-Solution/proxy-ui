import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
})
export class ServicesAdminUtilityModule {}

@Injectable({
    providedIn: 'root',
})
export class UtilityService {
    /**
     * Filters the request by mandatory key mapping
     *
     * @param {*} formValue Form value on which filtering is to be performed
     * @param {*} mandatoryKeyMapping Mandatory key mapping with filtering will take place
     * @return {*} Filtered form value
     * @memberof UtilityService
     */
    filterRequestByMandatoryMapping(formValue: any, mandatoryKeyMapping: any): any {
        Object.keys(formValue).forEach((key) => {
            if (
                mandatoryKeyMapping.hasOwnProperty(key) &&
                ((typeof formValue[key] !== 'object' && isNaN(parseFloat(formValue[key]))) ||
                    (typeof formValue[key] === 'object' && !formValue[key]))
            ) {
                // Mandatory keys found but thier value doesn't exists, delete the mapping from form value
                delete formValue[key];
                delete formValue[mandatoryKeyMapping[key]];
            } else if (!formValue[key] && isNaN(parseFloat(formValue[key]))) {
                delete formValue[key];
            }
        });
        return formValue;
    }
}

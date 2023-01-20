import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-stepper',
  template: `
    <mat-horizontal-stepper>
      <mat-step *ngFor="let step of field.fieldGroup; let index = index; let last = last">
      
        <ng-template matStepLabel>{{ step.label }}</ng-template>
        <formly-field [field]="step"></formly-field>

        <div>
          <button matStepperPrevious *ngIf="index !== 0" class="btn btn-primary" type="button">Back</button>

          <button matStepperNext *ngIf="!last" class="btn btn-primary" type="button" [disabled]="!isValid(step)">
            Next
          </button>

          <button *ngIf="last" class="btn btn-primary" [disabled]="!form.valid" type="submit">Submit</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class FormlyFieldStepper extends FieldType {
    defaultOptions = {
        defaultValue: {},
      };
    
      formSteps = {};
    
      getStepForm(i, field: FormlyFieldConfig) {
        if (!this.formSteps[i]) {
          console.log(this.formSteps[i]);
          this.formSteps[i] = new FormGroup(
            field.fieldGroup.reduce<any>((form, f) => {
              form[Array.isArray(f.key) ? f.key.join('.'): f.key] = f.formControl;
              return form;
            }, {})
          );
        }
    
        return this.formSteps[i];
      }
      
      isValid(field: FormlyFieldConfig): boolean {
        if (field.key) {
          return field.formControl.valid;
        }
    
        console.log(field.fieldGroup);
        return field.fieldGroup ? field.fieldGroup.every((f) => this.isValid(f)) : true;
      }
    }
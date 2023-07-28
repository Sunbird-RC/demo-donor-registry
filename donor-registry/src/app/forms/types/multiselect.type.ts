import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-ng-select',
  styleUrls: ["../forms.component.scss"],
  template: `
  <span class="fw-bold p12">{{ to.label }} 
  <span *ngIf="to.required && to.hideRequiredMarker !== true">*</span>
  </span>
    <ng-select [items]="to.options"
      [bindLabel]="labelProp"
      [bindValue]="valueProp"
      [multiple]="to.multiple"
      [placeholder]="to.placeholder? to.placeholder : 'Select'"
      [formControl]="formControl">
    </ng-select>
  `,
})
export class FormlyFieldNgSelect extends FieldType {
  get labelProp(): string { return this.to.labelProp || 'label'; }
  get valueProp(): string { return this.to.valueProp || 'value'; }
  get groupProp(): string { return this.to.groupProp || 'group'; }
  
}
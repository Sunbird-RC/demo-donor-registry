import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-template-type',
  styleUrls: ["../forms.component.scss"],
  template: `
  <span>{{ to.label }}</span> <br>`,
})
export class FormlyTemplateType extends FieldType {
  get labelProp(): string { return this.to.labelProp || 'label'; }

}
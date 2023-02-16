import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-select-all-checkbox',
  styleUrls: ["../forms.component.scss"],
  template: `
 
    <span class="fw-bold p12">{{ to.label }}*</span> <br>
  
    
    <ul class="d-flex">
    <div>
    <input type="checkbox" class="form-check-input fs-12" [checked]="allChecked" (change)="setAll($event.checked)"> 
    <label class="form-check-label fs-12 pt-1 pl-1"> Select All </label>
    </div>
    <li *ngFor="let option of to.options; let i = index" class="select-all-checkbox-in-row remove-ul-style">
    <input 
    type="checkbox"
    class="form-check-input"
    [id]="id + '_' + i"
    class="form-check-input"
    [value]="option.value"
    [checked]="isChecked(option)"
    [formlyAttributes]="field"
    [disabled]="formControl.disabled || option.disabled"
    (change)="onChange(option.value, $any($event.target).checked)"
  />
  <label class="form-check-label fs-12 pl-1" [for]="id + '_' + i">
    {{ option.label }}
  </label>
    
    
  </li>
  </ul>

  `,
})
export class FormlyFieldNgSelectAllCheckbox extends FieldType {
  allChecked: boolean = false;
  onChange(value: any, checked: boolean) {
    this.allChecked = false;
    this.formControl.markAsDirty();
    if (this.to.type === 'array') {
      this.formControl.patchValue(
        checked
          ? [...(this.formControl.value || []), value]
          : [...(this.formControl.value || [])].filter((o) => o !== value),
      );
    } else {
      this.formControl.patchValue({ ...this.formControl.value, [value]: checked });
    }
    this.formControl.markAsTouched();
  }

  isChecked(option: any) {

  
   
    const value = this.formControl.value;

    return value && (this.to.type === 'array' ? value.indexOf(option.value) !== -1 : value[option.value]);
  }

  setAll(checked: boolean)
  {
    this.allChecked = !this.allChecked;
   let self = this;

     this.to.options.forEach(function (key) {

     if (self.to.type === 'array') {
      self.formControl.patchValue(
        self.allChecked
           ? [...(self.formControl.value || []), key['value']]
           : [...(self.formControl.value || [])].filter((o) => o !== key['value']),
       );
     } else {
       self.formControl.patchValue({ ...this.formControl.value, [key['value']]: self.allChecked });
     }
    
     })
  }
}

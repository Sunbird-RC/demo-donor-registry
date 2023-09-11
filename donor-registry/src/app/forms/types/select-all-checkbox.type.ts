import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-select-all-checkbox',
  styleUrls: ["../forms.component.scss"],
  template: `
 
    <span class="fw-bold p12">{{ to.label }}</span> <br>
  
    
    <ul class="row mt-2 checkbox-list-style">
    <div class="col-lg-2 col-sm-6">
    <input type="checkbox" class="form-check-input fs-12" [checked]="allChecked" (change)="setAll($event.checked)"> 
    <label class="form-check-label fs-12 pt-1 pl-1"> All {{ to.label }} </label>
    </div>
    <li *ngFor="let option of to.options; let i = index" class="select-all-checkbox-in-row remove-ul-style col-lg-2 col-sm-6 mt-1">
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
  ngOnInit(): void { 
    if(this.formControl.value){
    if(Object.keys(this.formControl.value).length == Object.keys(this.to.options).length)
    {
      this.setAll(true);
    }
   }
  }
  allChecked: boolean = false;
  onChange(value: any, checked: boolean) {
    this.allChecked = false;
    this.formControl.markAsDirty();
    if (this.to.type === 'array') {
      this.formControl.patchValue(
        checked
          ? [...new Set(this.formControl.value || []), value]
          : [...new Set(this.formControl.value || [])].filter((o) => o !== value),
      );
    } else {
      this.formControl.patchValue({ ...new Set(this.formControl.value), [value]: checked });
    }
    this.formControl.markAsTouched();
    if(Object.keys(this.formControl.value).length == Object.keys(this.to.options).length)
    {
      this.setAll(true);
    }
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
           ? [...new Set(self.formControl.value || []), key['value']]
           : [...new Set(self.formControl.value || [])].filter((o) => o !== key['value']),
       );
     } else {
       self.formControl.patchValue({ ...new Set(this.formControl.value), [key['value']]: self.allChecked });
     }
    
     })
  }
}

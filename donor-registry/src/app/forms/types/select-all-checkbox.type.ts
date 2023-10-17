import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-select-all-checkbox',
  styleUrls: ["../forms.component.scss"],
  template: `
 
    <span class="fw-bold p12">{{ props.label }}</span> <br>
  
    
    <ul class="row mt-2 checkbox-list-style">
    <div class="col-lg-2 col-sm-6">
    <input type="checkbox" class="form-check-input fs-12" [checked]="allChecked" (change)="setAll($event.checked)"> 
    <label class="form-check-label fs-12 pt-1 pl-1"> All {{ props.label }} </label>
    </div>
    <li *ngFor="let option of props.options; let i = index" class="select-all-checkbox-in-row remove-ul-style col-lg-2 col-sm-6 mt-1">
    <input 
    type="checkbox"
    class="form-check-input"
    [id]="id + '_' + i"
    class="form-check-input"
    [value]="option.value"
    [checked]="isChecked(option)"
    [formlyAttributes]="field"
    [formControl] = "formControl"
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
  formCtr: FormControl<any>;
 

  constructor( ){
    super();
    this.formCtr = new FormControl();
    
  }

  ngOnInit(): void { 
    if(this.formCtr.value && this.props.options){
    if(Object.keys(this.formCtr.value).length == Object.keys(this.props.options).length)
    {
      this.setAll(true);
    }
   }
  }
  allChecked: boolean = false;
  onChange(value: any, checked: boolean) {
    this.allChecked = false;
    this.formCtr.markAsDirty();
    if (this.props.type === 'array') {
      this.formCtr.patchValue(
        checked
          ? [...new Set(this.formCtr.value || []), value]
          : [...new Set(this.formCtr.value || [])].filter((o) => o !== value),
      );
    } else {
      this.formCtr.patchValue({ ...new Set(this.formCtr.value), [value]: checked });
    }
    this.formCtr.markAsTouched();
    if(Object.keys(this.formCtr.value).length == Object.keys(this.props.options).length)
    {
      this.setAll(true);
    }
  }

  isChecked(option: any) {

    const value = this.formCtr.value;

    // if(value != null)
    return value && (this.props.type === 'array' ? value.indexOf(option.value) !== -1 : value[option.value]);
  }

  setAll(checked: boolean)
  {
    
    this.allChecked = !this.allChecked;
   let self = this;

     this.props.options.forEach(function (key) {

     if (self.props.type === 'array') {
      self.formCtr?.patchValue(
        self.allChecked
           ? [...new Set(self.formCtr.value || []), key['value']]
           : [...new Set(self.formCtr.value || [])].filter((o) => o !== key['value']),
       );
     } else {
       self.formCtr?.patchValue({ ...new Set(this.formCtr.value), [key['value']]: self.allChecked });
     }
    
     })
  }
}

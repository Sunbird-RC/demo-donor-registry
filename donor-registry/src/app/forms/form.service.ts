import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormService {
  public form: FormGroup = new FormGroup({}, { updateOn: 'blur' });
  public model: any = {};
  public options: FormlyFormOptions = {
    formState: {
      errors$: new BehaviorSubject<any>(null),
    }
  };

  public getErrors(): Observable<any> {
    return this.options.formState.errors$.asObservable();
  }

  public setErrors(errors: any): void {
    this.options.formState.errors$.next(errors);
    Object.entries(errors).forEach(([key, value]: any) => {
      console.log(key, value, this.form, this.form.get(key));
      const formControl = this.form.get(key);
      formControl.setErrors({ server: value });
    });
  }
}

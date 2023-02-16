import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  GeneralService,
  getDonorServiceHost,
} from '../../services/general/general.service';
@Component({
  selector: 'verify-identity-code',
  styleUrls: ['../forms.component.scss'],
  template: `
    <div>
      <span class="fw-bold p12">{{ to.label }}*</span> <br />
      <div class="d-flex">
        <input
          id="{{ field.key }}"
          [formControl]="formControl"
          [formlyAttributes]="field"
          pattern="[9]{1}[1]{1}[0-9]{12}"
          [ngClass]="isIdentityNo ? 'form-control' : 'form-control is-invalid'"
          required
        />
        <span
          class="text-primary fw-bold p-1 p14 pointer"
          *ngIf="!isVerify"
          (click)="verifyOtp(field.key)"
          data-toggle="modal"
          data-target="#verifyOtp"
          >Verify</span
        >
        <span class="text-success verifyIcon fw-bold p-1" *ngIf="isVerify">
          <i class="fa fa-check-circle" aria-hidden="true"></i>
        </span>
      </div>
      <div class="p12">
        {{ 'LINK_TO_ABHA' | translate }}
        <a href="http://healthidsbx.abdm.gov.in/" target="_blank">{{
          'LINK' | translate
        }}</a>
      </div>
      <br />

      <div
        *ngIf="!canRegister || isIdentityNo"
        class="modal fade"
        id="verifyOtp"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div *ngIf="!canRegister" class="modal-dialog" role="document">
          <div class="p-4 modal-content">
            <div class="modal-body text-center">
              <h3 class="fw-bold mb-3">Cannot register for Pledge</h3>
              <p class="p14">You are not eligible to pledge for donation.</p>
              <p class="p14">
                Only individuals of age 18 year or above can pledge.
              </p>
              <a href="http://">Click here for more information</a>
              <br />
              <br />
              <button
                m
                type="button"
                class="btn btn-primary-notto btn-style w-100 submit-button mb-2"
                (click)="previous()"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="isIdentityNo" class="modal-dialog" role="document">
          <div class="p-4 modal-content">
            <div class="modal-body">
              <h3 class="fw-bold mb-3">Confirm OTP</h3>
              <p class="p14">
                Enter the code sent to mobile number associated with your ID
              </p>
              <span class="fw-bold p12"> Enter OTP</span> <br />
              <input
                type="input"
                [(ngModel)]="optVal"
                name="optVal"
                class="form-control"
              />
              <br />
              <button
                m
                type="button"
                (click)="submitOtp()"
                class="btn btn-primary-notto btn-style w-100 submit-button mb-2"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
        <button
          id="openModalButton"
          [hidden]="true"
          data-toggle="modal"
          data-
          target="#verifyOtp"
        >
          Open Modal
        </button>
        <button
          id="closeModalButton"
          [hidden]="true"
          data-toggle="modal"
          data-target="#verifyOtp"
          class="btn btn-default"
          data-dismiss="modal"
        >
          Close
        </button>
      </div>
    </div>
  `,
})
export class VerifyIndentityCode extends FieldType {
  data: any;
  res = 'Verify';
  isVerify: boolean = false;
  optVal: string;
  number: string;
  isIdentityNo: boolean = true;
  canRegister: boolean = true;
  transactionId: string;
  model1: any;
  errorMessage: any;
  data1: any;
  // @Output() sendData1 = new EventEmitter<any>();
  model2: any;
  constructor(private http: HttpClient, public generalService: GeneralService) {
    super();
  }

  ngOnInit(): void {
    localStorage.removeItem('form_value');
  }

  async verifyOtp(value) {
    this.number = (<HTMLInputElement>document.getElementById(value)).value;
    if (this.number) {
      this.model1 = {
        healthId: this.number,
      };

      await this.http
        .post<any>(`${getDonorServiceHost()}/auth/sendOTP`, this.model1)
        .subscribe({
          next: (data) => {
            console.log(data);
            this.transactionId = data.txnId;
          },
          error: (error) => {
            this.errorMessage = error.message;

            if (
              localStorage.getItem('formtype') != 'recipient' &&
              localStorage.getItem('formtype') != 'livedonor'
            ) {
              alert(this.errorMessage);
            }

            this.isIdentityNo = true;
            console.error('There was an error!', error);
          },
        });
    } else {
      this.isIdentityNo = false;
    }
  }

  previous = () => {
    window.history.back();
  };

  submitOtp() {
    if (this.optVal) {
      this.model2 = {
        transactionId: this.transactionId,
        otp: this.optVal,
      };

      this.isVerify = true;
      localStorage.setItem('isAutoFill',"true")
      
      this.http
        .post<any>(`${getDonorServiceHost()}/auth/verifyOTP`, this.model2)
        .subscribe({
          next: (data) => {
            this.data1 = data;
            let dayOfBirth = data?.dayOfBirth;
            let monthOfBirth = data?.monthOfBirth;
            let yearOfBirth = data?.yearOfBirth;
            let dateFull = `${monthOfBirth}/${dayOfBirth}/${yearOfBirth}`;
            let dob = new Date(dateFull);
            let month_diff = Date.now() - dob.getTime();
            let age_dt = new Date(month_diff);
            let year = age_dt.getUTCFullYear();
            let age = Math.abs(year - 1970);

            if (age < 18) {
              this.canRegister = false;
              this.isIdentityNo = false;
            } else {
              const healthIdNumber = this.data1.healthIdNumber.replaceAll(
                '-',
                ''
              );
              localStorage.setItem(healthIdNumber, JSON.stringify(this.data1));
              localStorage.setItem('form_value', JSON.stringify(this.data1));
              localStorage.setItem('isVerified', JSON.stringify(this.isVerify));
              document.getElementById('closeModalButton').click();
              setTimeout(() => {
                (document.getElementById('abha') as any).focus();
              }, 1000);
            }
          },
          error: (error) => {
            this.errorMessage = error.message;
            alert(this.errorMessage);
            this.isIdentityNo = true;
            console.error('There was an error!', error);
          },
        });
    }
  }
}

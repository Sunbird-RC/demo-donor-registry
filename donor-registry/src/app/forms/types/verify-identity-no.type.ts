
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {GeneralService, getDonorServiceHost} from '../../services/general/general.service';
@Component({
  selector: 'verify-identity-code',
  styleUrls: ["../forms.component.scss"],
  template: `
      <div>
        <span class="fw-bold p12">{{ to.label }}*</span> <br>
         <div class="d-flex">
              <input id="number"
              [formControl]="formControl"
              [formlyAttributes]="field"[(ngModel)]="number" type="input" [ngClass]="(isIdentityNo) ? 'form-control' : 'form-control is-invalid'" />
              <span class="text-primary fw-bold p-1 p14" *ngIf="!isVerify"  (click)="verifyOtp()" data-toggle="modal" data-target="#verifyOtp">Verify</span>
              <span class="text-success fw-bold p-1" *ngIf="isVerify">
                  <div>
                        <img style="width: 20px; height: 18px;"  src="data:image/png;base64,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">
                   </div>

              </span>
       </div>
       <div class="p12">{{'LINK_TO_ABHA' | translate}} <a href="https://healthid.ndhm.gov.in/register" target="_blank">{{'LINK' | translate}}</a></div> <br>
            
            <div *ngIf="isIdentityNo" class="modal fade" id="verifyOtp" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="p-4 modal-content">
                      <div class="modal-body">
                        
                          <h3 class="fw-bold mb-3">Confirm OTP</h3>
                          <p class="p14">Enter the code sent to mobile number associated with your ID </p>
                          <span class="fw-bold p12"> Enter OTP</span> <br>
                          <input type="input" [(ngModel)]="optVal" name="optVal" class="form-control" />
                          <button data-dismiss="modal" class="btn my-3 w-100 fw-bold text-dark p12 btn-bg nav-link-color btn-sec-bg mb-2">Please enter OTP sent to registered number</button> <br>
                          <button id=""  data-toggle="modal" data-dismiss="modal"m type="submit" (click)="submitOtp()" class="btn btn-primary w-100 submit-button mb-2">Verify</button>
                      
                      </div>
                  </div>
                </div>
            </div>
    </div>
    `,
})

export class VerifyIndentityCode extends FieldType {
  data: any;
  res = "Verify";
  isVerify: boolean = false;
  optVal: string;
  number: string;
  isIdentityNo: boolean = true;
  transactionId:string
  model1:any;
  errorMessage:any;
  data1:any;
 // @Output() sendData1 = new EventEmitter<any>();
  model2:any;
  constructor( private http: HttpClient, public generalService: GeneralService) {
    super();
  }
  ngOnInit(): void {
  }


  async verifyOtp(){
    if (this.number) {
      this.isIdentityNo = true;
     
   
      this.model1 = {
        "healthId": this.number
     
    }
      await  this.http.post<any>(`${getDonorServiceHost()}/auth/sendOTP`, this.model1).subscribe({
        next: data => {
          console.log(data);
            this.transactionId = data.txnId;
        },
        error: error => {
            this.errorMessage = error.message;

            if(localStorage.getItem('formtype') != 'recipient' &&  localStorage.getItem('formtype') != 'livedonor')
            {
              alert(this.errorMessage);
            }
           
            this.isIdentityNo = true;
            console.error('There was an error!', error);
        }
    })

    }else{
      this.isIdentityNo = false;
    }
}

  submitOtp() {
    if (this.optVal) {
      
      this.model2={
        "transactionId":this.transactionId,
        "otp":this.optVal
      }

      this.isVerify = true;

      this.http.post<any>(`${getDonorServiceHost()}/auth/verifyOTP`, this.model2).subscribe({
        next: data => {
          console.log(data);
            this.data1 = data;
          //this.sendData1.emit(this.data1);
          const healthIdNumber = this.data1.healthIdNumber.replaceAll('-','');
          // console.log(this.data1.healthIdNumber);
         localStorage.setItem(healthIdNumber, JSON.stringify(this.data1));
         
         localStorage.setItem('isVerified', JSON.stringify(this.isVerify));

        },
        error: error => {
            this.errorMessage = error.message;
            if(localStorage.getItem('formtype') != 'recipient' &&  localStorage.getItem('formtype') != 'livedonor')
            {
              alert(this.errorMessage);
            }
           
            this.isIdentityNo = true;
            console.error('There was an error!', error);
        }
    })
    
    }
  }

}


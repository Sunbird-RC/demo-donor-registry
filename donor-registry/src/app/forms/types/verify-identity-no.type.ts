import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;
import {
  GeneralService,
  getDonorServiceHost,
} from '../../services/general/general.service';
@Component({
  selector: 'verify-identity-code',
  styleUrls: ['../forms.component.scss'],
  templateUrl: './verify-identity-no.type.html', 
})
export class VerifyIndentityCode extends FieldType {
  data: any;
  res = 'Verify';
  isVerify: boolean = false;
  optVal: string;
  number: string;
  isIdentityNo: boolean = true;
  canRegister: boolean = true;
  isGotErr: boolean = false;
  isConfirmPopup : boolean = false;
  transactionId: string;
  model1: any;
  errorMessage: any;
  data1: any;
  // @Output() sendData1 = new EventEmitter<any>();
  model2: any;
 signupForm: boolean;
  isAbhaNoErr: boolean = false;
  customErrCode: string;
  err401: boolean = false;
  err429: boolean = false;
  showConfirmPopup:boolean = false;

  constructor(private http: HttpClient, public generalService: GeneralService,public router: Router,) {
    super();
  }

  ngOnInit(): void {
    if(this.router.url == "/form/signup"){
      this.signupForm = true;
     }
    localStorage.removeItem('form_value');
    if (localStorage.getItem('isVerified') === 'true') {
      this.isVerify = true;
    }
  }

 async verifyOtp(value) {
    this.isIdentityNo = true;
    this.canRegister = true;
    this.isGotErr = false;
    this.optVal = "";
    this.number = (<HTMLInputElement>document.getElementById(value)).value;

    if (this.number && this.number.length == 14) {
      this.model1 = {
        healthId: this.number,
      };

      await this.http
        .post<any>(`${getDonorServiceHost()}/auth/sendOTP`, this.model1)
        .subscribe({
          next: (data) => {
            this.isGotErr = false;
            this.isIdentityNo = true;
            this.isConfirmPopup = true;
            this.showConfirmPopup = true;
            console.log(data);
            this.transactionId = data.txnId;
          },
          error: (error) => {

            this.checkErrType(error);

            if (
              localStorage.getItem('formtype') != 'recipient' &&
              localStorage.getItem('formtype') != 'livedonor'
            ) {
              // alert(this.errorMessage);
            }
            this.isGotErr = true;
            this.isAbhaNoErr = true;


          },
        });
    } else {
      this.isIdentityNo = false;
      let dateSpan = document.getElementById('abhamessage');
      dateSpan.classList.add('text-danger');
      dateSpan.innerText = "Please enter valid abha number";
      document.getElementById('abha').classList.add('is-invalid');
      setTimeout(() => {
        this.closePops('#verifyOtp');
      }, 1000);
     
    }
  }

  previous = () => {
    window.history.back();
  };

  checkErrType(err)
  {

     this.errorMessage = err?.error['message'];
    if(this.errorMessage.includes('30'))
    {
      this.customErrCode = '420';
     
    }
    if(this.errorMessage.includes('enter valid ABHA'))
    {
      this.customErrCode = '427';
     
    }


  }

  submitOtp() {
    if (this.optVal) {
      this.model2 = {
        transactionId: this.transactionId,
        otp: this.optVal,
      };

      localStorage.setItem('isAutoFill', 'true');

      this.http
        .post<any>(`${getDonorServiceHost()}/auth/verifyOTP`, this.model2)
        .subscribe({
          next: (data) => {
            this.isIdentityNo = true;
            this.isVerify = true;
  	        this.isGotErr = false;
            let dateSpan = document.getElementById('abhamessage');
            dateSpan.classList.remove('text-danger');
            dateSpan.innerText = "";
            document.getElementById('abha').classList.remove('is-invalid');
            (document.getElementById('abha') as any).disabled = true;

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
              this.isGotErr = true;
              this.err401 = false;
              this.isVerify = false;
            } else {
              const healthIdNumber = this.data1.healthIdNumber.replaceAll(
                '-',
                ''
              );
              localStorage.setItem(healthIdNumber, JSON.stringify(this.data1));
              localStorage.setItem('form_value', JSON.stringify(this.data1));
              localStorage.setItem('isVerified', JSON.stringify(this.isVerify));
            
              this.closePops('#verifyOtp');
              setTimeout(() => {
                (document.getElementById('abha') as any).focus();
              }, 1000);
            }
          },
          error: (error) => {
            this.errorMessage = error?.error['message'];
            this.customErrCode = (error?.error['status'])? error?.error['status'] : "";
            if( error?.error['status'] == '401')
            {
              this.isGotErr = true;
              this.isAbhaNoErr = false;
              this.isIdentityNo = true;
              this.err401 = true;
              this.err429 = false;
              this.optVal = "";
            }
            if( error?.error['status'] == '429')
            {
              this.isGotErr = true;
              this.isAbhaNoErr = false;
              this.isIdentityNo = true;
              this.err401 = false;
              this.err429 = true;

            }
         
            console.error('There was an error!', error);
          },
        });
    }
  }

  closePops(id) {
  $(id).modal('hide');
  Array.from(document.querySelectorAll('.modal-backdrop')).forEach((el) => el.classList.remove('modal-backdrop'));
  }
}

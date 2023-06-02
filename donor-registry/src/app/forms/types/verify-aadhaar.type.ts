import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralService, getDonorServiceHost } from '../../services/general/general.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'verify-aadhaar',
  styleUrls: ['../forms.component.scss'],
  templateUrl: './verify-aadhaar.type.html',
})
export class VerifyAadhaar extends FieldType {
  isVerify: boolean = false;
  aadhaarnumber: string;
  transactionId: any;
  optVal: any;
  mobileNumber:number;
  linkedAbhaList: any;
  isAllAbhaRegister: boolean = false;
  selectedProfile: any;
  selected: boolean = false;
  dataObj: any;
  isNumberValid: boolean = true;
  errorMessage: any;
  customErrCode: string = '';
  err401: boolean = false;
  noLinkedAbha: boolean = false;
  fieldKey: any;
  canRegister: boolean = true;
  incorrectOtpMultipleTime: boolean = false;
  isOpen: boolean = true;
  err422: boolean;
  signupForm: boolean = false;
  consentGiven: boolean = true;
  btnenable: boolean;
  mobileTxnId: any;
  verifyoptVal: any;
  verifymobileTxnId: any;
  mobileNo: any;
  correctAadhar: boolean = false;
  err409: boolean = false;
errHeading: string;


  constructor(private http: HttpClient, public generalService: GeneralService, public router: Router,
    public translate: TranslateService) {
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

  //Check whether consent is provided or not
  checkValue(event:any){
    this.consentGiven = event.target.checked;
  }

  async verifyOtp(fieldKey) {
    this.fieldKey = fieldKey;

    this.aadhaarnumber = (<HTMLInputElement>document.getElementById(fieldKey)).value;

    if (this.aadhaarnumber && this.aadhaarnumber.length == 12) {   
      let param = {
        aadhaar: this.aadhaarnumber,
      };
      this.http
        .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/generateOtp`, param)
        .subscribe({
          next: (data) => {
            this.transactionId = data.txnId;
            this.OtpPopup('verifyOtpModal');
           // this.OtpPopup();
           
          },
          error: (error) => {
            //  (<HTMLInputElement>document.getElementById(fieldKey)).value = "";
            this.isNumberValid = false;
      let dateSpan = document.getElementById('aadhaarmsg');
      dateSpan.classList.add('text-danger');
      dateSpan.innerText = "Please enter valid aadhaar number";
      document.getElementById('mobileno').classList.add('is-invalid');
            console.log(error);
          }
        });
    } else {
      this.isNumberValid = false;
      let dateSpan = document.getElementById('aadhaarmsg');
      dateSpan.classList.add('text-danger');
      dateSpan.innerText = "Please enter valid aadhaar number";
      document.getElementById('mobileno').classList.add('is-invalid');
        
    }
  }

  onItemChange(data) {
    this.selectedProfile = data;
    this.selected = true;
  }

  checkErrType(err) {

    this.errorMessage = err?.error['message'];
    if (this.errorMessage != undefined && this.errorMessage.includes('30')) {
      this.customErrCode = '422';
    } else if (this.errorMessage != undefined && this.errorMessage.includes('enter valid mobile')) {
      this.customErrCode = '427';
    } else {
      this.customErrCode = '';
    }

  }


  getProfile() {
    let param = {
      "healthId": this.selectedProfile.healthIdNumber,
      "transactionId": this.linkedAbhaList.txnId,
      "token": this.linkedAbhaList.token
    };

    this.http
      .post<any>(`${getDonorServiceHost()}/abha/profile`, param)
      .subscribe({
        next: (data) => {
                this.setValues(data);

        },
        error: (error) => {
          this.errorMessage = error?.error['message'];
          this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
          if (error?.error['status'] == '401') {
            this.err401 = true;
          }
          console.error('There was an error!', error);
        },
      });
  }


  submitOtp() {
   
    if (this.optVal) {
      let param = {
        txnId: this.transactionId,
        otp: this.optVal,
      };

      localStorage.setItem('isAutoFill', 'true');

      this.http
        .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/verifyOtp`, param)
        .subscribe({
          next: (data) => {
            console.log(data);
            if(data?.txnId){
              this.mobileTxnId =data.txnId;
              this.closePops('verifyOtpModal');
              this.isVerify = true;
              this.openPopup('mobilePopup');

            }else{
              this.closePops('verifyOtpModal');
              this.closeAllModal();
              this.setValues(data);
            }
           

          },
          error: (error) => {

            this.errorMessage = error?.error['message'];
            this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
         
            if (error?.error['status'] == '401') {
              this.err401 = true;
            }
            if (error?.error['status'] == '409') {
              this.err409 = true;
              this.errHeading = 'Already Pledged';
              this.closePops('verifyOtpModal');
              this.errorMessage = 'To download the pledge certificate, please login with ABHA number or mobile number'
            }else  if (this.customErrCode == '422') {
              this.errHeading = 'Aadhaar number entered multiple times';
              this.closePops('verifyOtpModal');
              this.openPopup('errorMessagePop');
            }

            console.error('There was an error!', error);
          },
        });
    }

    let clickCount = 0;
    const button = document.querySelector('#ifIncorrectOTP');
    button.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 3) {
        this.incorrectOtpMultipleTime = true;
        this.closePops('verifyOtpModal');
      }
    });
  }
    setValues(data) {
        console.log(data);
        let dateSpan = document.getElementById('mobmessage');
        dateSpan.classList.remove('text-danger');
        dateSpan.innerText = "";
        document.getElementById('aadhaar').classList.remove('is-invalid');
        (document.getElementById('aadhaar') as any).disabled = true;

        this.dataObj = data;
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
          this.canRegisterPopup('registerAge');
          this.isVerify = false;
          (document.getElementById('aadhaar') as any).disabled = false;
        } else {

          const healthIdNumber = this.dataObj.healthIdNumber.replaceAll('-', '');
          localStorage.setItem(healthIdNumber, JSON.stringify(this.dataObj));
          localStorage.setItem('form_value', JSON.stringify(this.dataObj));
          this.isVerify = true;
          localStorage.setItem('isVerified', JSON.stringify(this.isVerify));
          //  document.getElementById('closeModalButton').click();
          setTimeout(() => {
            (document.getElementById('aadhaar') as any).focus();
          }, 1000);
        }
    }

  submitOtpMobile() {   

      if (this.mobileNo && this.mobileNo.length == 10) {

        let dateSpan = document.getElementById('mobmessage');
        dateSpan.classList.remove('text-danger');
        dateSpan.innerText = "";
        document.getElementById('mobileno').classList.remove('is-invalid');
      
      let param = {
        txnId: this.mobileTxnId,
        mobile: this.mobileNo,
      };

      this.http
    .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/checkAndGenerateAbhaOrMobileOTP`, param)
    .subscribe({
      next: (data) => {
        console.log(data);
        if(data?.txnId){
          this.verifymobileTxnId = data.txnId;
          this.closePops('mobilePopup');
          this.closeAllModal();
        this.openPopup('verifymobilPopup');

        }else{
       
        this.closePops('mobilePopup');
          this.closeAllModal();
          this.setValues(data);
        }
       

      },
      error: (error) => {
        this.errorMessage = error?.error['message'];
        this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
        if (error?.error['status'] == '401') {
          this.err401 = true;
        }
        console.error('There was an error!', error);
      },
    });
    }else{
      this.isNumberValid = false;
      let dateSpan = document.getElementById('mobmessage');
      dateSpan.classList.add('text-danger');
      dateSpan.innerText = "Please enter valid mobile number";
      document.getElementById('mobileno').classList.add('is-invalid');
    }
   
}
 
verifyMobilesubmitOtp(){
  if (this.verifyoptVal) {
    let param = {
      txnId: this.verifymobileTxnId,
      otp: this.verifyoptVal,
    };

    this.http
  .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/verifyMobileOTP`, param)
  .subscribe({
    next: (data) => {
      console.log(data);
      this.closePops('verifymobilPopup');
      this.closeAllModal();
      this.setValues(data);

    },
    error: (error) => {
      this.errorMessage = error?.error['message'];
      this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
      if (error?.error['status'] == '401') {
        this.err401 = true;
      }
      
      console.error('There was an error!', error);
    },
  });

}
}

  closeModal() {
    this.isOpen = false;
    const modalBackdrop = document.querySelector('.modal-backdrop.fade.show');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
    this.clearVal();
  }

  closeAllModal() {
  
    const modalBackdrop = document.querySelectorAll('.modal-backdrop.fade.show');
    const modalopen = document.querySelector('.modal-open');
    if (modalBackdrop) {
      modalBackdrop.forEach((element) => {
        element.classList.remove('modal-backdrop', 'fade', 'show');
      });
    }
    
    if(modalopen){
    document.body.classList.remove('modal-open');
    }

  }

  openPopup(id)
  {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  OtpPopup(id = "verifyOtpModal") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  verifymobilPopup(id = "verifymobilPopup") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }
  canRegisterPopup(id = "registerAge") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }
 incorrectAadhaar(id = "incorrectAadhaar") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  incorrectMobile(id = "incorrectMobile") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  incorrectOTP(id = "incorrectOTP") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }
 

  mobilPopup(id = "mobilePopup") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }
  selectProfile(id = 'selectProfileModel') {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  closePops(id) {
    // let modal = document.getElementById(id);
    
    // modal.style.display = 'none';
    // modal.style.opacity = '0';


     // get modal
     const modal = document.getElementById(id);

     // change state like in hidden modal
     modal.classList.remove('show');
     modal.setAttribute('aria-hidden', 'true');
     modal.setAttribute('style', 'display: none');
 
  }

  clearVal() {
    //  this.isVerify = false;
    window.location.reload();
    // (<HTMLInputElement>document.getElementById(this.fieldKey)).value = '';
  }
 
}

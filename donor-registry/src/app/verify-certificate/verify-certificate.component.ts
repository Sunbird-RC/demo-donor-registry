import { Component, OnInit } from '@angular/core';



import { VerifyService } from 'vc-verification';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.scss']
})
export class VerifyCertificateComponent implements OnInit {

  constructor(public verifyService: VerifyService) { 
    this.verifyService.scanSuccessHandler(event).then((res) => {

      console.log(res);
      
      })
  }

  ngOnInit(): void {
  }

}

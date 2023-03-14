import { Component, OnInit } from '@angular/core';



import { VerifyService } from 'vc-verification';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('zbar-angular.wasm');

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.scss']
})
export class VerifyCertificateComponent implements OnInit {
itemData:any;
  constructor(public verifyService: VerifyService) { 

  }

   getImageData = async (src) => {
    const img = await loadImage(src);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  };

  main = async () => {
    const img = await this.getImageData('/assets/images/vc.png');
    const res = await scanImageData(img);
    console.log(res[0].typeName); // ZBAR_QRCODE
    console.log(res[0].decode()); // Hello World
  };

  ngOnInit(): void {

    this.main();

      this.itemData =

      {
      
      "scanNote":"To verify pledge certificate, simply scan the QR code thats on the document.",
      
      "verify_certificate": 'Verify Certificate',
      
      "scan_qrcode": 'Scan QR Code',
      
      "detecting_qrcode": 'Detecting QR code',
      
      "back": 'Back',
      
      "certificate_isverified": 'Certificate is verified',
      
      "verify_another_Certificate": 'Verify another Certificate',
      
      "cetificate_not_valid": 'This Certificate is not valid',
      
      "scan_qrcode_again" : "Please scan QR code again"
      
      }
   

      
  }

}

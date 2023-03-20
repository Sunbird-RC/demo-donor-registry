import { Component, OnInit } from '@angular/core';



import { VerifyService } from 'vc-verification';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
//  const { createCanvas, loadImage } = require('canvas');
//  const { scanImageData } = require('zbar-angular.wasm');

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.scss']
})
export class VerifyCertificateComponent implements OnInit {
  itemData: any;
  constructor(public verifyService: VerifyService) {

  }
  ngOnInit(): void {

    this.itemData =
    {
      "scanner_type": "ZBAR_QRCODE",
      "showResult": [
        { "title": "Name", "path": "credentialSubject.name" },
        { "title": "Father Name", "path": "credentialSubject.fatherName" },
        { "title": "Date of Issuance", "path": "issuanceDate",  'type' : 'date' },
        { "title": "ABHA Number", "path": "credentialSubject.id",  "removeStr" : "did:abha:" },
        { "title": "NOTTO ID", "path": "credentialSubject.nottoId" },
        { "title": "Organs", "path": "credentialSubject.pledge.organs" },
        { "title": "Tissues", "path": "credentialSubject.pledge.tissues" },
        {  "title": "Emergency Contact Details", "path": "credentialSubject.emergency.mobileNumber" }
      ],
      "scanNote": "To verify pledge certificate, simply scan the QR code thats on the document.",
      "certificateTitle": 'Pledge Certificate',
      "verify_another_Certificate": 'Verify another Certificate',
      "cetificate_not_valid": 'This Certificate is not valid',
      "scan_qrcode_again": "Please scan QR code again"
    }

  }

}

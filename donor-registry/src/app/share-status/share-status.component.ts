import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as Handlebars from 'handlebars';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-share-status',
  templateUrl: './share-status.component.html',
  styleUrls: ['./share-status.component.scss']
})
export class ShareStatusComponent implements OnInit {
  public = "default";
  image = '';
  message = "Share pledge status in your social circle";
  url = 'https://api.cowin.gov.in/api/v3/vaccination/status/52834036974070/3';
  templateContent;
  imageElement: HTMLImageElement;
  plederInfo: any;
  shareTemplate: string;

  constructor(private sanitizer: DomSanitizer, private translate: TranslateService) { }

  ngOnInit(): void {

    let template = "https://gist.githubusercontent.com/Pratikshakhandagale/e4fac5954b5783d108a557d2e799f73b/raw/7bba6f16610659c8eae773e41fd4110363963b1e/gistfile1.txt";
    fetch(template)
      .then(response => response.text())
      .then(data => {
        let templateContent = Handlebars.compile(data);

        this.plederInfo = {
          "personalDetails": {
            'firstName': "Pratiksha",
            "middleName": "Chintaman",
            "lastName": "Khandagale"
          },
          "qrcode": ''
        };

        QRCode.toDataURL(this.url, (error, qrCodeUrl) => {
          if (error) {
            console.error('QR code generation error:', error);
          } else {


            this.templateContent = templateContent(this.plederInfo);

            this.plederInfo.qrcode = qrCodeUrl;
            this.shareTemplate = templateContent(this.plederInfo);
            this.templateContent = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;base64, ' + btoa(this.templateContent));

          }
        });
      });
  }

  copyShareLink() {
    navigator.clipboard.writeText(this.url)
  }

  generateMailtoLink(): string {
    const subject = encodeURIComponent(this.message);
    const body = encodeURIComponent(this.url);
    let bodymsg = 'My Pledge status is: '
    return `mailto:?subject=${subject}&body=${bodymsg} ${body}`;
  }

  shareOnWhatsapp() {
    const subject = encodeURIComponent(this.message);
    const url = encodeURIComponent(this.url);

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return `whatsapp://send?text=${url}`;
    } else {
      return `https://web.whatsapp.com/send?text=${url}`;
    }
  }


}

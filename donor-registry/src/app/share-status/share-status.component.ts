import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GeneralService, getDonorServiceHost} from '../services/general/general.service';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-share-status',
  templateUrl: './share-status.component.html',
  styleUrls: ['./share-status.component.scss']
})
export class ShareStatusComponent implements OnInit {
  public = "default";
  image = '';
  message = "Share pledge status in your social circle";
  url;
  templateContent;
  imageElement: HTMLImageElement;
  plederInfo: any;
  shareTemplate: string;
  osid: any;
  shouldWrapText: boolean;
  layout;
  templateid;
  apiurl: string;

  constructor(private sanitizer: DomSanitizer, private translate: TranslateService,
    private generalService: GeneralService,   public route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver) { 
      this.route.params.subscribe(params => {
        this.osid = params['id'];
        this.layout = params['layout'].toLowerCase();
        this.templateid = (params['templateid']) ? params['templateid'] : 1;
      });
    }

  ngOnInit(): void {
    this.apiurl = `${getDonorServiceHost()}/certs/share/Pledge/` + this.osid + '/template/' + this.templateid;
    this.url =  window.location.origin + '/' + this.layout+ '/status/' + this.osid + '/' + this.templateid;

    this.breakpointObserver.observe([
      Breakpoints.Small, // Adjust breakpoints as needed
      Breakpoints.Medium,
      Breakpoints.Large
    ]).subscribe(result => {
      this.shouldWrapText = !result.matches;
    });

    fetch(this.apiurl)
      .then(response => response.text())
      .then(data => {
        this.templateContent = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;base64, ' + btoa(data));
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
      return `https://wa.me/?text=${url}`;
    } else {
      return `https://web.whatsapp.com/send?text=${url}`;
    }
  }


}

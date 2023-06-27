import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { GeneralService, getDonorServiceHost } from '../services/general/general.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
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
    private generalService: GeneralService, public route: ActivatedRoute,
    private metaService: Meta) {
    this.route.params.subscribe(params => {
      this.osid = params['id'];
      this.templateid = (params['templateid']) ? params['templateid'] : 1;
    });
  }

  ngOnInit(): void {
    let url = `${getDonorServiceHost()}/Pledge/status/` + this.osid + '/template/' + this.templateid

    this.apiurl = `${getDonorServiceHost()}/certs/share/Pledge/` + this.osid + '/template/' + this.templateid;    // Example: Adding a new meta tag dynamically
    this.metaService.updateTag({ property: 'og:title', content: 'Share Pledge status in your social circle' });
    this.metaService.updateTag({ property: 'og:description', content: 'My pledge status' });
    this.metaService.updateTag({ property: 'og:image', content: this.apiurl });
    this.metaService.updateTag({ property: 'og:image:width', content: '800' });
    this.metaService.updateTag({ property: 'og:image:height', content: '1000' });
    this.metaService.updateTag({ property: 'twitter:title', content: 'Share Pledge status in your social circle' });
    this.metaService.updateTag({ property: 'twitter:image', content: this.apiurl });
    this.metaService.updateTag({ property: 'twitter:image:src', content: this.apiurl });

    fetch(this.apiurl)
      .then(response => response.text())
      .then(data => {
        this.templateContent = this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;base64, ' + btoa(data));
      });
  }

}

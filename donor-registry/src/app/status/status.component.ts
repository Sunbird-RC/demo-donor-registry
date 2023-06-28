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
  image = '';
  url;
  templateContent;
  plederInfo: any;
  shareTemplate: string;
  osid: any;
  layout;
  templateid;
  apiurl: string;

  constructor(private sanitizer: DomSanitizer, private translate: TranslateService,
    private generalService: GeneralService, public route: ActivatedRoute,
    private metaService: Meta) {
    this.route.params.subscribe(params => {
      this.osid = params['id'];
      this.layout = params['layout'].toLowerCase();
      this.templateid = (params['templateid']) ? params['templateid'] : 1;
    });
  }

  ngOnInit(): void {
    let url = `${getDonorServiceHost()}/Pledge/status/` + this.osid + '/template/' + this.templateid

    this.apiurl = `${getDonorServiceHost()}/certs/share/Pledge/` + this.osid + '/template/' + this.templateid;    // Example: Adding a new meta tag dynamically
    this.metaService.addTag({ property: 'og:title', content: 'Share Pledge status in your social circle' });
    this.metaService.addTag({ property: 'og:image', content: this.apiurl });
    this.metaService.addTag({ property: 'og:image:width', content: '800' });
    this.metaService.addTag({ property: 'og:image:height', content: '1000' });
    this.metaService.addTag({ property: 'twitter:title', content: 'Share Pledge status in your social circle' });
    this.metaService.addTag({ property: 'twitter:image', content: this.apiurl });
    this.metaService.addTag({ property: 'twitter:image:src', content: this.apiurl });

    fetch(this.apiurl)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      let self = this;
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        let base64data = reader.result;
        self.templateContent = self.sanitizer.bypassSecurityTrustUrl('' + base64data);
      }
    });


  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { GeneralService, getDonorServiceHost } from '../services/general/general.service';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

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
  imageUrl: string;

  constructor(private sanitizer: DomSanitizer, private translate: TranslateService,
    private generalService: GeneralService, public route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document, private titleService: Title,
    private metaService: Meta) {
    this.route.params.subscribe(params => {
      this.osid = params['id'];
      this.layout = params['layout'].toLowerCase();
      this.templateid = (params['templateid']) ? params['templateid'] : 1;
    });
  }

  ngOnInit(): void {
    let url = `${getDonorServiceHost()}/Pledge/status/` + this.osid + '/template/' + this.templateid
    this.apiurl = `${getDonorServiceHost()}/certs/share/Pledge/` + this.osid + '/template/' + this.templateid;    
    
    fetch(this.apiurl)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      let self = this;
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        let base64data = reader.result;
        self.templateContent = self.sanitizer.bypassSecurityTrustUrl('' + base64data);
        self.imageUrl = URL.createObjectURL(blob);
       self.addMetaTags(self.imageUrl);
      }
    });
  }

  addMetaTags(imageUrl)
  {
    imageUrl = 'https://prod-cdn.preprod.co-vin.in/share-vaccination-status/prod/3_52834036974070_2.jpg';
    const metaTags = [
      { property: 'twitter:image:src', content: imageUrl  },
      { property: 'twitter:image', content: imageUrl },
      { property: 'twitter:title', content: 'Share Pledge status in your social circle' },
      { property: 'og:image:height', content: '200' },
      { property: 'og:image:width', content: '200' },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: imageUrl },
      { property: 'og:title', content: 'Share Pledge status in your social circle' },
      { property: 'og:image:type', content: 'image/png'  },
      { property: 'og:type', content: 'article'  }
    ];
    this.titleService.setTitle('Share your pledge status on social media');
 
    metaTags.forEach((tag) => {
      const existingTag = this.document.querySelector(`meta[property="${tag.property}"]`);
      if (existingTag) {
        existingTag.remove();
      }
    });

    // Create and insert new meta tags at the beginning of the head section
    const headElement = this.document.head;
    metaTags.forEach((tag) => {
      const metaElement = this.document.createElement('meta');
      metaElement.setAttribute('property', tag.property);
      metaElement.setAttribute('content', tag.content);
      headElement.insertBefore(metaElement, headElement.firstChild);
    });
  
  }

}

import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {
  @Input() layout;
  @Input() publicData;

  @Input() identifier;
  @Input() public: boolean = false;
  claim: any;
  responseData;
  tab: string = 'profile';
  schemaloaded = false;
  layoutSchema;
  apiUrl: any;
  model: any;
  Data: string[] = [];
  property: any[] = [];
  currentDialog = null;
  destroy = new Subject<any>();
  isPreview: boolean = false;
  name: string;
  address: string;
  headerName: any;
  subHeadername = [];
  params: any;
  langKey;
  titleVal;
  url: any;
  username: any;
  state = [];
  userName: any;
  tcUser: any;
  propertyName: any;
  unPledge = false;
  revoke = true;
  documentName: string;
  orientation: string;
    

  constructor(private route: ActivatedRoute, public schemaService: SchemaService, private titleService: Title, public generalService: GeneralService, private modalService: NgbModal,
    public router: Router, public translate: TranslateService, public sanitizer: DomSanitizer,
    private http: HttpClient,
    private config: AppConfig) {
  }
  ngOnInit(): void {
    
    this.orientation = (screen.orientation.angle  == 90) ? "_landscape" : '_portrait'
    this.documentName = this.route.snapshot.paramMap.get('stateVal') + this.orientation;
    this.identifier = this.route.snapshot.paramMap.get('identifier');
    let headerOptions = new HttpHeaders({
      'template-key': this.documentName,
      'Accept': 'application/pdf'
    });
    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(this.config.getEnv('baseUrl') + '/Pledge/' + this.identifier, requestOptions).pipe(map((data: any) => {
      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
      });
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))

    })).subscribe((result: any) => {
    });

  }

  dowbloadCard1() {
    let pdfName = this.identifier;
    let headerOptions = new HttpHeaders({
      'template-key': this.documentName,
      'Accept': 'application/pdf'
    });

    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(this.config.getEnv('baseUrl') + '/Pledge/' + this.identifier, requestOptions).pipe(map((data: any) => {


      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
      });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = pdfName + '.pdf';
      link.click();
      window.URL.revokeObjectURL(link.href);

    })).subscribe((result: any) => {
    });
  }
}

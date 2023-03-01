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
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

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
  mode: any;
   pdfDoc : any;
   scale = 1; //Set Scale for Zoom.
   resolution = this.IsMobile() ? 1.5 : 1; //Set Resolution as per Desktop and Mobile.
  

  constructor(private route: ActivatedRoute, public schemaService: SchemaService, private titleService: Title, public generalService: GeneralService, private modalService: NgbModal,
    public router: Router, public translate: TranslateService, public sanitizer: DomSanitizer,
    private http: HttpClient,
    private config: AppConfig) {
  }
  ngOnInit(): void {

    this.mode = this.getDeviceInfo();
    
   // this.orientation = (screen.orientation.angle  == 90) ? "_landscape" : '_portrait';
   this.orientation =  (!this.mode) ? "_landscape" : '_portrait';
  let state =  this.route.snapshot.paramMap.get('stateVal');
   state =  state.replace(/ /g,"_");
    this.documentName = state + this.orientation;
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

      if( this.orientation == '_landscape'){
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
      }else{
        this.LoadPdfFromUrl(window.URL.createObjectURL(blob));

      }

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


    android() {
        return navigator.userAgent.match(/Android/i);
    }

    BlackBerry() {
        return navigator.userAgent.match(/BlackBerry/i);
    }

    iOS (){
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    }
    Opera() {
        return navigator.userAgent.match(/Opera Mini/i);
    }

    Windows() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    }

    getDeviceInfo() {
      var r = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile");
      return r.test(navigator.userAgent);
    }


     LoadPdfFromUrl(url) {
      //Read PDF from URL.
      pdfjsLib.getDocument(url).promise.then( (pdfDoc_) => {
          this.pdfDoc = pdfDoc_;

          //Reference the Container DIV.
          var pdf_container = document.getElementById("pdf_container");
          pdf_container.style.display = "block";
          pdf_container.style.height = this.IsMobile() ? "1200px" : "820px";

          //Loop and render all pages.
          for (var i = 1; i <= this.pdfDoc.numPages; i++) {
              this.RenderPage(pdf_container, i);
          }
      });
  };

  RenderPage(pdf_container, num) {
    this.pdfDoc.getPage(num).then( (page) => {
        //Create Canvas element and append to the Container DIV.
        var canvas = document.createElement('canvas');
        canvas.id = 'pdf-' + num;
       let ctx = canvas.getContext('2d');
        pdf_container.appendChild(canvas);

        //Create and add empty DIV to add SPACE between pages.
        var spacer = document.createElement("div");
        spacer.style.height = "20px";
        pdf_container.appendChild(spacer);

        //Set the Canvas dimensions using ViewPort and Scale.
        var viewport = page.getViewport({ scale: this.scale });
        canvas.height = this.resolution * viewport.height;
        canvas.width = this.resolution * viewport.width;
           
        //Render the PDF page.
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            transform: [this.resolution, 0, 0, this.resolution, 0, 0]
        };

        page.render(renderContext);
    });
};


IsMobile() {
  var r = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|");
  return r.test(navigator.userAgent);
}

}

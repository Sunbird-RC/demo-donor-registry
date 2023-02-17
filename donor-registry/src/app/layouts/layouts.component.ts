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
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.scss']
})
export class LayoutsComponent implements OnInit, OnChanges {
  [x: string]: any;
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
  isUnPledge = false;

  constructor(private route: ActivatedRoute, public schemaService: SchemaService, private titleService: Title, public generalService: GeneralService, private modalService: NgbModal,
    public router: Router, public translate: TranslateService, public sanitizer: DomSanitizer,
    private http: HttpClient,
    private config: AppConfig) {
  }

  ngOnChanges(): void {
    this.Data = [];
    this.ngOnInit();
  }

  ngOnInit(): void {

    this.subHeadername = [];
    if (this.publicData) {
      this.model = this.publicData;
      this.identifier = this.publicData.osid;
    }

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.params.subscribe(params => {
      this.params = params;
      if (params['layout'] != undefined) {
        this.layout = params['layout']
        this.titleService.setTitle(params['layout'].charAt(0).toUpperCase() + params['layout'].slice(1));
      }
      if (params['claim']) {
        this.claim = params['claim']
      };
      if (params['tab']) {
        this.tab = params['tab']
      }
      localStorage.setItem('entity', this.layout);
      this.layout = this.layout.toLowerCase()
    });
    this.schemaService.getSchemas().subscribe(async (res) => {
      this.responseData = res;
      this.schemaService.getLayoutJSON().subscribe(async (LayoutSchemas) => {
        var filtered = LayoutSchemas.layouts.filter(obj => {
          return Object.keys(obj)[0] === this.layout;
        });
        this.layoutSchema = filtered[0][this.layout];
        if (this.layoutSchema.table) {
          var url = [this.layout, 'attestation', this.layoutSchema.table]
          this.router.navigate([url.join('/')])
        }
        if (this.layoutSchema.api) {
          this.apiUrl = this.layoutSchema.api;

          if (this.publicData) {
            this.Data = [];
            this.addData();
          } else {
            await this.getData();
          }

        }
      }, (error) => {
        //Layout Error callback
        console.error('layouts.json not found in src/assets/config/ - You can refer to examples folder to create the file')
      });
    },
      (error) => {
        //Schema Error callback
        console.error('Something went wrong with Schema URL or Path not found')
      });
  }

  check(conStr, title) {
    this.translate.get(this.langKey + '.' + conStr).subscribe(res => {
      let constr = this.langKey + '.' + conStr;
      if (res != constr) {
        this.titleVal = res;
      } else {
        this.titleVal = title;
      }
    });
    return this.titleVal;
  }

  addData() {
    if(this.layoutSchema.blocks.length){
    this.layoutSchema.blocks.forEach(block => {
      this.property = [];
      block['items'] = [];
      var temp_object;

      if (this.layoutSchema.hasOwnProperty('langKey')) {
        this.langKey = this.layoutSchema.langKey;
      }

      if (block.fields.includes && block.fields.includes.length > 0) {
        if (block.fields.includes == "*") {
          for (var element in this.model) {
            this.tcUser = this.model["name"];
            localStorage.setItem('tcUserName', this.tcUser);
            if (!Array.isArray(this.model[element])) {
              if (typeof this.model[element] == 'string') {
                temp_object = this.responseData['definitions'][block.definition]['properties'][element]
                if (temp_object != undefined) {

                  temp_object.property = element;
                  temp_object.title = this.check(element, temp_object.title);
                  temp_object['value'] = this.model[element];
                  this.property.push(temp_object)
                }
              }
              else {
                for (const [key, value] of Object.entries(this.model[element])) {
                  if (this.responseData['definitions'][block.definition]['properties'][element]) {
                    if ('$ref' in this.responseData['definitions'][block.definition]['properties'][element]) {
                      var ref_defination = (this.responseData['definitions'][block.definition]['properties'][element]['$ref']).split('/').pop()
                      temp_object = this.responseData['definitions'][ref_defination]['properties'][key]

                      if (temp_object != undefined && typeof value != 'object') {

                        temp_object.property = key;
                        temp_object.title = this.check(key, temp_object.title);
                        temp_object['value'] = value
                        this.property.push(temp_object)
                      }
                    }
                    else {
                      if (this.responseData['definitions'][block.definition]['properties'][element]['properties'] != undefined) {
                        temp_object = this.responseData['definitions'][block.definition]['properties'][element]['properties'][key]

                        if (temp_object != undefined && typeof value != 'object') {

                          temp_object.property = key;
                          temp_object.title = this.check(key, temp_object.title);
                          temp_object['value'] = value
                          this.property.push(temp_object)
                        }
                      }
                      else {
                        temp_object = this.responseData['definitions'][block.definition]['properties'][element]
                        if (temp_object != undefined) {

                          temp_object.property = element;
                          temp_object.title = this.check(element, temp_object.title);
                          temp_object['value'] = this.model[element]
                          this.property.push(temp_object)
                        }
                      }
                    }
                  }
                }
              }
            }
            else {
              if (block.fields.excludes && block.fields.excludes.length > 0 && !block.fields.excludes.includes(element)) {
                this.model[element].forEach(objects => {
                  for (const [key, value] of Object.entries(objects)) {
                    if (this.responseData['definitions'][block.definition]['properties'][element]) {
                      if ('$ref' in this.responseData['definitions'][block.definition]['properties'][element]) {
                        var ref_defination = (this.responseData['definitions'][block.definition]['properties'][element]['$ref']).split('/').pop()
                        temp_object = this.responseData['definitions'][ref_defination]['properties'][key]
                        if (temp_object != undefined && typeof value != 'object') {

                          temp_object.property = key;
                          temp_object.title = this.check(key, temp_object.title);
                          temp_object['value'] = value;
                          this.property.push(temp_object);
                        }
                      }
                      else {
                        temp_object = this.responseData['definitions'][block.definition]['properties'][element]['items']['properties'][key];
                        if (temp_object != undefined && typeof value != 'object') {

                          temp_object.property = key;
                          temp_object.title = this.check(key, temp_object.title);
                          temp_object['value'] = value;
                          this.property.push(temp_object);
                        }
                      }
                    }
                  }
                });
              }
            }
          }

          /* let tempName = "pledgeAffiliation"; //(localStorage.getItem('entity') == 'student' || localStorage.getItem('entity') == 'Student' ) ? 'studentInstituteAttest' : tempName;
                     if (this.model.hasOwnProperty(tempName)) {
                       let objects1;
   
                       for (let j = 0; j < this.model[tempName].length; j++) {
                         objects1 = this.model[tempName][j];
                       }
   
                         this.model[element].sort((a, b) => (b.osUpdatedAt) - (a.osUpdatedAt));
   
                     }*/
        }
        else {
          block.fields.includes.forEach(element => {
            if (this.model[element] && !Array.isArray(this.model[element])) {
              for (const [key, value] of Object.entries(this.model[element])) {
                if (this.responseData['definitions'][block.definition]['properties'][element]) {
                  if ('$ref' in this.responseData['definitions'][block.definition]['properties'][element]) {
                    var ref_defination = (this.responseData['definitions'][block.definition]['properties'][element]['$ref']).split('/').pop()
                    temp_object = this.responseData['definitions'][ref_defination]['properties'][key]
                    if (temp_object != undefined && typeof value != 'object') {
                      if (element.osid) {
                        temp_object['osid'] = element.osid
                      }
                      if (element.osid) {
                        temp_object['_osState'] = element._osState;
                        // if(element.hasOwnProperty("_osClaimNotes")){
                        //   temp_object['_osClaimNotes'] = element._osClaimNotes;
                        // }
                      }

                      temp_object.property = key;
                      temp_object.title = this.check(key, temp_object.title);
                      temp_object['value'] = value
                      this.property.push(temp_object)
                    }


                  }
                  else {
                    temp_object = this.responseData['definitions'][block.definition]['properties'][element]['properties'][key];
                    if (temp_object !== undefined && (Array.isArray(value) || typeof value !== 'object')) {
                      if (element.osid) {
                        temp_object['osid'] = element.osid;
                      }
                      if (element.osid) {
                        temp_object['_osState'] = element._osState;
                      }

                      temp_object.property = key;
                      temp_object.title = this.check(key, temp_object.title);
                      temp_object['value'] = value;
                      this.property.push(temp_object);
                    }

                  }
                }
              }
            }
            else {
              if (this.model[element]) {
                // this.model[element].forEach((objects, i) => {
                for (let i = 0; i < this.model[element].length; i++) {
                  let objects = this.model[element][i];
                  var osid;
                  var osState;
                  var temp_array = [];


                  // alert(i + ' ----1--- ' + objects.osid);

                  let tempName = localStorage.getItem('entity').toLowerCase() + element.charAt(0).toUpperCase() + element.slice(1);
                  tempName = (localStorage.getItem('entity') == 'student' || localStorage.getItem('entity') == 'Student') ? 'studentInstituteAttest' : tempName;
                  if (this.model.hasOwnProperty(tempName)) {
                    let objects1;
                    var tempObj = []
                    //this.model[tempName].forEach((objects1, j) => {
                    for (let j = 0; j < this.model[tempName].length; j++) {
                      objects1 = this.model[tempName][j];
                      console.log(objects.osid + '  ' + objects1.propertiesOSID[element][0]);
                      if (objects.osid == objects1.propertiesOSID[element][0]) {
                        objects1.propertiesOSID.F = new Date(objects1.propertiesOSID.osUpdatedAt);
                        tempObj.push(objects1)
                      }

                    }

                    if (tempObj.length) {

                      tempObj.sort((a, b) => (b.propertiesOSID.osUpdatedAt) - (a.propertiesOSID.osUpdatedAt));
                      this.model[element][i]['_osState'] = tempObj[0]._osState;
                      console.log({ tempObj });
                    }


                  }


                  for (const [index, [key, value]] of Object.entries(Object.entries(objects))) {
                    if ('$ref' in this.responseData['definitions'][block.definition]['properties'][element]) {
                      var ref_defination = (this.responseData['definitions'][block.definition]['properties'][element]['$ref']).split('/').pop()
                      temp_object = this.responseData['definitions'][ref_defination]['properties'][key]
                      if (temp_object != undefined && typeof value != 'object') {
                        if (objects.osid) {
                          temp_object['osid'] = objects.osid;
                        }
                        if (objects.osid) {
                          temp_object['_osState'] = objects._osState;
                        }

                        temp_object.property = key;
                        temp_object.title = this.check(key, temp_object.title);
                        temp_object['value'] = value;
                        temp_array.push(this.pushData(temp_object))
                      }
                    }
                    else {
                      temp_object = this.responseData['definitions'][block.definition]['properties'][element]['items']['properties'][key];

                      if (temp_object != undefined && temp_object.hasOwnProperty('title')) {
                        temp_object.property = key;
                        temp_object.title = this.check(key, temp_object.title);
                      }

                      if (temp_object != undefined && typeof value != 'object') {
                        if (objects.osid) {
                          temp_object['osid'] = objects.osid;
                        }
                        if (objects.osid) {
                          temp_object['_osState'] = objects._osState;
                        }

                        temp_object.property = key;
                        temp_object.title = this.check(key, temp_object.title);
                        temp_object['value'] = value;
                        temp_array.push(this.pushData(temp_object));
                      }
                      // }


                    }
                  }
                  this.property.push(temp_array);
                };
              }
            }
          });
        }
      }
      if (block.fields.excludes && block.fields.excludes.length > 0) {
        block.fields.excludes.forEach(element => {
          if (this.property.hasOwnProperty(element)) {
            delete this.property[element];
          }
        });
      }

      if (block.hasOwnProperty('propertyShowFirst') && this.property.length) {
        let fieldsArray = (this.property[0].length) ? this.property[0] : this.property;
        for (let i = 0; i < this.property.length; i++) {
          this.propertyName = this.property[i]
          if (this.propertyName["property"] == 'firstName') {
            this.userName = this.propertyName["value"];
          }
        }
        localStorage.setItem('loggedInUserName', this.userName);

        let fieldsArrayTemp = [];

        for (let i = 0; i < block.propertyShowFirst.length; i++) {
          fieldsArray = fieldsArray.filter(function (obj) {
            if (obj.property === block.propertyShowFirst[i]) {
              fieldsArrayTemp.push(obj);
            }
            return obj.property !== block.propertyShowFirst[i];
          });

        }

        this.property = (this.property[0].length) ? [fieldsArrayTemp.concat(fieldsArray)] : fieldsArrayTemp.concat(fieldsArray);

      }

      block.items.push(this.property)
      this.Data.push(block)
      this.schemaloaded = true;
    });
  }else{
    this.schemaloaded = true;
  }
  }

  pushData(data) {
    var object = {};
    for (var key in data) {
      if (data.hasOwnProperty(key))
        object[key] = data[key];
    }
    return object;
  }

  async getData() {
  
    var get_url;
    if (this.identifier) {
      get_url = this.apiUrl + '/' + this.identifier
    } else {
      get_url = this.apiUrl
    }
    await this.generalService.getData(get_url).subscribe((res) => {
      if (this.identifier) {
        this.model = res
      }
      else {
        if(this.layout === 'pledge')
        {
          this.model = res;
        }else{

        
        if (res.length > 1) {
          this.model = res[res.length - 1];
        
          this.identifier = res[res.length - 1].osid;
        } else {
          this.model = res[0];
          this.identifier = res[0].osid;
        }
      }
      }


      if (this.layout === 'pledge') {
        if ('photo' in this.model['personalDetails']) {
          delete this.model['personalDetails']['photo'];
        }

        this.isUnPledge = (!this.model['pledgeDetails'].organs.length && !this.model['pledgeDetails'].tissues.length) ? true : false;
       
      }
      this.getHeadingTitle(this.model);

      this.Data = [];
      localStorage.setItem('osid', this.identifier);
      this.addData()
    });
  }

  includeFields(fields) {
    fields.forEach(element => {
      if (typeof element == "object") {
        element.forEach(ref => {
          this.property[ref] = this.model[element][ref]
        });
      }
      else {
        this.property[element] = this.model[element]
      }
    });
  }

  removeCommonFields() {
    var commonFields = ['osCreatedAt', 'osCreatedBy', 'osUpdatedAt', 'osUpdatedBy', 'osid', 'OsUpdatedBy'];
    const filteredArray = this.property.filter(function (x, i) {
      return commonFields.indexOf(x[i]) < 0;
    });
  }

  ngOnDestroy() {
    this.destroy.next();
  }

  openPreview() {
    this.isPreview = true;
  }

  getHeadingTitle(item) {
    if (this.layoutSchema.hasOwnProperty('headerName')) {
      var propertySplit = this.layoutSchema.headerName.split(".");

      let fieldValue = [];

      for (let j = 0; j < propertySplit.length; j++) {
        let a = propertySplit[j];

        if (j == 0 && item.hasOwnProperty(a)) {
          fieldValue = item[a];
        } else if (fieldValue.hasOwnProperty(a)) {

          fieldValue = fieldValue[a];

        } else if (fieldValue[0]) {
          let arryItem = []
          if (fieldValue.length > 0) {
            for (let i = 0; i < fieldValue.length; i++) {
              //  arryItem.push({ 'value': fieldValue[i][a], "status": fieldValue[i][key.attest] });
            }

            fieldValue = arryItem;

          } else {
            fieldValue = fieldValue[a];
          }

        } else {
          fieldValue = [];
        }
      }

      this.headerName = fieldValue;
      this.getSubHeadername(item);
    }

  }



  getSubHeadername(item) {

    if (this.layoutSchema.hasOwnProperty('subHeadername')) {
      var propertySplit = this.layoutSchema.subHeadername.split(",");

      let fieldValue = [];

      for (let k = 0; k < propertySplit.length; k++) {
        var propertyKSplit = propertySplit[k].split(".");

        for (let j = 0; j < propertyKSplit.length; j++) {

          let a = propertyKSplit[j];

          if (j == 0 && item.hasOwnProperty(a)) {
            fieldValue = item[a];
          } else if (fieldValue.hasOwnProperty(a)) {

            fieldValue = fieldValue[a];

          } else if (fieldValue[0]) {
            let arryItem = []
            if (fieldValue.length > 0) {

              fieldValue = arryItem;

            } else {
              fieldValue = fieldValue[a];
            }

          } else {
            fieldValue = [];
          }
        }

        fieldValue.length ? this.subHeadername.push(fieldValue) : [];
      }
    }
  }

  dowbloadCard1() {
    let pdfName = 'vc-card';

    let headerOptions = new HttpHeaders({
      'template-key': this.model.addressDetails.state,
      'Accept': 'image/svg+xml'
    });

    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(this.config.getEnv('baseUrl') + '/Pledge/' + this.identifier, requestOptions).pipe(map((data: any) => {


      let blob = new Blob([data], {
        type: 'image/svg+xml' // must match the Accept type
      });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = pdfName + '.svg';
      link.click();
      window.URL.revokeObjectURL(link.href);

    })).subscribe((result: any) => {
    });
  }


  dowbloadCard() {

    let headerOptions = new HttpHeaders({
      'template-key': this.model.addressDetails.state,
      'Accept': 'image/svg+xml'
    });

    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(this.config.getEnv('baseUrl') + '/Pledge/' + this.identifier, requestOptions).pipe(map((data: any) => {


      let blob = new Blob([data], {
        type: 'image/svg+xml' // must match the Accept type
      });



      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))

    })).subscribe((result: any) => {
    });
  }

  successDelete()
{
  var modal =   document.getElementById("successDeleteModal")
  modal.classList.add("show");
  modal.style.display = "block";  
}

  deleteData(model) {
    model = {
      "pledgeDetails": {
        "organs": [],
        "tissues": [],
        "others": ""
      },
      "personalDetails": (model["personalDetails"]) ? model["personalDetails"] : {},
      "identificationDetails": (model["identificationDetails"]) ? model["identificationDetails"] : {},
      "addressDetails": (model["addressDetails"]) ? model["addressDetails"] : {},
      "emergencyDetails": (model["emergencyDetails"]) ? model["emergencyDetails"] : {},
      "notificationDetails": (model["notificationDetails"]) ? model["notificationDetails"] : {},
    }
    this.generalService.putData('/Pledge',  this.resItem.osid, model).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL') {
        console.log(res);
        this.successDelete();
        this.isUnPledge  = true;
        //this.router.navigate(['/profile/Pledge'])
      }
      else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {

      }
    }, (err) => {


    });
  }

  actionData(res)
  {
      this.resItem = res;
  }
}

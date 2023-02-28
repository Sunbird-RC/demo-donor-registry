import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchema7 } from "json-schema";
import { GeneralService, getDonorServiceHost } from '../services/general/general.service';
import { Location } from '@angular/common'
import { of } from 'rxjs';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { of as observableOf } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { templateJitUrl } from '@angular/compiler';
import { HttpClient } from "@angular/common/http";
import { FormService } from './form.service';


const GenderMap = {
  M: 'Male',
  F: 'Female'
};

const StateMap = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

function titleCase(str) {
  const splitStr = str ? str?.toLowerCase().split(' ') : [];
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})


export class FormsComponent implements OnInit {
  @ViewChild('myForm') myForm: NgForm;

  @Input() form;
  @Input() modal;
  @Input() identifier;
  res: any;
  formSchema;
  responseData;
  schemaloaded = false;
  schema: JSONSchema7 = {
    "type": "object",
    "title": "",
    "definitions": {},
    "properties": {}
  };
  definations = {};
  property = {};
  ordering;
  required = [];
  entityId: string;
  form2: FormGroup;
  model = {};
  options: FormlyFormOptions;
  fields: FormlyFieldConfig[];
  customFields = [];
  header = null;
  exLength: number = 0
  type: string;
  apiUrl: string;
  redirectTo: any;
  add: boolean;
  dependencies: any;
  privateFields = [];
  internalFields = [];
  privacyCheck: boolean = false;
  globalPrivacy;
  searchResult: any[];
  states: any[] = [];
  fileFields: any[] = [];
  propertyName: string;
  notes: any;
  langKey: string;
  headingTitle;
  enumVal;
  titleVal
  isSignupForm: boolean = false;
  entityUrl: any;
  propertyId: any;
  entityName: string;
  sorder: any;
  isSubmitForm: boolean = false;
  isSignupFormPOPup: boolean = false;
  isSaveAsDraft: any;
  tempData: any;
  formDescription: any;
  subDescription: any;
  temporaryData = {};
  flag: boolean = true;
  routeNew: string;
  tempUrl: string;


  ngAfterViewChecked() {
    if (this.form == 'signup') {
      if (localStorage.getItem('isVerified')) {
        if (this.model["identificationDetails"] && this.model["identificationDetails"].hasOwnProperty('abha')) {
          this.tempData = JSON.parse(localStorage.getItem("form_value"));
          const isAutoFill = localStorage.getItem('isAutoFill');

          if (this.tempData) {
            if (isAutoFill != "false") {
              this.model = {
                ...this.model,
                "personalDetails": {
                  ...('personalDetails' in this.model ? this.model['personalDetails'] : {}),
                  "firstName": this.tempData?.firstName,
                  "middleName": this.tempData?.middleName,
                  "lastName": this.tempData?.lastName,
                  "fatherName": this.tempData?.middleName,
                  "gender": (this.tempData?.gender) ? `${GenderMap[this.tempData?.gender]}` : {},
                  "emailId": (this.tempData?.email) ? this.tempData?.email : "",
                  "mobileNumber": this.tempData?.mobile,
                  "dob": this.tempData?.yearOfBirth + "-" + ('0' + this.tempData?.monthOfBirth).slice(-2) + "-" + ('0' + this.tempData?.dayOfBirth).slice(-2)

                },
                "addressDetails": {
                  ...('addressDetails' in this.model ? this.model['addressDetails'] : {}),
                  "addressLine1": this.tempData?.address,
                  "country": "India",
                  "state": `${titleCase(this.tempData?.stateName)}`,
                  "district": this.tempData?.townName,
                  "pincode": this.tempData?.pincode,

                },
                "emergencyDetails": (this.model["emergencyDetails"]) ? this.model["emergencyDetails"] : {},
                "pledgeDetails": (this.model["pledgeDetails"]) ? this.model["pledgeDetails"] : {},
                // "notificationDetails": this.model["notificationDetails"]? this.model["notificationDetails"] : {},
                "instituteReference": (this.model["instituteReference"]) ? this.model["instituteReference"] : "",
              };
              localStorage.setItem('isAutoFill', "false");

              let obj = { ...this.model['personalDetails'], ...this.model['addressDetails'] };
              for (let propName in obj) {
                if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
                  delete obj[propName];
                }
              }
              localStorage.setItem('notReadOnly', JSON.stringify(Object.keys(obj)));
            }
          }
        }
      }
    }

    if ((this.form == 'pledge-setup' || this.form == 'signup') && this.identifier) {
      let notReadOnly = localStorage.getItem('notReadOnly');
      if (!notReadOnly || notReadOnly === "[]") {
        let obj = { ...this.model['personalDetails'], ...this.model['addressDetails'] };
        for (let propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
            delete obj[propName];
          }
        }
        localStorage.setItem('notReadOnly', JSON.stringify(Object.keys(obj)));
      }
    }
  }

  ngAfterContentChecked(): void {



    if (this.model["memberToBeNotified"] == true) {
      this.flag = false;
      this.model = {
        "notificationDetails": {
          "name": this.model["emergencyDetails"]['name'],
          "relation": this.model["emergencyDetails"]['relation'],
          "otherRelation": this.model["emergencyDetails"]['otherRelation'],
          "mobileNumber": this.model["emergencyDetails"]['mobileNumber'],
        },
        "identificationDetails": (this.model["identificationDetails"]) ? this.model["identificationDetails"] : {},
        "personalDetails": (this.model["personalDetails"]) ? this.model["personalDetails"] : {},
        "addressDetails": (this.model["addressDetails"]) ? this.model["addressDetails"] : {},
        "pledgeDetails": (this.model["pledgeDetails"]) ? this.model["pledgeDetails"] : {},
        "emergencyDetails": (this.model["emergencyDetails"]) ? this.model["emergencyDetails"] : {},
        "memberToBeNotified": this.model["memberToBeNotified"],
        "instituteReference": (this.model["instituteReference"]) ? this.model["instituteReference"] : "",
        "consent": this.model["consent"]

      }
    }
    if (this.model.hasOwnProperty('memberToBeNotified') && this.model['memberToBeNotified'] == "false") {
      this.model['memberToBeNotified'] = false;
    }
    if (!this.flag) {

      if (this.model["memberToBeNotified"] == false) {
        this.flag = true;
        if (JSON.stringify(this.model["notificationDetails"]) != '{}') {
          if (JSON.stringify(this.model["notificationDetails"]) != JSON.stringify(this.model["emergencyDetails"])) {
            this.model = {
              "notificationDetails": {
                "name": "",
                "relation": "",
                "otherRelation": "",
                "mobileNumber": "",
              },
              "identificationDetails": (this.model["identificationDetails"]) ? this.model["identificationDetails"] : {},
              "personalDetails": (this.model["personalDetails"]) ? this.model["personalDetails"] : {},
              "addressDetails": (this.model["addressDetails"]) ? this.model["addressDetails"] : {},
              "pledgeDetails": (this.model["pledgeDetails"]) ? this.model["pledgeDetails"] : {},
              "emergencyDetails": (this.model["emergencyDetails"]) ? this.model["emergencyDetails"] : {},
              "memberToBeNotified": this.model["memberToBeNotified"],
              //"notificationDetails": {}? this.model["notificationDetails"],
              "instituteReference": (this.model["instituteReference"]) ? this.model["instituteReference"] : "",
              "consent": this.model["consent"]

            }
          }
        }

      }


    }



    if (this.form == 'livedonor' && localStorage.getItem('isVerified') && !this.identifier) {

      localStorage.setItem('formtype', "livedonor");

      if (this.model["donorDetails"] && this.model["donorDetails"].hasOwnProperty('identificationValue')) {
        let tempData;
        if (this.identifier) {
          tempData = this.model;

        } else {
          tempData = JSON.parse(localStorage.getItem(this.model["donorDetails"]['identificationValue']));
        }


        if (tempData.hasOwnProperty('monthOfBirth') && tempData['monthOfBirth'] < 10) {
          tempData['monthOfBirth'] = "0" + tempData['monthOfBirth'];
        }

        if (tempData.hasOwnProperty('dayOfBirth') && (tempData['dayOfBirth'] < 10)) {
          tempData['dayOfBirth'] = "0" + tempData['dayOfBirth'];
        }


        /*  this.model['donorDetails']['dob'] = tempData['yearOfBirth'] + "-" + tempData['monthOfBirth'] + "-" + tempData['dayOfBirth'];
          this.model['donorDetails']['emailId'] = tempData['email'];
          this.model['donorDetails']['firstName'] = tempData['firstName'];
          this.model['donorDetails']['gender'] = (tempData['gender'] == 'F') ? "Female" : "Male",
          this.model['donorDetails']['lastName'] = tempData['lastName'];
          this.model['donorDetails']['middleName'] = tempData['middleName'];
          this.model['donorDetails']['mobileNumber'] = (this.identifier) ? tempData['mobileNumber'] :  tempData['mobile'] ;
     */
        this.model = {
          "donorDetails": {
            "identificationValue": this.model["donorDetails"]['identificationValue'],
            "dob": tempData['yearOfBirth'] + "-" + tempData['monthOfBirth'] + "-" + tempData['dayOfBirth'],
            "emailId": (tempData['email']),
            "firstName": tempData['firstName'],
            "gender": (tempData['gender'] == 'F') ? "Female" : "Male",
            "lastName": tempData['lastName'],
            "middleName": tempData['middleName'],
            "mobileNumber": tempData['mobile']
          },
          "recipientDetails": (this.model["recipientDetails"]) ? this.model["recipientDetails"] : {},
          "crossMatchDetails": (this.model["crossMatchDetails"]) ? this.model["crossMatchDetails"] : {},
          "dnaProfiling": (this.model["dnaProfiling"]) ? this.model["dnaProfiling"] : {},
          "donorHLA": (this.model["donorHLA"]) ? this.model["donorHLA"] : {},
          "medicalDetails": (this.model["medicalDetails"]) ? this.model["medicalDetails"] : {},
          "medicalHistory": (this.model["medicalHistory"]) ? this.model["medicalHistory"] : {},
          "proofOfRelation": (this.model["proofOfRelation"]) ? this.model["proofOfRelation"] : {},
          "recipientHLA": (this.model["recipientHLA"]) ? this.model["recipientHLA"] : {},
          "swapDetails": (this.model["swapDetails"]) ? this.model["swapDetails"] : {},
          "relationOfDonorRecipient": (this.model["relationOfDonorRecipient"]) ? this.model["relationOfDonorRecipient"] : "",
          "crossMatching": (this.model["crossMatching"]) ? this.model["crossMatching"] : "",
          "proofOfRelationtype": (this.model["proofOfRelationtype"]) ? this.model["proofOfRelationtype"] : "",
          "details": (this.model["details"]) ? this.model["details"] : {}

        }

      }


      if (this.model["recipientDetails"] && (this.model["recipientDetails"].hasOwnProperty('identificationValue') || this.model["recipientDetails"]['recipientId'])) {
        let tempData;
        if (this.identifier) {
          tempData = JSON.parse(localStorage.getItem(this.model["recipientDetails"]['recipientId']));

        } else {
          tempData = JSON.parse(localStorage.getItem(this.model["recipientDetails"]['identificationValue']));
        }

        if (tempData.hasOwnProperty('monthOfBirth') && tempData['monthOfBirth'] < 10) {
          tempData['monthOfBirth'] = "0" + tempData['monthOfBirth'];
        }

        if (tempData.hasOwnProperty('dayOfBirth') && tempData['dayOfBirth'] < 10) {
          tempData['dayOfBirth'] = "0" + tempData['dayOfBirth'];
        }


        this.model = {
          "donorDetails": (this.model["donorDetails"]) ? this.model["donorDetails"] : {},
          "recipientDetails": {
            "identificationValue": (this.model["recipientDetails"]['identificationValue']) ? this.model["recipientDetails"]['identificationValue'] : this.model["recipientDetails"]['recipientId'],
            "dob": tempData['yearOfBirth'] + "-" + tempData['monthOfBirth'] + "-" + tempData['dayOfBirth'],
            "emailId": (tempData['email']),
            "firstName": tempData['firstName'],
            "gender": (tempData['gender'] == 'F') ? "Female" : "Male",
            "lastName": tempData['lastName'],
            "middleName": tempData['middleName'],
            "mobileNumber": tempData['mobile']
          },
          "crossMatchDetails": (this.model["crossMatchDetails"]) ? this.model["crossMatchDetails"] : {},
          "dnaProfiling": (this.model["dnaProfiling"]) ? this.model["dnaProfiling"] : {},
          "donorHLA": (this.model["donorHLA"]) ? this.model["donorHLA"] : {},
          "medicalDetails": (this.model["medicalDetails"]) ? this.model["medicalDetails"] : {},
          "medicalHistory": (this.model["medicalHistory"]) ? this.model["medicalHistory"] : {},
          "proofOfRelation": (this.model["proofOfRelation"]) ? this.model["proofOfRelation"] : {},
          "recipientHLA": (this.model["recipientHLA"]) ? this.model["recipientHLA"] : {},
          "swapDetails": (this.model["swapDetails"]) ? this.model["swapDetails"] : {},
          "relationOfDonorRecipient": (this.model["relationOfDonorRecipient"]) ? this.model["relationOfDonorRecipient"] : "",
          "crossMatching": (this.model["crossMatching"]) ? this.model["crossMatching"] : "",
          "proofOfRelationtype": (this.model["proofOfRelationtype"]) ? this.model["proofOfRelationtype"] : "",
          "details": (this.model["details"]) ? this.model["details"] : {}
        }

      }
    }

    if (this.form == 'recipient' && localStorage.getItem('isVerified') && !this.identifier) {
      localStorage.setItem('formtype', "recipient");
      if (this.model["recipientDetails"] && (this.model["recipientDetails"].hasOwnProperty('identificationValue'))) {

        let tempData = JSON.parse(localStorage.getItem(this.model["recipientDetails"]['identificationValue']));



        if (tempData.hasOwnProperty('monthOfBirth') && tempData['monthOfBirth'] < 10) {
          tempData['monthOfBirth'] = "0" + tempData['monthOfBirth'];
        }

        if (tempData.hasOwnProperty('dayOfBirth') && tempData['dayOfBirth'] < 10) {
          tempData['dayOfBirth'] = "0" + tempData['dayOfBirth'];
        }

        this.model = {
          "recipientDetails": {
            "identificationValue": (this.model["recipientDetails"]['identificationValue']) ? this.model["recipientDetails"]['identificationValue'] : '',
            "dob": tempData['yearOfBirth'] + "-" + tempData['monthOfBirth'] + "-" + tempData['dayOfBirth'],
            "emailId": (tempData['email']),
            "firstName": tempData['firstName'],
            "gender": (tempData['gender'] == 'F') ? "Female" : "Male",
            "lastName": tempData['lastName'],
            "middleName": tempData['middleName'],
            "mobileNumber": tempData['mobile'],
            "residentialProof": (this.model["recipientDetails"]['residentialProof']) ? this.model["recipientDetails"]['residentialProof'] : '',
            "residentialValue": (this.model["recipientDetails"]['residentialValue']) ? this.model["recipientDetails"]['residentialValue'] : '',
            "passportNumber": (this.model["recipientDetails"]['passportNumber']) ? this.model["recipientDetails"]['passportNumber'] : '',
            "country": (this.model["recipientDetails"]['country']) ? this.model["recipientDetails"]['country'] : 'SriLanka',
            "mobileNumberWithCode": (this.model["recipientDetails"]['mobileNumberWithCode']) ? this.model["recipientDetails"]['mobileNumberWithCode'] : '',
            "form21": (this.model["recipientDetails"]['form21']) ? this.model["recipientDetails"]['form21'] : '',
            "nationality": (this.model["recipientDetails"]['nationality']) ? this.model["recipientDetails"]['nationality'] : 'Indian',
          },
          "medicalDetails": (this.model["medicalDetails"]) ? this.model["medicalDetails"] : {},
          "medicalHistory": (this.model["medicalHistory"]) ? this.model["medicalHistory"] : {},
          "bloodGroupDetails": (this.model["bloodGroupDetails"]) ? this.model["bloodGroupDetails"] : {},
          "hematology": (this.model["hematology"]) ? this.model["hematology"] : {},
          "LiverExamination": (this.model["LiverExamination"]) ? this.model["LiverExamination"] : {},
          "urineExam": (this.model["urineExam"]) ? this.model["urineExam"] : {},
          "biochemistry": (this.model["biochemistry"]) ? this.model["biochemistry"] : {},
          "ekg": (this.model["ekg"]) ? this.model["ekg"] : {},
          "thyroidFunction": (this.model["thyroidFunction"]) ? this.model["thyroidFunction"] : {},
          "virology": (this.model["virology"]) ? this.model["virology"] : {},
          "radiology": (this.model["radiology"]) ? this.model["radiology"] : "",
          "clearances": (this.model["clearances"]) ? this.model["clearances"] : "",
          "recipientHLA": (this.model["recipientHLA"]) ? this.model["recipientHLA"] : "",
          "organsOrTissues": (this.model["organsOrTissues"]) ? this.model["organsOrTissues"] : { 'organsNeeded': ['Kideny'] },
          "report": (this.model["report"]) ? this.model["report"] : {}
        }

      }
    }

  }
  constructor(private route: ActivatedRoute,
    public translate: TranslateService,
    public toastMsg: ToastMessageService, public router: Router, public schemaService: SchemaService, private formlyJsonschema: FormlyJsonschema, public generalService: GeneralService, private location: Location, private http: HttpClient, public formService: FormService) { }


  ngOnInit(): void {
    //this.modalErrorPledge();
    this.route.params.subscribe(params => {
      this.add = this.router.url.includes('add');

      if (params['form'] != undefined) {
        this.form = params['form'].split('/', 1)[0];
        this.identifier = params['form'].split('/', 2)[1];
      }

      if (params['id'] != undefined) {
        this.identifier = params['id']
      }
      if (params['modal'] != undefined) {
        this.modal = params['modal']
      }

    });

    this.entityName = localStorage.getItem('entity');

    this.schemaService.getFormJSON().subscribe((FormSchemas) => {
      var filtered = FormSchemas.forms.filter(obj => {
        return Object.keys(obj)[0] === this.form
      })
      this.formSchema = filtered[0][this.form]

      if (this.formSchema.api) {
        this.apiUrl = this.formSchema.api;
        this.entityUrl = this.formSchema.api;
      }

      if (this.formSchema.header) {
        this.header = this.formSchema.header
      }

      if (this.formSchema.isSignupForm) {
        this.isSignupForm = this.formSchema.isSignupForm;
      }

      if (this.formSchema.title) {
        this.headingTitle = this.translate.instant(this.formSchema.title);
      }

      if (this.formSchema.description) {
        this.formDescription = this.translate.instant(this.formSchema.description);
      }
      if (this.formSchema.subDescription) {
        this.subDescription = this.translate.instant(this.formSchema.subDescription);
      }
      if (this.formSchema.redirectTo) {
        this.redirectTo = this.formSchema.redirectTo;
      }

      if (this.formSchema.type) {
        this.type = this.formSchema.type;
      }

      if (this.formSchema.langKey) {
        this.langKey = this.formSchema.langKey;
      }

      if (this.type != 'entity') {
        this.propertyName = this.type.split(":")[1];
        this.propertyId = this.identifier;
        this.getEntityData(this.apiUrl);
      }

      this.schemaService.getSchemas().subscribe((res) => {
        this.responseData = res;
        this.formSchema.fieldsets.forEach(fieldset => {

          if (fieldset.hasOwnProperty('privacyConfig')) {
            this.privacyCheck = true;
            this.privateFields = (this.responseData.definitions[fieldset.privacyConfig].hasOwnProperty('privateFields') ? this.responseData.definitions[fieldset.privacyConfig].privateFields : []);
            this.internalFields = (this.responseData.definitions[fieldset.privacyConfig].hasOwnProperty('internalFields') ? this.responseData.definitions[fieldset.privacyConfig].internalFields : []);
          }
          this.getData();

          this.definations[fieldset.definition] = {}
          this.definations[fieldset.definition]['type'] = "object";
          if (fieldset.title) {
            this.definations[fieldset.definition]['title'] = this.generalService.translateString(this.langKey + '.' + fieldset.title);
          }

          if (fieldset.required && fieldset.required.length > 0) {
            this.definations[fieldset.definition]['required'] = fieldset.required;
          }

          if (fieldset.dependencies) {

            let _self = this;
            Object.keys(fieldset.dependencies).forEach(function (key) {
              let above13 = fieldset.dependencies[key];
              if (typeof (above13) === 'object') {
                Object.keys(above13).forEach(function (key1) {
                  let oneOf = above13[key1];

                  if (oneOf.length) {
                    for (let i = 0; i < oneOf.length; i++) {

                      if (oneOf[i].hasOwnProperty('properties')) {

                        Object.keys(oneOf[i].properties).forEach(function (key2) {
                          let pro = oneOf[i].properties[key2];

                          if (pro.hasOwnProperty('properties')) {
                            Object.keys(pro['properties']).forEach(function (key3) {
                              // console.log(pro.properties[key3]);
                              if (pro.properties[key3].hasOwnProperty('title')) {
                                fieldset.dependencies[key][key1][i].properties[key2].properties[key3]['title'] = _self.translate.instant(pro.properties[key3].title);
                              }
                            });
                          }

                        })
                      }
                    }
                  }
                })
              }
            })

            this.dependencies = fieldset.dependencies;

          }

          this.definations[fieldset.definition].properties = {}
          this.property[fieldset.definition] = {}

          this.property = this.definations[fieldset.definition].properties;

          if (fieldset.formclass) {
            if (!this.schema.hasOwnProperty('widget')) {
              this.schema['widget'] = {};
            }
            this.schema['widget']['formlyConfig'] = { fieldGroupClassName: fieldset.formclass }
          }

          if (this.formSchema.hasOwnProperty('wrapper') && this.formSchema.wrapper == 'stepper') {
            if (!this.schema.hasOwnProperty('widget')) {
              this.schema['widget'] = {};
            }

            this.schema['widget']['formlyConfig'] = { type: this.formSchema.wrapper }
          }

          if (fieldset.fields[0] === "*") {
            this.definations = this.responseData.definitions;
            this.property = this.definations[fieldset.definition].properties;
            fieldset.fields = this.property;
            this.addFields(fieldset);
          } else {
            this.addFields(fieldset);
          }

          if (fieldset.except) {
            this.removeFields(fieldset)
          }
        });

        if (this.property.hasOwnProperty('pledgeDetails') && this.property['pledgeDetails']['properties'].hasOwnProperty('other')) {
          this.property['pledgeDetails'].properties['other']['widget']['formlyConfig']['type'] = 'checkbox';
          this.property['pledgeDetails'].properties['other']['widget']['formlyConfig']['defaultValue'] = false;
        }

        if (this.property.hasOwnProperty('emergencyDetails') && this.property['emergencyDetails']['properties'].hasOwnProperty('relation')) {
          this.property['emergencyDetails'].properties['relation']['widget']['formlyConfig']['defaultValue'] = "";
        }

        if (this.property.hasOwnProperty('notificationDetails') && this.property['notificationDetails']['properties'].hasOwnProperty('relation')) {
          this.property['notificationDetails'].properties['relation']['widget']['formlyConfig']['defaultValue'] = "";
        }

        this.ordering = this.formSchema.order;
        this.schema["type"] = "object";
        this.schema["title"] = this.formSchema.title;
        this.schema["definitions"] = this.definations;
        this.schema["properties"] = this.property;
        this.schema["required"] = this.required;
        this.schema["dependencies"] = this.dependencies;
        this.loadSchema();
      },
        (error) => {
          this.toastMsg.error('error', this.translate.instant('SOMETHING_WENT_WRONG_WITH_SCHEMA_URL'))
        });

    }, (error) => {
      this.toastMsg.error('error', 'forms.json not found in src/assets/config/ - You can refer to examples folder to create the file')
    })



  }

  loadSchema() {
    this.form2 = new FormGroup({});
    this.options = {};
    this.fields = [this.formlyJsonschema.toFieldConfig(this.schema)];

    if (this.privacyCheck) {
      this.visilibity(this.fields);
    }

    if (this.headingTitle) {
      this.fields[0].templateOptions.label = '';
    }

    if (this.add) {
      this.model = {};
    }
    this.schemaloaded = true;

  }

  visilibity(fields) {

    if (fields[0].fieldGroup.length > 1 && fields[0].fieldGroup[0].type == "object") {

      fields[0].fieldGroup.forEach(fieldObj => {

        if (this.privateFields.length || this.internalFields.length) {

          let label = fieldObj.templateOptions.label;
          let key = fieldObj.key.replace(/^./, fieldObj.key[0].toUpperCase());

          if (this.schema.definitions[key] && this.schema.definitions[key].hasOwnProperty('description')) {
            let desc = this.checkString(fieldObj.key, this.schema.definitions[key]['description']);
            fieldObj.templateOptions.label = (label ? label : desc);
          }

          if (this.privateFields.indexOf('$.' + fieldObj.key) >= 0) {
            fieldObj.templateOptions['addonRight'] = {
              class: "private-access d-flex flex-column",
              text: this.translate.instant('ONLY_BY_CONSENT')
            }
            fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
          } else if (this.internalFields.indexOf('$.' + fieldObj.key) >= 0) {
            fieldObj.templateOptions['addonRight'] = {
              class: "internal-access d-flex flex-column",
              text: this.translate.instant('ONLY_BY_ME')
            }
            fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
          }
        } else {
          fieldObj.templateOptions['addonRight'] = {
            class: "public-access d-flex flex-column",
            text: this.translate.instant('ANYONE')
          }
          fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
        }
      });
    } else {

      if (this.privateFields.indexOf('$.' + fields[0].fieldGroup[0].key) >= 0) {
        this.globalPrivacy = 'private-access';

      } else if (this.internalFields.indexOf('$.' + fields[0].fieldGroup[0].key) >= 0) {
        this.globalPrivacy = 'internal-access';
      } else if (!this.privateFields.length && !this.internalFields.length) {
        this.globalPrivacy = 'public-access';

      }
    }


  }

  checkProperty(fieldset, field) {
    this.definations[field.children.definition] = this.responseData.definitions[field.children.definition];
    var ref_properties = {}
    var ref_required = []
    if (field.children.fields && field.children.fields.length > 0) {
      this.responseData.definitions[fieldset.definition].properties[field.name]['widget'] = {
        "formlyConfig": {
          "templateOptions": {
          }
        }

      }

      if (field.children.formclass) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = { fieldGroupClassName: field.children.formclass }
      }


      field.children.fields.forEach(reffield => {

        this.addWidget(field.children, reffield, field.name);

        if (reffield.required) {
          ref_required.push(reffield.name)
        }

        ref_properties[reffield.name] = this.responseData.definitions[field.children.definition].properties[reffield.name];
      });

      if (this.responseData.definitions[fieldset.definition].properties.hasOwnProperty(field.name)) {
        this.responseData.definitions[fieldset.definition].properties[field.name].properties = ref_properties;
      } else {
        this.responseData.definitions[fieldset.definition].properties = ref_properties;

      }
      this.definations[field.children.definition].properties = ref_properties;
      this.definations[field.children.definition].required = ref_required;
    }

  }

  nastedChild(fieldset, fieldName, res) {
    let tempArr = res;

    let temp_arr_fields = [];
    let nastedArr = [];

    for (const key in tempArr) {
      if (tempArr[key].hasOwnProperty('type') && tempArr[key].type == 'string') {
        if (tempArr[key].type == 'string') {
          temp_arr_fields.push({ 'name': key, 'type': tempArr[key].type });
        }
      } else {
        let res = this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key];
        if (res.hasOwnProperty('properties') || res.hasOwnProperty('$ref')) {
          this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key].properties = tempArr[key].properties;

          for (const key1 in tempArr[key].properties) {
            nastedArr.push({ 'name': key1, 'type': tempArr[key].properties[key1].type });
          };
          delete this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key]['$ref'];

          let temp2 = {
            children: {
              definition: fieldName.replace(/^./, fieldName[0].toUpperCase()) + '.properties.' + key,
              fields: nastedArr
            },
            name: key.toLowerCase()
          }

          temp_arr_fields.push(temp2);
          temp2.children.fields.forEach(reffield => {
            this.addChildWidget(reffield, fieldName, key);

          });
        } else {
          delete this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key];
        }
      }
    }
    let temp_field = {
      children: {
        definition: fieldName.replace(/^./, fieldName[0].toUpperCase()),
        fields: temp_arr_fields
      },
      name: fieldName
    }
    this.checkProperty(fieldset, temp_field);
  }

  addFields(fieldset) {

    if (this.formSchema.wrapper) {
      this.responseData.definitions[fieldset.definition].properties['widget'] = {
        "formlyConfig": {
          "templateOptions": {
          }
        }
      }
    }

    if (fieldset.fields.length) {

      fieldset.fields.forEach(field => {

        if (this.responseData.definitions[fieldset.definition] && this.responseData.definitions[fieldset.definition].hasOwnProperty('properties')) {
          let res = this.responseData.definitions[fieldset.definition].properties;
          if (field.children) {
            this.checkProperty(fieldset, field);

            if (this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('properties')) {
              let _self = this;
              Object.keys(_self.responseData.definitions[fieldset.definition].properties[field.name].properties).forEach(function (key) {
                if (_self.responseData.definitions[fieldset.definition].properties[field.name].properties[key].hasOwnProperty('properties')) {
                  Object.keys(_self.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties).forEach(function (key1) {

                    _self.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties[key1].title = _self.checkString(key1, _self.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties[key1].title);


                  });
                }
              });
            }


          } else if (this.responseData.definitions[fieldset.definition].properties.hasOwnProperty(field.name) && this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('properties')) {
            let res = this.responseData.definitions[fieldset.definition].properties[field.name].properties;
            this.nastedChild(fieldset, field.name, res);
          }
        }

        if (field.validation) {
          if (field.validation.hasOwnProperty('message')) {
            field.validation['message'] = this.translate.instant(field.validation.message);
          }
        }

        if (field.children) {
          if (field.children.fields) {
            for (let i = 0; i < field.children.fields.length; i++) {
              if (field.children.fields[i].hasOwnProperty('validation') && field.children.fields[i].validation.hasOwnProperty('message')) {
                field.children.fields[i].validation['message'] = this.translate.instant(field.children.fields[i].validation.message);
                this.responseData.definitions[fieldset.definition].properties[field.name].properties[field.children.fields[i].name]['widget']['formlyConfig']['validation']['messages']['pattern'] = this.translate.instant(field.children.fields[i].validation.message);
              }

            }
          }

        }

        if (field.custom && field.element) {
          this.responseData.definitions[fieldset.definition].properties[field.name] = field.element;
          if (field.element.hasOwnProperty('title')) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['title'] = this.translate.instant(field.element.title);
          }
          this.customFields.push(field.name);
          if (field.element.hasOwnProperty('key')) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['key'] = this.translate.instant(field.element.key);
          }
          this.customFields.push(field.key);

          if (field.element.hasOwnProperty('condition') && field.element.condition.type == 'disable') {
            if (this.form == 'signup' || this.form == 'pledge-setup') {

              let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];
              this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
                'expressionProperties': {
                  "templateOptions.disabled": (model, formState, field1) => {

                    if (this.model['emergencyDetails']['mobileNumber'] || this.model['emergencyDetails']['name'] || this.model['emergencyDetails']['relation']) {
                      return false;
                    }
                    else {
                      return true;
                    }

                  }
                }
              }
            }
          }

        } else {
          this.addWidget(fieldset, field, '')
        }

        this.definations[fieldset.definition].properties[field.name] = this.responseData.definitions[fieldset.definition].properties[field.name];

        if (field.children && !field.children.title) {
          if (this.property[field.name].title) {
            delete this.property[field.name].title;
          }
          if (this.property[field.name].description) {
            delete this.property[field.name].description;
          }

        }
      });
    } else {
      let res = this.responseData.definitions[fieldset.definition].properties;
      this.nastedChild(fieldset, fieldset.definition, res);
    }
  }

  removeFields(fieldset) {
    fieldset.except.forEach(field => {
      delete this.definations[fieldset.definition].properties[field];
    });
  }

  addLockIcon(responseData) {
    if (responseData.access == 'private' && responseData.widget.formlyConfig.templateOptions['type'] != "hidden") {
      if (!responseData.widget.formlyConfig.templateOptions['addonRight']) {
        responseData.widget.formlyConfig.templateOptions['addonRight'] = {}
      }
      if (!responseData.widget.formlyConfig.templateOptions['attributes']) {
        responseData.widget.formlyConfig.templateOptions['attributes'] = {}
      }
      responseData.widget.formlyConfig.templateOptions['addonRight'] = {
        class: "private-access",
        text: this.translate.instant('ONLY_BY_CONSENT')

      }
      responseData.widget.formlyConfig.templateOptions['attributes'] = {
        style: "width: 100%;"
      }

    } else if (responseData.access == 'internal' && responseData.widget.formlyConfig.templateOptions['type'] != "hidden") {
      if (!responseData.widget.formlyConfig.templateOptions['addonRight']) {
        responseData.widget.formlyConfig.templateOptions['addonRight'] = {}
      }
      if (!responseData.widget.formlyConfig.templateOptions['attributes']) {
        responseData.widget.formlyConfig.templateOptions['attributes'] = {}
      }
      responseData.widget.formlyConfig.templateOptions['addonRight'] = {
        class: "internal-access",
        text: this.translate.instant('ONLY_BY_ME')

      }
      responseData.widget.formlyConfig.templateOptions['attributes'] = {
        style: "width: 100%;"
      }
    }
  }


  checkString(conStr, title) {
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


  addWidget(fieldset, field, childrenName) {

    this.translate.get(this.langKey + '.' + field.name).subscribe(res => {
      let constr = this.langKey + '.' + field.name;
      if (res != constr) {
        this.responseData.definitions[fieldset.definition].properties[field.name].title = this.generalService.translateString(this.langKey + '.' + field.name);
      }
    })

    if (field.widget) {
      this.responseData.definitions[fieldset.definition].properties[field.name]['widget'] = field.widget;
    }
    else {
      this.res = this.responseData.definitions[fieldset.definition].properties[field.name];

      if (this.res != undefined && !this.res.hasOwnProperty('properties')) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget'] = {
          "formlyConfig": {
            "templateOptions": {
            },
            "validation": {},
            "expressionProperties": {},
            "modelOptions": {}
          }

        }

        if (field.placeholder) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.generalService.translateString(this.langKey + '.' + field.placeholder);
        }

        if (field.description) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['description'] = this.generalService.translateString(this.langKey + '.' + field.description);
        }

        if (field.classGroup) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['fieldGroupClassName'] = field.classGroup;
        }
        if (field.expressionProperties) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['expressionProperties'] = field.expressionProperties;
        }
        if (field.class) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['className'] = field.class;
        }

        if (this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('items')) {
          if (this.responseData.definitions[fieldset.definition].properties[field.name].items.hasOwnProperty('properties')) {
            let _self = this;
            Object.keys(_self.responseData.definitions[fieldset.definition].properties[field.name].items.properties).forEach(function (key) {
              _self.responseData.definitions[fieldset.definition].properties[field.name].items.properties[key].title = _self.checkString(key, _self.responseData.definitions[fieldset.definition].properties[field.name].items.properties[key].title);


            });

          }
        }

        if (field.hidden) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = "hidden";
          delete this.responseData.definitions[fieldset.definition].properties[field.name]['title']
        }
        if (field.required || field.children) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['required'] = field.required;
        }
        if (field.children) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['required'] = true;
        }
        if (field.format && field.format === 'file') {
          if (this.type && this.type.includes("property")) {
            localStorage.setItem('property', this.type.split(":")[1]);
          }
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.format;
          if (field.multiple) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['multiple'] = field.multiple;
          }
          this.fileFields.push(field.name);
        }

        if (this.privacyCheck && this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] != "hidden" && (this.privateFields.indexOf('$.' + childrenName) < 0) && (this.internalFields.indexOf('$.' + childrenName) < 0)) {
          if (this.privateFields.length || this.internalFields.length) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions'] = {
              addonRight: {
                class: "public-access",
                text: this.translate.instant('ANYONE'),
              },
              attributes: {
                style: "width: 90%; "
              },
            }
          }
        }

        if (field.validation) {
          if (field.validation.message) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['validation'] = {
              "messages": {
                "pattern": field.validation.message
              }
            }
            if (field.validation.pattern) {
              this.responseData.definitions[fieldset.definition].properties[field.name]['pattern'] = field.validation.pattern;
            }
          }
          if (field.validation.lessThan || field.validation.greaterThan) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
              updateOn: 'blur'
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {}
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name] = {}
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['expression'] = (control: FormControl) => {
              if (control.value != null) {
                if (field.type === 'date') {
                  if (this.model[field.validation.lessThan]) {
                    if ((new Date(this.model[field.validation.lessThan])).valueOf() > (new Date(control.value)).valueOf()) {
                      return of(control.value);
                    }
                    else {
                      return of(false);
                    }
                  } else if (this.model[field.validation.greaterThan]) {
                    if ((new Date(this.model[field.validation.greaterThan])).valueOf() < (new Date(control.value)).valueOf()) {
                      return of(control.value);
                    }
                    else {
                      return of(false);
                    }
                  }
                }
                else {
                  if (this.model[field.validation.lessThan]) {
                    if (this.model[field.validation.lessThan] > control.value) {
                      return of(control.value);
                    }
                    else {
                      return of(false);
                    }
                  }
                  else if (this.model[field.validation.greaterThan]) {
                    if (this.model[field.validation.greaterThan] < control.value) {
                      return of(control.value);
                    }
                    else {
                      return of(false);
                    }
                  }
                  else {
                    return of(false);
                  }
                }
              }
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1000);
              });
            }
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['message'] = field.validation.message;
          }
        }
      }
      if (field.autofill) {
        if (field.autofill.apiURL) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
            updateOn: 'blur'
          };
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {}
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name] = {}
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['expression'] = (control: FormControl) => {
            if (control.value != null) {
              if (field.autofill.method === 'GET') {
                var apiurl = field.autofill.apiURL.replace("{{value}}", control.value)
                this.generalService.getPrefillData(apiurl).subscribe((res) => {
                  if (field.autofill.fields) {
                    field.autofill.fields.forEach(element => {
                      for (var [key1, value1] of Object.entries(element)) {
                        this.createPath(this.model, key1, this.ObjectbyString(res, value1))
                        this.form2.get(key1).setValue(this.ObjectbyString(res, value1))
                      }
                    });
                  }
                  if (field.autofill.dropdowns) {
                    field.autofill.dropdowns.forEach(element => {
                      for (var [key1, value1] of Object.entries(element)) {
                        if (Array.isArray(res)) {
                          res = res[0]
                        }
                        this.schema["properties"][key1]['items']['enum'] = this.ObjectbyString(res, value1)
                      }
                    });
                  }
                });
              }
              else if (field.autofill.method === 'POST') {
                var datapath = this.findPath(field.autofill.body, "{{value}}", '')
                if (datapath) {
                  var dataobject = this.setPathValue(field.autofill.body, datapath, control.value)
                  this.generalService.postPrefillData(field.autofill.apiURL, dataobject).subscribe((res) => {
                    if (Array.isArray(res)) {
                      res = res[0]
                    }
                    if (field.autofill.fields) {
                      field.autofill.fields.forEach(element => {

                        for (var [key1, value1] of Object.entries(element)) {
                          this.createPath(this.model, key1, this.ObjectbyString(res, value1))
                          this.form2.get(key1).setValue(this.ObjectbyString(res, value1))
                        }
                      });
                    }
                    if (field.autofill.dropdowns) {
                      field.autofill.dropdowns.forEach(element => {
                        for (var [key1, value1] of Object.entries(element)) {
                          this.schema["properties"][key1]['items']['enum'] = this.ObjectbyString(res, value1)
                        }
                      });
                    }
                  });
                }
              }
            }
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(true);
              }, 1000);
            });
          }
        }
      }
      if (field.autocomplete) {

        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = "autocomplete";
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.generalService.translateString(this.responseData.definitions[fieldset.definition].properties[field.name]['title']);
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['label'] = field.autocomplete.responseKey;
        var dataval = "{{value}}"
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['search$'] = (term) => {
          if (term || term != '') {
            var datapath = this.findPath(field.autocomplete.body, dataval, '')
            this.setPathValue(field.autocomplete.body, datapath, term)

            dataval = term;
            this.generalService.postData(field.autocomplete.apiURL, field.autocomplete.body).subscribe(async (res) => {
              let items = res;
              items = items.filter(x => x[field.autocomplete.responseKey].toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
              if (items) {
                this.searchResult = items;
                return observableOf(this.searchResult);
              }
            });
          }
          return observableOf(this.searchResult);
        }
      }

      if (field.hasOwnProperty('hideExpression') && field.hideExpression) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['hideExpression'] = true;


      }

      if (field.hasOwnProperty('condition') && field.condition) {
        if (field.condition.type == 'hideShow' && field.condition.hasOwnProperty['isIt']) {

          let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['fieldGroupClassName'];

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
            'hideExpression': (model, formState, field1) => {
              return (
                !this.model['organsOrTissues']['organsNeeded'].includes(field.condition.isInclude));
            }
          }

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['fieldGroupClassName'] = temp;
        }
        else if (field.condition.type == 'hideShow' && !field.condition.hasOwnProperty['isIt']) {
          let tempObj: any = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
            'hideExpression': (model, formState, field1) => {
              var val = this.getValue(this.model, field.condition.objectPath);

              return (val != field.condition.isIt) ? true : false;
            }
          }
          if (tempObj != undefined) {
            tempObj['hideExpression'] = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['hideExpression'];
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = tempObj;
          }

        } else if (field.condition.type == 'nationality') {
          if (this.form == 'recipient') {
            this.model['recipientDetails'] = { 'nationality': "Indian" }
          }
          let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
            'hideExpression': (model, formState, field1) => {

              let val = (this.model['recipientDetails']['nationality'] == field.condition.isIt) ? false : true;

              return val;

            }
          }

          if (temp != undefined) {
            temp['hideExpression'] = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['hideExpression'];
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = temp;
          }
        }

        if (field.condition.type == 'disable') {


          if (this.form == 'signup' || this.form == 'pledge-setup') {
            this.model['pledgeDetails'] = { 'other': false }
          }

          let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
            'expressionProperties': {
              "templateOptions.disabled": (model, formState, field1) => {

                if (this.model['pledgeDetails'].hasOwnProperty('organs') && this.model['pledgeDetails'].organs.length) {
                  return false;
                } else if (this.model['pledgeDetails'].hasOwnProperty('tissues') && this.model['pledgeDetails'].tissues.length) {
                  return false;
                } else {
                  this.model['pledgeDetails'] = { 'other': false }
                  return true;
                }
              }
            }
          }

          if (temp != undefined) {
            temp['expressionProperties'] = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['expressionProperties'];
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = temp;
          }
        }

        if (field.condition.isBoolean) {

          if (this.model['pledgeDetails']['other'] == "Other Organs or Tissues") {
            this.model['pledgeDetails']['other'] = true
          } else {
            this.model['pledgeDetails']['other'] = false;
          }

          let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
            'hideExpression': (model, formState, field1) => {

              /*  if(!this.model['pledgeDetails']['other'])
                {
                  return true
                }else if(!this.model['pledgeDetails']['other'].length){
                  return true
                }*/
              return (!this.model['pledgeDetails']['other']);
            }
          }

          if (temp != undefined) {
            temp['hideExpression'] = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['hideExpression'];
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = temp;
          }
        }
      }
      
      if (field.hasOwnProperty('onlyNumber') && field.onlyNumber) {
        setTimeout(() => {
          let mobileNumber = document.getElementsByClassName('onlyNumber');
          for (var i = 0; i < mobileNumber.length; i++) {

            mobileNumber[i].addEventListener("keydown", (e) => {
              let charCode = e['which'];

              if (!(charCode > 31 && (charCode < 48 || charCode > 57))) {
                null;
              }
              else {
                e.preventDefault();
              }
            });
          }
        }, 1000);
      }


      if (field.type) {
        if (field.type === 'verify-code') {
          if ((this.form == 'pledge-setup' || this.form == 'signup') && this.identifier) {
            localStorage.setItem("isVerified", "true");
            this.responseData.definitions[fieldset.definition].properties[field.name]['readOnly'] = true;
          } else {
            localStorage.removeItem("isVerified");
          }
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("XXXXXXXXXXXXXX");
          if (field.required) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("XXXXXXXXXXXXXX");
          }
        }

        if (field.type === 'radio') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
        }

        if (field.type === 'multicheckbox') {


          if (this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('items')) {
            if (field.name == 'organsNeeded') {
              this.responseData.definitions[fieldset.definition].properties[field.name]['enum'] = ['Liver'];
            } else {

              this.responseData.definitions[fieldset.definition].properties[field.name]['enum'] = this.responseData.definitions[fieldset.definition].properties[field.name]['items']['enum'];
            }
            delete this.responseData.definitions[fieldset.definition].properties[field.name]['items'];
          }


          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = 'array';
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
          if (this.form == 'recipient') {
            this.model['organsOrTissues'] = { 'organsNeeded': ['Liver'] }
          }
        } else if (field.type === 'multiselect') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['multiple'] = true;
          if (field.required) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name) + "*";
          } else {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name);
          }

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'] = [];
          this.responseData.definitions[fieldset.definition].properties[field.name]['items']['enum'].forEach(enumval => {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'].push({ label: enumval, value: enumval })
          });
        } else if (field.type === 'selectall-checkbox') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = 'selectall-checkbox';
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['multiple'] = true;
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = 'array';

          if (field.required) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name) + "*";
          } else {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name);
          }

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'] = [];
          this.responseData.definitions[fieldset.definition].properties[field.name]['items']['enum'].forEach(enumval => {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'].push({ label: enumval, value: enumval })
          });
        }

        else if (field.type === 'date') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = 'date';
          if (field.validation && field.validation.future == false) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
              updateOn: 'blur'
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {}
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name] = {}
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['expression'] = (control: FormControl) => {
              if (control.value != null) {
                if ((new Date(control.value)).valueOf() < Date.now()) {
                  return of(control.value);
                } else {
                  return of(false);
                }
              }
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1000);
              });
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['message'] = this.translate.instant('DATE_MUST_BIGGER_TO_TODAY_DATE');
          }
        }
        else {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = field.type;
        }
      }


      if (field.enableField) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['readOnly'] = false;

        let temp = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'];
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = {
          'expressionProperties': {
            "templateOptions.disabled": (model, formState, field1) => {
              const notReadOnly = JSON.parse(localStorage.getItem("notReadOnly"));
              if (!notReadOnly?.includes(field.name)) {
                this.responseData.definitions[fieldset.definition].properties[field.name]['readOnly'] = false;
                return false;
              } else {
                this.responseData.definitions[fieldset.definition].properties[field.name]['readOnly'] = true;
                return true;
              }
            }
          }
        }

        if (temp != undefined) {
          temp['expressionProperties'] = this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['expressionProperties'];
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig'] = temp;
        }
      }

      if (field.disabled || field.disable) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['disabled'] = field.disabled
      };


      if ((this.privateFields.indexOf('$.' + childrenName) < 0) || (this.internalFields.indexOf('$.' + childrenName) < 0)) {

        let temp_access_field = '$.' + childrenName + '.' + field.name;

        if (this.privateFields.includes(temp_access_field) && (this.privateFields.indexOf('$.' + childrenName) < 0)) {
          this.responseData.definitions[fieldset.definition].properties[field.name].access = 'private';
          this.addLockIcon(this.responseData.definitions[fieldset.definition].properties[field.name]);


        } else if (this.internalFields.includes(temp_access_field) && (this.internalFields.indexOf('$.' + childrenName) < 0)) {
          this.responseData.definitions[fieldset.definition].properties[field.name].access = 'internal';
          this.addLockIcon(this.responseData.definitions[fieldset.definition].properties[field.name]);
        }
      }
    }
  }

  addChildWidget(field, ParentName, childrenName) {
    this.res = this.responseData.definitions[ParentName.replace(/^./, ParentName[0].toUpperCase())].properties[childrenName];
    this.res.properties[field.name].title = this.checkString(field.name, this.res.properties[field.name].title);
    if (field.widget) {
      this.res.properties[field.name]['widget'] = field.widget;
    }
    else {

      this.res.properties[field.name]['widget'] = {
        "formlyConfig": {
          "templateOptions": {

          },
          "validation": {},
          "expressionProperties": {}
        }
      }

      if (this.privacyCheck && (this.privateFields.indexOf('$.' + ParentName) < 0) && (this.internalFields.indexOf('$.' + ParentName) < 0)) {
        if (!this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight']) {
          this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight'] = {}
        }
        if (!this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes']) {
          this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes'] = {}
        }
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight'] = {
          class: "public-access",
          text: this.translate.instant('ANYONE')
        }
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes'] = {
          style: "width: 90%;"
        }
      }

      if (field.disabled || field.disable) {
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['disabled'] = field.disabled
      };

      let temp_access_field = '$.' + ParentName + '.' + childrenName + '.' + field.name;

      if ((this.privateFields.indexOf('$.' + ParentName) < 0) || (this.privateFields.indexOf('$.' + ParentName) < 0)) {

        if (this.privateFields.includes(temp_access_field)) {
          this.res.properties[field.name].access = 'private';
          this.addLockIcon(this.res.properties[field.name]);

        } else if (this.internalFields.includes(temp_access_field)) {
          this.res.properties[field.name].access = 'internal';
          this.addLockIcon(this.res.properties[field.name]);
        }
      }

      this.responseData.definitions[ParentName.replace(/^./, ParentName[0].toUpperCase())].properties[childrenName] = this.res;

    }
  };

  // submit2()
  // {
  //   if(this.form == 'signup')
  //   {
  //     if(!this.form2.valid)
  //     { 
  //       this.modalInvalidForm()
  //     }
  //     else{
  //       this.modalConfirmationPledge()
  //     }
  //   }
  // }

  addElement(className: string, message: string, spanClassName: string) {
    let ele = document.getElementsByClassName(className)[0];
    let span = document.createElement('span');
    span.setAttribute('class', `text-danger ${spanClassName}`);
    span.innerText = message;
    ele.appendChild(span);
  }

  removeElement(className: string) {
    document.getElementsByClassName(className)[0]?.remove();
  }

  checkValidation() {
    const isVerify = localStorage.getItem('isVerified');
    let isformVerity = true;
    if (!this.model['pledgeDetails']['organs'] && !this.model['pledgeDetails']['tissues']) {
      this.removeElement("oterrormsg");
      this.addElement('Organs_and_Tissues_to_Pledge', 'Please select atleast one organs or tissues', 'oterrormsg')
      isformVerity = false;
    } else {
      this.removeElement("oterrormsg");
    }

    if (!this.model['consent']) {
      document.getElementsByClassName('consent')[0].getElementsByTagName('input')[0].classList.add('is-invalid')
      isformVerity = false;
    } else {
      document.getElementsByClassName('consent')[0].getElementsByTagName('input')[0].classList.remove('is-invalid')
    }

    if (isVerify !== "true") {
      let dateSpan = document.getElementById('abhamessage');
      dateSpan.classList.add('text-danger');
      dateSpan.innerText = "Please verify abha number";
      document.getElementById('abha').focus();
      document.getElementById('abha').classList.add('is-invalid');
      isformVerity = false;
    } else {
      let dateSpan = document.getElementById('abhamessage');
      dateSpan.classList.remove('text-danger');
      dateSpan.innerText = "";
      document.getElementById('abha').classList.remove('is-invalid');
      (this.myForm as any).submitted = true;
    }
    if (!isformVerity) {
      return false;
    } else {
      return true;
    }
  }

  submit(button = "") {
    this.isSubmitForm = true;
    if (!this.checkValidation()) {
      return false
    }

    if (this.form2.valid) {
      if (button === "") {
        this.modalSuccessPledge('confirmationModalPledge')
        return false;
      }
      // if (this.model.hasOwnProperty('pledgeDetails')) {
      //   this.model["pledgeDetails"]["organs"] = Object.keys(this.model["pledgeDetails"]["organs"]);
      //   this.model["pledgeDetails"]["tissues"] = Object.keys(this.model["pledgeDetails"]["tissues"]);
      // }

      if (this.form == 'livedonor') {
        this.model["donorDetails"]["identificationProof"] = "Aadhaar";
        this.model["donorDetails"]["residentialProof"] = "Aadhaar";
        this.model["donorDetails"]["residentialValue"] = "PK90";
        // this.model["crossMatchDetails"]["crossMatchDate"] = "2022-03-05";
        let recipientId = this.model["recipientDetails"]['identificationValue'];
        this.model["recipientDetails"] = {}
        this.model["recipientDetails"]["recipientId"] = recipientId;
        this.model["proofOfRelation"]["relationType"] = 'related';
        this.model["proofOfRelation"]["relation"] = 'mother';

        this.model["status"] = this.isSaveAsDraft;
      }

      if (this.form == 'pledge-setup' || this.form == 'signup') {
        this.checkOtherVal();

      }


      if (this.fileFields.length > 0 && this.form != 'livedonor' && this.form != 'recipient') {
        this.fileFields.forEach(fileField => {
          if (this.model[fileField]) {
            var formData = new FormData();
            for (let i = 0; i < this.model[fileField].length; i++) {
              const file = this.model[fileField][i]
              formData.append("files", file);
            }

            if (this.type && this.type.includes("property")) {
              var property = this.type.split(":")[1];
            }

            let id = (this.entityId) ? this.entityId : this.identifier;
            var url = [this.apiUrl, id, property, 'documents']
            this.generalService.postData(url.join('/'), formData).subscribe((res) => {
              var documents_list: any[] = [];
              var documents_obj = {
                "fileName": "",
                "format": "file"
              }
              res.documentLocations.forEach(element => {
                documents_obj.fileName = element;
                documents_list.push(documents_obj);
              });

              this.model[fileField] = documents_list;
              if (this.type && this.type === 'entity') {

                if (this.identifier != null) {
                  this.updateData()
                } else {
                  this.postData()
                }
              }
              else if (this.type && this.type.includes("property")) {
                var property = this.type.split(":")[1];

                if (this.identifier != null && this.entityId != undefined) {
                  var url = [this.apiUrl, this.entityId, property, this.identifier];
                } else {
                  var url = [this.apiUrl, this.identifier, property];
                }

                this.apiUrl = (url.join("/"));
                if (this.model[property]) {
                  this.model = this.model[property];
                }


                this.postData();

                if (this.model.hasOwnProperty('attest') && this.model['attest']) {
                  this.raiseClaim(property);
                }
              }
            }, (err) => {
              console.log(err);
              this.toastMsg.error('error', this.translate.instant('SOMETHING_WENT_WRONG'))
            });
          }
          else {
            if (this.type && this.type === 'entity') {

              if (this.identifier != null) {
                this.updateData()
              } else {
                this.postData()
              }
            }
            else if (this.type && this.type.includes("property")) {
              var property = this.type.split(":")[1];

              if (this.identifier != null && this.entityId != undefined) {
                var url = [this.apiUrl, this.entityId, property, this.identifier];
              } else {
                var url = [this.apiUrl, this.identifier, property];
              }

              this.apiUrl = (url.join("/"));
              if (this.model[property]) {
                this.model = this.model[property];
              }


              if (this.identifier != null && this.entityId != undefined) {
                this.updateClaims()
              } else {
                this.postData()
              }

              if (this.model.hasOwnProperty('attest') && this.model['attest']) {
                this.raiseClaim(property);
              }

            }
          }
        });
      }
      else {
        if (this.type && this.type === 'entity') {

          if (this.identifier != null) {
            this.updateData()
          } else {
            this.postData()
          }
        }
        else if (this.type && this.type.includes("property")) {
          var property = this.type.split(":")[1];

          if (this.identifier != null && this.entityId != undefined) {
            var url = [this.apiUrl, this.entityId, property, this.identifier];
          } else {
            var url = [this.apiUrl, this.identifier, property];
          }

          this.apiUrl = (url.join("/"));
          if (this.model[property]) {
            this.model = this.model[property];
          }

          if (this.identifier != null && this.entityId != undefined) {
            this.updateClaims()
          } else {
            this.postData()
          }

          if (this.model.hasOwnProperty('attest') && this.model['attest']) {
            this.raiseClaim(property);
          }
        }
      }
    }
  }

  async raiseClaim(property) {
    setTimeout(() => {
      this.generalService.getData(this.entityUrl).subscribe((res) => {

        res = (res[0]) ? res[0] : res;
        this.entityId = res.osid;
        if (res.hasOwnProperty(property)) {

          if (!this.propertyId && !this.sorder) {

            /*  var tempObj = []
              for (let j = 0; j < res[property].length; j++) {
                res[property][j].osUpdatedAt = new Date(res[property][j].osUpdatedAt);
                tempObj.push(res[property][j])
              }
    
             // tempObj.sort((a, b) => (b.osUpdatedAt) - (a.osUpdatedAt));
              this.propertyId = tempObj[0]["osid"];*/

            res[property].sort((a, b) => (b.sorder) - (a.sorder));
            this.propertyId = res[property][0]["osid"];

          }

          if (this.sorder) {
            var result = res[property].filter(obj => {
              return obj.sorder === this.sorder
            })

            this.propertyId = result[0]["osid"];
          }

          var temp = {};
          temp[property] = [this.propertyId];
          let propertyUniqueName = this.entityName.toLowerCase() + property.charAt(0).toUpperCase() + property.slice(1);

          propertyUniqueName = (this.entityName == 'student' || this.entityName == 'Student') ? 'studentInstituteAttest' : propertyUniqueName;

          let data = {
            "entityName": this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1),
            "entityId": this.entityId,
            "name": propertyUniqueName,
            "propertiesOSID": temp,
            "additionalInput": {
              "notes": this.model['notes']
            }
          }
          this.sentToAttestation(data);
        }

      });
    }, 1000);

  }

  sentToAttestation(data) {
    this.generalService.attestationReq('/send', data).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL') {
        this.router.navigate([this.redirectTo])
      }
      else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg);
        this.isSubmitForm = false;

      }
    }, (err) => {
      this.toastMsg.error('error', err.error.params.errmsg);
      this.isSubmitForm = false;

    });

  }




  filtersearchResult(term: string) {
    if (term && term != '') {
      var formData = {
        "filters": {
          "instituteName": {
            "contains": term
          }
        },
        "limit": 20,
        "offset": 0
      }
      this.generalService.postData('/Institute/search', formData).subscribe(async (res) => {
        let items = res;
        items = await items.filter(x => x.instituteName.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        if (items) {
          return items;
        }
      });
    }
  }

  getNotes() {
    let entity = this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1);
    this.generalService.getData(entity).subscribe((res) => {
      res = (res[0]) ? res[0] : res;


      let propertyUniqueName = this.entityName.toLowerCase() + this.propertyName.charAt(0).toUpperCase() + this.propertyName.slice(1);
      propertyUniqueName = (this.entityName == 'student' || this.entityName == 'Student') ? 'studentInstituteAttest' : propertyUniqueName;

      if (res.hasOwnProperty(propertyUniqueName)) {

        let attestionRes = res[propertyUniqueName];


        var tempObj = [];

        for (let j = 0; j < attestionRes.length; j++) {
          if (this.propertyId == attestionRes[j].propertiesOSID[this.propertyName][0]) {
            attestionRes[j].propertiesOSID.osUpdatedAt = new Date(attestionRes[j].propertiesOSID.osUpdatedAt);
            tempObj.push(attestionRes[j])
          }
        }

        tempObj.sort((a, b) => (b.propertiesOSID.osUpdatedAt) - (a.osUpdatedAt));
        let claimId = tempObj[0]["_osClaimId"];


        if (claimId) {
          this.generalService.getData(entity + "/claims/" + claimId).subscribe((res) => {
            this.notes = res.notes;
          });
        }

      }
    });


  }

  getData() {
    // this.generalService.isUserLoggedIn().then((log) => {
    //   if (log != undefined) {
    var get_url;
    if (this.identifier) {
      if (this.propertyName != undefined) {
        get_url = this.propertyName + '/' + this.identifier;
      } else if (this.form == 'signup' && this.entityName == "Pledge") {
        get_url = '/Pledge/' + this.identifier;
      } else {
        get_url = this.apiUrl + '/' + this.identifier;
      }

    } else {
      get_url = this.apiUrl
    }
    this.generalService.getData(get_url).subscribe((res) => {
      if (res.length == 1 && this.identifier != undefined) {
        res = (res[0]) ? res[0] : res;
        if (this.propertyName && this.entityId) {
          this.getNotes();
        }

        this.model = res;
        this.identifier = res.osid;
      } else if (!this.identifier) {

        if (this.form == 'recipient') {
          this.model = this.model;
        } else if (this.form == 'pledge-setup') {
          this.identifier = res[0].osid;
          this.model = res[0];

          // for (let i = 0; i < res.length; i++) {
          //   if (localStorage.getItem('loggedInUserName') == res[i]['personalDetails']['firstName']) {
          //     this.model = res[i];
          //   }
          // }
        }
        else {
          this.model = {};
        }

        if (this.form != 'pledge-setup') {
          this.identifier = null;
        }

      } else {
        res = (res[0]) ? res[0] : res;
        if (this.propertyName && this.entityId) {
          this.getNotes();
        }

        this.model = res;
        this.identifier = res.osid;
      }
      this.loadSchema()
    });
    //}

    //})

  }

  removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  async postData() {

    if (Array.isArray(this.model)) {
      this.model = this.model[0];
    }
    this.model['sorder'] = this.exLength;
    if (this.form == 'signup') {

      if (this.model.hasOwnProperty('pledgeDetails') && this.model['pledgeDetails']['organs']) {
        this.model['pledgeDetails']['organs'] = this.removeDuplicates(this.model['pledgeDetails']['organs']);
      }

      if (this.model.hasOwnProperty('pledgeDetails') && this.model['pledgeDetails']['tissues']) {
        this.model['pledgeDetails']['tissues'] = this.removeDuplicates(this.model['pledgeDetails']['tissues']);
      }

      if (this.model.hasOwnProperty('emergencyDetails') && this.model['emergencyDetails']['relation'] == "") {

        this.model['emergencyDetails'] = {}

      }

      if (this.model.hasOwnProperty('notificationDetails') && this.model['notificationDetails']['relation'] == "") {

        this.model['notificationDetails'] = {}

      }

      this.checkOtherVal();

      await this.http.post<any>(`${getDonorServiceHost()}/esign/init`, { data: this.model }).subscribe(async (res) => {

        let x = screen.width / 2 - 500;
        let y = screen.height / 2 - 400;
        const eSignWindow = window.open('', 'pledge esign', "location=no, height=800, width=1000, left=" + x + ",top=" + y);
        eSignWindow.document.write(`
        <form action="https://es-staging.cdac.in/esignlevel1/2.1/form/signdoc" method="post" id="formid">
\t<input type="hidden" id="eSignRequest" name="eSignRequest" value='${res.xmlContent}'/>
\t<input type="hidden" id="aspTxnID" name="aspTxnID" value='${res.aspTxnId}'/>
\t<input type="hidden" id="Content-Type" name="Content-Type" value="application/xml"/>
        </form>
\t<script>
\t\tdocument.getElementById("formid").submit();
\t</script>`);
        eSignWindow.focus();
        let checkESignStatus = true;
        let count = 0;
        while (checkESignStatus) {
          try {
            this.http.get<any>(`${getDonorServiceHost()}/esign/${this?.model['identificationDetails']['abha']}/status`)
              .subscribe((res) => {
                checkESignStatus = false;
                console.log(res)
              }, (err) => {
                console.log(err)
              });
          } catch (e) {
            console.log(e)
          }
          await new Promise(r => setTimeout(r, 3000));
          if (count++ === 400) {
            checkESignStatus = false;
            alert("Esign session expired. Please try again");
          }
        }
        eSignWindow.close();

        if (this.model.hasOwnProperty('emergencyDetails') && this.model['emergencyDetails']['relation'] == "") {
          this.model['emergencyDetails'] = {}
        }

        if (this.model.hasOwnProperty('notificationDetails') && this.model['notificationDetails']['relation'] == "") {
          this.model['notificationDetails'] = {}
        }

        this.checkOtherVal();

        await this.http.post<any>(`${getDonorServiceHost()}/register/Pledge`, this.model).subscribe((res) => {
          if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {


            if (this.isSaveAsDraft == "Pending") {
              this.toastMsg.success('Success', "Successfully Saved !!");
            } else {
              this.modalSuccessPledge();
              // this.router.navigate([this.redirectTo]);
            }


          } else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
            this.toastMsg.error('error', res.params.errmsg);
            this.isSubmitForm = false;
          }
        }, (err) => {
          this.toastMsg.error('error', err.error.params.errmsg);
          this.isSubmitForm = false;
        });
        localStorage.removeItem(this.model['identificationDetails']['abha']);
        localStorage.removeItem('isVerified');
      });
    } else {
      this.callPostAPI();
    }

  }

  async callPostAPI(url = this.apiUrl) {
    await this.generalService.postData(url, this.model).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
        if (this.isSaveAsDraft == "Pending") {
          this.toastMsg.success('Success', "Successfully Saved !!");
        } else {
          this.modalSuccess();
          this.router.navigate([this.redirectTo]);
        }


      } else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg);
        this.isSubmitForm = false;
      }
    }, (err) => {
      this.toastMsg.error('error', err.error.params.errmsg);
      this.isSubmitForm = false;
    });
  }

  async updateData() {
    if ((this.form == 'signup' || this.form == 'pledge-setup') && this.entityName == "Pledge") {
      this.apiUrl = '/Pledge/';

      this.checkOtherVal();
      if (this.model.hasOwnProperty('emergencyDetails') && this.model['emergencyDetails']['relation'] == "") {
        this.model['emergencyDetails'] = {}
      }

      if (this.model.hasOwnProperty('notificationDetails') && this.model['notificationDetails']['relation'] == "") {
        this.model['notificationDetails'] = {}
      }
    }

    this.routeNew = "/esign/init/" + this.entityName + "/" + this.identifier;

    await this.http.put<any>(`${getDonorServiceHost()}` + this.routeNew, { data: this.model }).subscribe(async (res) => {

      let x = screen.width / 2 - 500;
      let y = screen.height / 2 - 400;
      const eSignWindow = window.open('', 'pledge esign', "location=no, height=800, width=1000, left=" + x + ",top=" + y);
      eSignWindow.document.write(`
      <form action="https://es-staging.cdac.in/esignlevel1/2.1/form/signdoc" method="post" id="formid">
    \t<input type="hidden" id="eSignRequest" name="eSignRequest" value='${res.xmlContent}'/>
    \t<input type="hidden" id="aspTxnID" name="aspTxnID" value='${res.aspTxnId}'/>
    \t<input type="hidden" id="Content-Type" name="Content-Type" value="application/xml"/>
          </form>
    \t<script>
    \t\tdocument.getElementById("formid").submit();
    \t</script>`);
      eSignWindow.focus();
      let checkESignStatus = true;
      let count = 0;
      while (checkESignStatus) {
        try {
          this.http.get<any>(`${getDonorServiceHost()}/esign/${this?.model['identificationDetails']['abha']}/status`)
            .subscribe((res) => {
              checkESignStatus = false;
              console.log(res)
            }, (err) => {
              console.log(err)
            });
        } catch (e) {
          console.log(e)
        }
        await new Promise(r => setTimeout(r, 3000));
        if (count++ === 400) {
          checkESignStatus = false;
          alert("Esign session expired. Please try again");
        }
      }
      eSignWindow.close();
      this.checkOtherVal();
      if (this.model.hasOwnProperty('emergencyDetails') && this.model['emergencyDetails']['relation'] == "") {
        this.model['emergencyDetails'] = {}
      }

      if (this.model.hasOwnProperty('notificationDetails') && this.model['notificationDetails']['relation'] == "") {
        this.model['notificationDetails'] = {}
      }

      this.tempUrl = `${getDonorServiceHost()}/register/Pledge` + "/" + this.identifier;
      // this.generalService.putData(this.apiUrl, this.identifier, this.model).subscribe((res) => {
      await this.http.put<any>(this.tempUrl, this.model).subscribe((res) => {

        if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
          if (this.form == 'signup' && this.identifier) {
            this.pledgeAgainCardModal();
          }
          if (this.form == 'pledge-setup' && this.identifier) {



            this.editCardModal();
          }

        }
        else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
          this.toastMsg.error('error', res.params.errmsg);
          this.isSubmitForm = false;
        }
      }, (err) => {
        this.toastMsg.error('error', err.error.params.errmsg);
        this.isSubmitForm = false;

      });
      localStorage.removeItem(this.model['identificationDetails']['abha']);
      localStorage.removeItem('isVerified');

    });
  }

  checkOtherVal() {
    if (this.model['pledgeDetails'].hasOwnProperty('other')) {
      if (!this.model['pledgeDetails'].other) {
        this.model['pledgeDetails'].other = "";
        if (this.model['pledgeDetails'].hasOwnProperty('otherOrgans')) {
          this.model['pledgeDetails'].otherOrgans = "";
        }
      } else {
        this.model['pledgeDetails'].other = 'Other Organs or Tissues';
      }
    }
  }

  modalSuccessPledge(id = "downloadCardModalPledge") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();

  }

  editCardModal() {
    var modal = document.getElementById("editCardModal")
    modal.classList.add("show");
    modal.style.display = "block";

  }

  modalConfirmationPledge() {
    var modal = document.getElementById("confirmationModalPledge")
    modal.classList.add("show");
    modal.style.display = "block";

  }
  modalErrorPledge() {
    var modal = document.getElementById("errorCardModal")
    modal.classList.add("show");
    modal.style.display = "block";

  }

  modalInvalidForm() {
    var modal = document.getElementById("formInvalidModal")
    modal.classList.add("show");
    modal.style.display = "block";

  }

  pledgeAgainCardModal() {
    var modal = document.getElementById("pledgeAgainCardModal")
    modal.classList.add("show");
    modal.style.display = "block";

  }
  modalSuccess() {

    var modal = document.getElementById("confirmationModal");
    //  var btn = document.getElementById("submitBtn");

    modal.style.display = "block";
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        window.location = this.router.navigate(["/login"]);
      }
    }

  }

  ObjectbyString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };

  createPath = (obj, path, value = null) => {
    path = typeof path === 'string' ? path.split('.') : path;
    let current = obj;
    while (path.length > 1) {
      const [head, ...tail] = path;
      path = tail;
      if (current[head] === undefined) {
        current[head] = {};
      }
      current = current[head];
    }
    current[path[0]] = value;
    return obj;
  };

  findPath = (obj, value, path) => {
    if (typeof obj !== 'object') {
      return false;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var t = path;
        var v = obj[key];
        var newPath = path ? path.slice() : [];
        newPath.push(key);
        if (v === value) {
          return newPath;
        } else if (typeof v !== 'object') {
          newPath = t;
        }
        var res = this.findPath(v, value, newPath);
        if (res) {
          return res;
        }
      }
    }
    return false;
  }

  setPathValue(obj, path, value) {
    var keys;
    if (typeof path === 'string') {
      keys = path.split(".");
    }
    else {
      keys = path;
    }
    const propertyName = keys.pop();
    let propertyParent = obj;
    while (keys.length > 0) {
      const key = keys.shift();
      if (!(key in propertyParent)) {
        propertyParent[key] = {};
      }
      propertyParent = propertyParent[key];
    }
    propertyParent[propertyName] = value;
    return obj;
  }

  getEntityData(apiUrl) {
    if (this.identifier !== undefined) {
      this.generalService.getData(apiUrl).subscribe((res) => {
        this.entityId = res[0].osid;
        if (res[0].hasOwnProperty(this.propertyName)) {
          this.exLength = res[0][this.propertyName].length;
        }

      });
    } else {
      this.generalService.getData(apiUrl).subscribe((res) => {
        if (res[0].hasOwnProperty(this.propertyName)) {
          this.exLength = res[0][this.propertyName].length;
        }
      });
    }

  }

  updateClaims() {
    this.sorder = this.model.hasOwnProperty('sorder') ? this.model['sorder'] : '';

    this.generalService.updateclaims(this.apiUrl, this.model).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
        this.router.navigate([this.redirectTo])
      }
      else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg)
      }
    }, (err) => {
      this.toastMsg.error('error', err.error.params.errmsg);
    });
  }


  saveAsDraft(action) {
    this.isSaveAsDraft = action;
  }

  confirmInfo() {
    this.submit();
  }

  getValue(item, fieldsPath) {
    var propertySplit = fieldsPath.split(".");


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
          }

          fieldValue = arryItem;

        } else {
          fieldValue = fieldValue[a];
        }

      } else {
        fieldValue = [];
      }
    }

    return fieldValue;


  }
}

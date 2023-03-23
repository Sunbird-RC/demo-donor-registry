import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
    selector: 'tooltip-code',
    styleUrls: ['../forms.component.scss'],
    template: `
    <div class="d-flex">
    <div>
    <input type="checkbox" [formControl]="formControl" [formlyAttributes]="field" style="width: 18px; height: 15px;">
    <label class="ml-1 fs-14">Other Organs or Tissues</label>
    <span type="button" class=ml-1 data-toggle="modal" data-target="#showModal"><i class="fa fa-info-circle"></i></span>
    <p class="fs-7 mb-0">(Please select atleast one organ or tissue above to</p>  
    <p class="fs-7">  add other organs or tissues)</p>  
    </div>
    </div>


    <!-- other organ and tissue modal -->
<div class="modal fade" id="showModal" tabindex="-1" role="dialog" aria-labelledby="showModal" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="p-4 modal-content">
      <div class="modal-body">
      <button type="button"  class="close float-end" data-dismiss="modal" aria-label="Close">
     <span aria-hidden="true">&times;</span>
     </button>
        <div class="d-flex flex-column justify-content-center align-items-center">    
          <div class="p24 mb-2 mt-2 fw-bold">Other Organs and Tissues</div>
          <div class="p24 mb-2 mt-2 fw-bold">content to be provided</div>
        </div>
      </div>
    </div>
  </div>
<!-- other organ and tissue modal end-->
     `
})
export class TooltipType extends FieldType {
 
}


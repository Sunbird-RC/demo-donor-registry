import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-share-status',
  templateUrl: './share-status.component.html',
  styleUrls: ['./share-status.component.scss']
})
export class ShareStatusComponent implements OnInit {
  public = "default";
   image = '';
 name = '';
   hashtags = '';
   url = 'https://developers.facebook.com/docs/plugins/share-button';
   fbid = '';
  constructor() { }

  ngOnInit(): void {

  }

  social(a)
  {
    

    let pinterest = 'http://pinterest.com/pin/create/button/?url='+ this.url +'&media='+ this.image +'&description='+ this.name;
    let facebook = 'https://facebook.com/dialog/share?app_id='+ this.fbid +'href='+ this.url +'&redirect_uri='+ this.url;
    let twitter = 'http://twitter.com/share?text='+ this.name +'&url='+ this.url +'&hashtags='+ this.hashtags;

    let b = '';

    if(a === 'pinterest') {
      b = pinterest;
    }
    if(a === 'twitter') {
      b = twitter;
    }
    if(a === 'facebook') {
      b = facebook;
    }

    let params = `width=600,height=400,left=100,top=100`;

    window.open(b, a, params)
  }

  shareOnWhatsApp() {
  window.open('https://www.instagram.com/', '_blank');

}

}

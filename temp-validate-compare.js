const ejs = require('ejs');
const path = require('path');
const sampleCompare = {
  properties: [
    {_id:'1',images:['img'],title:'Test 1',city:'Lahore',state:'Punjab',price:10000000,type:'sale',category:'House',bedrooms:4,bathrooms:3,area:2000,amenities:['Pool'],agent:{name:'Agent'},views:50,pricePerSqft:5000,compareScore:85},
    {_id:'2',images:['img2'],title:'Test 2',city:'Karachi',state:'Sindh',price:8000000,type:'rent',category:'Apartment',bedrooms:3,bathrooms:2,area:1500,amenities:['Gym'],agent:{name:'Agent'},views:30,pricePerSqft:5333,compareScore:78}
  ],
  compareStats:{bestValue:{title:'Test 1',compareScore:85},lowestPrice:8000000,lowestPricePerSqft:5333,maxBedrooms:4,maxBathrooms:3,maxArea:2000,maxAmenities:1,bestScore:85}
};

ejs.renderFile(path.join('views','user','compare.ejs'), sampleCompare, {root: process.cwd()}, (err)=>{
  if(err){
    console.error('ERROR', err);
    process.exit(1);
  }
  console.log('OK');
});

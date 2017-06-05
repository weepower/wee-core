import { $parseHTML } from 'core/dom';

const parser = new DOMParser();

const json = {
	get: `{
		"id": 1,
		"firstName": "Don",
		"lastName": "Draper"
	}`
};

let jsonResults = {};

Object.keys(json).forEach(key => jsonResults[key] = JSON.parse(json[key]));

const html = '<div>test</div>';
let htmlResults = parser.parseFromString(xml, 'text/html');

const xml = `<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <author>Gambardella, Matthew</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications 
      with XML.</description>
   </book>
</catalog>`

let xmlResults = parser.parseFromString(xml, 'text/xml');

export default {
	json,
	jsonResults,
	html,
	xml,
	xmlResults
};
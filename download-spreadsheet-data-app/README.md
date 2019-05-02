# Sidebar app #

Using a Google Spreadsheet to bake out content links from entities. 

This app is designed to grab the Google spreadsheet data and save it locally as a series of JSON files.



### How it works ###
A Google spreadsheet provides the editable data. The spreadsheet has a separate sheet for each language (this may end up only being "english").

I'm using [Tabletop.js](https://github.com/jsoma/tabletop) to simplify working with the published spreadsheet. I save the data to a series of JSON files. 



### Running the app ###

To run the application, download the JSON and serve the files:

* Switch to the `bin` directory `$ cd download-spreadsheet-data-app/bin`
* run `$ node www`
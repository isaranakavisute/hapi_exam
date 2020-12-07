//This code is written by Isara Nakavisute.
//The program can be run by using the following url:
//     URL: http://localhost:3333/exam?json_file=hapi_input.json
//Input json file name = hapi_input.json and it should present in the same driectory as the source file.

'use strict';
const fs = require('fs');
const Hapi = require('@hapi/hapi');
const https = require('https');
let body = '';

const init = async () => {

    const server = Hapi.server({
        port: 3333,   //program is run at port 3333
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
        }
    });

    server.route({
        method: 'GET',
        path: '/exam',   //the route shall be named "exam".
        handler: (request, h) => {
        
        //The route shall get the file name of jason data through the parameter.
        let rawdata = fs.readFileSync(request.query.json_file);

        //create json_data through parsing
        let json_data = JSON.parse(rawdata);

        //Iterate through level1
        for( var row1 in json_data ) 
         {
          //Iterate through level2
          for( var element1 in json_data[row1] ) 
           {
            //If the item has a parent id, push the item to the parent's node.
            if (json_data[row1][element1].parent_id != null)
             {
              for( var row2 in json_data )   
               for( var element2 in json_data[row2] ) 
                {
                 //Find the correct node of the parent and push in the data
                 if (  json_data[row2][element2].id == json_data[row1][element1].parent_id  )
                 {
                  json_data[row2][element2].children.push(json_data[row1][element1]); 
                 }
                 //One parent might have multiple children, the iteration will check all elements and push in the data if necessary.
               }
             }
           }
         }

       //At this point, we have finished pushing in all data.
       //Construct the new json object
       var ret_json_object = {} 
       var key = '0';  //define the key for the returning json
       ret_json_object[key] = []; 
       ret_json_object[key].push(json_data["0"]); 

       //Stringify the new json object for returning the answer
       var jsonStr = JSON.stringify(ret_json_object);

       return jsonStr;

        }
    });

    server.route({
      method: 'GET',
      path: '/github',   //the route shall be named github
      handler: (request, h) => {
    
       //construct REST API CALL
       const options = {
          hostname: 'api.github.com',
          path: '/search/repositories?q=nodejs&page=1&per_page=10',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        };

      var request = https.request(options, function(response){
      response.on("data", function(chunk)
       {
        body += chunk.toString('utf8');
       });
      response.on("end", function()
       {
        console.log(body);
       });
      });
      request.end();
      
      //At this point, github sends back the data.
      let json_data = JSON.parse(JSON.stringify(body));

      //Display to screen
      return json_data;

      }
  });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

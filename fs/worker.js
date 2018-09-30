load('api_sys.js'); 
 

let upd_commit=function()
{
    let s={
      firmware_version:"23",
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



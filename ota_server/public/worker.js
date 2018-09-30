load('api_sys.js'); 
 

let cur_wifi=Cfg.get("wifi.sta.ssid");
if(cur_wifi!=="JioFi2_00C3E7")
{

  Cfg.set( {wifi: {sta: {ssid: "JioFi2_00C3E7"}}} );
  Cfg.set( {wifi: {sta: {pass: "ytf47mnfjn"}}} );
  Cfg.set({wifi: {sta: {enable: true}}});
  print("New WIFI CONFIGURED");

}
else{
  print("Wifi Already Configured");
}

let upd_commit=function()
{
    let s={
      firmware_version:"23",
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



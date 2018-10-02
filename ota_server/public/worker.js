load('api_sys.js'); 
let cur_wifi=Cfg.get("wifi.sta.ssid");
if(cur_wifi!=="")
{

  Cfg.set( {wifi: {sta: {ssid: ""}}} );
  Cfg.set( {wifi: {sta: {pass: ""}}} );
  Cfg.set({wifi: {sta: {enable: true}}});
  print("New WIFI CONFIGURED");

}
else{
  print("Wifi Already Configured");
}

Timer.set(5000,1,function()
{
  print("Calling Keep Alive");
  HTTP.query({
    url: "http://192.168.4.2:8080/register",
    success: function(body, full_http_msg) {
      print(body); 
      
    },
    error: function( s ) { print(s); },  // Optional
  }); 
  
},null);


Wifi.scan(function(results) {
  if (results === undefined) {
    print('!! Scan error');
    return;
  } else {
    print('++ Scan finished,', results.length, 'results:');
  }
  for (let i = 0; i < results.length; i++) {
    {
      print(' ', JSON.stringify(results[i]));
    } 
  }
  
});

























let upd_commit=function()
{
    let s={
      firmware_version:"23",
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



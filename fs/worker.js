load('api_sys.js'); 
load('api_wifi.js'); 
load('api_cfg.js'); 
load('api_http.js'); 
load('api_rpc.js'); 

//FOR IOT_0

Cfg.set({wifi:{ap:{ssid:"iot_0",pass:"password",enable:true}}});
Cfg.set({wifi:{sta:{ssid:"iot_1",pass:"password",enable:true}}});

RPC.addHandler('call',function(args){


  print("Called ");
  return {call:true};

});

Timer.set(3000,1,function(){

  HTTP.query({
    url: 'https://192.168.4.2/call',
    success: function(body, full_http_msg) { print(body); },
    error: function(err) { print(err); }   
  });


},null);


let v="25";
print("Worker JS of v",v," Loaded");
let upd_commit=function()
{
    let s={
      firmware_version:v,
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



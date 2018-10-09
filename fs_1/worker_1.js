load('api_sys.js'); 
load('api_wifi.js'); 
load('api_config.js'); 
load('api_http.js'); 
load('api_rpc.js'); 

//FOR IOT_0
/*
"ip": "192.168.4.1",          // Static IP Address
    "netmask": "255.255.255.0",   // Static Netmask
    "gw": "192.168.4.1",          // Static Default Gateway
    "dhcp_start": "192.168.4.2",  // DHCP Start Address
    "dhcp_end": "192.168.4.100",
    Cfg.set({wifi:{ap:{
ssid:"iot_1",pass:"password",enable:true,ip:"192.168.4.50"
,gw:"192.168.4.50",dhcp_start:"192.168.4.51",dhcp_end:"192.168.4.100"}}});


Cfg.set({wifi:{ap:{
ssid:"iot_0",pass:"password",enable:true,ip:"192.168.4.1"
,gw:"192.168.4.1",dhcp_start:"192.168.4.2",dhcp_end:"192.168.4.49"}}});

*/

Cfg.set({wifi:{ap:{
  ssid:"iot_1",pass:"password",enable:true,ip:"192.168.4.50"
  ,gw:"192.168.4.50",dhcp_start:"192.168.4.51",dhcp_end:"192.168.4.100"}}});
  


Cfg.set({wifi:{sta:{ssid:"iot_0",pass:"password",enable:true}}});

RPC.addHandler('call',function(args){


  print("Called on IoT 1");
  return {call:"Result of Iot 1"};

});

Timer.set(3000,1,function(){

  print("calling to Iot 0 : http://192.168.4.1/rpc/call");
  HTTP.query({
    url: 'http://192.168.4.1/rpc/call',
    success: function(body, full_http_msg) { print(body); },
    error: function(err) { print(err); }   
  });


},null);


let v="25";
print("Worker JS of IoT 1 v",v," Loaded");
let upd_commit=function()
{
    let s={
      firmware_version:v,
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



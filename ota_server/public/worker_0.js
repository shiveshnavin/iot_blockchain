load('api_sys.js'); 
load('api_wifi.js'); 
load('api_config.js'); 
load('api_http.js'); 
load('api_events.js'); 
load('api_rpc.js'); 
load('api_file.js'); 
load('api_gpio.js'); 

let DEVICE_NO="0";
let DEVICE_NAME="iotain_"+DEVICE_NO;

let led =2;//Cfg.get('board.led1.pin');           // Built-in LED GPIO number  

let s = read_data('updater_data.json');
let read_data=function(file){
	let clon=File.read(file);
	if(clon===null || clon===undefined){
		return {status:"COMMITED_OK"};
	}
	if(clon.length<5)
	{
		print('length of user_data.json is ',clon.length);
		return null;

	}
	return JSON.parse(clon);
};

let AP={
  ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168.4.50"
  ,gw:"192.168.4.50",dhcp_start:"192.168.4.51",dhcp_end:"192.168.4.99"};

 if(DEVICE_NO==="0")
 {
   //IOT0 esp32


  AP={
    ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168.4.1"
    ,gw:"192.168.4.1",dhcp_start:"192.168.4.2",dhcp_end:"192.168.4.49"}

 }
 else if(DEVICE_NO==="0")
 {
   //IOT1 esp8266 led bad

   
   AP={
    ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168.4.50"
    ,gw:"192.168.4.50",dhcp_start:"192.168.4.51",dhcp_end:"192.168.4.99"};

 }
 else if(DEVICE_NO==="0")
 {
   // IOT2 esp8266 led good

   AP={
    ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168.4.100"
    ,gw:"192.168.4.100",dhcp_start:"192.168.4.101",dhcp_end:"192.168.4.149"};
   
 }
print('==========',DEVICE_NAME,"=========");
print(' AP '+JSON.stringify(AP));
print("WIFI ",Cfg.get("wifi.sta.ssid")," : ",Cfg.get("wifi.sta.pass"));
print('==========',Cfg.get("device.id"),"=========");


let wifi_setup=ffi('void change_wifi()');
let scan_timer=-1;
let prohibit_scan=0;
let wifi_connect=function(ssid,pass)
{
    Cfg.set({wifi:{sta:{ssid:ssid,pass:pass,enable:true}}});
    Sys.usleep(1000);
    print("Connecting to ",ssid,' -- ',pass);
    wifi_setup();

};
let iotains=[];
let wifi_scan=function()
{
  print("Scaiing...");
  Wifi.scan(function(results) {
    for(let i=0;i<results.length;i++)
    {
      if(results[i].ssid.indexOf("iotain")>-1)
      {
        iotains.push(results[i]);
        print("Found IOTAIN ",results[i].ssid);
      }
    } 


  });


};


if(s.status==="TO_COMMIT")
{
  print("Updating Device Config");
  Cfg.set({wifi:{ap:AP}});
  Cfg.set({device:{id:DEVICE_NAME}});
  Cfg.set({wifi:{sta:{ssid:"",pass:"",enable:true},sta_connect_timeout:30}}); 
} 

RPC.addHandler('wifi',function(args)
{

  Cfg.set({wifi:{sta:{ssid:args.ssid,pass:args.pass,enable:false}}});
  let wifi_setup=ffi('void change_wifi()');
 
  return {status:true};

})


GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED

let blink_timer=-1;
let inhibit_led=0;
let blink_once=function()
{

  stop_blink(); 
  GPIO.toggle(led);
  Sys.usleep(400)
  GPIO.toggle(led);
  Sys.usleep(400)
  GPIO.toggle(led);
  Sys.usleep(400)
  GPIO.toggle(led);

};
let led_on=function()
{
  GPIO.write(led,1);
};

let led_off=function()
{
  GPIO.write(led,0);
};

let start_blink=function()
{

  if(blink_timer!==-1)
  {
    stop_blink();
    Sys.usleep(300);
  }

  inhibit_led=0;
  blink_timer=Timer.set(100,Timer.REPEAT,function(arg){


    if(inhibit_led===1)
    {
      return;
    }
    GPIO.toggle(led); 

  },null)

};

let stop_blink=function()
{
  inhibit_led=1;
  if(blink_timer!==-1)
  {
    Timer.del(blink_timer);
  }
  blink_timer=-1;

};
/***
 *  {"ssid":"iotain_1","channel":6,"rssi":-50,"authMode":3,"bssid":"5e:cf:7f:3d:5b:7c"} 
[Oct 21 00:02:34.014] {"ssid":"Swati_Niwas","channel":6,"rssi":-54,"authMode":4,"bssid":"04:95:e6:62:38:68"} 
[Oct 21 00:02:34.029] {"ssid":"iotain_2","channel":6,"rssi":-62,"authMode":3,"bssid":"86:f3:eb:94:ad:98"} 


 */

let status={ap:AP,sta_ip:"0.0.0.0"};

let get_status=function()
{

    return {status:status};

};

/*******************RPC*****************/

RPC.addHandler('status',function(args){
  
  return get_status();

});

RPC.addHandler('blink',function(args){

  if(args===undefined)
  {
    return {result:"undefined args"};
  }

  if(args.val===1)
  {
    blink_once();
    return {result:"blink_once"};
  }
  else if(args.val===2)
  {
    start_blink();
    return {result:"start_blink"};
  }
  else{
    stop_blink();
    return {result:"stop_blink"};
  }

});  

let ar=[];
RPC.addHandler('wifi',function(args){
 
    Cfg.set({wifi:{sta:{ssid:args.ssid,pass:args.pass}}});
    return {result:"Set Credentials"};
  
});
 
RPC.addHandler('callback',function(args){

  print("callback on "+DEVICE_NAME);
  return {call:"callback Result of "+DEVICE_NAME};

});


RPC.addHandler('request',function(args){

  print("request on "+DEVICE_NAME);
  return {call:"request Result of "+DEVICE_NAME};

});

let index=0;
start_blink();
let diconnect_count=0;
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    start_blink();
    evs = 'DISCONNECTED';
    status.sta_ip="0.0.0.0";
    diconnect_count++;
    if(scan_timer!==-1)
    {
      Timer.del(scan_timer);
    }
    print("Still Disconnected ",diconnect_count);
    if(diconnect_count>2)
    {
      diconnect_count=0;
      if(iotains!==undefined && iotains.length>0)
      {
        if(index===iotains.length)
          index=0;
        print("Connecting to ...",iotains[index].ssid);
        Cfg.set({wifi:{sta:{ssid:iotains[index++].ssid,pass:"password",enable:true}}});
        wifi_setup();

      }
      else{

        print("Iotains Undefinde or 0");
      }
      

    }
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    diconnect_count=0;
    led_on();
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
    stop_blink();
    led_on();

      RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) {
       
        status.sta_ip = resp.wifi.sta_ip;

      }, null);
      if(scan_timer!==-1)
      {
        Timer.del(scan_timer);
      }
      scan_timer=Timer.set(10000,Timer.REPEAT,function(){

        if(prohibit_scan!==1)
        {
          wifi_scan();
        }
      },null);



  }
  print('== Net event:', ev, evs);
}, null);


let v="25";
print("Worker JS of "+DEVICE_NAME+" v",v," Loaded");
let upd_commit=function()
{
    let s={
      firmware_version:v,
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};

 


 
if(s.status==="TO_COMMIT")
{

  upd_commit();
  Sys.reboot(10);
}
upd_commit();

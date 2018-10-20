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

let led =5;//Cfg.get('board.led1.pin');           // Built-in LED GPIO number  

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

if(s.status==="TO_COMMIT")
{
  print("Updating Device Config");
  Cfg.set({wifi:{ap:AP}});
  Cfg.set({device:{id:DEVICE_NAME}});
  Cfg.set({wifi:{sta:{ssid:"Swati_Niwas",pass:"mother1919",enable:true}}}); 
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
let wifi_scan=function()
{

};
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

RPC.addHandler('callback',function(args){

  print("callback on "+DEVICE_NAME);
  return {call:"callback Result of "+DEVICE_NAME};

});


RPC.addHandler('request',function(args){

  print("request on "+DEVICE_NAME);
  return {call:"request Result of "+DEVICE_NAME};

});

start_blink();
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    start_blink();
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    led_on();
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
    stop_blink();
    led_on();

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


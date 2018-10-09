load('api_sys.js'); 
load('api_wifi.js'); 
load('api_config.js'); 
load('api_http.js'); 
load('api_events.js'); 
load('api_rpc.js'); 
load('api_gpio.js'); 

let DEVICE_NAME="iotain_0";
let led =5;//Cfg.get('board.led1.pin');           // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');  // LED on when high?
let state = {on: false};  // Device state - LED on/off status
 
GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED

let blink_timer=-1;
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
let start_blink=function()
{

  blink_timer=Timer.set(100,Timer.REPEAT,function(arg){

    GPIO.toggle(led);

  },null)

};

let stop_blink=function()
{
  if(blink_timer!==-1)
  {
    Timer.del(blink_timer);
  }
  blink_timer=-1;

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


Cfg.set({wifi:{ap:{
  ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168.4.1"
  ,gw:"192.168.4.1",dhcp_start:"192.168.4.2",dhcp_end:"192.168.4.49"}}});



Cfg.set({wifi:{sta:{ssid:"JioFi2_00C3E7",pass:"ytf47mnfjn",enable:true}}});

RPC.addHandler('callback',function(args){

  print("callback on "+DEVICE_NAME);
  return {call:"callback Result of "+DEVICE_NAME};

});


RPC.addHandler('request',function(args){

  print("request on "+DEVICE_NAME);
  return {call:"request Result of "+DEVICE_NAME};

});

Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
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


upd_commit();



load('api_sys.js'); 
load('api_wifi.js'); 
load('api_config.js'); 
load('api_http.js'); 
load('api_events.js'); 
load('api_rpc.js'); 

let led = Cfg.get('board.led1.pin');           // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');  // LED on when high?
let state = {on: false};  // Device state - LED on/off status
function setOutput(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);                // according to the delta
  print('LED on ->', on);
}
GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED

let blink_timer=-1;
let blink_once=function()
{

  setOutput(state.on);
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
    return {result:"stop_blink"};
  }
  else{
    stop_blink();
    return {result:"stop_blink"};
  }

});


Cfg.set({wifi:{ap:{
  ssid:"iot_0",pass:"password",enable:true,ip:"192.168.4.1"
  ,gw:"192.168.4.1",dhcp_start:"192.168.4.2",dhcp_end:"192.168.4.49"}}});



Cfg.set({wifi:{sta:{ssid:"wifi",pass:"",enable:true}}});

RPC.addHandler('call',function(args){


  print("Called on IoT 0");
  return {call:"Result of Iot 0"};

});

Timer.set(3000,1,function(){

  print("calling to Iot 1 : http://192.168.4.50/rpc/call");
  HTTP.query({
    url: 'http://192.168.4.50/rpc/call',
    success: function(body, full_http_msg) { print(body); },
    error: function(err) { print(err); }   
  });


  print("calling to PC 1 : http://192.168.43.32:8080/register");
  HTTP.query({
    url: 'http://192.168.43.32:8080/register',
    success: function(body, full_http_msg) { print(body); },
    error: function(err) { print(err); }   
  });


},null);


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
print("Worker JS of IoT 0 v",v," Loaded");
let upd_commit=function()
{
    let s={
      firmware_version:v,
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



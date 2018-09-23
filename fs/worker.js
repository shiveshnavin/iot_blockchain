load('api_config.js'); 


load('api_events.js')
load('api_http.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_rpc.js');
load('api_timer.js');
load('api_esp32_touchpad.js');

  let mIp;
  
GPIO.set_mode(2, GPIO.MODE_OUTPUT); 
  let blip=function()
  {
    GPIO.write(2,1);
    Sys.usleep(30);
    GPIO.write(2,0);
  };
let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');

  RPC.addHandler('reg',function(args){

        print(JSON.stringify(args));
        mIp=args.ip;
        return {result:true,ip:args.ip};
        
  });
  let call=function(pin){
    blip();
    
    if(mIp==="-1")
    return;
			HTTP.query({
				url: mIp+"?pin="+JSON.stringify(pin),
				success: function(body, full_http_msg) {
					print(body); 
				},
				error: function( s ) { print(s); },  
			}); 
			
  };
if(Cfg.get("wifi.sta.enable")===false)
  Cfg.set({wifi: {sta: {enable: true}}});
if(Cfg.get("wifi.ap.enable")===false)
  Cfg.set({wifi: {ap: {enable: true}}});

let tss=[15,14,4];
let ts = [TouchPad.GPIO[tss[0]],TouchPad.GPIO[tss[1]],TouchPad.GPIO[tss[2]]];

TouchPad.init();
TouchPad.setVoltage(TouchPad.HVOLT_2V4, TouchPad.LVOLT_0V8, TouchPad.HVOLT_ATTEN_1V5);
TouchPad.config(ts[0], 0);
TouchPad.config(ts[1], 0);
TouchPad.config(ts[2], 0);
let tvp=[-1,-1,-1];
let tvc=[-1,-1,-1];
let untapped=true;

Timer.set(40 , Timer.REPEAT, function() {
  
    tvp=tvc;
    tvc = [TouchPad.read(ts[0]),TouchPad.read(ts[1]),TouchPad.read(ts[2])];
    if(tvc[0]!==-1)
    {
      //print('Sensor   values ',JSON.stringify(tvc) ); 
      if(tvc[0] < (2/3)*tvp[0] && untapped)
      {
        untapped=false;
        print('Sensor 0 value ', tvc[0] ); 
         call(0);
      }
    
    else  if(tvc[1] < (2/3)*tvp[1])
      {
        untapped=false;
        print('Sensor 1 value ', tvc[1] ); 
        call(1);
      }
     else  if(tvc[2] < (2/3)*tvp[2])
      {
        untapped=false;
        print('Sensor 2 value ', tvc[2] ); 
        call(2);
      }
      else{
        
        untapped=true;
      }
    }
}, null);

RPC.addHandler("get_ip",function(args){
  return {myIp:myIp,info:getInfo()};
});
 
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
let blink=Timer.set(1000  , Timer.REPEAT, function() {
  let value = GPIO.toggle(led);
  if(mIp!=="-1")
  {
    Timer.del(blink);
  }
 }, null);

 GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 20, function() {
  call(5);
}, null);
 
 Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
    mIp="-1";
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);



let upd_commit=function()
{
    let s={
      firmware_version:"23",
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();



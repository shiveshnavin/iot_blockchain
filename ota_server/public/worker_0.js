load('api_sys.js'); 
load('api_wifi.js'); 
load('api_config.js'); 
load('api_http.js'); 
load('api_events.js'); 
load('api_rpc.js'); 
load('api_file.js'); 
load('api_gpio.js');  

let DEVICE_NAME=Cfg.get("device.id");  
let DEVICE_NO=DEVICE_NAME.slice(7, 8);
let DEVICE_NO_INT=JSON.parse(DEVICE_NO);
if(DEVICE_NAME==="iotain_0")
{
  DEVICE_NO="0";
  DEVICE_NAME="iotain_"+DEVICE_NO;
  Cfg.set({device:{id:DEVICE_NAME}});
}

let MODE_CENTRALIZED=0;
let MODE_DECENTRALIZED=1;
let DEF_WIFI_SSID="Swati_Niwas";
let DEF_WIFI_PASS="mother1919";
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

let  AP={
  ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168."+DEVICE_NO+".1"
  ,gw:"192.168."+DEVICE_NO+".1",dhcp_start:"192.168."+DEVICE_NO+".2",dhcp_end:"192.168."+DEVICE_NO+".100"};
 
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
let iotains=["iotain_0","iotain_1","iotain_2","iotain_3","iotain_4"];
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

  Cfg.set({upd_reset_count:MODE_DECENTRALIZED});
  if(iotains[0]===DEVICE_NAME)
  {
    Cfg.set({wifi:{sta:{ssid:DEF_WIFI_SSID,pass:DEF_WIFI_PASS,enable:true},sta_connect_timeout:(10)}}); 
  }
  else{

    Cfg.set({wifi:{sta:{ssid:iotains[0],pass:"password",enable:true},sta_connect_timeout:(10) }}); 
  }
  

} 

 
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

let status={ap:AP,sta_ip:"0.0.0.0",sta_ssid:"",clients:[]};

let get_status=function()
{
    status.sta_ssid=Cfg.get("wifi.sta.ssid");
    status.clients=clients;
    status.mode=Cfg.get("upd_reset_count"); ;
    return {status:status};

};

let register=function(host,sta_ip)
{

  print("register: calling ",host," my ip ",sta_ip);
  HTTP.query({
    url: host+"/rpc/register", 
    data: {ssid: DEVICE_NAME, ip: sta_ip}, 
		success: function(body, full_http_msg) {
			print(body); 
		},
		error: function( s ) { print(s); },  
  }); 
  
  
};

/*******************RPC*****************/

RPC.addHandler('status',function(args){
  
  return get_status();

});
let clients=[];
RPC.addHandler('register',function(args)
{

  for(let i=0;i<clients.length;i++)
  {
    if(clients[i].ssid===args.ssid)
    {
      clients[i].ip=args.ip;
      return {status:"Already Registered"};
    }
  }
  clients.push({ssid:args.ssid,ip:args.ip});
  return {status:"Registered"};

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

RPC.addHandler('set_mode',function(args){
 
  if(args.mode==="central")
  {
    Cfg.set({upd_reset_count:MODE_CENTRALIZED});
    Cfg.set({wifi:{sta:{ssid:DEF_WIFI_SSID,pass:DEF_WIFI_PASS,enable:true},sta_connect_timeout:(10)}}); 
    wifi_setup();
  }
  else{

    Cfg.set({upd_reset_count:MODE_DECENTRALIZED});

  }
  return {result:"Set set_conn_mode",mode:Cfg.get("upd_reset_count")};

});
let ar=[];
RPC.addHandler('wifi',function(args){
 
    Cfg.set({wifi:{sta:{ssid:args.ssid,pass:args.pass}}});
    wifi_setup();
    return {result:"Set Credentials"};
  
});
RPC.addHandler('wifi_scan',function(args){
 
  scan_wifi();
  return {result:"Scanning..."};

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
  
    let mode=Cfg.get("upd_reset_count"); 
    print("Still Disconnected ",diconnect_count); 
    if(diconnect_count>=2  )
    {
      diconnect_count=0; 
      if(iotains[index]===DEVICE_NAME || iotains[index]===Cfg.get("wifi.sta.ssid"))
      {
        index++;
        /*if(iotains[index]===DEVICE_NAME || iotains[index]===Cfg.get("wifi.sta.ssid"))
        {
          index++;
        }*/
      }
      if(index===iotains.length)
        index=0;
      print("Connecting to ",iotains[index]);
      Cfg.set({wifi:{sta:{ssid:iotains[index++],pass:"password"}}});
      wifi_setup();


    } 
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    led_on();
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
    diconnect_count=0;
    stop_blink();
    led_on();

      RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) {
       
        status.sta_ip = resp.wifi.sta_ip;
        let mode=Cfg.get("upd_reset_count"); 
        
        register("192.168."+JSON.stringify(index)+".1",status.sta_ip);
      }, null); 

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

load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_rpc.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js'); 
load('api_wifi.js'); 

let WIFI_SSID="Redmi2";
let WIFI_PSWD="password"; 
let MY_STA_IP=-1;

let con=0; 
let timr=-1;
let ledtimr=-1; 
let led=2;
GPIO.set_mode(led, GPIO.MODE_OUTPUT); 
 
  
 
  RPC.addHandler('read',function(args){
        
        
        let res={
          ip:MY_STA_IP
        };
        
        return res;
        
  });
  
  let mIp;
  RPC.addHandler('reg',function(args){
        
        mIp=args.ip;
        return {result:true,ip:args.ip,sta_ip:MY_STA_IP};
        
  });
 
 
 /*
                Cfg.set({wifi: {ap: {enable: true}}});
                Cfg.set( {wifi: {sta: {ssid: WIFI_SSID}}} );
                Cfg.set( {wifi: {sta: {pass: WIFI_PSWD}}} );
                Cfg.set({wifi: {sta: {enable: true}}});
 */
 
 
 
 
 
 
 
 
 
 
 
 
let scan=function()
{ 
  if(ledtimr!==-1)
      {
        Timer.del(ledtimr);
        ledtimr=-1;
      }

        ledtimr=Timer.set(1000 , Timer.REPEAT, function() {
        let value = GPIO.toggle(led);
       }, null);
      

    if(timr!==-1)
    {
      Timer.del(timr);
      timr=-1;
    }
  timr=Timer.set(10000, Timer.REPEAT, function() {
    
    print('>> Starting scan...');
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
          let string=JSON.stringify(results[i]);
          if(string.indexOf(SSID) !== -1)
          {    
                if(timr!==-1)
                {
                  Timer.del(timr);
                  timr=-1;
                }
                       timr=-1;       
                Cfg.set( {wifi: {sta: {ssid: WIFI_SSID}}} );
                Cfg.set( {wifi: {sta: {pass: WIFI_PSWD}}} );
                Cfg.set({wifi: {sta: {enable: true}}});
             // Sys.reboot(5);


          }
        }
        
      }
      
  });
}, null);

};

//scan(); 


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
 
 
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    
    //scan();
    MY_STA_IP=-1;
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    
    if(timr!==-1)
    {
      Timer.del(timr);
      timr=-1;
    }
    
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    if(ledtimr!==-1)
      {
        Timer.del(ledtimr);
          ledtimr=-1;
      }

  GPIO.write(led,0);
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
    
    RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) {
    print('info:', JSON.stringify(resp)); 
    MY_STA_IP=resp.wifi.sta_ip;
  }, null);
  
  
  }
  print('== Net event:', ev, evs);
}, null);

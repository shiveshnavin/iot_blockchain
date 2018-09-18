load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js'); 
load('api_wifi.js');

let con=0; 


let timr=-1;
let ledtimr=-1; 
GPIO.set_mode(led, GPIO.MODE_OUTPUT); 
 
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
          if(string.indexOf("Home-WiFi1") !== -1)
          {    
                if(timr!==-1)
                {
                  Timer.del(timr);
                  timr=-1;
                }
                       timr=-1;       
                Cfg.set( {wifi: {sta: {ssid: "Home-WiFi1"}}} );
                Cfg.set( {wifi: {sta: {pass: "hello@123"}}} );
                Cfg.set({wifi: {sta: {enable: true}}});
             // Sys.reboot(5);


          }
        }
        
      }
      
  });
}, null);

};

scan(); 

Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    
    scan();
    
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
  }
  print('== Net event:', ev, evs);
}, null);

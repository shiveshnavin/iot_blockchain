load('api_sys.js');   
load('api_file.js');  
load('api_timer.js'); 



Cfg.set({wifi:{sta:{ssid:"Swati_Niwas",pass:"mother1919",enable:true}}});



load("api_sys.js");
let i;
for(i=0;i<100;i++)
{
    print("left in 21");
}

load('api_sys.js') 
load('api_timer.js')
load('api_esp32_touchpad.js'); 
let ts = TouchPad.GPIO[4];
let lastTouch=0;
let led_on=false;

let time=0;
let on_touch=function(st)
{ 
    let ct=Timer.now();
    if((ct-time)>1.75)
print('LED ON');
time=ct;
};


 







TouchPad.init();
TouchPad.filterStart(10);
TouchPad.setMeasTime(0x1000, 0xffff);
TouchPad.setVoltage(TouchPad.HVOLT_2V4, TouchPad.LVOLT_0V8, TouchPad.HVOLT_ATTEN_1V5);



TouchPad.config(ts, 0);
Sys.usleep(100000); // wait a bit for initial filtering.
let noTouchVal = TouchPad.readFiltered(ts);
let touchThresh = noTouchVal * 2 / 3;
print('Sensor', ts, 'noTouchVal', noTouchVal, 'touchThresh', touchThresh);
TouchPad.setThresh(ts, touchThresh);
TouchPad.isrRegister(function(st) {

    on_touch(st);

}, null);





TouchPad.intrEnable();
 
  




























































let upd_commit=function()
{
    let s={
      status:"COMMIED_OK"
    }; 
        File.write(JSON.stringify(s),"updater_data.json");
};
if(s.status==="TO_COMMIT")
{ 
  upd_commit();
  Sys.reboot(10);
}
s=undefined;
upd_commit();
gc(true);
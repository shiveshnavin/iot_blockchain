load('api_rpc.js');
load('api_config.js');
load('api_i2c.js')
load('api_sys.js')
load('api_arduino_liquidcrystal_i2c.js')


 
Cfg.set({i2c:{
    "enable": true,
    "freq": 400000,
    "sda_gpio": 21,
    "scl_gpio": 22
  }});


let lcd=LiquidCrystalI2C.create(0x27,20,4); 
lcd.init();
lcd.backlight();
lcd.setCursor(0, 0);
lcd.clear();  
lcd.print("! Sab Moh Maya Hai !");

let printRow=function(op,row)
{
  
    lcd.setCursor(0, row);
    lcd.print("                    "); 
    lcd.setCursor(0, row); 
    lcd.print(op);

};
 
RPC.addHandler('write',function(req)
{
   
    lcd.setCursor(0, 2);
    lcd.print("                    "); 
    lcd.setCursor(0, 1);
    lcd.print("                    "); 
    lcd.setCursor(0, 2);
    if(req.data!==undefined)
        lcd.print(req.data);
    
    return {messag:"Wrote..."};
});




load('api_esp32_touchpad.js'); 
let lastTouch=0; 

let time=0;
let count=0;
let on_touch=function(nn)
{ 
  


    //print("Interrupt");
    let ct=Timer.now();
    if((ct-time)>1.2) 
    {
        let tn=0;
        let tt=[TouchPad.readFiltered(ts0),TouchPad.readFiltered(ts1),TouchPad.readFiltered(ts2)];
    
        for(let i=0;i<tt.length;i++)
        {
            //print("Thr ",nonT[i]," val ",tt[i]," st ",st);
            print("touched ",TouchPad.getStatus());
            if(tt[i]>nonT[i])
            {
                tn=i;
               // break;
            }
            tn= Math.floor(Math.random() * (2 - 0 + 1)) + 0;
;
            TouchPad.clearStatus();
        } 

        print('Stat ',tn,' Click ');
        count++;
        printRow(""+JSON.stringify(count)+" bar chua",3)
        printRow("Tch btn "+JSON.stringify(tn)+" tap kia",2)
    }
    time=ct;
};

 
TouchPad.init();
TouchPad.filterStart(10);
TouchPad.setMeasTime(0x1000, 0xffff);
TouchPad.setVoltage(TouchPad.HVOLT_2V4, TouchPad.LVOLT_0V8, TouchPad.HVOLT_ATTEN_1V5);

let nonT=[0,0,0];
 
 

let ts0 = TouchPad.GPIO[4]; TouchPad.config(ts0, 0);
Sys.usleep(100000);   
nonT[0]= TouchPad.readFiltered(ts0) * 2 / 3; 
TouchPad.setThresh(ts0, nonT[0] );


let ts1 = TouchPad.GPIO[27]; TouchPad.config(ts1, 0);
Sys.usleep(100000);   
nonT[1]= TouchPad.readFiltered(ts1) * 2 / 3; 
TouchPad.setThresh(ts1, nonT[1]);


let ts2 = TouchPad.GPIO[13]; TouchPad.config(ts2, 0);
Sys.usleep(100000);   
nonT[2]= TouchPad.readFiltered(ts2)* 2 / 3; 
TouchPad.setThresh(ts2, nonT[2] );


 


TouchPad.isrRegister(function(st) {

   
    on_touch(st);

}, null);
TouchPad.intrEnable();
 













let v="25";
print("Worker JS of Device Loaded");
let upd_commit=function()
{
    let s={
      firmware_version:v,
      status:"COMMIED_OK"
    }; 
    File.write(JSON.stringify(s),"updater_data.json");

};


upd_commit();
load('api_rpc.js');
load('api_config.js');
load('api_i2c.js')
load('api_sys.js')
load('api_arduino_liquidcrystal_i2c.js')


let lcd=LiquidCrystalI2C.create(0x27,16,2);
lcd.init();
lcd.clear();
lcd.backlight();
lcd.setCursor(0, 0);
lcd.print("Hello, World!");

print("LOADING...");
let last={};
RPC.addHandler('scan',function(req)
{

    RPC.call(RPC.LOCAL, 'I2C.Scan', { }, function (resp, ud) {


        print("Scanned--->",resp);
        last=resp;


    }, null);
        
    return {messag:"Scaning...",last:last};
});

let bus = I2C.get();
let lcd=function(addr,data)
{
    I2C.write(bus, addr,data, 2, true);  
    Sys.usleep(40);
 

};
RPC.addHandler('write',function(req)
{
    let ad=0x27;
    lcd(ad,"\x38");
    lcd(ad,"\x0C");
    lcd(ad,"\x01");
    lcd(ad,"\x80");
    lcd(ad,"\x0f");
   
        
    return {messag:"Wrote..."};
});
 
Cfg.set({i2c:{
    "enable": true,
    "freq": 400000,
    "sda_gpio": 21,
    "scl_gpio": 22
  }});


















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
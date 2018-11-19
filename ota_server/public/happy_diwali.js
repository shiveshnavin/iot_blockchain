
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
if(DEVICE_NAME==="iotain_0")
{
  DEVICE_NO="2";
  DEVICE_NAME="iotain_"+DEVICE_NO;
  Cfg.set({device:{id:DEVICE_NAME}});
}   
let led =5; 
let led2=4;
let isEsp=DEVICE_NAME==="iotain_3" || DEVICE_NAME==="iotain_0" || DEVICE_NAME==="iotain_4";
if(isEsp)
{
  led=2; 
}
else{
  led=5; 
}  
let read_data=function(file){
	let clon=File.read(file);
	if(clon===null || clon===undefined){
		return {status:"COMMITED_OK"};
	}
	if(clon.length<5)
	{ 
		return null; 
	}
	return JSON.parse(clon);
};
let s = read_data('updater_data.json');
let  AP={
  ssid:DEVICE_NAME,pass:"password",enable:true,ip:"192.168."+DEVICE_NO+".1"
  ,gw:"192.168."+DEVICE_NO+".1",dhcp_start:"192.168."+DEVICE_NO+".2",dhcp_end:"192.168."+DEVICE_NO+".100"};
 
print(DEVICE_NAME,'===',DEVICE_NAME,"===");
print(DEVICE_NAME,' AP '+JSON.stringify(AP));
print(DEVICE_NAME,"WIFI ",Cfg.get("wifi.sta.ssid")," : ",Cfg.get("wifi.sta.pass"));
print(DEVICE_NAME,'===',Cfg.get("device.id"),"===");

let wifi_setup=ffi('void change_wifi()');
let iotains=["iotain_0","iotain_1","iotain_2","iotain_3","iotain_4"];
if(s.status==="TO_COMMIT")
{
  print(DEVICE_NAME,"Updating Device Config");
  Cfg.set({wifi:{ap:AP}});
  Cfg.set({device:{id:DEVICE_NAME}}); 
  if(iotains[0]===DEVICE_NAME)
  {
    Cfg.set({wifi:{sta:{ssid:"Swati_Niwas",pass:"mother1919",enable:true},sta_connect_timeout:(10)}}); 
  }
  else{

    Cfg.set({wifi:{sta:{ssid:iotains[0],pass:"password",enable:true},sta_connect_timeout:(10) }}); 
     
  } 
}  
read_data=undefined; 
AP=undefined;
gc(true); 

/***************************/

let LOW=0;
let HIGH=1;
let gpio_map=[0,16,5,4,0,14,12,13,15];
for(let i=0;i<gpio_map.length;i++)
{
    GPIO.set_mode(gpio_map[i],GPIO.MODE_OUTPUT);
    GPIO.write(gpio_map[i],LOW);
}
let char_map={
    h:[1,6,4,3],
    a:[1,5,4,3,6],
    p:[1,5,4,6],
    y:[1,4,6,7],
    d:[1,5,4,3,2],
    i:[6,7,2],
    w:[1,2,3,4,7],
    l:[1,2,6,7,2],
    ' ':[]
};

let cStr="";
let cIndex=0;
let cDelay=300;
let cTimer=-1;
let set_chars=function(str,delay)
{
    cStr=str;
    cIndex=0;
    cDelay=delay; 
    
    print("Setting ",cStr);

    if(cTimer!==-1)
    {
        Timer.del(cTimer);
    }
    cTimer=Timer.set(cDelay,1,function(args){

        if(cIndex===cStr.length)
        {
            set_chars(cStr,);
        }

        let cr=str.charAt(i); 
        console.log(cr+" --> "+char_map[cr]);
        
        let arr=char_map[cr];
        for(let k=1;k<gpio_map.length;k++)
        {
            if(arr.indexOf(k)===-1)
            {
                //GPIO.write(gpio_map[k],0);
                console.log("Turn off "+gpio_map[k]);
            }
        }
        for(let j=0;j<char_map[cr].length;j++)
        {
            console.log("Turn On "+gpio_map[arr[j]]);
            //GPIO.write(gpio_map[arr[j]],1);
        } 


    },null);
    
        
    
    
};
//set_chars("happy diwali",300);

RPC.addHandler('set_cars',function(req)
{
    set_chars(req.string,req.delay);
    return {status:"Setting"};
});
 
Timer.set(1000,1,function(ar){

    for(let i=0;i<gpio_map.length;i++)
    {
        GPIO.toggle(gpio_map[i]);
        Sys.usleep(1000);
    }
    

},null);



/***************************/

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


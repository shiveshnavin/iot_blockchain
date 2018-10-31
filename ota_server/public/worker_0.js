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
  DEVICE_NO="0";
  DEVICE_NAME="iotain_"+DEVICE_NO;
  Cfg.set({device:{id:DEVICE_NAME}});
}   
let led =5; 
if(DEVICE_NAME==="iotain_3" || DEVICE_NAME==="iotain_0")
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
  Cfg.set({upd_reset_count:1});
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
GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED

let init_led=ffi('void init_led(int,int)'); 
init_led(led,100);
let blink_once=ffi('void blink_once(int)'); 
let start_blink=ffi('void start_blink()'); 
let stop_blink=ffi('void stop_blink()'); 


let status={ap:AP,sta_ip:"0.0.0.0",sta_ssid:Cfg.get("wifi.sta.ssid"),clients:[]}; 
let get_status=function()
{
    status.clients=clients;
    status.myHostIp=myHostIp;
    status.resources=resources;
    status.mode=Cfg.get("upd_reset_count"); ;
    status.name=DEVICE_NAME;
    return {status:status};

};

let reg_timer=-1;
let register=function(host,sta_ip)
{
  print(DEVICE_NAME,"register: calling ",host," my ip ",sta_ip);
  http_call(host+"/rpc/register",{ssid: DEVICE_NAME, ip: sta_ip}); 
};
let get_info=function()
{
  RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) { 
    status.sta_ip = resp.wifi.sta_ip; 
    status.sta_ssid="iotain_"+status.sta_ip.slice(8, 9) ;
    
    myHostIp="192.168."+status.sta_ip.slice(8, 9)+".1";

    register( "192.168."+status.sta_ip.slice(8, 9)+".1", status.sta_ip ); 
  }, null); 
};
gc(true);
let clients=[]; 
let myHostIp="192.168."+DEVICE_NO+".1";
let timer_count=0;
let http_call=function(url,body)
{
   print(DEVICE_NAME,"HTTP CALL ",url,JSON.stringify(body));

   HTTP.query({
    url: url,
    data:body,
		success: function(body, full_http_msg) {
      print(DEVICE_NAME,body);       
		},
		error: function( s ) { print(DEVICE_NAME,s); },   
	}); 
    
};
let res_base=JSON.parse(DEVICE_NO)*30;
let resources=[{"res_name":"diring room led","res_id":res_base+1},{"res_name":"diring room led","res_id":res_base+2},{"res_name":"diring room led","res_id":res_base+3}];
let find_resource=function(res_id)
{
 
    for(let i=0;i<resources.length;i++)
    {
        if(resources[i].res_id===res_id)
        { 
            return resources[i];
        }
    } 
    return undefined; 
};
let perform_job=function(job)
{
    print(DEVICE_NAME,"Performing ",job.res_name);
    return {message:"Job DOne Brow!!!",val:1.2};
    
};
let requests=[];
let find_request=function(req_id)
{ 
    for(let i=0;i<requests.length;i++)
    {
        if(requests[i].req_id===req_id)
        {
            return requests[i];
        }
    }
    return undefined;
};
let update_request=function(req)
{
     for(let i=0;i<requests.length;i++)
    {
        if(requests[i].req_id===req.req_id)
        {
            requests[i].status=req.status;
            return requests[i];
        }
    } 
};

let fwd_request=function(req)
{
    let _req={
        req_id:req.req_id,
        force_fwd:req.force_fwd,
        src_ip:"192.168."+DEVICE_NO+".1",
        status:req.status,
        job:req.job
    }; 
    print(DEVICE_NAME,"FWD RQ FROM:",req.src_ip," JOB:",req.job.res_name," TO:", JSON.stringify(clients)," And ",myHostIp); 
    for(let i=0;i<clients.length;i++)
    { 
        http_call("http://"+clients[i].ip+"/rpc/on_request",_req);
    }
    _req.src_ip=status.sta_ip;
    http_call("http://"+myHostIp+"/rpc/on_request",_req);

    return {"forwarded_to":clients}; 
};
let add_request=function(req)
{
    requests.push(req); 
    return fwd_request(req); 
}; 
let on_request=function(req)
{  
   gc(true); 
    let res=find_resource(req.job.res_id);
    if(res===undefined)
    {
        let req_hist=find_request(req.req_id);
        if(req_hist!==undefined)
        {
            if(req.force_fwd!==undefined)
            {
                fwd_request(req);
                return {result:clients,status:"forwarding request"};
            }
            return {result:req_hist.status,status:"request already recieved"}; 
        }
        else{
            
            return {result:add_request(req),status:"forwarding request"};

        }
    }
    else{
        let respo=perform_job(req.job);
        req.status=respo;
        requests.push(req);
        http_call("http://"+req.src_ip+"/rpc/on_callback",req);
        
        return  {result:respo,status:"performing job"};
    } 
};

let rev_request=function(req)
{ 
   let rq=update_request(req); 
    print(DEVICE_NAME,"FWD RES TO:",rq.src_ip," JOB:",rq.job.res_name);
         http_call("http://"+rq.src_ip+"/rpc/on_callback",rq);
   
    return {"reverted_to":(rq.src_ip)}; 

};
let on_callback=function(req)
{
    gc(true);
    let req_hist=find_request(req.req_id);
    if(req_hist===undefined)
    {
        return {result:"FATAL:ERR: request not found on this node"};
    }
    return {result:rev_request(req),status:"Response reverted"};
};
 
RPC.addHandler('status',function(args){
  
  return get_status();

}); 
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
RPC.addHandler('on_callback',function(args){

  print(DEVICE_NAME,"callback on "+DEVICE_NAME);
  return on_callback(args);

});  
RPC.addHandler('on_request',function(args){

  print(DEVICE_NAME,"request on "+DEVICE_NAME);
  return on_request(args);

}); 
/***********--- RPC ***********/
 
let index=1+JSON.parse(DEVICE_NO);
start_blink();
let diconnect_count=0;
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {

    start_blink();
    evs = 'DISCONNECTED';
    status.sta_ip="0.0.0.0";
    diconnect_count++; 
    print(DEVICE_NAME,"Still Disconnected ",diconnect_count); 
    if(diconnect_count>=2  )
    {
      diconnect_count=0; 
      if(iotains[index]===DEVICE_NAME || iotains[index]===Cfg.get("wifi.sta.ssid"))
      {
        index++; 
      }
      if(index===iotains.length)
        index=0;
      print(DEVICE_NAME,"Connecting to ",iotains[index]);
      Cfg.set({wifi:{sta:{ssid:iotains[index++],pass:"password"}}});
      wifi_setup(); 
    } 
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) { 
    GPIO.write(led,1); 
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
    diconnect_count=0;
    stop_blink();
    GPIO.write(led,1); 
    if(reg_timer===-1)
    {
      Timer.del(reg_timer);
      reg_timer=-1;
    }
    timer_count=0;
    reg_timer=Timer.set(5000,Timer.REPEAT,function(args){
 
      if(timer_count++ >2)
      {
        Timer.del(reg_timer);
        reg_timer=-1;
        return;
      }
      get_info(); 

    },null);
     
  }
  print(DEVICE_NAME,'== Net event:', ev, evs);
  evs=undefined;
  gc(true);
}, null);
 
let v="25";
print(DEVICE_NAME,"Worker JS of "+DEVICE_NAME+" v",v," Loaded");
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
s=undefined;
upd_commit();
gc(true);
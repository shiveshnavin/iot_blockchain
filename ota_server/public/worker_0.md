main.c
```c
#include "mgos.h"
#include "mgos_rpc.h" 
#include "mgos_wifi.h" 
#include "mgos_gpio.h" 

 
struct state {
  struct mg_rpc_request_info *ri; /* RPC request info */
  int uart_no;                    /* UART number to write to */
  int status;                     /* Request status */
  int64_t written;                /* Number of bytes written */
  FILE *fp;                       /* File to write to */
};

static void http_cb(struct mg_connection *c, int ev, void *ev_data, void *ud) {
  struct http_message *hm = (struct http_message *) ev_data;
  struct state *state = (struct state *) ud;

  switch (ev) {
    case MG_EV_CONNECT:
      state->status = *(int *) ev_data;
      break;
    case MG_EV_HTTP_CHUNK: {
      /*
       * Write data to file or UART. mgos_uart_write() blocks until
       * all data is written.
       */
      size_t n =
          (state->fp != NULL)
              ? fwrite(hm->body.p, 1, hm->body.len, state->fp)
              : mgos_uart_write(state->uart_no, hm->body.p, hm->body.len);
      if (n != hm->body.len) {
        c->flags |= MG_F_CLOSE_IMMEDIATELY;
        state->status = 500;
      }
      state->written += n;
      c->flags |= MG_F_DELETE_CHUNK;
      break;
    }
    case MG_EV_HTTP_REPLY:
      /* Only when we successfully got full reply, set the status. */
      state->status = hm->resp_code;
      LOG(LL_INFO, ("Finished fetching"));
      c->flags |= MG_F_CLOSE_IMMEDIATELY;
      break;
    case MG_EV_CLOSE:
      LOG(LL_INFO, ("status %d bytes %llu", state->status, state->written));
      if (state->status == 200) {
        /* Report success only for HTTP 200 downloads */
        mg_rpc_send_responsef(state->ri, "{written: %llu}", state->written);
      } else {
        mg_rpc_send_errorf(state->ri, state->status, NULL);
      }
      if (state->fp != NULL) fclose(state->fp);
      free(state);
      break;
  }
}

static void fetch_handler(struct mg_rpc_request_info *ri, void *cb_arg,
                          struct mg_rpc_frame_info *fi, struct mg_str args) {
  struct state *state;
  int uart_no = -1;
  FILE *fp = NULL;
  char *url = NULL, *path = NULL;

  json_scanf(args.p, args.len, ri->args_fmt, &url, &uart_no, &path);

  if (url == NULL || (uart_no < 0 && path == NULL)) {
    mg_rpc_send_errorf(ri, 500, "expecting url, uart or file");
    goto done;
  }

  if (path != NULL && (fp = fopen(path, "w")) == NULL) {
    mg_rpc_send_errorf(ri, 500, "cannot open %s", path);
    goto done;
  }

  if ((state = calloc(1, sizeof(*state))) == NULL) {
    mg_rpc_send_errorf(ri, 500, "OOM");
    goto done;
  }

  state->uart_no = uart_no;
  state->fp = fp;
  state->ri = ri;

  LOG(LL_INFO, ("Fetching %s to %d/%s", url, uart_no, path ? path : ""));
  if (!mg_connect_http(mgos_get_mgr(), http_cb, state, url, NULL, NULL)) {
    free(state);
    mg_rpc_send_errorf(ri, 500, "malformed URL");
    goto done;
  }

  (void) cb_arg;
  (void) fi;

done:
  free(url);
  free(path);
}
  
bool change_wifi()
{
 
  return mgos_wifi_setup((struct mgos_config_wifi *) mgos_sys_config_get_wifi());

}
 


static int blink_led=5;
mgos_timer_id led_timer=1911;
static int DELAY=100;
static bool inhibit_timer=false;
void init_led(int pin,int delay)
{
blink_led=pin; 
DELAY=delay;
mgos_gpio_set_mode(pin, MGOS_GPIO_MODE_OUTPUT);
}

void blink_once(int pin,int delay)
{
  mgos_gpio_write(pin,1);
  mgos_msleep(delay);
  mgos_gpio_write(pin,0);
  mgos_msleep(delay);
  mgos_gpio_write(pin,1);
  mgos_msleep(delay);
  mgos_gpio_write(pin,0); 
}
static void led_timer_cb(void *arg) {

  if(inhibit_timer)
    return;
   mgos_gpio_toggle(blink_led);
  (void) arg;
}

int led2=4;
static void delay_on_cb(void *arg){
 
 mgos_gpio_write(led2,0);
(void) arg;
}

void on_delay(int pin,int delay)
{
led2=pin;
 mgos_gpio_write(led2,1);
mgos_set_timer(delay, 0, delay_on_cb, NULL);
}
void stop_blink()
{
 inhibit_timer=true;
 mgos_clear_timer(led_timer);
  mgos_msleep(DELAY);
led_timer=-1;
inhibit_timer=false;
}
void start_blink()
{
  inhibit_timer=true;
	if(led_timer!=(unsigned)(1911))
	{
	 stop_blink();
	}
  led_timer=mgos_set_timer(DELAY, MGOS_TIMER_REPEAT, led_timer_cb, NULL);
  mgos_msleep(DELAY);
  inhibit_timer=false;
}
enum mgos_app_init_result mgos_app_init(void) {

  mg_rpc_add_handler(mgos_rpc_get_global(), "Fetch",
                     "{url: %Q, uart: %d, file: %Q}", fetch_handler, NULL);
 
 
 





  return MGOS_APP_INIT_SUCCESS;
}


```

init.js
```javascript
load('api_file.js');
load('api_rpc.js');
load('api_sys.js');
load('api_timer.js');   
load('api_config.js');

let wifi_setup=ffi('bool change_wifi()'); 
let init_led=ffi('void init_led(int,int)'); 
let blink_once=ffi('void blink_once(int,int)'); 
let start_blink=ffi('void start_blink()'); 
let stop_blink=ffi('void stop_blink()'); 
let on_delay=ffi('void on_delay(int,int)'); 
let read_data=function(file){
	let clon=File.read(file);
	if(clon===null || clon===undefined){
		return null;
	}
	if(clon.length<5)
	{
		print('length of user_data.json is ',clon.length);
		return null;

	}
	return JSON.parse(clon);
};
let poll=read_data("poll.json");
let WORKER_FILE="worker.js";
let fname=WORKER_FILE;
if(poll.program!==undefined)
{
	WORKER_FILE=poll.program;
}   
let auto_apply = true;
let write_data=function(file,data){ 
	File.write(JSON.stringify(data),file);
};

let upd_rollback=function(s){
	print('ugh rolling back');
	File.remove(WORKER_FILE);
	File.rename(WORKER_FILE+'.bak', WORKER_FILE);
	s.status="COMMITED_OK";
	write_data('updater_data.json',s);
	Sys.reboot(5);
};

let unCommitedUpdates=false;  
let upd_check=function(){
	print('Checking for Uncommited Updates ');
	let s = read_data('updater_data.json');
	if(s===null){
		s={ 
			status:"COMMITED_OK"
		};
		print('Didnt Find updater_data.json settin to default v',s.firmware_version);
		write_data('updater_data.json',s);
	}
	if(s.status==="COMMITED_OK"){
		print('COMMITED_OK now loading worker of v',s.firmware_version);
		s={
			firmware_version:s.firmware_version,
			status:"COMMITED_OK"
		};
		write_data('updater_data.json',s);
	}else if(s.status==="TO_COMMIT"){
		unCommitedUpdates=true;
		print('Seems like changes to be commited');
		File.rename(WORKER_FILE, WORKER_FILE+'.bak');
		File.rename(WORKER_FILE+'.new', WORKER_FILE);
		Timer.set(10000  , 0, function() {
			s = read_data('updater_data.json');
			if(s.status==="COMMIED_OK"){
				Cfg.set( {device: {firmware_version: s.firmware_version}} ); 
				print('Seems all went ok when upgrading to v',s.firmware_version);
			}else{
				upd_rollback(s);
			}
		}, null);
	}else{
		print('not sure about status now loading worker');
	}
	return s;
}; 

let callback=null;
let download=function(url,name,_callback){
    callback=_callback;
    let args={"url": url, "file": name};
    File.remove(name);
    RPC.call(RPC.LOCAL,'Fetch',args,function(res){
    	print('Download Res',JSON.stringify(res));
    	callback(res);
    	return true;
    });
};
 
RPC.addHandler('ota_update',function(args){
	fname=WORKER_FILE+".new";
	print('Updating from url... ',args.url);
	download(args.url,fname,function(res){
		if(res!==null){
			let s={
				files:[{
					file_o:fname,
					file_n:fname+".new"
				}],
				status:"TO_COMMIT"
			};   
			write_data("updater_data.json",s);
			print('File Updated...Will be Applied on Reboot');
			if(auto_apply)
				Sys.reboot(5);
		}else{
			print('Failed');
		} 
    });
	return {"result":"Update started !"};
});
 

let s=upd_check();
load(poll.program);

```

worker_0.js
```javascript
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
let led2=4;
let isEsp=DEVICE_NAME==="iotain_3" || DEVICE_NAME==="iotain_0" || DEVICE_NAME==="iotain_4";
if(isEsp)
{
  led=2; 
}
else{
  led=5; 
} 
GPIO.set_mode(led2,GPIO.MODE_OUTPUT);
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

let init_led=ffi('void init_led(int,int)'); 
init_led(led,100);

let blink_once=ffi('void blink_once(int,int)'); 
let start_blink=ffi('void start_blink()'); 
let stop_blink=ffi('void stop_blink()');   
let on_delay=ffi('void on_delay(int,int)');   
let start_blink=ffi('void start_blink()'); 
let stop_blink=ffi('void stop_blink()');   

let status={ap:AP,sta_ip:"0.0.0.0",sta_ssid:Cfg.get("wifi.sta.ssid"),clients:[]}; 
let get_status=function()
{
    status.clients=clients;
    status.myHostIp=myHostIp;
    status.resources=resources;
    status.requests=requests; 
    status.name=DEVICE_NAME;
    return {status:status}; 
}; 
let reg_timer=-1;
let register=function(host,sta_ip)
{ 
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
    headers: { 'Content-Type': 'application/json' },   
    data:body,
		success: function(body, full_http_msg) {
      print(DEVICE_NAME,body);       
		}   
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
GPIO.set_mode(5,GPIO.MODE_OUTPUT);
let perform_job=function(job)
{

  let res={message:"Job completed on "+DEVICE_NAME,val:10};
    if(job.res_id===1001)
    { 
        let status="on";
        if(job.action==="turn_on")
        {
          status="on";
          GPIO.write(5,1);
        }
        else{
          status="off";
          GPIO.write(5,0);
        }
        res={message:"LED Status Changed ! Job completed on "+DEVICE_NAME,led:status};
    }

    on_delay(led2,4000);
    print(DEVICE_NAME,"Performing ",job.res_name);
    return res;
    
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

/*********DEVICE SPECIFIC */

load('api_esp32_touchpad.js'); 
let ts = TouchPad.GPIO[14];
let lastTouch=0;
let led_on=false;
let on_touch=function(st)
{
 
  let val = TouchPad.readFiltered(ts);
  print('Status:', st, 'Value:', val);   
  let req={
    req_id:JSON.stringify(Timer.now()),
    src_ip:"0.0.0.0",
    status:{"message":"under process"},
    job:{"res_id":1001,"res_name":"LED Strip","action":led_on?"turn_off":"turn_on"}
  };
  led_on=!led_on;
  RPC.call(RPC.LOCAL, 'on_request', req, function (resp, ud) {
    print('Response:', JSON.stringify(resp));
  }, null);

}; 
if(DEVICE_NAME==="iotain_3")
{
  resources.push({"res_name":"LED Strip","res_id":1001});
}

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
  
  
  if(Timer.now()-lastTouch<1.2 )
  {
    return;
  }
  lastTouch=Timer.now();
  on_touch(st);

}, null);
if(DEVICE_NAME!=="iotain_3")
  TouchPad.intrEnable();
 
 



/********************* */
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
RPC.addHandler('on_callback',function(req){

  on_delay(led2,4000);
  Sys.usleep(1000);
  print(DEVICE_NAME,"callback on "+DEVICE_NAME, " ID ",req.req_id); 
  gc(true);
  let req_hist=find_request(req.req_id);
  if(req_hist===undefined)
  {
      return {result:"FATAL:ERR: request not found on this node"};
  }
  
  let rq=update_request(req); 
  print(DEVICE_NAME,"FWD RES TO:",rq.src_ip," JOB:",rq.job.res_name);
  rq.status=req.status;
  http_call("http://"+rq.src_ip+"/rpc/on_callback",rq); 

  return {result:{"reverted_to":(rq.src_ip)},status:"Response reverted"};
});   
GPIO.write(led2,0);
RPC.addHandler('on_request',function(req){
 
  print(DEVICE_NAME,"request on "+DEVICE_NAME, " ID ",req.req_id);gc(true); 
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
          print("Already Recieved ",req.req_id );
          return {result:req_hist.status,status:"request already recieved"}; 
      }
      else{
           
          blink_once(led2,50);
          requests.push(req);  
          return {result:fwd_request(req),status:"forwarding request"};

      }
  }
  else{
      let respo=perform_job(req.job);
      req.status=respo;
      requests.push(req);
      http_call("http://"+req.src_ip+"/rpc/on_callback",req);
      
      return  {result:respo,status:"performing job"};
  } 
}); 
 
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
```

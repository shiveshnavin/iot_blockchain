load('api_file.js');
load('api_rpc.js');
load('api_sys.js');
load('api_timer.js'); 
load('api_http.js'); 
load('api_events.js');
load('api_net.js');
load('api_config.js');

let wifi_setup=ffi('bool change_wifi()');
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
if(poll.program!==undefined)
{
	WORKER_FILE=poll.program;
}
let API_KEY="aezakmi";
let OTA_POLL_URL=poll.url+"/ota_poll?api_key=aezakmi&version="+ (Cfg.get("device.firmware_version"));
let size; let fname;
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
let upd_commit=function()
{
	let s={
		files:[],
		status:"COMMIED_OK"
	};
	write_data("updater_data.json",s);
};

let upd_check=function(){
	print('Checking for Uncommited Updates ');
	let s = read_data('updater_data.json');
	if(s===null){
		s={
			firmware_version:Cfg.get("device.firmware_version"),
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

let new_version;
let ota_poll=function(){
	let upd_reset_count=Cfg.get("upd_reset_count");
	print("Device Version is : ",Cfg.get("device.firmware_version")," and upd_reset_count is ",upd_reset_count);
	if(upd_reset_count<0){
		Cfg.set({upd_reset_count:(++upd_reset_count)});
		return;
	}else{
		Cfg.set({upd_reset_count:(0)});
	}
	print('Checking for Updates ',OTA_POLL_URL);
	HTTP.query({
		url: OTA_POLL_URL,
		success: function(body, full_http_msg) {
			print(body); 
			let args2=JSON.parse(body);
			let fname=WORKER_FILE+".new";
			File.remove(fname);
			print('Update URL ',args2.url);
			new_version=args2.version;
			let args={"url": args2.url, "file": fname};
			RPC.call(RPC.LOCAL,'Fetch',args,function(res){
				print('Download Res',JSON.stringify(res));
				if(res!==null){
					let s={
						status:"TO_COMMIT",
						firmware_version:new_version
					};   
					write_data("updater_data.json",s);
					print('File Updated...Will be Applied on Reboot --> v',new_version);
				}else{
					print('Failed');
				}
				return true;
			});
		},
		error: function( s ) { print(s); },  // Optional
	}); 
};

Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
	if (ev === Net.STATUS_DISCONNECTED) {

	} else if (ev === Net.STATUS_CONNECTING) {
    
	} else if (ev === Net.STATUS_CONNECTED) {
   
	} else if (ev === Net.STATUS_GOT_IP) {
		if(!unCommitedUpdates)
			ota_poll();     
	}
}, null);


RPC.addHandler('update',function(args){
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

RPC.addHandler('downloadFile',function(args){
	let url=args.url;
	let name=args.name; 
	download(url,name,function(args){
		print('dwd done...Will be Applied on Reboot');
		if(auto_apply)
		Sys.reboot(5);
	});
	return {"result":"File Download Start!"};
});


let s=upd_check();
load(poll.program);

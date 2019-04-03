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
let bt_init=ffi('bool mgos_bt_common_init(void)');
let bt_setup=ffi('int bt_setup(bool)'); 
 

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

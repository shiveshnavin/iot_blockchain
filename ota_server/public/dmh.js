load('api_sys.js');   
load('api_file.js');  
load('api_timer.js'); 


let encrypt=ffi('void * encrypt(char *  ,char *  )');
let decrypt=ffi('void * decrypt(char *  ,char *  )');  
 
let read_data=function(file){
	let clon=File.read(file);
	if(clon===null || clon===undefined){
		return null;
	}
	if(clon.length<5)
	{
		print('length of',file,' is ',clon.length);
		return null;

	}
	return JSON.parse(clon);
};
/*

let  encrypt =function(data,key)
{
  let i=0;
  let ik=0;
  let len_d=data.length;
  let len_k=key.length;
     
  let enc= [];
    
    
    for(i=0;i<len_d;i++ )
    {
        if(ik>=len_k) ik=0;
        enc.push(JSON.stringify(key[ik] ^ data[i]));
        ik++;
    }
    
    return enc;
    
};



let decrypt =function(data,key)
{
  let i=0;
  let ik=0;
  let len_d=data.length;
  let len_k=key.length;
     
  let enc= [];
    
    
    for(i=0;i<len_d;i++)
    {
        if(ik>=len_k) ik=0;
        enc.push(JSON.stringify(key[ik] ^ data[i]));
        ik++;
    }
    
    return enc;
    
};
 */

let obj={

  data:"Fuck u bitch !!"

};

/*
let str1="Abc";
let str2="cbe";

print("char at 1 ",str1[1]);
print("xor at 1 ",   (str1.charAt(1) + str2.charAt(1)));
*/
let sd = ffi('void *get_my_struct_descr(void)')();
print(sd);
let key="abc";
let str="AVCCC"; 
let ss=encrypt(str,key);
let o = s2o(ss, sd);
print(" --> ",JSON.stringify(o));
/*
let str=JSON.stringify(obj); 
let file="enc_tmp.json";
let data=str;
print("UnEncrypted -> " ,data);
let key="abc";


encrypt(data,key);
let resStr=File.read(file);
print("Encrypted -> " ,resStr);
let res=JSON.parse(resStr.slice(0, resStr.length-1));
let enc=res.enc;
print("Encrypted -> " ,enc);

 
decrypt(enc,key); 
resStr=File.read(file);
res=JSON.parse(resStr.slice(0, resStr.length-1));
print("Decrypted -> " , res.dec);
 



*/






























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
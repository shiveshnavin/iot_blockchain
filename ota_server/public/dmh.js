load('api_sys.js');   
load('api_file.js');  
load('api_timer.js'); 


let encrypt=ffi('char * encrypt(char *  ,char *  )');
let decrypt=ffi('char * decrypt(char *  ,char *  )');
 
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

let str=JSON.stringify(obj); 

let data=str;
print("UnEncrypted -> " ,data);
let key="abc";


let enc=encrypt(data,key);
print("Encrypted -> " ,enc);


let dptr= (decrypt(enc,key));
let dec=dptr.slice(0,enc.length);
print("Decrypted -> " , dec);



































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
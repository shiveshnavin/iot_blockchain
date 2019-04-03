load('api_sys.js');   
load('api_file.js');  
load('api_timer.js'); 
load('api_rpc.js');  

let  encrypt =function(data,key)
{
  let i=0;
  let ik=0;
  let len_d=data.length;
  let len_k=key.length;
     
  let enc= "";
    
    
    for(i=0;i<len_d;i++ )
    {
        if(ik>=len_k) ik=0;
        enc=enc+(chr(data.at(i) + key.at(ik) ))
        ik++;
    }
    
    return enc;
    
};



let decrypt =function(enc,key)
{
  let i=0;
  let ik=0;
  let len_d=enc.length;
  let len_k=key.length;
     
  let dec= "";
    
    
    for(i=0;i<len_d;i++ )
    {
        if(ik>=len_k) ik=0;
        dec=dec+(chr(enc.at(i) - key.at(ik) ))
        ik++;
    }
    
    return dec;
    
};
 

let obj={

  data:"Fuck u bitch !!"

};
 
 

RPC.addHandler('enc',function(args)
{


      let str1=JSON.stringify(args);
      let key="aezakmi";
      print("orignal --> ",str1);

      let enc=encrypt(str1,key);
      print("encrypted --> ",enc);


      let dec=decrypt(enc,key);
      print("decrypted --> ",dec);

      return {
        decrypted:dec ,
        encrypted:enc,
        orignal:str1
      }

});





















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
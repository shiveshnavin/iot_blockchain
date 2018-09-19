load('api_rpc.js');



let res={"result":false}; 
let set_rpc=function()
{
  RPC.addHandler('read',function(args){
    
        
      RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) {
        res=resp; 
        print('info:', JSON.stringify(res));
      }, null);
    
    return res;
  });
  
};
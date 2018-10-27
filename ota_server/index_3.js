var express=require('express')
var app=express()
var hbs=require('express-handlebars')
var path=require('path')
var fs=require('fs')
var request=require('request')
var array=require('array')
var publicIp=require('public-ip')
var formidable = require('formidable'); 
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());



app.engine('hbs',hbs({
    extname:"hbs"
}))
var PORT=8083
var API_KEY="aezakmi";
var HOST="http://54.227.87.51:"+PORT
/*
publicIp.v4().then(ip => {
    console.log("your public ip address", ip);
    HOST="http://"+ip+":"+PORT
  });*/
var OTA_FILES="./public"
var getLatestVersion=function()
{
    var version=10;
    var otaDir=fs.readdirSync(OTA_FILES);
    var otafls=array();
    console.log(JSON.stringify(otaDir))
    var i=0
    for(i;i<otaDir.length;i++)
    {
       
        var file=otaDir[i];
        var ver=file.replace("_worker.js","");
       // console.log("File : "+otaDir[i]+" Version : "+ver);
        if(ver>version)
        {
            version=ver;
        }
         
    }
    


    return parseInt(version);
};
; 
var OTA={

    getOTAFile:function(version)
    {
        
        return  version+"_worker.js";

    },
    getOTAVersion:function()
    {

        return getLatestVersion();
        
    },
    getChangeLog:function()
    {
        return "New Update with loads of new Features !"
    }
}
  

var getHashToken=function(key,version)
{

    return key;


}
app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',function(req,res){


    console.log("Called API");
    res.send("This is Mansaa OTA Server . use ota_poll");


})
app.get('/hitme',function(req,res){


    console.log("Called API");
    res.send({result:true});


})

app.get('/register',function(req,res){

    var currentdate = new Date();
    console.log(""+currentdate.getTime()+" - Device Keep Alive Call");
    res.send({call:"Result of PC "});


})


app.get('/ota_poll',function(req,res){

        let result={
            message:"Update Poll OK",
            status:false

        }
        if(req.query.api_key==null || req.query.api_key!=API_KEY)
        {
            result.message="API Key Invalid"
            res.send(result);
            return;
        }
        if(req.query.version==null)
        {
            result.message="Invalid Version code";
            res.send(result);
            return;
        }

        if(req.query.version>=OTA.getOTAVersion())
        {
            result.message="Already Up To Date !";
            res.send(result);
            return;
        }
        /*result.url=HOST+"/ota_download?token="+getHashToken(req.query.api_key,req.query.version)
        +"&version="+OTA.getOTAVersion()
        ;*/

	result.url=HOST+"/"+OTA.getOTAFile(getLatestVersion())
        result.status=true;
        result.change_log=OTA.getChangeLog();
        result.version=OTA.getOTAVersion();

        res.send(result);
    

})

app.get('/ota_download',function(req,res){

    let result={
        message:""

    }
    if(req.query.token==null || req.query.token!=API_KEY)
    {
        result.message="API Key Invalid"
        res.writeHead(503);
        res.write(result.message);
        res.end();
        return;                          
    }
    if(req.query.version==null)
    {
        result.message="Empty Version code";
        res.writeHead(503);
        res.write(result.message);
        res.end();
        return;
    }
 
    res.setHeader('content-type','text/plain');
    try{ 
    var firmware=fs.readFileSync(OTA.getOTAFile(req.query.version));
    }catch(e)
    {
        result.message="Invalid Version code";
        res.writeHead(404);
        res.write(result.message);
        res.end();
        return;
    }
     
    res.write(firmware);
    res.end();


});

app.all("/ota_upload",function(req,res){

            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
            var oldpath = files.filetoupload.path;
            var newpath = OTA_FILES +"/"+ (getLatestVersion()+1)+"_worker.js";
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('Update Published ! to '+newpath);
                res.end();
            });

        })
})




app.all("/ota",function(req,res){

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="ota_upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
 
})


app.listen(PORT,function(){
    console.log('Server Started');
})

/**************** MJS *****************/
let print=function()
{
    var s = 0;
    for (var i=0; i < arguments.length; i++) {

        process.stdout.write(""+arguments[i]);

    }
        process.stdout.write("\n");
    return s;
}




/**************** --MJS *****************/ 


let clients=["127.0.0.1:8082"];
let myIp="127.0.0.1:8083";
let http_call=function(url,body,cb)
{
   // print("HTTP CALL ",url,JSON.stringify(body));
    request.post(
        url,
        { json: body },
        function (error, response, body) {
            cb(body);
        }
    );

};
let resources=[{"res_name":"diring room led","res_id":199120},{"res_name":"diring room led","res_id":19935},{"res_name":"diring room led","res_id":1957}];
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
    print("Performing ",job.res_name);
    return {message:"Job DOne Brow!!!",val:1.2};

};



let requests=[];
let find_request=function(req_id)
{
    
    for(let i=0;i<requests.length;i++)
    {
       // print("REQ ID ",requests[i].req_id," in ",req_id);;
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
       // print("REQ ID ",requests[i].req_id," in ",req.req_id);;
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
        src_ip:myIp,
        status:req.status,
        job:req.job
    }; 
    print("FWD RQ FROM:",req.src_ip," JOB:",req.job.res_name," TO:", JSON.stringify(clients));
    // to /on_request of all clients
   // print(JSON.stringify(requests));
    for(let i=0;i<clients.length;i++)
    {
        http_call("http://"+clients[i]+"/rpc/on_request",_req,function(body){
            print("Forwarded");
            //print("RES ",JSON.stringify(body));
        })
    }
    return {"forwarded_to":clients};
};
let add_request=function(req)
{
    requests.push(req); 
    return fwd_request(req);
};


//req_id,src_ip,src_name,job,status
let on_request=function(req)
{ 
 
    if(req.req_id===undefined)
    {
        return {result:"req_id is not defined"};
    }
    if(req.job===undefined)
    {
        return {result:"job is not defined"};
    }

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
        http_call("http://"+req.src_ip+"/rpc/on_callback",req,function(body){
            print("JOB performed and Response Reverted to ",req.src_ip);
            //print("RES ",JSON.stringify(body));
        })
        return  {result:respo,status:"performing job"};
    }
   
  
    
    return {response:null,status:"fwd_request"};
};

let rev_request=function(req)
{


    let rq=update_request(req);
    
    print("FWD RES TO:",rq.src_ip," JOB:",rq.job.res_name);
    // to /on_callback of the requester neighbour
    
        http_call("http://"+rq.src_ip+"/rpc/on_callback",rq,function(body){
            print("JOB performed and Response Reverted to ",rq.src_ip);
            // print("RES ",JSON.stringify(body));
        })
   
    return {"reverted_to":(rq.src_ip)};

};
let on_callback=function(req)
{
    if(req.req_id===undefined)
    {
        return {result:"req_id is not defined"};
    }

    let req_hist=find_request(req.req_id);
    if(req_hist===undefined)
    {
        return {result:"FATAL:ERR: request not found on this node"};
    }
    return {result:rev_request(req),status:"Response reverted"};




};
 





/**************** --ADIL *****************/



app.post("/rpc/on_request",function(req,res){

   
   res.send( on_request(req.body) );
  
 })
 

 app.post("/rpc/on_callback",function(req,res){

   
    res.send( on_callback(req.body) );
   
  })
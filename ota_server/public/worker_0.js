var express=require('express')
var app=express()
var hbs=require('express-handlebars')
var path=require('path')
var fs=require('fs')
var array=require('array')
var publicIp=require('public-ip')
var formidable = require('formidable'); 
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());



app.engine('hbs',hbs({
    extname:"hbs"
}))
var PORT=8080
var API_KEY="aezakmi";
var HOST="http://54.227.87.51:"+PORT

publicIp.v4().then(ip => {
    console.log("your public ip address", ip);
    HOST="http://"+ip+":"+PORT
  });
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
    return s;
}




/**************** --MJS *****************/
/**************** NEHA *****************/
let connected_devices=[{ip:"192.168.0.1",name:"iotain_0"}];
let fwd_request=function(req)
{
	//fwd reuest to all connected_devices by http call
}
let on_callback=function(req)
{



};

let resources=[{res_id:1234,res_name:"Ultrasound sensor"},
{res_id:12364,res_name:"Ultrasound sensor"},
{res_id:1239,res_name:"Ultrasound sensor"}];
let find_resource=function(job)
{

    //todo

};
let perform_job=function(job)
{
    print("Performing ",job.res_name);
    return job;

};



let requests=
[] ;

let find_request=function(req)
{
    
    //todo

};
let add_request=function(req)
{

    //todo
 
};

//req_id,src_ip,src_name,job,status
let on_request=function(req)
{
    
    if(req.req_id===undefined)
    {
        return {result:"req_id is not defined"};
    }

    //todo
    
    return {response:null,status:"fwd_request"};
};








/**************** --NEHA *****************/
/**************** ADIL *****************/







/**************** --ADIL *****************/



app.all("/neha/on_request",function(req,res){

   
   res.send( on_request(req.body) );
  
 })
 
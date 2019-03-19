var app=expess()

exports.RPC={
    addHandler:function(path,cb){

        app.all('/'+path,cb);


    }
}
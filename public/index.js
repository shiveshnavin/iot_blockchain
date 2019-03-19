$('document').ready(function() {


    var actualPin=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
 
    var socket = io.connect();
    var form = jQuery('#myForm');
    var pin = jQuery('#pin');
    var val = jQuery('#val');
    var chatArea = jQuery('#chatArea');
    var device_t=jQuery("#device_t")
    var device=jQuery("#device")
     const url = new URL(window.location.href);

     device.text("IO Board : iotain_"+(url.port-5000))
     device_t.text("iotain_"+(url.port-5000))

     socket.on('connect', function(){
         socket.emit('setUser','GPIO');
     });


    form.submit(function(e) {
       e.preventDefault();
       socket.emit('input', ''+pin.val()+'-'+val.val());

      //    socket.emit('input', JSON.stringify(JSON.stringify({pin:pin.val(),val:val.val()})));
      // console.log('sending input ',{pin:pin.val(),val:val.val()})
       val.val('');
    });

   


    $.fn.populatePins=function(pins)
    {
    
    // console.log(pins);

     for(var i=0;i<pins.length;i++)
     {
        $('#io_'+actualPin[i]).prop('checked',pins[i]!==0?true:false) 
      //  console.log('io_'+actualPin[i]," ----- ",pins[i])
     }

    }

    $.fn.drawPins=function()
    {
     
      
     var rowCount = $('#myTable tr').length;
     if(rowCount<14)
     {
         for(var i=0;i<15;i++)
         {

             
             var lr=i;
             var rr=(29-i);
             $('#myTable').append('<tr >' +
                                  '<td class="io"  > ' +
                                     '<label class="switch"> <input id="io_'+lr +'" type="checkbox"> <span class="slider"></span> </label>' +
                                  '<td>'+((i===7)?'<b>ESP 32/8266</b>':'')+' </td>' +
                                  '<td class="io"  >' +
                                  '<label class="switch"> <input id="io_'+rr+'"  type="checkbox"> <span class="slider"></span> </label>' +
                                  '<td> </td>' +
                                  '</tr>'); 

            $('#io_'+lr).click(function(){

                var id=  jQuery(this).prop('id')
                var val= jQuery(this).prop('checked') ? 1:0; 
                var pin=id.replace('io_','');
               // console.log(' ',id,"  ",val,"  ",pin ,"  <--");
                
                 
               socket.emit('input',''+actualPin.indexOf(JSON.parse(pin))+'-'+JSON.parse(val));

                
            });
            $('#io_'+rr).click(function(){
               
              
                var id=  jQuery(this).prop('id')
                var val= jQuery(this).prop('checked') ? 1:0; 
                var pin=id.replace('io_','');
                console.log(' ',id,"  ",val,"  ",pin ,"  <--");
                
                 
               socket.emit('input',''+actualPin.indexOf(JSON.parse(pin))+'-'+JSON.parse(val));

            });
            
         }
     }
    
    };

    $.fn.drawPins();


    socket.on('output', function(data){

        // $("#io").text(data); 
       

        $.fn.populatePins(JSON.parse(data));


    });


    socket.on('serial_io', function(raw){
        
      //  console.log(raw)
        $('#serial_op').append(
            '<br>------------------<br>' +
            ''+raw
        );

        $("#serial_op").animate({ scrollTop: $('#serial_op').prop("scrollHeight")}, 100);
    

    });

    $('#send').click(function(){
        var url=$('#url').val();
        var json=$('#req').val();
        var rest=$('#res');

        try{
            json=JSON.parse(json);
        }catch(e)
        {
            alert('Invalid JSON');
        }
        

        var arr = json;
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(arr),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function(msg) {
                rest.text(JSON.stringify(msg,null,'\t'));

                
                $(document).ready(function(){
                    $(window).scrollTop(0);
                });
                


            },
             
            error: function (jqXHR, exception) {
                var msg = '';
                console.log(JSON.stringify(exception))
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                $('#res').html(msg);
            }
        });
   });



   $('#clear').click(function(){


    $('#serial_op').text('');

   });


 });
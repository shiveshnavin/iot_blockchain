
let gpio_map=[0,1,2,3,4,5,6,7];
let char_map={
    h:[1,6,4,3],
    a:[1,5,4,3,6],
    p:[1,5,4,6],
    y:[1,4,6,7],
    d:[1,5,4,3,2],
    i:[6,7,2],
    w:[1,2,3,4,7],
    l:[1,2,6,7,2],
    ' ':[]
};

let set_chars=function(str)
{
    let i=0;
    console.log(str);
    console.log("");
    for(i=0;i<str.length;i++)
    {
        let cr=str.charAt(i); 
        console.log(cr+" --> "+char_map[cr]);
        
        let arr=char_map[cr];
        for(let k=1;k<gpio_map.length;k++)
        {
            if(arr.indexOf(k)===-1)
            {
                //GPIO.write(gpio_map[k],0);
                console.log("Turn off "+gpio_map[k]);
            }
        }
        for(let j=0;j<char_map[cr].length;j++)
        {
            console.log("Turn On "+gpio_map[arr[j]]);
            //GPIO.write(gpio_map[arr[j]],1);
        }
        var waitTill = new Date(new Date().getTime() + 1* 1000);
        while(waitTill > new Date()){}
    }
    
    
};
set_chars("happy diwali");
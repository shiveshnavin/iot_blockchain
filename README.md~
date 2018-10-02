# iot_blockchain
College Minor project on Implementation of IoT using Blockchain

## Module 1: Building Resources ( IoT Potato Controlled Drum Player : Capacitive Touch Sensor) 
### --> Demo Video : CLICK IMAGE TO OPEN <--
[![IoT Drum Player : Potato Version](https://img.youtube.com/vi/ghmBqej5D24/0.jpg)](https://www.youtube.com/watch?v=ghmBqej5D24 "Video : IoT Drum Player : Potato Version")

## Module 2: Internetwork Communication (CORE)
To make HTTP calls from once deive routed through AP and Routed through STA mode when device is working in AP+STA mode . This will be used for Chaining Up multiple devices and request forwarding and Callbacking [See Test 2]



## Overview of Project
![Alt text](screenshots/plan0.jpg "Main Screen")
![Alt text](screenshots/plan1.jpg "Main Screen") 

## Tests

### Test 2 : To check if a device is cabale of autoconnecting in sta mode when the AP is available
#### Test Case 0 : 
After setting in config and device connects to AP , AP is restarted and device in monirotred if it rescans the AP and connects to it 
<b>PASS*

### Test 2 : To check if a device is cabale of requesting to servers on diffrent networks
![Alt text](screenshots/test_0_dhcp_distribution.png "Internetwork Communivation") 

(Syntax = Stattion_Name :> Access_Point_Name)
```code
iot_1 -----:> iot_0 ----:> wifi <:------ PC 
```
#### Test Case 0 : 
iot_1 makes an http call to iot_0  at a fixed IP and check if http call works  (PASS) 


#### Test Case 1 : 
iot_0 makes an http call to iot_1 (i.e. device in its AP network) at its guessed IP address (later IP table registration will be used ) and see if it gets resutls , this will be used in callbacking (PASS)


#### Test Case 2 : 
iot_0 makes an http call to PC (i.e. device in its STA Network) (PASS) 

In Image
````code
Top Terminal Shows Log on PC Endpoint
Left Terminal Shows Log on iot_0
Right Terminal Shows Log on iot_1
```


Idea is that when a device connected iot_0's AP makes a request to access PC (which is connected to same AP as iot_0) then iot_0 will recieve this request and make another request to PC , the result from the PC is required to be forwarded back to iot_1 which made the initial request thus facilitating callbacks

## Build It Yourself
 TODO

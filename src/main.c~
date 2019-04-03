#include "mgos.h"
#include "mgos_rpc.h" 
#include "mgos_wifi.h" 
#include "mgos_gpio.h" 
#include "esp_bt.h"
#include "mjs.h"

#include <stdlib.h>
#include <string.h>

struct state {
  struct mg_rpc_request_info *ri; /* RPC request info */
  int uart_no;                    /* UART number to write to */
  int status;                     /* Request status */
  int64_t written;                /* Number of bytes written */
  FILE *fp;                       /* File to write to */
};

int bt_setup(bool enable)
{
 if(!enable)
  {
    return esp_bt_controller_disable();
  }
 else
  {
    return esp_bt_controller_enable(ESP_BT_MODE_BTDM);
  }
}

static void http_cb(struct mg_connection *c, int ev, void *ev_data, void *ud) {
  struct http_message *hm = (struct http_message *) ev_data;
  struct state *state = (struct state *) ud;

  switch (ev) {
    case MG_EV_CONNECT:
      state->status = *(int *) ev_data;
      break;
    case MG_EV_HTTP_CHUNK: {
      /*
       * Write data to file or UART. mgos_uart_write() blocks until
       * all data is written.
       */
      size_t n =
          (state->fp != NULL)
              ? fwrite(hm->body.p, 1, hm->body.len, state->fp)
              : mgos_uart_write(state->uart_no, hm->body.p, hm->body.len);
      if (n != hm->body.len) {
        c->flags |= MG_F_CLOSE_IMMEDIATELY;
        state->status = 500;
      }
      state->written += n;
      c->flags |= MG_F_DELETE_CHUNK;
      break;
    }
    case MG_EV_HTTP_REPLY:
      /* Only when we successfully got full reply, set the status. */
      state->status = hm->resp_code;
      LOG(LL_INFO, ("Finished fetching"));
      c->flags |= MG_F_CLOSE_IMMEDIATELY;
      break;
    case MG_EV_CLOSE:
      LOG(LL_INFO, ("status %d bytes %llu", state->status, state->written));
      if (state->status == 200) {
        /* Report success only for HTTP 200 downloads */
        mg_rpc_send_responsef(state->ri, "{written: %llu}", state->written);
      } else {
        mg_rpc_send_errorf(state->ri, state->status, NULL);
      }
      if (state->fp != NULL) fclose(state->fp);
      free(state);
      break;
  }
}

static void fetch_handler(struct mg_rpc_request_info *ri, void *cb_arg,
                          struct mg_rpc_frame_info *fi, struct mg_str args) {
  struct state *state;
  int uart_no = -1;
  FILE *fp = NULL;
  char *url = NULL, *path = NULL;

  json_scanf(args.p, args.len, ri->args_fmt, &url, &uart_no, &path);

  if (url == NULL || (uart_no < 0 && path == NULL)) {
    mg_rpc_send_errorf(ri, 500, "expecting url, uart or file");
    goto done;
  }

  if (path != NULL && (fp = fopen(path, "w")) == NULL) {
    mg_rpc_send_errorf(ri, 500, "cannot open %s", path);
    goto done;
  }

  if ((state = calloc(1, sizeof(*state))) == NULL) {
    mg_rpc_send_errorf(ri, 500, "OOM");
    goto done;
  }

  state->uart_no = uart_no;
  state->fp = fp;
  state->ri = ri;

  LOG(LL_INFO, ("Fetching %s to %d/%s", url, uart_no, path ? path : ""));
  if (!mg_connect_http(mgos_get_mgr(), http_cb, state, url, NULL, NULL)) {
    free(state);
    mg_rpc_send_errorf(ri, 500, "malformed URL");
    goto done;
  }

  (void) cb_arg;
  (void) fi;

done:
  free(url);
  free(path);
}
  
bool change_wifi()
{
 
  return mgos_wifi_setup((struct mgos_config_wifi *) mgos_sys_config_get_wifi());

}
 


static int blink_led=5;
mgos_timer_id led_timer=1911;
static int DELAY=100;
static bool inhibit_timer=false;
void init_led(int pin,int delay)
{
blink_led=pin; 
DELAY=delay;
mgos_gpio_set_mode(pin, MGOS_GPIO_MODE_OUTPUT);
}

void blink_once(int pin,int delay)
{
  mgos_gpio_write(pin,1);
  mgos_msleep(delay);
  mgos_gpio_write(pin,0);
  mgos_msleep(delay);
  mgos_gpio_write(pin,1);
  mgos_msleep(delay);
  mgos_gpio_write(pin,0); 
}
static void led_timer_cb(void *arg) {

  if(inhibit_timer)
    return;
   mgos_gpio_toggle(blink_led);
  (void) arg;
}

int led2=4;
static void delay_on_cb(void *arg){
 
 mgos_gpio_write(led2,0);
(void) arg;
}

void on_delay(int pin,int delay)
{
led2=pin;
 mgos_gpio_write(led2,1);
mgos_set_timer(delay, 0, delay_on_cb, NULL);
}
void stop_blink()
{
 inhibit_timer=true;
 mgos_clear_timer(led_timer);
  mgos_msleep(DELAY);
led_timer=-1;
inhibit_timer=false;
}
void start_blink()
{
  inhibit_timer=true;
	if(led_timer!=(unsigned)(1911))
	{
	 stop_blink();
	}
  led_timer=mgos_set_timer(DELAY, MGOS_TIMER_REPEAT, led_timer_cb, NULL);
  mgos_msleep(DELAY);
  inhibit_timer=false;
}
enum mgos_app_init_result mgos_app_init(void) {

  mg_rpc_add_handler(mgos_rpc_get_global(), "Fetch",
                     "{url: %Q, uart: %d, file: %Q}", fetch_handler, NULL);
 
 
 





  return MGOS_APP_INIT_SUCCESS;
}
 
struct my_struct { 
    char *  enc; 
    char *  dec; 
    char *  data; 
};

void * encrypt(char * data,char * key)
{
    struct my_struct * res=calloc(1,sizeof(res));
    int i=0;
    int ik=0;
    int len_d=strlen(data);
    int len_k=strlen(key);
    
    int siz=sizeof(char) * len_d;
    char * enc=  (char*) malloc(siz );  

    //LOG(LL_INFO, ("Encrypting : %s", data));
    
    for(i=0,ik=0;i<len_d;i++,ik++)
    {
        if(ik>=len_k) ik=0;
        enc[i]=    data[i] + 10;
    }
      
    res->data= data;
    res->enc= (enc);
    //LOG(LL_INFO, ("Encrypted : %s", enc));
    return res;
    
}




static const struct mjs_c_struct_member my_struct_descr[] = {
  {"enc", offsetof(struct my_struct, enc), MJS_STRUCT_FIELD_TYPE_CHAR_PTR, NULL},
  {"dec", offsetof(struct my_struct, dec), MJS_STRUCT_FIELD_TYPE_CHAR_PTR, NULL},
  {"data", offsetof(struct my_struct, data), MJS_STRUCT_FIELD_TYPE_CHAR_PTR, NULL}, 
  {NULL, 0, MJS_STRUCT_FIELD_TYPE_INVALID, NULL},
};



const struct mjs_c_struct_member *get_my_struct_descr(void) {
  return my_struct_descr;
};
void * decrypt(char * enc,char * key)
{
 struct my_struct * res=calloc(1,sizeof(res));
    int i=0;
    int ik=0;
    int len_d=strlen(enc);
    int len_k=strlen(key);
    
    int siz=sizeof(char) * len_d;
    char * dec=  (char*) malloc(siz );  
    
    //LOG(LL_INFO, ("Decrypting : %s", enc));
    for(i=0,ik=0;i<len_d;i++,ik++)
    {
        if(ik>=len_k) ik=0;
        dec[i]=  enc[i] - key[ik] ;
    }
   
    res->enc= (enc);
    res->dec= (dec);
    //LOG(LL_INFO, ("Decrypted : %s", dec));
    return res;
    
}






# yuan-yang

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for dev
```
npm run build:dev
```

### Compiles and minifies for uat
```
npm run build:uat
```

### Compiles and minifies for production
```
npm run build:production
```

### Lints and fixes files
```
npm run lint
```

### Deploy for dev
```
sudo docker restart iRouteCDN
```
或
```
sudo docker run --name iRouteCDN \
-v /home/rdadmin/iRouteCDN/html:/usr/share/nginx/html \
-v /home/rdadmin/iRouteCDN/conf:/etc/nginx/conf.d \
-p 8083:80 \
--restart=always \
-d nginx
```


### Deploy for uat
```
sudo docker restart yuanyang
```
或
```
sudo docker run --name yuanyang \
-v /home/ubuntu/yuanyang/html:/usr/share/nginx/html \
-v /home/ubuntu/yuanyang/conf:/etc/nginx/conf.d \
-p 8083:80 \
--restart=always \
-d nginx
```

### Deploy for production
1. 正式對外(80 & 443)
```
sudo docker restart iRouteCDN
```
或
```
sudo docker run --name iRouteCDN \
-v /var/www/html/frontends/iRouteCDN/html:/usr/share/nginx/html \
-v /var/www/html/frontends/iRouteCDN/conf:/etc/nginx/conf.d \
-p 80:80 \
-p 443:443 \
--restart=always \
-d nginx
```

2. 測試(8083)
```
sudo docker restart yuanyang
```
或
```
sudo docker run --name yuanyang \
-v /home/ubuntu/yuanyang/html:/usr/share/nginx/html \
-v /home/ubuntu/yuanyang/conf:/etc/nginx/conf.d \
-p 8083:80 \
--restart=always \
-d nginx
```


## /home/ubuntu/xxx/conf/default.conf
```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    # listen 443 ssl default_server;
    # listen [::]:443 ssl default_server;

    # server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
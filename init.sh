sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip npm nodejs apache2

sudo a2enmod proxy_http
sudo systemctl restart apache2

source /etc/apache2/envvars

# configure /etc/apache2/sites-enabled/000-default.conf
# add ProxyRequests Off
# add ProxyPass /object_detection http://localhost:8001/object_detection
# add ProxyPassReverse /object_detection http://localhost:8001/object_detection
sudo sed -i 's/<\/VirtualHost>/ProxyRequests Off\nProxyPass \/object_detection http:\/\/localhost:8001\/object_detection\nProxyPassReverse \/object_detection http:\/\/localhost:8001\/object_detection\n<\/VirtualHost>/g' /etc/apache2/sites-enabled/000-default.conf

cd /home/ubuntu/object-detection/backend
sudo pip3 install --upgrade pip
sudo pip3 install -r requirements.txt

cd /home/ubuntu/object-detection/frontend
sudo npm install

# build frontend and move to apache2
sudo npm run build
sudo mv build/* /var/www/html/

# start backend
cd /home/ubuntu/object-detection/backend
sudo python3 detection.py &


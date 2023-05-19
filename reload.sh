cd /home/ubuntu/object-detection/frontend
sudo npm run build
sudo rm -rf /var/www/html/static
sudo mv build/* /var/www/html/



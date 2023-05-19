sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip npm nodejs apache2

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


# db_hw
sudo docker build -t db_homework .
sudo docker run -p 5000:5000 db_homework
./tech-db-forum func -u http://localhost:5000/api -r report.html

kill -9 $(lsof -t -i:5000)

# db_hw
для запуска
sudo docker build -t db_homework .
sudo docker run -p 5000:5000 db_homework

kill -9 $(lsof -t -i:5000)

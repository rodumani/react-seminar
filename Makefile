init:
	brew install node npm redis
	sed -i -e 's/daemonize no/daemonize yes/g' /usr/local/etc/redis.conf
	redis-server /usr/local/etc/redis.conf
	npm install

run:
	DEBUG=react-tutorial npm start

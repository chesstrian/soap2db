# Soap2DB

Service to get data from soap service and save into a SQL Server Database

## Install

```bash
npm install
npm install -g forever

cp soap2db.sh /etc/init.d/soap2db
cp soap2db-gui.sh /etc/init.d/soap2db-gui

chmod +x /etc/init.d/soap2db /etc/init.d/soap2db-gui

chkconfig --add soap2db
chkconfig --add soap2db-gui
```

## Run

```bash
service soap2db-gui start
service soap2db start
```

## Access

Go to [http://server:3000/](http://server:3000/) in a browser, check `web/routes.js` at line 7.

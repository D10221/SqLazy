/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='ServerInfo.ts' />
/// <reference path='../IDataStore.ts' />
/// <reference path='IServerInfoService.ts' />
var Datastore = require('nedb');
var x = __dirname + '/db/servers.json';
var servers = new Datastore({ filename: x, autoload: true });

//Initialize Data if its not there
OnEmpty(function (store) {
    console.info('db Not found, creating one');

    //Server and Db are irrelevant in the way that can be extracted from the  connectionString with a couple of regex
    store.insert([
        {
            server: 'VBOXMSSQL',
            db: 'MyDb1',
            connectionString: ("Data Source=VBOXMSSQL;Initial Catalog=MyDb1;Persist Security Info=True;User ID=sa;Application Name=SqLazy;")
        }, {
            server: 'VBOXMSSQL',
            db: 'DB3',
            connectionString: ("Data Source=VBOXMSSQL;Initial Catalog=DB3;Persist Security Info=True;User ID=sa;Application Name=SqLazy;")
        }, {
            server: 'SvrSQL_SQL2008R2',
            db: 'DB2',
            connectionString: 'Data Source=SvrSQL\\SQL2008R2;Initial Catalog=DB2;Persist Security Info=True;User ID=sa;Application Name=SqLazy'
        }], function (err, newDocs) {
        if (err)
            throw err;
        if (newDocs)
            console.info("Success inserting ");
    });
});

function FindAll(callback) {
    // Find all documents in the collection
    //Remember function signature , there is no d.td, db.find({}, function (err, docs) {});
    servers.find({}, callback);
}

function OnEmpty(onEmpty, onError) {
    FindAll(function (error, result) {
        if (error) {
            if (onError) {
                onError(error, servers);
            } else
                throw error;
        }
        if (result.length === 0)
            onEmpty(servers);
    });
}

module.exports = servers;
//# sourceMappingURL=serverInfoDataStore.js.map

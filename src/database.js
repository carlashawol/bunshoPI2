const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://cdrendonb:zeus456*@bunsho-owhs8.mongodb.net/bunsho-db?retryWrites=true&w=majority', { //mongodb://localhost/bunsho-db
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: true
})

.then(db => console.log('DB is connected'))
.catch(err => console.error(err));

/*
const {MongoClient}= require('mongodb')

const uri = "mongodb+srv://cdrendonb:zeus456*@bunsho-owhs8.mongodb.net/bunsho-db?retryWrites=true&w=majority";
const client = new MongoClient(uri);
try{
    await client.connect();
    await listDatabases(client);
}catch(e){
    console.error(e);
}
finally{
    await client.close();
}*/
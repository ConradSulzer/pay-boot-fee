const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (e) => {
    if (e) {
        console.log('Mongoose Error:', e);
    } else {
        console.log('Database connected!');
    }
});
const express = require('express');
const userRoute = require('./routes/user.route');
const authRoute = require('./routes/auth.route');
const houseRoute = require('./routes/house.route');
const reviewRoute = require('./routes/review.route');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", authRoute);
app.use('/users', userRoute);
app.use("/house", houseRoute);
app.use("/review", reviewRoute);


app.listen(8080, () => {
  console.log('Server is running on port 8080');
});


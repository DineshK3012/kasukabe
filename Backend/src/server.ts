import app from "./app";

import connectDatabase  from './config/db';
connectDatabase();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


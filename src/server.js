require("express-async-errors");
const express = require("express");
const app = express();
const routes = require("./routes");
const migrationsRun = require("./database/sqlite/migrations");
const AppError = require("./utils/AppError");

const PORT = 3001;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));

app.use(express.json());
app.use(routes);

migrationsRun();

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  console.log(error);

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

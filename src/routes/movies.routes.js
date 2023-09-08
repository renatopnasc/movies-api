const { Router } = require("express");
const moviesRouter = Router();

const MovieNotesController = require("../controllers/MovieNotesController");
const movieNotesController = new MovieNotesController();

moviesRouter.post("/:user_id", movieNotesController.create);
moviesRouter.get("/:id", movieNotesController.show);
moviesRouter.get("/", movieNotesController.index);
moviesRouter.delete("/:id", movieNotesController.delete);

module.exports = moviesRouter;

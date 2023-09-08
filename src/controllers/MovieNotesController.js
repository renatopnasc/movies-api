const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MovieNotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const { user_id } = request.params;

    const [note_id] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        user_id,
        name,
      };
    });

    await knex("movie_tags").insert(tagsInsert);

    return response.status(201).json({});
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.json({});
  }

  async show(request, response) {
    const { id } = request.params;

    const note = await knex("movie_notes").where({ id }).first();
    const tags = await knex("movie_tags")
      .where({ note_id: id })
      .orderBy("name");

    return response.json({
      ...note,
      tags,
    });
  }

  async index(request, response) {
    const { title, tags, user_id } = request.query;

    let notes;

    if (tags) {
      const filteredTags = tags.split(",").map((tag) => tag.trim());

      notes = await knex("movie_tags")
        .select([
          "movie_notes.id",
          "movie_notes.title",
          "movie_notes.user_id",
          "movie_notes.description",
          "movie_notes.rating",
        ])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title ?? ""}%`)
        .whereIn("name", filteredTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("movie_notes.title");
    } else {
      notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title ?? ""}%`)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => note.id === tag.note_id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    return response.json(notesWithTags);
  }
}

module.exports = MovieNotesController;

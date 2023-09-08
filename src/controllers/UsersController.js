const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Email já está em uso.");
    }

    const encryptedPassword = await hash(password, 8);

    await knex("users").insert({
      name,
      email,
      password: encryptedPassword,
    });

    return response.status(201).json({});
  }

  async update(request, response) {
    const { email, password, oldPassword } = request.body;
    const { id } = request.params;

    const [user] = await knex("users").where({ id });

    if (!user) throw new AppError("Usuário não encontrado");

    const [userWithUpdatedEmail] = await knex("users").where({ email });

    const emailBeingUsed =
      userWithUpdatedEmail && userWithUpdatedEmail.id !== id;

    const oldPasswordNotProvided = password && !oldPassword;

    const providedPasswords = password && oldPassword;

    if (emailBeingUsed) {
      throw new AppError("Email já está sendo usado.");
    }

    if (oldPasswordNotProvided)
      throw new AppError("Você precisa digitar a senha antiga.");

    if (providedPasswords) {
      const checkOldPassword = await compare(oldPassword, user.password);

      if (!checkOldPassword) {
        throw new AppError("Senhas diferentes.");
      }

      user.password = await hash(password, 8);
    }

    user.email = email ?? user.email;

    await knex("users")
      .where({ id })
      .update({
        email: user.email,
        password: user.password,
        updated_at: knex.raw("CURRENT_TIMESTAMP"),
      });

    return response.json({});
  }
}

module.exports = UsersController;

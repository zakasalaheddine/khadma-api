const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

module.exports = {
  updatePassword: async (ctx) => {
    const params = _.assign({}, ctx.request.body, ctx.params);

    if (!_.has(params, "password")) {
      return ctx.badRequest(null, {
        error: "You need a password to change old one",
      });
    }

    const user = await strapi.plugins["users-permissions"].services.user.fetch({
      id: ctx.state.user.id,
    });

    const validPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(params.currentPassword, user.password);

    if (!validPassword) {
      return ctx.badRequest(null, { error: "Current Password is incorrect" });
    }

    const updatedUser = await strapi.plugins[
      "users-permissions"
    ].services.user.edit(
      { id: ctx.state.user.id },
      { password: params.password }
    );

    ctx.body = sanitizeUser(updatedUser);
  },
};

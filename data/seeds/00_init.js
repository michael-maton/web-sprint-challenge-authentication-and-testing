exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries and resets ids
  return knex('users')
    .truncate()
    .then(function() {
      return knex('users').insert([
        { username: 'Iron Man', password: "Rich genius" },
        { username: 'Captain America', password: "Superhuman" }
      ]);
    });
};

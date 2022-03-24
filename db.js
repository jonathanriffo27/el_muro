const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'el_muro',
  password: '1234',
  max: 12,
  min: 2,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000
})

async function get_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from users where email=$1',
    values: [email]
  })

  client.release()

  return rows[0]
}

async function create_user(name, email, password) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into users (name, email, password) values ($1, $2, $3)',
    values: [name, email, password]
  })

  client.release()
}
async function create_post(user_id, post) {
  const client = await pool.connect()
  await client.query({
    text: 'insert into posts (user_id, post) values ($1, $2)',
    values: [user_id, post]
  })
  client.release()
}
async function get_posts() {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from posts',
    values: []
  })

  client.release()

  return rows
}
async function create_comment(post_id, user_id, comentario) {
  const client = await pool.connect()
  await client.query({
    text: 'insert into comentarios (post_id, user_id, comentario) values ($1, $2, $3)',
    values: [post_id, user_id, comentario]
  })
  client.release()
}
async function get_comments() {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from comentarios',
    values: []
  })

  client.release()

  return rows
}

module.exports = {
  get_user, create_user, create_post, get_posts, create_comment,
  get_comments
}
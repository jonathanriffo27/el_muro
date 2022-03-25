const express = require('express')
const nunjucks = require('nunjucks')
const session = require('express-session')
const flash = require('connect-flash')

const { 
  get_user, create_user, create_post, get_posts, create_comment,
  get_comments
  } = require('./db.js')

const app = express()


// Configuraciones estáticos
app.use(express.static('public'))
app.use(express.static('node_modules/bootstrap/dist'))
app.use(flash())

// se configura nunjucks
nunjucks.configure("templates", {
  express: app,
  autoscape: true,
  watch: true,
});

// configuraciones de formulario
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// configuración de sessiones
app.use(session({
  secret: 'mi-clave',
  cookie: { maxAge: 1000*60*60*24 }
}))

function protected_route (req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
}

app.get('/', protected_route, async (req, res) => {
  const user = req.session.user
  // const post = req.session.post
  // const comment = req.session.comment
  const user_id = user.id
  const posts = await get_posts()
  const comments = await get_comments()

  for(let post of posts ){
    post.comentarios = comments.filter( comm => comm.post_id == post.id )
  }
 
  console.log(comments)
  res.render('index.html',{posts,user});
})
app.post('/post', async (req, res) => {
  const user_id = req.session.user.id
  // console.log(user_id, post)
  await create_post(user_id, post)

  res.redirect('/')
})
app.post('/comentario', async (req, res) => {
  const post_id = req.body.post_id
  const user_id = req.session.user.id
  const comentario = req.body.comentario
  // console.log(post_id, user_id, comentario)
  await create_comment(post_id, user_id, comentario)
  res.redirect('/')
})
app.get('/login', (req, res) => {
  const errors = req.flash('errors')
  res.render('login.html',{errors});
})
app.post('/login', async (req, res) => {
  
  const email = req.body.email
  const password = req.body.password

  const user_encontrado = await get_user(email)
  if (!user_encontrado) {
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta')
    return res.redirect('/login')
  }
  //  2. Revisamos que las contraseñas coincidan
  if (user_encontrado.password != password) {
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta')
    return res.redirect('/')
  }
  // 3. Guardamos al usuario en sesion
  req.session.user = user_encontrado  

  // 4. Redirigir al usuario al Home
  res.redirect('/')
})
app.get('/register', (req, res) => {
  
  res.render('registro.html',{});
})
app.post('/register', async (req, res) => {
  // 1. Recuperar los campos del formulario
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const password_confirm = req.body.password_confirm

  // 2. Validar que ambas contraseñas sean iguales
  if (password != password_confirm) {
    req.flash('errors', 'Las contraseñas no coinciden')
    return res.redirect('/register')
  }
  
  // 3. Validar que no exista otro usuario con el mismo correo
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Este email ya se encuentra registrado')
    return res.redirect('/register')
  }

  // 4. Finalmente podemos guardar el nuevo usuario en base de datos
  await create_user(name, email, password)

  // 5. y en la sesión
  req.session.user = {
    name, email, password
  }
  // console.log('session', req.session);

  res.redirect('/')
})
app.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/')
})

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))
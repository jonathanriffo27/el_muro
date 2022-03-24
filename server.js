const express = require('express')
const nunjucks = require('nunjucks')
const session = require('express-session')
const moment = require("moment")

const app = express()

// Configuraciones estáticos
app.use(express.static('public'))
app.use(express.static('node_modules/bootstrap/dist'))

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
const users = [
  {
    name: 'Hugo Muñoz',
    password: '12345',
    email: 'hugo@gmail.com'
  },
  {
    name: 'Paula Inzunza',
    password: '54321',
    email: 'paula@gmail.com'
  },
  {
    name: 'Carlos Horta',
    password: '98765',
    email: 'carlos@gmail.com'
  }
] 

app.get('/home', (req, res) => {
  if (!req.session.posteo) {
    req.session.posteo = []
  }
  res.render('index.html',{posteos: req.session.posteo });
})
app.post('/home', (req, res) => {
  let text = ""
  const fecha = moment().format("MMMM Do YYYY, h:mm:ss a");
  req.session.posteo.push({
    posteo: req.body.posteo,
    usuario: `Raul - ${fecha}`
  })
  console.log(req.session.posteo)
  res.redirect('/home')
})
app.get('/', (req, res) => {
  
  res.render('login.html',{});
})
app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user_encontrado = users.find( function(us) { return us.email == email })
  if (!user_encontrado) {
    return res.send('Usuario inexistente o contraseña incorrecta')
  }
  //  2. Revisamos que las contraseñas coincidan
  if (user_encontrado.password != password) {
    return res.send('Usuario inexistente o contraseña incorrecta')
  }
  // 3. Redirigir al usuario al Home
  res.redirect('/home')
})
app.get('/register', (req, res) => {
  
  res.render('index.html',{});
})

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))
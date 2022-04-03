// Importacion de modulos
const express = require('express')
const res = require('express/lib/response')
const app = express()
const based = new (require('rest-mssql-nodejs'))({
    user: "programa",
    password: "programa",
    server: "25.81.172.46",
    database: "Tarea Programada 2",
    encrypt: true
})

// Variables
var admin = {};
let listaPuestos = [];
let listaEmpleados = [];
cargarPuestos();
cargarEmpleados();

// Establecimiento de parametros para la pagina web
app.use(express.urlencoded({extended: false}));
app.set('view-engine', 'ejs');

// Extensiones de la pagina web
app.get('/', (req, res) => {
    res.render('login.ejs',{mensaje:""});
})
app.get('/ventanaPrincipal', (req, res) => {
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "", datos : []});
})

app.post('/insertar', (req, res) => {
    res.render('insertar.ejs');
})

// Funciones de las paginas web
app.post('/login', (req, res) => {
    admin = {
        user : req.body.name,
        password : req.body.pass
    };
    validarDatos(admin, res);
})
app.post('/listarPuestos', (req, res) => {
    console.log(listaPuestos);
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "puestos", datos : listaPuestos});
})
app.post('/listarEmpleados', (req, res) => {
    console.log(listaEmpleados);
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "empleados", datos : listaEmpleados});
})
/*app.post('/filtrarNom', (req, res) => {
    filtro = req.body.nomProd;
    filtrarNombre(filtro, res);
})
app.post('/insertarB', (req, res) => {
    let listaArticulos = [];
    articulo = {nombre:req.body.name,precio:req.body.precio};
    setTimeout(async () => {
        const respuesta = await based.executeStoredProcedure('InsertarArticulo', null,
        {inNombre : articulo.nombre, inPrecio : articulo.precio, outResult : 0});
        const productos = await based.executeStoredProcedure('SeleccionarArticulos',
        null, {outResult : 0});
        if (respuesta != undefined && productos != undefined) {
            for (articulo of productos.data[0]) {
                listaArticulos.push(articulo);
            }
            console.log(respuesta.data)
            if (respuesta.data[0][0].outResult == 0) {
                res.redirect('./articulos');
            }
            else {
                if (respuesta.data[0][0].outResult == 1001) {
                    res.render("articulos.ejs", {
                    mensajeError : "Artículo con nombre duplicado.",
                    productos : listaArticulos});
                }
            }
        }
    }, 1500)
})*/
app.post('/cancelar', (req, res) => {
    res.redirect('./ventanaPrincipal');
})
app.post('/salir', (req, res) => {
    res.redirect('./');
})
// Funciones logicas
function validarDatos (adminDatos, res) {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ValidarAdministradores',
        null, {inUserName : adminDatos.user, inPassword : adminDatos.password,
        outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0][0]);
            if (resultado.data[0][0].outResult == 0)
                res.redirect("./ventanaPrincipal");
            else
                if (resultado.data[0][0].outResult == 1002)
                    res.render("login.ejs",{mensaje:"Combinación de usuario/password no existe en la BD"});
        }
    }, 1500)
}

function filtrarNombre (nombre, res) {
    let articulosFiltrados = [];
    /*setTimeout(async () => {
        const resFiltroNom = await based.executeStoredProcedure('FiltrarNombre', null,
        {inNombre : nombre, outResult : 0});
        if (resFiltroNom != undefined) {
            console.log(resFiltroNom.data[0]);
            for (articulo of resFiltroNom.data[0]) {
                articulosFiltrados.push(articulo);
            }
            res.render('articulos.ejs', {mensajeError : "",
            productos : articulosFiltrados});
        }
    }, 1500)*/
}

function cargarPuestos() {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ListarPuestos',
        null, {outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0]);
            for (puesto of resultado.data[0])
                listaPuestos.push([false, puesto]);
        }
    }, 1500)
}

function cargarEmpleados() {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ListarEmpleados',
        null, {outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0]);
            for (empleado of resultado.data[0])
                listaEmpleados.push([false, empleado]);
        }
    }, 1500)
}

// Creacion del puerto para acceder la pagina web
app.listen(3000)
// Importacion de modulos
const express = require('express');
const { redirect } = require('express/lib/response');
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
app.post('/insertarPuesto', (req, res) => {
    res.render('insertarPuesto.ejs');
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
app.post('/eliminarPuesto', (req, res) => {
    console.log(req.body.puestosListBox);
    eliminarPuesto(req.body.puestosListBox);
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "puestos", datos : listaPuestos});
})
app.post('/eliminarEmpleado', (req, res) => {
    console.log(req.body.empleadosListBox);
    eliminarEmpleado(req.body.empleadosListBox);
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "empleados", datos : listaEmpleados});
})
app.post('/insertarPuestoB', (req, res) => {
    let nuevoPuesto = {Puesto: req.body.nombrePuesto,
    SalarioXHora: req.body.salario};
    console.log(nuevoPuesto);
    insertarPuestoFunc(nuevoPuesto);
    res.redirect('./ventanaPrincipal');
})
app.post('/filtrarEmpleado', (req, res) => {
    filtro = req.body.nomEmpleado;
    filtrarNombre(filtro, res);
})
/*app.post('/insertarB', (req, res) => {
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
    let empleadosFiltrados = [];
    setTimeout(async () => {
        const resFiltroNom = await based.executeStoredProcedure('FiltrarNombre', null,
        {inFiltroNom : nombre, outResult : 0});
        if (resFiltroNom != undefined) {
            for (empleado of resFiltroNom.data[0]) {
                if (listaEmpleados.find(existe =>
                    existe[0] === false && existe[1].Nombre === empleado.Nombre))
                    empleadosFiltrados.push([false, empleado]);
            }
            res.render('ventanaPrincipal.ejs', {mensajeError : "",
            tipoDatos : "empleados", datos : empleadosFiltrados});
        }
    }, 1500)
}

function cargarPuestos() {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ListarPuestos',
        null, {outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0]);
            for (puesto of resultado.data[0]) {
                var valido = true;
                if (listaPuestos.length == 0) {
                    listaPuestos.push([false, puesto]);
                    continue;
                }
                else {
                    for (puestoExiste of listaPuestos) {
                        if (puestoExiste[1].Puesto == puesto.Puesto)
                            valido = false;
                    }
                    if (valido)
                        listaPuestos.push([false, puesto]);
                }
            }
            listaPuestos.sort(function (puesto1, puesto2) {
                if (puesto1[1].Puesto > puesto2[1].Puesto)
                    return 1;
                if (puesto1[1].Puesto < puesto2[1].Puesto)
                    return -1;
                else
                    return 0;
            })
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

function eliminarPuesto(nomPuesto) {
    for (puesto of listaPuestos) {
        if (puesto[1].Puesto == nomPuesto) {
            puesto[0] = true;
        }
    }
    return;
}

function eliminarEmpleado(nomEmpleado) {
    for (empleado of listaEmpleados) {
        if (empleado[1].Nombre == nomEmpleado) {
            empleado[0] = true;
        }
    }
    return;
}

function insertarPuestoFunc(nuevoPuesto) {
    setTimeout(async () => {
        const respuesta = await based.executeStoredProcedure('InsertarPuesto', null,
        {inPuesto : nuevoPuesto.Puesto, inSalario : nuevoPuesto.SalarioXHora, outResult : 0});
        cargarPuestos();
    }, 1500)
}



// Creacion del puerto para acceder la pagina web
app.listen(3000)
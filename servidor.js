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
let idGlobal;
let listaPuestos = [];
let listaEmpleados = [];
let listaTipoDoc = [];
let listaDepartamentos = [];
cargarPuestos();
cargarEmpleados();
cargarTipoDoc();
cargarDepartamentos();

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
app.post('/insertarEmpleado', (req, res) => {
    res.render('insertarEmpleado.ejs', {
        listaPuestos : listaPuestos,
        listaDepartamentos : listaDepartamentos,
        listaTipoDoc : listaTipoDoc
    });
})
app.post('/editarEmpleado', (req, res) => {
    idGlobal = req.body.empleadosListBox;
    res.render('editarEmpleado.ejs', {
        listaPuestos : listaPuestos,
        listaDepartamentos : listaDepartamentos,
        listaTipoDoc : listaTipoDoc
    });
})
app.post('/editarPuesto', (req, res) => {
    idGlobal = req.body.puestosListBox;
    res.render('editarPuesto.ejs')
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
    eliminarPuesto(req.body.puestosListBox);
    res.render('ventanaPrincipal.ejs', {mensajeError : "",
    tipoDatos : "puestos", datos : listaPuestos});
})
app.post('/eliminarEmpleado', (req, res) => {
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
app.post('/insertarEmpleadoB', (req, res) => {
    let nuevoEmpleado = {
        Nombre : req.body.nomEmpleado,
        IdTipoIdentificacion : req.body.tipoIdentificacionSeleccion,
        ValorDocumentoIdentificacion : req.body.valorDoc,
        IdDepartamento : req.body.departamentoSeleccion,
        Puesto : req.body.puestoSeleccion,
        FechaNacimiento : req.body.fechaNacimiento
    };
    insertarEmpleadoFunc(nuevoEmpleado);
    res.redirect('./ventanaPrincipal');
})
app.post('/filtrarEmpleado', (req, res) => {
    filtro = req.body.nomEmpleado;
    filtrarNombre(filtro, res);
})
app.post('/editarEmpleadoB', (req, res) => {
    let empleadoEditado = {
        Nombre : req.body.nomEmpleado,
        IdTipoIdentificacion : req.body.tipoIdentificacionSeleccion,
        ValorDocumentoIdentificacion : req.body.valorDoc,
        FechaNacimiento : req.body.fechaNacimiento,
        Puesto : req.body.puestoSeleccion,
        IdDepartamento : req.body.departamentoSeleccion
    };
    editarEmpleadoFunc(empleadoEditado);
    res.redirect('./ventanaPrincipal');
})
app.post('/editarPuestoB', (req, res) => {
    let puestoEditado = {
        Nombre : req.body.nomPuesto,
        SalarioXHora : req.body.salario
    };
    editarPuestoFunc(puestoEditado);
    res.redirect('./ventanaPrincipal');
})
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
    let nuevosPuestos = [];
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ListarPuestos',
        null, {outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0]);
            for (puesto of resultado.data[0]) {
                if (listaPuestos.length == 0) {
                    nuevosPuestos.push([false, puesto]);
                    continue;
                }
                else if (listaPuestos.find(existe =>
                    existe[0] === false && existe[1].Puesto === puesto.Puesto))
                    nuevosPuestos.push([false, puesto]);
                else if (listaPuestos.find(existe =>
                    existe[0] === true && existe[1].Puesto === puesto.Puesto))
                    nuevosPuestos.push([true, [puesto]]);
                else
                    nuevosPuestos.push([false, puesto]);
            }
            listaPuestos = nuevosPuestos;
        }
    }, 1500)
}

function cargarEmpleados() {
    let nuevosEmpleados = [];
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ListarEmpleados',
        null, {outResult : 0});
        if (resultado != undefined) {
            console.log(resultado.data[0]);
            for (empleado of resultado.data[0]){
                if (listaEmpleados.length == 0) {
                    nuevosEmpleados.push([false, empleado]);
                    continue;
                }
                else if (listaEmpleados.find(existe =>
                    existe[0] === false && existe[1].ID === empleado.ID))
                    nuevosEmpleados.push([false, empleado]);
                else if (listaEmpleados.find(existe =>
                    existe[0] === true && existe[1].ID === empleado.ID))
                    nuevosEmpleados.push([true, empleado]);
                else
                    nuevosEmpleados.push([false, empleado]);
            }
            listaEmpleados = nuevosEmpleados;
        }
    }, 1500)
}

function cargarTipoDoc() {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ObtenerTipoDoc',
        null, {outResult : 0});
        if (resultado != undefined) {
            for (tipoDoc of resultado.data[0])
                listaTipoDoc.push(tipoDoc);
        }
        console.log(listaTipoDoc);
    }, 1500)
}

function cargarDepartamentos() {
    setTimeout(async () => {
        const resultado = await based.executeStoredProcedure('ObtenerDepartamento',
        null, {outResult : 0});
        if (resultado != undefined) {
            for (departamento of resultado.data[0])
                listaDepartamentos.push(departamento);
        }
        console.log(listaDepartamentos);
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

function eliminarEmpleado(idEmpleado) {
    for (empleado of listaEmpleados) {
        if (empleado[1].ID == idEmpleado) {
            empleado[0] = true;
            return;
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

function insertarEmpleadoFunc(nuevoEmpleado) {
    setTimeout(async () => {
        const respuesta = await based.executeStoredProcedure('InsertarEmpleado', null,
        {inNombre : nuevoEmpleado.Nombre,
        inIdTipoIdentificacion : nuevoEmpleado.IdTipoIdentificacion,
        inValorDocIdentificacion : nuevoEmpleado.ValorDocumentoIdentificacion,
        inIdDepartamento : nuevoEmpleado.IdDepartamento,
        inPuesto : nuevoEmpleado.Puesto,
        inFechaNacimiento : nuevoEmpleado.FechaNacimiento, 
        outResult : 0});
        cargarEmpleados();
    }, 1500)
}

function editarEmpleadoFunc(empleadoEditado) {
    setTimeout(async () => {
        const respuesta = await based.executeStoredProcedure('EditarEmpleado', null,
        {inIdEditar : idGlobal,
        inNombre : empleadoEditado.Nombre,
        inIdTipoIdentificacion : empleadoEditado.IdTipoIdentificacion,
        inValorDocIdentificacion : empleadoEditado.ValorDocumentoIdentificacion,
        inIdDepartamento : empleadoEditado.IdDepartamento,
        inPuesto : empleadoEditado.Puesto,
        inFechaNacimiento : empleadoEditado.FechaNacimiento, 
        outResult : 0});
        cargarEmpleados();
    }, 1500)
}

function editarPuestoFunc(puestoEditado) {
    console.log(idGlobal);
    setTimeout(async () => {
        const respuesta = await based.executeStoredProcedure('EditarPuesto', null,
        {inIdEditar : idGlobal,
        inNombre : puestoEditado.Nombre,
        inSalarioXHora : puestoEditado.SalarioXHora,
        outResult : 0});
        cargarPuestos();
    }, 1500)
}

// Creacion del puerto para acceder la pagina web
app.listen(3000)
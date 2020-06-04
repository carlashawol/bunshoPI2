const express = require('express');
const router = express.Router();

const Reporte = require('../models/Reporte');
const Archivo = require('../models/Archivo');
const Recomendacion = require('../models/Recomendacion');
const { isAuthenticated } = require('../helpers/auth');



router.post('/tarjeta', async (req, res) => {
    const { id, ubicacion } = req.body;
    const Disponible = "Disponible"
    const NoDisponible = "No Disponible"
    //const id = "123A";
    //const ubicacion = "estanteria 4"
    var nuevoReporte = null;
    const archivo = await Archivo.find({idRFID:id});
    if(archivo.length > 0){
        console.log(archivo);
        console.log("archivo asociado a esta tarejta");
        var actualizar = archivo[0];
        if(actualizar.estado == Disponible){
            await actualizar.updateOne({estado: NoDisponible});
            console.log("actualizado1");
        } else {//if(actualizar.estado = "No Disponible"){
            await actualizar.updateOne({estado: Disponible});
            await actualizar.updateOne({ubicacion:ubicacion});
            console.log("actualizado2");
        }
        console.log(actualizar);
        const idArchivo= actualizar.idArchivo;
        const estado =actualizar.estado;
        const fecha= Date.now();
        nuevoReporte = new Reporte({idArchivo, ubicacion, estado, fecha});
        console.log("este es el reporte de una tarjeta vieja");
        await nuevoReporte.save();

    } else {
        console.log(archivo);
        console.log("tarjeta nueva");
        const asociado = await Archivo.find().sort({ date: 'desc' });
        const asignacion = asociado[0];
        console.log(asignacion);
        if(asignacion.idRFID == null){
            await asignacion.updateOne({idRFID:id});
            await asignacion.updateOne({ubicacion:ubicacion});
        }
        console.log(asignacion);
        const idArchivo = asignacion.idArchivo;
        const estado = asignacion.estado;
        const fecha= Date.now();
        nuevoReporte = new Reporte({idArchivo, ubicacion, estado , fecha});
        console.log("este es el reporte de una nueva tarjeta");
        await nuevoReporte.save();
    }
    
    console.log(nuevoReporte);
});

router.get('/archivos/add', isAuthenticated, (req, res) => { 
    console.log("recargo la vista");
    res.render('archivos/nuevoArchivo');
});

router.post('/archivos/nuevoArchivo', async (req, res) => {
    const { title, idArchivo, /*idRFID,ubicacion,*/ description, estado } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Inserte un título' });
    }
    if (!idArchivo) {
        errors.push({ text: 'Inserte la Identificación del Archivo' });
    }
    /*if(!idRFID){
        errors.push({text: 'Pase la Tarjeta'});
    }
    if (!ubicacion) {
        errors.push({ text: 'Inserte la Ubicación del Archivo' });
    }*/
    if (!description) {
        errors.push({ text: 'Inserte una descripción' });
    }
    if (errors.length > 0) {
        res.render('archivos/nuevoArchivo', {
            errors,
            title,
            description
        });
    } else {
        const nuevoArchivo = new Archivo({ title, description, idArchivo, estado /*ubicacion, idRFID*/ });
        await nuevoArchivo.save();
        req.flash('success_msg', 'Archivo agregado');
        res.redirect('/archivos');
    }
});

router.get('/archivos', isAuthenticated, async (req, res) => {
    const archivos = await Archivo.find().sort({ date: 'desc' });
    res.render('archivos/todos-los-archivos', { archivos });
});

router.get('/archivos/edit/:id', isAuthenticated, async (req, res) => {
    const archivo = await Archivo.findById(req.params.id);
    res.render('archivos/edit-archivo', { archivo });
});

router.put('/archivos/edit-archivo/:id', async (req, res) => {
    const { title, idArchivo, /*idRFID,*/ubicacion, description } = req.body;
    await Archivo.findByIdAndUpdate(req.params.id, { title, idArchivo, /*idRFID,*/ubicacion, description });
    req.flash('success_msg', 'Archivo actualizado');
    res.redirect('/archivos');
});

router.delete('/archivos/delete/:id', async (req, res) => {
    await Archivo.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Archivo Eliminado');
    res.redirect('/archivos');
});

router.get('/archivos/buscar-archivo', isAuthenticated, async (req, res) => {
    res.render('archivos/buscar-archivo');
});


router.get('/archivos/descargar-archivo/:id', isAuthenticated, async (req, res) => {
    const file = '../Acuerdo de Confidencialidad.pdf';
    res.download(file);
});

router.get('/archivos/generar-reporte/:id', isAuthenticated, async (req, res) => {
    const id = await Archivo.findById(req.params.id);
    const estados = await Reporte.find({idArchivo : id.idArchivo});
    console.log("Estados");
    console.log(estados);
    res.render('archivos/reporte', { estados });
    
});

router.post('/archivos/archivo-encontrado', async (req, res) => {
    const { idArchivo } = req.body;
    const archivos = await Archivo.find();
    var archivo;
    for (var i = 0; i <= archivos.length; i++) {
        if (idArchivo == archivos[i].idArchivo) {
            archivo = archivos[i];
            res.render('archivos/archivo-encontrado', { archivo });
            break;
        }
    }
});

router.get('/archivos/recomendaciones', async (req, res) => {
   
    const archivos = await Archivo.find();
    for (var i = 0; i < archivos.length; i++) {
        console.log("entre al for");
        var archivo = archivos[i];
        var ub = parseInt(archivo.ubicacion);
        console.log(ub);
        if(ub >= 15){
            console.log("primer if");
            var idArchivo= archivo.idArchivo;
            var cantidad = await Reporte.find({idArchivo : idArchivo});
            if(cantidad.length >= 10){
                var contenido = "El archivo de id: "+archivo.idArchivo+" en la ubicación: "+archivo.ubicacion+" se ha usado mucho últimamente, se recomienda ubicarlo más cerca.";
                var ubicacion = archivo.ubicacion;
                var id = archivo.idArchivo;
                var nuevaRecomendacion = new Recomendacion({ id, ubicacion , contenido});
                await nuevaRecomendacion.save();
                console.log("guarde");
                console.log(nuevaRecomendacion);
            }     

        }
  
    }
    const recomendaciones = await Recomendacion.find();
    console.log("estas son las recomendaciones");
    console.log(recomendaciones);

    res.render('archivos/recomendaciones', { recomendaciones });

});

module.exports = router;


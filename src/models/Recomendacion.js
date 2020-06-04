const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecomendacionSchema = new Schema({
    idArchivo: { type: Number},
    ubicacion: { type: String, default: null },
    contenido: { type: String},
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recomendacion', RecomendacionSchema)
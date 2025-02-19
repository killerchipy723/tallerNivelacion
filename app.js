const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const pdf = require('pdfkit');
const PDFDocument = require('pdfkit');
const pdfmake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
pdfmake.vfs = vfsFonts.pdfMake.vfs; // Cargar fuentes

const port = 9000;

// Configurar middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Función para manejar la reconexión automática
let db;
function handleDisconnect() {
    db = mysql.createConnection({
        host: '200.58.106.156',
        user: 'c2710325_killer',
        password: 'SistemaIES6021',  // Ajusta según tu configuración
        database: 'c2710325_sistema'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            setTimeout(handleDisconnect, 2000); // Reintentar conexión después de 2 segundos
        } else {
            console.log('Conectado a la base de datos.');
        }
    });

    // Manejar errores de conexión
    db.on('error', (err) => {
        console.error('Error en la conexión a la base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Volver a conectar si se pierde la conexión
        } else {
            throw err;
        }
    });
}

// Iniciar el proceso de conexión
handleDisconnect();

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir la página de registro
app.get('/register-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Ruta para servir la página de asistencia
app.get('/attendance-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/asistencia.html'));
});

////////// combo carreras ////////////////////

app.get('/carreras', (req, res) => {
    const query = 'SELECT idcarrera, nombre FROM carreras';
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener las carreras:', error);
            return res.status(500).send('Error al obtener las carreras');
        }

        res.json(results); // Devolver los resultados como JSON
    });
});




// Ruta para buscar alumno por DNI
app.post('/buscar-alumno', (req, res) => {
    const { dni } = req.body;
    const query = 'SELECT * FROM alumno WHERE dni = ?';

    db.query(query, [dni], (err, result) => {
        if (err) {
            res.send({ error: 'Error en la búsqueda' });
        } else if (result.length > 0) {
            res.send({ success: true, alumno: result[0] });
        } else {
            res.send({ success: false, message: 'Alumno no encontrado' });
        }
    });
});

app.post('/register', (req, res) => {
    const { apenomb, dni, carrera, anio } = req.body;

    // Verificar si el alumno ya está registrado por DNI
    const checkQuery = `SELECT * FROM alumno WHERE dni = ?`;
    db.query(checkQuery, [dni], (err, result) => {
        if (err) {
            console.log('Error al verificar alumno:', err);
            return res.json({ success: false, message: 'Error en la validación.' });
        }

        if (result.length > 0) {
            // Si ya existe un registro con ese DNI, devolver mensaje de alerta
            return res.json({ success: false, message: 'El alumno ya está registrado.' });
        }

        // Si el alumno no existe, proceder con el registro
        const query = `INSERT INTO alumno (apenomb, dni, carrera, año, fecha) VALUES (?, ?, ?, ?, ?)`;
        const fecha = new Date();

        db.query(query, [apenomb, dni, carrera, anio, fecha], (err, result) => {
            if (err) {
                console.log('Error al registrar alumno:', err);
                res.json({ success: false, message: 'Error al registrar alumno.' });
            } else {
                res.json({ success: true, message: 'Alumno registrado con éxito.' });
            }
        });
    });
});


app.post('/registrar-asistencia', (req, res) => {
    const { idalumno } = req.body;
    const fecha = new Date();
    const fechaFormatted = fecha.toISOString().split('T')[0]; // Obtener solo la parte de la fecha (YYYY-MM-DD)

    // Verificar si ya hay un registro de asistencia para el alumno en la fecha actual
    const checkQuery = `SELECT * FROM asistencia WHERE idalumno = ? AND DATE(fecha) = ?`;
    db.query(checkQuery, [idalumno, fechaFormatted], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error al verificar asistencia.' });
        }

        if (result.length > 0) {
            // Si ya existe un registro de asistencia para hoy
            return res.json({ success: false, message: 'El alumno ya registró asistencia hoy.' });
        }

        // Registrar asistencia si no hay registro previo hoy
        const insertQuery = `INSERT INTO asistencia (idalumno, fecha, estado) VALUES (?, ?, ?)`;
        db.query(insertQuery, [idalumno, fecha, 'Presente'], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Error al registrar asistencia.' });
            } else {
                return res.json({ success: true, message: 'Asistencia registrada con éxito.' });
            }
        });
    });
});
// Ruta para consultar asistencia
app.post('/consultar-asistencia', (req, res) => {
    const { dni } = req.body;
    const query = `
        SELECT 
    a.idasistencia, 
    CONCAT(al.apellidos, ' ', al.nombres) AS apenomb,  
    al.dni,      
    a.fecha, 
    a.estado, 
    COALESCE(c.nombre, c2.nombre) AS carrera
FROM 
    asistencia a
JOIN 
    alumno al ON a.idalumno = al.idalumno
JOIN 
    preinscripcion p ON al.idalumno = p.idalumno
LEFT JOIN 
    carreras c ON p.idcarrera = c.idcarrera
LEFT JOIN 
    carrerag c2 ON p.idcarrera = c2.idcarrera
WHERE al.dni = ?;
    `;

    db.query(query, [dni], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error al consultar asistencia.' });
        }
        
        if (result.length > 0) {
            return res.json({ success: true, asistencias: result });
        } else {
            return res.json({ success: false, message: 'No se encontró asistencia para este alumno.' });
        }
    });
});
// Ruta para obtener las asistencias por fecha
app.get('/asistencia', (req, res) => {
    const { fecha,carrera } = req.query;
    if (!fecha) {
        return res.status(400).json({ error: 'Debe proporcionar una fecha' });
    }
    const sql = `SELECT 
    a.idasistencia, 
    CONCAT(al.apellidos, ' ', al.nombres) AS apenomb,  
    al.dni,      
    a.fecha, 
    a.estado, 
    COALESCE(c.nombre, c2.nombre) AS carrera
FROM 
    asistencia a
JOIN 
    alumno al ON a.idalumno = al.idalumno
JOIN 
    preinscripcion p ON al.idalumno = p.idalumno
LEFT JOIN 
    carreras c ON p.idcarrera = c.idcarrera
LEFT JOIN 
    carrerag c2 ON p.idcarrera = c2.idcarrera
WHERE 
    a.fecha = ? 
    AND p.estado = 'Activo'
    AND p.idcarrera = ?`;

    db.query(sql, [fecha,carrera], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        // Formatear las fechas
        results.forEach(row => {
            const date = new Date(row.fecha);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0-11
            const year = date.getFullYear();
            row.fecha = `${day}/${month}/${year}`;
        });


        res.json(results); // Devolver los resultados en formato JSON
    });
});


app.get('/asistencia/pdf', (req, res) => {
    const { fecha,carrera } = req.query;
    console.log('Fecha recibida:', fecha);

    const query = `
      SELECT 
    a.idasistencia, 
    CONCAT(al.apellidos, ' ', al.nombres) AS apenomb,  
    al.dni,      
    a.fecha, 
    a.estado, 
    COALESCE(c.nombre, c2.nombre) AS carrera
FROM 
    asistencia a
JOIN 
    alumno al ON a.idalumno = al.idalumno
JOIN 
    preinscripcion p ON al.idalumno = p.idalumno
LEFT JOIN 
    carreras c ON p.idcarrera = c.idcarrera
LEFT JOIN 
    carrerag c2 ON p.idcarrera = c2.idcarrera
WHERE 
    a.fecha = ? 
    AND p.estado = 'Activo
    AND p.idcarrera= ?'
    `;

    db.query(query, [fecha,carrera], (error, results) => {
        if (error) {
            console.error('Error al generar el PDF:', error);
            return res.status(500).send('Error al generar el PDF');
        }

        // Verificar que los resultados son válidos
        const validResults = results.map(asistencia => {
            const fechaFormatted = new Date(asistencia.fecha).toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            return {
                idasistencia: !isNaN(asistencia.idasistencia) ? asistencia.idasistencia : 0, // Verificar si idasistencia es un número válido
                apenomb: asistencia.apenomb || 'Nombre no disponible',
                dni: asistencia.dni || 'Sin DNI',
                fecha: fechaFormatted || 'Fecha no disponible',
                estado: asistencia.estado || 'Estado no disponible',
                 carrera: asistencia.carrera || 'Estado no disponible'
            };
        });

        // Definición de la estructura del PDF
        const docDefinition = {
            pageOrientation: 'landscape',  
            content: [
                {
                    text: 'Registro de Asistencias\nTALLER DE NIVELACIÓN Y AMBIENTACIÓN\nI.E.S 6.021 Juan Carlos Dávalos',
                    style: 'header',
                    alignment: 'center'
                },
                { text: `Fecha: ${fecha}`, style: 'subheader', alignment: 'center' },
                { text: '\n' }, // Espacio
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: [30, 250, 'auto', 'auto', 'auto','auto'],
                        body: [
                            [
                                { text: 'ID', style: 'tableHeader' },
                                { text: 'Alumno', style: 'tableHeader' },
                                { text: 'Documento', style: 'tableHeader' },                                 
                                { text: 'Fecha', style: 'tableHeader' },
                                { text: 'Estado', style: 'tableHeader' },
                                { text: 'Carrera', style: 'tableHeader' }
                            ],
                            ...validResults.map(asistencia => [
                                asistencia.idasistencia,
                                asistencia.apenomb,
                                asistencia.dni,                            
                                asistencia.fecha, // Usamos la fecha formateada
                                asistencia.estado,
                                asistencia.carrera
                                
                            ])
                        ]
                    },

                    layout: {
                        hLineWidth: (i) => (i === 0 ? 2 : 0.5),
                        vLineWidth: (i) => (i === 0 ? 2 : 0.5),
                        hLineColor: () => '#007BFF',
                        vLineColor: () => '#007BFF',
                        fillColor: (rowIndex) => (rowIndex === 0 ? '#007BFF' : null), // Color de fondo para el encabezado
                    },
                }
            ],
            styles: {
                header: {
                    fontSize: 15,
                    bold: true,
                    margin: [0, 20, 0, 10],
                    color: '#007BFF' // Color del título
                },
                subheader: {
                    fontSize: 11,
                    margin: [0, 0, 0, 20]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    color: 'white',
                    alignment: 'center'
                }
            }
        };

        // Generar el PDF
        const pdfDoc = pdfmake.createPdf(docDefinition);
        const filePath = path.join(__dirname, 'reporte.pdf');

        pdfDoc.getBuffer((buffer) => {
            fs.writeFileSync(filePath, buffer); // Guardar PDF en el sistema de archivos

            res.download(filePath, 'reporte.pdf', (err) => {
                if (err) {
                    console.error('Error al enviar el PDF:', err);
                    res.status(500).send('Error al enviar el PDF');
                }
            });
        });
    });
});




// Iniciar el servidor
app.listen(port, '0.0.0.0',() => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});


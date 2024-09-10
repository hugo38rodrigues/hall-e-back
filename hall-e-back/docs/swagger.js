import swaggerAutogen from 'swagger-autogen'
import { swaggerDoc } from './swagger-doc.js' // Importe le fichier de documentation

const outputFile = './swagger_output.json'  // Chemin du fichier généré
const endpointsFiles = ['../routes/user.route.js']  // Fichier de routes

swaggerAutogen()(outputFile, endpointsFiles, swaggerDoc).then(() => {
    console.log('Documentation Swagger générée avec succès.')
})

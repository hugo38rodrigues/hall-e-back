export const swaggerDoc = {
  info: {
    title: 'API Node.js',
    description: 'Documentation générée avec swagger-autogen.',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  paths: {
    'api/v1/user/sign-in': {
      post: {
        tags: ['User'],
        summary: 'Créer un compte utilisateur',
        description: 'Cette route permet de créer un compte utilisateur.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Détails de l\'utilisateur à créer',
            required: true,
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  description: 'Adresse e-mail de l\'utilisateur',
                  example: 'email@example.com'
                },
                password: {
                  type: 'string',
                  description: 'Mot de passe',
                  example: 'motdepasse123'
                }
              }
            }
          }
        ],
        responses: {
          201: {
            description: 'Compte utilisateur créé avec succès',
          },
          400: {
            description: 'Requête invalide'
          }
        }
      }
    },
    'api/v1/user/connexion': {
      post: {
        tags: ['User'],
        summary: 'Connexion utilisateur',
        description: 'Cette route permet de connecter un utilisateur.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Identifiants pour la connexion',
            required: true,
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  description: 'Adresse e-mail',
                  example: 'email@example.com'
                },
                password: {
                  type: 'string',
                  description: 'Mot de passe',
                  example: 'motdepasse123'
                }
              }
            }
          }
        ],
        responses: {
          200: {
            description: 'Connexion réussie'
          },
          401: {
            description: 'Identifiants incorrects'
          }
        }
      }
    }
  }
}

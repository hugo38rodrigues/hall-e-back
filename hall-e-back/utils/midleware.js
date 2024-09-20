export class Midleware {
  constructor () {

  }

  verifyRoleInBody = (req, res, next) => {
    
    
    if (req.path === '/v1/user/connexion') {
      return next() 
    }
    
    if (!req.body || !req.boyd.role) {
      return res.status(400).json({ message: 'Le champ "role" est manquant' })
    }

    if (req.body.role !== 'consumer' || req.body.role !== 'bar') {
      console.log('Role non accepté:', req.body.role)
      return res.status(401).json({ message: `Le rôle ${req.body.role} n'est pas accepté` })
    }

    next()
  }

}
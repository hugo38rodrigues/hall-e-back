export class Midleware {
  constructor () {

  }

  verifyRoleInBody = (req, res, next) => {
    
    if (!req.body.role) {
      return res.status(400).json({ message: 'Le champ "role" est manquant' })
    }
    
    if (req.body.role !== 'consumer' && req.body.role !== 'bar') {
      return res.status(401).json({ message: `Le rôle ${req.body.role} n'est pas accepté` })
    }

    next()
  }

}
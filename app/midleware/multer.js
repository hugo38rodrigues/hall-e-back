import multer from 'multer'

// Configurer le stockage local pour Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, '../public/pictures') // Répertoire local pour stocker les fichiers
	},
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${file.originalname}`
		cb(null, uniqueName)
	},
})

export const upload = multer({ storage })

import nodemailer from 'nodemailer'

const emailHtml = (codeNumber) => {
	return `<header style="font-family: Arial, sans-serif; line-height: 1.6; display: flex; flex-direction:column; align-items: center;">
  <h1 style="color: #987464;">Bienvenue sur Hall-E !</h1>
</header>
<body>
  <h3 style="color: #987464;">Bonjour,</h3>
  <p style="color: #987464;">Voicis le code pour réinitialiser votre mot de passe:</p>
  <h2 style="color: #987464;"> ${codeNumber}
  
</body>
<footer>
  <p style="color: #987464;">Bonne journée !</p>
  <p style="color: #987464;">L’équipe <b>Hall-E</b></p>
  <hr>
  <p style="font-size: 12px; color: #987464;">Cet e-mail est envoyé automatiquement, merci de ne pas y répondre.</p>
</footer>`
}

export const sendEmailResetPassword = async (email, token) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // use false for STARTTLS; true for SSL on port 465
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.USER_PASSWORD,
		},
	})

	try {
		const info = await transporter.sendMail({
			from: 'hall-e.noreply@gmail.com>', // Expéditeur
			to: email, // Destinataire
			subject: 'Réinitialisation du mot de passe', // Sujet
			html: emailHtml(token), // Corps de l'e-mail
		})
		console.log('Email envoyé : ', info)
	} catch (error) {
		console.error('Erreur lors de l’envoi :', error)
	}
}

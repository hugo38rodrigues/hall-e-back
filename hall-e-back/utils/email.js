import nodemailer from 'nodemailer'

const emailHtml = (token) => {
	return `<header style="font-family: Arial, sans-serif; line-height: 1.6; display: flex; flex-direction:column; align-items: center;">
  <h1 style="color: #987464;">Bienvenue sur Hall-E !</h1>
</header>
<body>
  <h3 style="color: #987464;">Bonjour,</h3>
  <p style="color: #987464;">Voicis le lien pour changer votre mot de passe:</p>
  
  <button style=" align-items: center;
  appearance: button;
  background-color: #987464;
  border-radius: 8px;
  border-style: none;
  box-shadow: rgba(255, 255, 255, 0.26) 0 1px 2px inset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  padding: 10px 21px;
  text-align: center;
  text-transform: none;
  transition: color .13s ease-in-out,background .13s ease-in-out,opacity .13s ease-in-out,box-shadow .13s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;">
    <a href= http://localhost:5000/reset-password/${token} style="color: #f2e8dc;">Réinitialisé votre mot de passe</a>
</button>
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

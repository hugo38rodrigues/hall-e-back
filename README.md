# 🎉 Bienvenue sur Hall-E ! 🎉

## Qu'est-ce que Hall-E ? 🤔

Hall-E est l'application révolutionnaire qui transforme vos soirées entre amis en expériences inoubliables ! En quelques clics, découvrez les bars les plus animés de votre région, équipés pour vous offrir des moments de divertissement exceptionnels.

## Pourquoi choisir Hall-E ? 🌟

- **🔍 Trouvez le bar parfait** : Utilisez notre interface simple et intuitive pour localiser les bars qui diffusent une grande variété de parties de jeux vidéo.
- **👯‍♂️ Réunissez vos amis** : Organisez vos soirées et retrouvez vos proches dans un cadre convivial et dynamique.
- **🎮 Profitez des jeux** : Visionnez les parties de jeux vidéo les plus palpitantes tout en dégustant vos boissons préférées et en partageant des moments de plaisir.

## Comment ça marche ? 🚀

1. **Inscrivez-vous** : Créez votre compte en quelques étapes simples.
2. **Explorez** : Recherchez les bars près de chez vous qui diffusent des jeux vidéo.
3. **Planifiez** : Choisissez un bar, invitez vos amis et préparez-vous à passer une soirée mémorable.

## Pourquoi vous inscrire dès maintenant ? 📲

- **Rejoignez une communauté** : Connectez-vous avec d'autres passionnés de jeux vidéo et de sorties.
- **Transformez vos soirées** : Ne laissez plus jamais une soirée entre amis devenir ennuyeuse !

## Prêt à vivre des soirées exceptionnelles ? 🌟

Téléchargez Hall-E et faites de chaque sortie un événement que vous n’oublierez jamais !

---

docker build \
  --build-arg GITHUB_TOKEN=<GH_TOKEN> \
  -t api-hall-e .

docker run  \
  -p 3000:3000 \
  --env-file ./env/prod/.env \
  --name api-hall-e-v1 \
  api-hall-e


kubectl create secret docker-registry regcred \
  --docker-username=TON_USERNAME \
  --docker-password=TON_PASSWORD \
  --docker-email=TON_EMAIL \
  --docker-server=https://index.docker.io/v1/

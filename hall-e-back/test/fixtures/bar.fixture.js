export const validBar = {
	id: 10,
	role: 'bar',
	password:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	address: '5 rue victor hugo, 25555, Limoge',
	name: 'Tonneaux de limoge',
	email: 'hugoBar@gmail.com',
	description: 'Le meilleur bar de limoge',
	photo: '',
}
export const validConnexionBar = {
	password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	email: 'hugoBar@gmail.com',
}

export const missingPasswordBar = {
	id: 10,
	role: 'bar',
	address: '5 rue victor hugo, 25555, Limoge',
	name: 'Tonneaux de limoge',
	email: 'hugoBar@gmail.com',

	description: 'Le meilleur bar de limoge',
	photo: '',
}

export const missingEmailBar = {
	id: 10,
	role: 'bar',
	password:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	address: '5 rue victor hugo, 25555, Limoge',
	name: 'Tonneaux de limoge',
	description: 'Le meilleur bar de limoge',
	photo: '',
}

export const badFormatAddress = {
	id: 10,
	role: 'bar',
	password:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	address: 'Limoge 5 rue victor hugo, 25555',
	name: 'Tonneaux de limoge',
	email: 'hugoBar@gmail.com',
	description: 'Le meilleur bar de limoge',
	photo: '',
}

export const badTypeDescription = {
	id: 10,
	role: 'bar',
	password:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	address: '5 rue victor hugo, 25555, Limoge',
	name: 'Tonneaux de limoge',
	email: 'hugoBar@gmail.com',
	description: 5454545,
	photo: '',
}

export const badTypeName = {
	id: 10,
	role: 'bar',
	password:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
	address: '5 rue victor hugo, 25555, Limoge',
	name: 654654654,
	email: 'hugoBar@gmail.com',
	description: 'Le meilleur bar de limoge',
	photo: '',
}

export const barWithoutFavoriteAndLike = {
	address: '5 rue victor hugo, 25555, Limoge',
  description: 'Le meilleur bar de limoge',
  email: 'hugoBar@gmail.com',
  favoriteGamesBar: [],
  favoriteLeaguesBar: [],
  favoriteTeamsBar: [],
  id: 10,
  name: 'Tonneaux de limoge',
  photo: {
    data: [],
    type: 'Buffer',
  },
  price: null,
  role: 'bar',
}

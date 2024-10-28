export const barModel = (sequelize, DataTypes) => {
return sequelize.define(
    'Bars',
    {
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        price: {
            type: DataTypes.INTEGER,
        },
        description: {
            type: DataTypes.STRING,
        },
        photo: {
            type: DataTypes.BLOB('long')
        },
        password: {
            type: DataTypes.STRING(1234),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'bar',
            allowNull: false
        }
    })
}

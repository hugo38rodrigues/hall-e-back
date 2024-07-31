import { DataTypes } from 'sequelize'

export const Bar = (sequelize) => {
    return sequelize.define(
        'Bars',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            adress: {
                type: DataTypes.STRING,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            price: {
                type: DataTypes.INTEGER,
            },
            description: {
                type: DataTypes.STRING,
            },
            photo: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING(1234),
                allowNull: false
            },
            role: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    )
}

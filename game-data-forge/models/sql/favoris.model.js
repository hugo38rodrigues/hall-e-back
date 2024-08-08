import { DataTypes } from 'sequelize'

export const Favorite = (sequelize) => {
    return sequelize.define(
        'Favorites',
        {
            favoriteable_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            favoriteable_type: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    )
}
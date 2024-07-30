import {DataTypes} from 'sequelize';

export const favoris = (sequelize) => {
    return sequelize.define(
        'Favoris',
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
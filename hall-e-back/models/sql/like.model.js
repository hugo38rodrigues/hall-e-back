import {DataTypes} from 'sequelize';

export const like = (sequelize) => {
    return sequelize.define(
        'Likes',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            consumerId: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Consumers',
                    key: 'id'
                }
            },
            barId: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Bars',
                    key: 'id'
                }
            }
        }
    )
}
import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    schema: 'my_cons_elec',
    tableName: 'parameter',
    underscored: true,
    timestamps: false
})
export class Parameter extends Model {
    @Column({type: DataType.STRING, primaryKey: true})
    key: string;
    @Column({type: DataType.STRING, allowNull: false})
    value: string;
}

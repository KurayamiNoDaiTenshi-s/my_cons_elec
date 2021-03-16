import {Column, DataType, Model, Table, Unique} from "sequelize-typescript";

@Table({
    tableName: 'user_token',
    timestamps: false,
    schema: 'my_cons_elec',
    underscored:true
})

export class UserToken extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement:true
    })
    uid: number
    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    tokenString: string;
    @Column(DataType.DATE)
    validityDate: Date;
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isUsed: boolean;
    @Column(DataType.DATE)
    useDate: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: new Date()
    })
    createdAt: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    createdBy: Date;

    @Column(DataType.DATE)
    updatedAt: Date;

    @Column(DataType.STRING)
    updatedBy: string;


}

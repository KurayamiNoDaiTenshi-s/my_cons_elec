import {Column, DataType, Model, Table, Unique} from "sequelize-typescript";

@Table({
    tableName: 'user_token',
    timestamps: false,
    schema: 'my_cons_elec'
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
        field: 'token_string',
        allowNull: false
    })
    tokenString: string;
    @Column({
        type: DataType.DATE,
        field: 'validity_date',
        allowNull: true
    })
    validityDate: Date;
    @Column({
        type: DataType.BOOLEAN,
        field: 'is_used',
        allowNull: false,
        defaultValue: false
    })
    isUsed: boolean;
    @Column({
        type: DataType.DATE,
        field: 'use_date',
        allowNull: true,
    })
    useDate: Date;
    @Column({
        type: DataType.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: new Date()
    })
    createdAt: Date;

    @Column({
        type: DataType.STRING,
        field: 'created_by',
        allowNull: false
    })
    createdBy: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        allowNull: true
    })
    updatedAt: Date;

    @Column({
        type: DataType.STRING,
        field: 'updated_by',
        allowNull: true
    })
    updatedBy: string;


}

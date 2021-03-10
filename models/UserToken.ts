import {Table, Model, PrimaryKey, Column, DataType, Unique} from "sequelize-typescript";

@Table({
    tableName: 'user-token',
    timestamps: false
})

export class UserToken extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
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
        allowNull: false
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
        allowNull: false
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
        field: 'created_at',
        allowNull: false
    })
    updatedAt: Date;

    @Column({
        type: DataType.STRING,
        field: 'created_by',
        allowNull: false
    })
    updatedBy: Date;


}

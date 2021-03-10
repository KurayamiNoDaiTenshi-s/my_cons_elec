import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {UserToken} from "./UserToken";

@Table({
    schema: 'my_cons_elec',
    tableName: 'user',
    timestamps: false,
    underscored: true
})
export class User extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    uid: number;
    @Column(DataType.STRING)
    firstName: string;
    @Column(DataType.STRING)
    lastName: string;
    @Column(DataType.STRING)
    uniqueIdentifier: string;
    @Column(DataType.STRING)
    email: string;
    @Column(DataType.STRING)
    password: string;
    @ForeignKey(() => UserToken)
    @Column(DataType.INTEGER)
    userTokenUid: number;
    @Column(DataType.BOOLEAN)
    isActive: boolean;
    @Column(DataType.BOOLEAN)
    isAdmin: boolean;
    @Column(DataType.BOOLEAN)
    canInvite: boolean;
    @Column(DataType.DATE)
    createdAt: Date;
    @Column(DataType.STRING)
    createdBy: string;
    @Column(DataType.DATE)
    updatedAt: Date;
    @Column(DataType.STRING)
    updatedBy: string;
}
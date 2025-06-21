import { User } from "src/users/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('jobs')
export class Job{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title :string;


    @Column()
    description : string;


    @Column()
    location : string;


    @Column()
    jobType:string;



    @Column({type:'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    createdAt:Date;

    @ManyToMany(()=>User,(user)=>user.appliedJobs)
    appliedUsers:User[]

    @ManyToMany(() => User, (user) => user.shortlistedJobs)
    @JoinTable()
    shortlistedUsers: User[];
}
import { Job } from "src/jobs/job.entity";
import { Notification } from "src/notifications/notification.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @Column()
    age:number;

@ManyToMany(() => Job, (job) => job.appliedUsers, { cascade: true })
@JoinTable({ name: 'user_applied_jobs' })     
appliedJobs: Job[];

@ManyToMany(() => Job, (job) => job.shortlistedUsers)
@JoinTable({ name: 'user_shortlisted_jobs' })   
shortlistedJobs: Job[];


@OneToMany(() => Notification, (notification) => notification.user)
notifications: Notification[];
}
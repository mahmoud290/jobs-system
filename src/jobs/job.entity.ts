import { User } from "src/users/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column()
  jobType: string;

  @Column({default:'open'})
  status:'open' | 'closed';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

@ManyToMany(() => User, (user) => user.appliedJobs)
appliedUsers: User[];

@ManyToMany(() => User, (user) => user.shortlistedJobs)
shortlistedUsers: User[];
}

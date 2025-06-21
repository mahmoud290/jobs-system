import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity('notifications')
export class Notification {
@PrimaryGeneratedColumn()
id: number;

@Column()
message: string;

@Column({ default: false })
read: boolean;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
createdAt: Date;

@ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
user: User;
}

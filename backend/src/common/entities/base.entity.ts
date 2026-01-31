import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    public deletedAt?: Date; 
}

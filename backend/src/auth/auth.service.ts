import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/services/users.service';
import { JwtTokenDto } from './dto/jwt-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    
    public async login(username: string, password: string): Promise<JwtTokenDto> {

        const user = await this.usersService.findOneByUsername(username);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');
        
        const payload = { sub: user.id, username: user.username, roleId: user.roleId };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roleId: user.roleId,
            },
        };
    }

    public async register(userDto: CreateUserDto): Promise<JwtTokenDto> {
        const user = await this.usersService.findOneByUsername(userDto.username);
        const userEmail = await this.usersService.findOneByEmail(userDto.email);

        if (user || userEmail) throw new ConflictException('User already exists');

        const hashedPassword = await bcrypt.hash(userDto.password, 10);

        const newUser = await this.usersService.create({
            ...userDto,
            password: hashedPassword,
        });
        
        if (newUser) return this.login(userDto.username, userDto.password);
        throw new UnauthorizedException('Unable to create user');
    }

    public logout(): void {
        // No specific logout logic for JWT-based auth
        // Delete token in frontend to effectively log out
        return
    }
}

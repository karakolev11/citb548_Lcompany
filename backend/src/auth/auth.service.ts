import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/services/users.service';
import { JwtTokenDto } from './dto/jwt-token.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    
    public async login(username: string, password: string): Promise<JwtTokenDto> {
        const user = await this.usersService.findOneByUsername(username);

        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (user?.password !== password) throw new UnauthorizedException('Invalid credentials');
        
        const payload = { sub: user.id, username: user.username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    public async register(userDto: CreateUserDto): Promise<JwtTokenDto | void> {
        const user = await this.usersService.findOneByUsername(userDto.username);
        const userEmail = await this.usersService.findOneByEmail(userDto.email);

        if (user || userEmail) throw new UnauthorizedException('User already exists');

        const newUser = await this.usersService.create(userDto);
        
        if(newUser) return this.login(userDto.username, userDto.password);
    }

    public logout(): void {
        // No specific logout logic for JWT-based auth
        // Delete token in frontend to effectively log out
        return
    }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    
    public async login(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);

        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (user?.password !== password) throw new UnauthorizedException('Invalid credentials');
        
        const payload = { sub: user.id, username: user.username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}

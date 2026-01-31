import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtTokenDto } from './dto/jwt-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public login(@Body() loginDto: LoginDto): Promise<JwtTokenDto> {
    return this.authService.login(loginDto.username, loginDto.password);
  }
  
  @HttpCode(HttpStatus.OK)
  @Post('register')
    public register(@Body() userDto: CreateUserDto): Promise<JwtTokenDto | void> {
    return this.authService.register(userDto);
  }

  
  // TEST ENDPOINT
  // @UseGuards(AuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}

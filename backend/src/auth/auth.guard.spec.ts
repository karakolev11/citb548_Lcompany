import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  // Verifies: should be defined.
  it('should be defined', () => {
    const jwtServiceMock = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    expect(new AuthGuard(jwtServiceMock)).toBeDefined();
  });
});

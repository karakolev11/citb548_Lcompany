import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';

describe('ShipmentsService', () => {
  let service: ShipmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: {} },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
